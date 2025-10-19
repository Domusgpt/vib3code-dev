export interface VelocitySample {
  readonly deltaY: number;
  readonly timestamp: number;
}

export interface ScrollIntensity {
  readonly velocity: number;
  readonly bucket: "gentle" | "standard" | "dramatic";
}

export interface ScrollOrchestratorOptions {
  readonly windowRef?: Window;
  readonly sampleWindowMs?: number;
  readonly snapDelayMs?: number;
  readonly snapEnabled?: boolean;
}

export type SectionChangeListener = (sectionId: string, intensity: ScrollIntensity) => void;

export class ScrollOrchestrator {
  private readonly options: Required<ScrollOrchestratorOptions>;
  private readonly samples: VelocitySample[] = [];
  private readonly listeners = new Set<SectionChangeListener>();
  private activeSection = "home";
  private readonly sectionElements = new Map<string, HTMLElement>();
  private readonly snapPoints: Array<{ id: string; offset: number }> = [];
  private snapTimer?: number;

  constructor(options: ScrollOrchestratorOptions = {}) {
    const resolvedWindow = options.windowRef ?? (typeof window !== "undefined" ? window : undefined);
    if (!resolvedWindow) {
      throw new Error("ScrollOrchestrator requires a window reference");
    }
    this.options = {
      windowRef: resolvedWindow,
      sampleWindowMs: options.sampleWindowMs ?? 120,
      snapDelayMs: options.snapDelayMs ?? 140,
      snapEnabled: options.snapEnabled ?? true
    };
  }

  record(deltaY: number, deltaT: number): ScrollIntensity {
    const timestamp = this.options.windowRef.performance.now();
    this.samples.push({ deltaY: deltaY / Math.max(deltaT, 1), timestamp });
    this.trimSamples(timestamp);
    const intensity = this.computeIntensity();
    this.scheduleSnap();
    return intensity;
  }

  setSection(sectionId: string): void {
    if (sectionId === this.activeSection) return;
    this.activeSection = sectionId;
    const intensity = this.computeIntensity();
    for (const listener of this.listeners) {
      listener(sectionId, intensity);
    }
  }

  onSectionChange(listener: SectionChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  registerSectionElement(sectionId: string, element: HTMLElement): void {
    this.sectionElements.set(sectionId, element);
    this.recomputeSnapPoints();
  }

  refresh(): void {
    this.recomputeSnapPoints();
  }

  private computeIntensity(): ScrollIntensity {
    if (!this.samples.length) {
      return { velocity: 0, bucket: "gentle" };
    }
    const sumVelocity = this.samples.reduce((acc, sample) => acc + Math.abs(sample.deltaY), 0);
    const velocity = sumVelocity / this.samples.length;
    const clamped = Math.min(Math.max(velocity, 0), 120);
    let bucket: ScrollIntensity["bucket"] = "gentle";
    if (clamped >= 50) bucket = "dramatic";
    else if (clamped >= 10) bucket = "standard";
    return { velocity: clamped, bucket };
  }

  private trimSamples(now: number): void {
    const cutoff = now - this.options.sampleWindowMs;
    while (this.samples.length && this.samples[0].timestamp < cutoff) {
      this.samples.shift();
    }
  }

  private scheduleSnap(): void {
    if (!this.options.snapEnabled || !this.snapPoints.length) {
      return;
    }
    if (this.snapTimer) {
      this.options.windowRef.clearTimeout(this.snapTimer);
    }
    this.snapTimer = this.options.windowRef.setTimeout(() => {
      this.snapTimer = undefined;
      this.performSnap();
    }, this.options.snapDelayMs);
  }

  private performSnap(): void {
    if (!this.snapPoints.length) return;
    const win = this.options.windowRef;
    const scrollY = win.scrollY;
    let nearest = this.snapPoints[0];
    let nearestDistance = Math.abs(scrollY - nearest.offset);
    for (const point of this.snapPoints) {
      const distance = Math.abs(scrollY - point.offset);
      if (distance < nearestDistance) {
        nearest = point;
        nearestDistance = distance;
      }
    }
    if (nearestDistance < win.innerHeight * 0.45) {
      win.scrollTo({ top: nearest.offset, behavior: "smooth" });
    }
  }

  private recomputeSnapPoints(): void {
    this.snapPoints.length = 0;
    const win = this.options.windowRef;
    for (const [id, element] of this.sectionElements.entries()) {
      const rect = element.getBoundingClientRect();
      const offset = rect.top + win.scrollY;
      this.snapPoints.push({ id, offset });
    }
    this.snapPoints.sort((a, b) => a.offset - b.offset);
  }
}
