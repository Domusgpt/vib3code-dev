import {
  VIB34DRenderer,
  defaultConfig,
  easeInOutCubic,
  getGeometryDefinition,
  type FrameStats,
  type QualityTier,
  type RendererAdapter,
  type RendererAppearance,
  type VIB34DConfig,
  type Vec4,
  type VisualizerRole
} from "@vib34d/core";
import type { TransitionRequest } from "@vib34d/transition";

export interface InstanceTemplate {
  readonly role: VisualizerRole;
  readonly modifier: number;
  readonly opacity: number;
  readonly zIndex: number;
}

export interface RendererController {
  attach(canvas: HTMLCanvasElement): Promise<void>;
  resize(width: number, height: number): void;
  setReducedMotion(enabled: boolean): void;
  setSpeedMultiplier(multiplier: number): void;
  setScale(scale: number): void;
  setAppearance(appearance: Partial<RendererAppearance>): void;
  setWarpIntensity?(intensity: number): void;
  setWarpAnchor?(anchor: Vec4): void;
  applyTransition(transition: {
    toGeometry: string;
    fromGeometry?: string;
    durationMs: number;
    intensity: number;
    easing?: (t: number) => number;
  }): void;
  pause(): void;
}

export interface RendererFactoryContext {
  readonly adapter: RendererAdapter;
  readonly geometry: string;
  readonly template: InstanceTemplate;
  readonly sectionId: string;
  readonly reducedMotion: boolean;
  readonly onFrameStats: (stats: FrameStats, meta: { quality: QualityTier; reducedMotion: boolean }) => void;
}

export type RendererFactory = (context: RendererFactoryContext) => RendererController;

export interface VisualizerInstance {
  readonly role: VisualizerRole;
  readonly modifier: number;
  readonly canvas: HTMLCanvasElement;
  readonly renderer: RendererController;
  active: boolean;
}

export interface SectionInstanceCluster {
  readonly sectionId: string;
  readonly instances: VisualizerInstance[];
  geometry: string;
}

export interface FrameStatsEvent {
  readonly sectionId: string;
  readonly role: VisualizerRole;
  readonly stats: FrameStats;
  readonly quality: QualityTier;
  readonly reducedMotion: boolean;
}

export type FrameStatsListener = (event: FrameStatsEvent) => void;

export interface MultiInstanceOrchestratorOptions {
  readonly rendererFactory?: RendererFactory;
}

interface NormalizedSectionParams {
  readonly scale: number;
  readonly speed: number;
  readonly luminance: number;
}

interface PortalTimerEntry {
  readonly timer: number;
  readonly revert: () => void;
}

const DEFAULT_SECTION_PARAMS = {
  baseScale: 42,
  velocity: 18,
  luminance: 12
};

export class MultiInstanceOrchestrator {
  private readonly adapter: RendererAdapter;
  private readonly config: VIB34DConfig;
  private readonly clusters = new Map<string, SectionInstanceCluster>();
  private readonly templates: InstanceTemplate[];
  private readonly frameListeners = new Set<FrameStatsListener>();
  private readonly sectionParameters = new Map<string, Record<string, number>>();
  private readonly portalTimers = new WeakMap<HTMLCanvasElement, PortalTimerEntry>();
  private readonly rendererFactory: RendererFactory;
  private reducedMotion: boolean;
  private readonly maxActiveSections: number;
  private readonly activeSectionOrder: string[] = [];
  private readonly portalEffectsEnabled: boolean;

  constructor(adapter: RendererAdapter, config: Partial<VIB34DConfig> = {}, options: MultiInstanceOrchestratorOptions = {}) {
    this.adapter = adapter;
    this.config = { ...defaultConfig, ...config };
    this.templates = this.buildDefaultTemplates();
    this.reducedMotion = Boolean(this.config.reducedMotion);
    const instancesPerSection = Math.max(1, this.config.visualizerCount || 1);
    const maxVisualizerBudget = Math.max(instancesPerSection, this.config.maxActiveVisualizers || instancesPerSection);
    this.maxActiveSections = Math.max(1, Math.floor(maxVisualizerBudget / instancesPerSection));
    this.portalEffectsEnabled = this.config.portalEffectsEnabled !== false;
    this.rendererFactory =
      options.rendererFactory ??
      ((context) =>
        new VIB34DRenderer(context.adapter, {
          geometryKey: context.geometry,
          scale: context.template.modifier,
          rotationMultiplier: context.template.modifier,
          adapterOptions: { preferWebGPU: true },
          appearance: this.resolveAppearance(context.template.role),
          targetFrameTime: 1000 / Math.max(1, this.config.targetFPS || 60),
          reducedMotion: context.reducedMotion,
          onFrameStats: context.onFrameStats
        }));
  }

  async mountSection(sectionId: string, canvasFactory: () => HTMLCanvasElement): Promise<SectionInstanceCluster> {
    if (this.clusters.has(sectionId)) {
      return this.clusters.get(sectionId)!;
    }

    const section = this.config.sections[sectionId];
    if (!section) {
      throw new Error(`Unknown section configuration: ${sectionId}`);
    }

    const instances: VisualizerInstance[] = [];
    const geometry = getGeometryDefinition(section.geometry).key;

    for (const template of this.templates.slice(0, this.config.visualizerCount)) {
      const canvas = canvasFactory();
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.zIndex = String(template.zIndex);
      canvas.style.opacity = template.opacity.toString();
      canvas.style.mixBlendMode = "screen";
      canvas.style.transition = this.reducedMotion ? "none" : "opacity 420ms ease, filter 420ms ease";
      canvas.style.pointerEvents = "none";
      canvas.dataset.role = template.role;
      canvas.dataset.section = sectionId;
      canvas.dataset.active = "false";

      const renderer = this.rendererFactory({
        adapter: this.adapter,
        geometry,
        template,
        sectionId,
        reducedMotion: this.reducedMotion,
        onFrameStats: (stats, meta) =>
          this.emitFrameStats({
            sectionId,
            role: template.role,
            stats,
            quality: meta.quality,
            reducedMotion: meta.reducedMotion
          })
      });

      await renderer.attach(canvas);
      instances.push({
        role: template.role,
        modifier: template.modifier,
        canvas,
        renderer,
        active: false
      });
    }

    const cluster: SectionInstanceCluster = { sectionId, instances, geometry: section.geometry };
    this.clusters.set(sectionId, cluster);

    const existingParams = this.sectionParameters.get(sectionId);
    if (existingParams) {
      this.applySectionParams(sectionId, existingParams);
    } else {
      this.applySectionParams(sectionId, this.buildDefaultParams(section.modifier));
    }

    return cluster;
  }

  getCluster(sectionId: string): SectionInstanceCluster | undefined {
    return this.clusters.get(sectionId);
  }

  disposeSection(sectionId: string): void {
    const cluster = this.clusters.get(sectionId);
    if (!cluster) return;
    for (const instance of cluster.instances) {
      this.clearPortalTimer(instance.canvas);
      instance.renderer.pause();
      instance.canvas.remove();
    }
    this.clusters.delete(sectionId);
    this.sectionParameters.delete(sectionId);
    const orderIndex = this.activeSectionOrder.indexOf(sectionId);
    if (orderIndex !== -1) {
      this.activeSectionOrder.splice(orderIndex, 1);
    }
  }

  onFrameStats(listener: FrameStatsListener): () => void {
    this.frameListeners.add(listener);
    return () => this.frameListeners.delete(listener);
  }

  setReducedMotion(enabled: boolean): void {
    if (this.reducedMotion === enabled) return;
    this.reducedMotion = enabled;
    for (const cluster of this.clusters.values()) {
      for (const instance of cluster.instances) {
        instance.canvas.style.transition = enabled ? "none" : "opacity 420ms ease, filter 420ms ease";
        this.clearPortalTimer(instance.canvas);
        instance.canvas.style.boxShadow = "";
        instance.renderer.setReducedMotion(enabled);
        if (enabled) {
          instance.renderer.setWarpIntensity?.(0);
        } else {
          instance.renderer.setWarpIntensity?.(this.readWarpBaseline(instance.canvas));
        }
        this.updateCanvasActivation(instance);
      }
    }
  }

  isReducedMotion(): boolean {
    return this.reducedMotion;
  }

  activateSection(sectionId: string): void {
    const cluster = this.clusters.get(sectionId);
    if (!cluster) return;
    const existingIndex = this.activeSectionOrder.indexOf(sectionId);
    if (existingIndex !== -1) {
      this.activeSectionOrder.splice(existingIndex, 1);
    }
    for (const instance of cluster.instances) {
      instance.active = true;
      if (!this.portalTimers.has(instance.canvas)) {
        this.updateCanvasActivation(instance);
      }
    }
    this.activeSectionOrder.push(sectionId);
    this.enforceActiveSectionLimit();
  }

  deactivateSection(sectionId: string): void {
    const cluster = this.clusters.get(sectionId);
    if (!cluster) return;
    const existingIndex = this.activeSectionOrder.indexOf(sectionId);
    if (existingIndex !== -1) {
      this.activeSectionOrder.splice(existingIndex, 1);
    }
    for (const instance of cluster.instances) {
      instance.active = false;
      this.clearPortalTimer(instance.canvas);
      instance.renderer.setWarpIntensity?.(this.readWarpBaseline(instance.canvas));
      if (!this.portalTimers.has(instance.canvas)) {
        this.updateCanvasActivation(instance);
      }
    }
  }

  applyTransition(sectionId: string, transition: TransitionRequest): void {
    const cluster = this.clusters.get(sectionId);
    if (!cluster) return;
    const easingFn = transition.easing === "easeInOutCubic" ? easeInOutCubic : undefined;
    for (const instance of cluster.instances) {
      instance.renderer.applyTransition({
        toGeometry: transition.toGeometry,
        fromGeometry: transition.fromGeometry,
        durationMs: transition.durationMs,
        intensity: transition.intensity,
        easing: easingFn
      });
      this.applyPortalEffect(instance, transition.intensity, transition.durationMs);
    }
    cluster.geometry = transition.toGeometry;
  }

  applySectionParams(sectionId: string, params: Record<string, number>): void {
    const copy = { ...params };
    this.sectionParameters.set(sectionId, copy);
    const cluster = this.clusters.get(sectionId);
    if (!cluster) {
      return;
    }
    const normalized = this.normalizeSectionParams(sectionId, copy);
    for (const instance of cluster.instances) {
      this.applyParamsToInstance(instance, normalized);
    }
  }

  resizeAll(): void {
    const dpr = (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1;
    for (const cluster of this.clusters.values()) {
      for (const instance of cluster.instances) {
        const width = Math.max(1, Math.floor(instance.canvas.clientWidth * dpr));
        const height = Math.max(1, Math.floor(instance.canvas.clientHeight * dpr));
        instance.renderer.resize(width, height);
      }
    }
  }

  private applyParamsToInstance(instance: VisualizerInstance, params: NormalizedSectionParams): void {
    const scaleValue = params.scale * instance.modifier;
    const speedValue = params.speed * instance.modifier;
    instance.renderer.setScale(scaleValue);
    instance.renderer.setSpeedMultiplier(speedValue);
    instance.renderer.setAppearance(this.tintAppearance(instance.role, params.luminance));
    instance.canvas.dataset.scale = scaleValue.toFixed(3);
    instance.canvas.dataset.velocity = speedValue.toFixed(3);
    instance.canvas.dataset.luminance = params.luminance.toFixed(3);
    const warpBaseline = this.computeWarpIntensity(params, instance.modifier);
    instance.canvas.dataset.warp = warpBaseline.toFixed(3);
    if (!this.portalTimers.has(instance.canvas)) {
      instance.renderer.setWarpIntensity?.(warpBaseline);
    }
    const warpAnchor = this.computeWarpAnchor(params, instance.modifier);
    instance.renderer.setWarpAnchor?.(warpAnchor);
    if (!this.portalTimers.has(instance.canvas)) {
      this.updateCanvasActivation(instance);
    }
  }

  private normalizeSectionParams(sectionId: string, params: Record<string, number>): NormalizedSectionParams {
    const baseScale = params.baseScale ?? DEFAULT_SECTION_PARAMS.baseScale;
    const velocity = params.velocity ?? DEFAULT_SECTION_PARAMS.velocity;
    const luminance = params.luminance ?? DEFAULT_SECTION_PARAMS.luminance;
    const modifier = this.config.sections[sectionId]?.modifier ?? 1;
    const scale = clamp((baseScale / DEFAULT_SECTION_PARAMS.baseScale) * modifier, 0.25, 3);
    const speed = clamp((velocity / DEFAULT_SECTION_PARAMS.velocity) * modifier, 0.1, 4);
    const luminanceFactor = clamp(luminance / DEFAULT_SECTION_PARAMS.luminance, 0.3, 2.4);
    return { scale, speed, luminance: luminanceFactor };
  }

  private computeWarpIntensity(params: NormalizedSectionParams, modifier: number): number {
    const luminanceComponent = clamp((params.luminance - 0.75) * 0.55, 0, 0.8);
    const speedComponent = clamp((params.speed - 0.9) * 0.35, 0, 0.6);
    const scaleComponent = clamp((params.scale - 0.8) * 0.25, 0, 0.4);
    const combined = (luminanceComponent + speedComponent + scaleComponent) * modifier;
    return clamp(combined, 0, 1);
  }

  private computeWarpAnchor(params: NormalizedSectionParams, modifier: number): Vec4 {
    const depth = clamp(0.2 + params.scale * 0.18, 0.25, 1.1);
    const offset = clamp(0.35 + modifier * 0.12, 0.2, 0.95);
    return [0, 0, depth, offset] as Vec4;
  }

  private readWarpBaseline(canvas: HTMLCanvasElement): number {
    const raw = canvas.dataset.warp;
    const parsed = raw ? Number.parseFloat(raw) : NaN;
    if (Number.isFinite(parsed)) {
      return clamp(parsed, 0, 1);
    }
    return 0;
  }

  private buildDefaultParams(modifier: number): Record<string, number> {
    return {
      baseScale: DEFAULT_SECTION_PARAMS.baseScale * modifier,
      velocity: DEFAULT_SECTION_PARAMS.velocity * modifier,
      luminance: DEFAULT_SECTION_PARAMS.luminance * modifier
    };
  }

  private applyPortalEffect(instance: VisualizerInstance, intensity: number, durationMs: number): void {
    if (this.reducedMotion || !this.portalEffectsEnabled || typeof window === "undefined") {
      return;
    }
    const clamped = clamp(intensity, 0, 1);
    const canvas = instance.canvas;
    const win = window as Window;
    const existing = this.portalTimers.get(canvas);
    if (existing) {
      win.clearTimeout(existing.timer);
      existing.revert();
    }
    canvas.style.boxShadow = `0 0 ${18 + clamped * 40}px rgba(118, 216, 255, ${0.25 + clamped * 0.45})`;
    canvas.style.filter = `saturate(${(instance.active ? 1.1 : 0.95) + clamped * 0.8}) drop-shadow(0 0 ${12 + clamped * 18}px rgba(120, 210, 255, ${0.35 + clamped * 0.4}))`;
    const baseline = this.readWarpBaseline(canvas);
    const boosted = clamp(baseline + clamped * 0.5, 0, 1);
    instance.renderer.setWarpIntensity?.(boosted);
    const revert = () => {
      canvas.style.boxShadow = "";
      instance.renderer.setWarpIntensity?.(this.readWarpBaseline(canvas));
      this.portalTimers.delete(canvas);
      this.updateCanvasActivation(instance);
    };
    const timer = win.setTimeout(revert, Math.max(240, durationMs));
    this.portalTimers.set(canvas, { timer, revert });
  }

  private updateCanvasActivation(instance: VisualizerInstance): void {
    if (this.reducedMotion) {
      instance.canvas.dataset.active = instance.active ? "true" : "false";
      instance.canvas.style.opacity = instance.active ? "1" : "0.6";
      instance.canvas.style.filter = "none";
      return;
    }
    const activeOpacity = instance.modifier >= 1 ? 1 : 0.85;
    instance.canvas.dataset.active = instance.active ? "true" : "false";
    instance.canvas.style.opacity = instance.active ? activeOpacity.toString() : "0.45";
    instance.canvas.style.filter = instance.active ? "saturate(1.1)" : "blur(8px) saturate(0.8)";
  }

  private clearPortalTimer(canvas: HTMLCanvasElement): void {
    if (typeof window === "undefined") return;
    const entry = this.portalTimers.get(canvas);
    if (entry) {
      window.clearTimeout(entry.timer);
      entry.revert();
    }
  }

  private enforceActiveSectionLimit(): void {
    while (this.activeSectionOrder.length > this.maxActiveSections) {
      const oldest = this.activeSectionOrder.shift();
      if (!oldest) break;
      const cluster = this.clusters.get(oldest);
      if (!cluster) {
        continue;
      }
      for (const instance of cluster.instances) {
        this.clearPortalTimer(instance.canvas);
        instance.active = false;
        instance.renderer.setWarpIntensity?.(this.readWarpBaseline(instance.canvas));
        this.updateCanvasActivation(instance);
      }
    }
  }

  private emitFrameStats(event: FrameStatsEvent): void {
    for (const listener of this.frameListeners) {
      listener(event);
    }
  }

  private buildDefaultTemplates(): InstanceTemplate[] {
    const roles = this.config.visualizerRoles;
    const modifiers = [1, 1.3, 0.7, 0.5];
    return roles.map((role, index) => ({
      role,
      modifier: modifiers[index] ?? 1,
      opacity: role === "background" ? 0.35 : role === "accent" ? 0.65 : 0.95,
      zIndex: index
    }));
  }

  private tintAppearance(role: VisualizerRole, luminance: number): RendererAppearance {
    const base = this.resolveAppearance(role);
    return {
      lineColor: tintColor(base.lineColor, luminance),
      backgroundColor: tintColor(base.backgroundColor, clamp(0.6 + luminance * 0.25, 0.4, 1.4))
    };
  }

  private resolveAppearance(role: VisualizerRole): RendererAppearance {
    switch (role) {
      case "background":
        return {
          lineColor: [0.32, 0.72, 0.95, 0.55],
          backgroundColor: [0.01, 0.02, 0.08, 1]
        };
      case "accent":
        return {
          lineColor: [0.96, 0.54, 0.93, 0.88],
          backgroundColor: [0.03, 0.02, 0.09, 1]
        };
      case "foreground":
        return {
          lineColor: [0.98, 0.85, 0.45, 0.92],
          backgroundColor: [0.03, 0.04, 0.1, 1]
        };
      default:
        return {
          lineColor: [0.82, 0.97, 1, 0.92],
          backgroundColor: [0.04, 0.05, 0.08, 1]
        };
    }
  }
}

function tintColor(color: readonly [number, number, number, number], factor: number): [number, number, number, number] {
  const nextFactor = clamp(factor, 0.2, 2.5);
  return [
    clamp(color[0] * nextFactor, 0, 1),
    clamp(color[1] * nextFactor, 0, 1),
    clamp(color[2] * nextFactor, 0, 1),
    color[3]
  ];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
