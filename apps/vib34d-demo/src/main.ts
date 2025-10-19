import {
  defaultConfig,
  type SectionConfig,
  type VIB34DConfig
} from "@vib34d/core";
import { createQuaternionSDKAdapter } from "@vib34d/adapter-sdk";
import { createVib3PlusAdapter } from "@vib34d/adapter-vib3plus";
import { HomeMaster, DEFAULT_HOME_MASTER_CHANNEL } from "@vib34d/home-master";
import { MultiInstanceOrchestrator, type FrameStatsEvent } from "@vib34d/multi";
import { ScrollOrchestrator } from "@vib34d/scroll";
import { TelemetryBatcher } from "@vib34d/telemetry";
import { TransitionEngine } from "@vib34d/transition";
import { createCrystalButton } from "@vib34d/crystal-ui";

const appRoot = document.getElementById("app");
if (!appRoot) throw new Error("Missing #app container");

const sections: Record<string, SectionConfig> = {
  home: { geometry: "hypercube", modifier: 1, snapPoint: 0 },
  articles: { geometry: "prism", modifier: 1.3, snapPoint: 1 },
  videos: { geometry: "tetra", modifier: 0.7, snapPoint: 2 },
  podcasts: { geometry: "dodeca", modifier: 0.9, snapPoint: 3 },
  ema: { geometry: "octa", modifier: 1.1, snapPoint: 4 }
};

const sectionCopy: Record<string, string> = {
  home: "Master harmonics recalibrate each downstream instance, providing a resonant origin point for the entire scroll journey.",
  articles: "Crystalized typography and softly morphing prisms sync to editorial cadences, emphasizing depth and intent.",
  videos: "Tetra portals weave motion cues with playback envelopes, inviting immersion while respecting reduced-motion states.",
  podcasts: "Dodeca shells reverberate with amplitude clusters, creating a tactile scaffold for multi-host narratives.",
  ema: "Octa lattices highlight event-mode announcements, balancing urgency with breathable, lucid space."
};

interface NavContext {
  highlight(sectionId: string): void;
  updateReducedMotion(enabled: boolean, source?: "media" | "user"): void;
  focus(sectionId: string): void;
}

const motionMedia =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : undefined;

const initialReducedMotion = motionMedia?.matches ?? false;

const config: VIB34DConfig = {
  ...defaultConfig,
  visualizerCount: 3,
  sections,
  editorMode: false,
  showControls: false,
  debugMode: true,
  reducedMotion: initialReducedMotion
};

let navContext: NavContext | undefined;
let activeSection = Object.keys(sections)[0];

const adapterPreference = matchPreferredAdapter();
const adapter = adapterPreference === "quaternion" ? createQuaternionSDKAdapter() : createVib3PlusAdapter();
const homeMaster = new HomeMaster({ baseScale: 42, luminance: 12, velocity: 18 }, {
  syncChannel: matchSyncChannel()
});
const orchestrator = new MultiInstanceOrchestrator(adapter, config);
const scroll = new ScrollOrchestrator({
  windowRef: window,
  snapEnabled: config.scrollSnapEnabled
});
const transition = new TransitionEngine(adapter);
const telemetry = new TelemetryBatcher(adapter, { flushIntervalMs: 8000 });

document.body.dataset.reducedMotion = String(config.reducedMotion ?? false);
window.VIB34DSyncChannel = homeMaster.getSyncChannel();

if (typeof window !== "undefined") {
  const teardown = () => telemetry.dispose();
  window.addEventListener("beforeunload", teardown, { once: true });
  window.addEventListener("pagehide", teardown, { once: true });
}

void bootstrap();

function applyReducedMotion(enabled: boolean, source: "media" | "user" = "media"): void {
  config.reducedMotion = enabled;
  document.body.dataset.reducedMotion = String(enabled);
  orchestrator.setReducedMotion(enabled);
  navContext?.updateReducedMotion(enabled, source);
}

async function bootstrap(): Promise<void> {
  const container = document.createElement("div");
  container.className = "vib34d-demo";
  appRoot.appendChild(container);

  const sectionEntries = Object.entries(sections);
  homeMaster.onMasterChange(() => {
    for (const [sectionId, section] of sectionEntries) {
      const derived = homeMaster.derive(sectionId, section.modifier);
      orchestrator.applySectionParams(sectionId, derived);
    }
  });
  homeMaster.setMasterParams(homeMaster.getCurrentParams());
  activeSection = sectionEntries[0]?.[0] ?? activeSection;
  navContext = setupCrystalNavigation(sectionEntries.map(([id]) => id));
  navContext?.updateReducedMotion(config.reducedMotion ?? false);
  for (const [sectionId, section] of sectionEntries) {
    const element = document.createElement("section");
    element.id = sectionId;
    element.dataset.geometry = section.geometry;
    element.className = "demo-section";

    const heading = document.createElement("h2");
    heading.textContent = sectionId.toUpperCase();
    element.appendChild(heading);

    const paragraph = document.createElement("p");
    paragraph.textContent = sectionCopy[sectionId] ?? "";
    element.appendChild(paragraph);

    const canvasHost = document.createElement("div");
    canvasHost.className = "canvas-host";
    canvasHost.style.position = "relative";
    canvasHost.style.width = "100%";
    canvasHost.style.height = "420px";
    canvasHost.style.marginTop = "32px";
    element.appendChild(canvasHost);

    const derivedParams = homeMaster.derive(sectionId, section.modifier);
    element.dataset.derived = JSON.stringify(derivedParams);

    await orchestrator.mountSection(sectionId, () => {
      const canvas = document.createElement("canvas");
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(canvasHost.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvasHost.clientHeight * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.dataset.role = "visualizer";
      canvasHost.appendChild(canvas);
      return canvas;
    });
    orchestrator.applySectionParams(sectionId, derivedParams);

    container.appendChild(element);
    scroll.registerSectionElement(sectionId, element);
  }

  const sectionIds = sectionEntries.map(([id]) => id);
  setupIntersectionObservers(container, sectionIds);
  setupScrollTelemetry();
  setupFrameTelemetry();
  setupTransitions(sectionIds);
  setupKeyboardNavigation(sectionIds);
  if (motionMedia) {
    setupReducedMotionSync(motionMedia);
  } else {
    applyReducedMotion(config.reducedMotion ?? false);
  }
  scroll.refresh();
  orchestrator.activateSection(sectionEntries[0][0]);
  navContext?.highlight(sectionEntries[0][0]);
  orchestrator.resizeAll();
  window.addEventListener("resize", () => {
    orchestrator.resizeAll();
    scroll.refresh();
  });
}

function setupIntersectionObservers(root: HTMLElement, sectionIds: string[]): void {
  if (typeof IntersectionObserver === "undefined") return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        .slice(0, 1)
        .forEach((entry) => {
          scroll.setSection(entry.target.id);
          orchestrator.activateSection(entry.target.id);
          for (const other of sectionIds) {
            if (other !== entry.target.id) {
              orchestrator.deactivateSection(other);
            }
          }
        });
    },
    { root: null, rootMargin: config.viewportMargin, threshold: [0.1, 0.25, 0.5, 0.75, 1] }
  );
  sectionIds.forEach((sectionId) => {
    const element = root.querySelector(`#${sectionId}`);
    if (element) observer.observe(element);
  });
}

function setupScrollTelemetry(): void {
  let lastTimestamp = performance.now();
  let lastTouchY = 0;
  window.addEventListener("wheel", (event) => {
    const now = performance.now();
    const intensity = scroll.record(event.deltaY, now - lastTimestamp);
    lastTimestamp = now;
    telemetry.push({
      t: now,
      type: "scroll",
      payload: { deltaY: event.deltaY, intensity: intensity.bucket }
    });
  });
  window.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    const now = performance.now();
    if (lastTouchY === 0) {
      lastTouchY = touch.clientY;
      lastTimestamp = now;
      return;
    }
    const deltaY = lastTouchY - touch.clientY;
    const intensity = scroll.record(deltaY, now - lastTimestamp);
    lastTimestamp = now;
    lastTouchY = touch.clientY;
    telemetry.push({
      t: now,
      type: "scroll",
      payload: { deltaY, intensity: intensity.bucket, input: "touch" }
    });
  });
  const resetTouch = () => {
    lastTouchY = 0;
  };
  window.addEventListener("touchend", resetTouch);
  window.addEventListener("touchcancel", resetTouch);
}

function setupFrameTelemetry(): void {
  orchestrator.onFrameStats((event: FrameStatsEvent) => {
    const fps = event.stats.averageFrameTime > 0 ? 1000 / event.stats.averageFrameTime : 0;
    telemetry.push({
      t: event.stats.timestamp,
      type: "fps",
      payload: {
        sectionId: event.sectionId,
        role: event.role,
        fps: Number(fps.toFixed(2)),
        frameTime: Number(event.stats.averageFrameTime.toFixed(2)),
        dropped: event.stats.droppedFrames,
        quality: event.quality,
        reducedMotion: event.reducedMotion
      }
    });
  });
}

function setupTransitions(sectionIds: string[]): void {
  let lastSection = sectionIds[0];
  transition.onTransition((request) => {
    if (!request.sectionId) return;
    orchestrator.applyTransition(request.sectionId, request);
  });
  scroll.onSectionChange((sectionId, intensity) => {
    const from = lastSection;
    const to = sectionId;
    lastSection = sectionId;
    activeSection = to;
    navContext?.highlight(to);
    transition.apply({
      sectionId: to,
      fromGeometry: sections[from].geometry,
      toGeometry: sections[to].geometry,
      intensity: Math.min(intensity.velocity / 60, 1),
      durationMs: intensity.bucket === "dramatic" ? 1800 : intensity.bucket === "standard" ? 1000 : 600,
      easing: "easeInOutCubic"
    });
  });
}

function setupKeyboardNavigation(sectionIds: string[]): void {
  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    let movement: number | null = null;
    switch (event.key) {
      case "ArrowDown":
      case "PageDown":
        movement = 1;
        break;
      case "ArrowUp":
      case "PageUp":
        movement = -1;
        break;
      case "Home":
        movement = -Infinity;
        break;
      case "End":
        movement = Infinity;
        break;
      default:
        return;
    }
    event.preventDefault();
    const currentIndex = sectionIds.indexOf(activeSection);
    if (currentIndex === -1) return;
    let targetIndex = currentIndex;
    if (movement === -Infinity) targetIndex = 0;
    else if (movement === Infinity) targetIndex = sectionIds.length - 1;
    else targetIndex = Math.min(sectionIds.length - 1, Math.max(0, currentIndex + movement));
    const targetSection = sectionIds[targetIndex];
    if (!targetSection || targetSection === activeSection) return;
    scrollToSection(targetSection);
    navContext?.focus(targetSection);
  });
}

function setupReducedMotionSync(media: MediaQueryList): void {
  applyReducedMotion(config.reducedMotion ?? media.matches);
  const handler = (event: MediaQueryListEvent) => {
    applyReducedMotion(event.matches, "media");
  };
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handler);
  } else {
    media.addListener(handler);
  }
}

function setupCrystalNavigation(sectionIds: string[]): NavContext {
  const nav = document.createElement("nav");
  nav.className = "crystal-nav";
  nav.setAttribute("aria-label", "Section navigation");
  const tray = document.createElement("div");
  tray.className = "crystal-nav__tray";
  nav.appendChild(tray);

  const buttonMap = new Map<string, ReturnType<typeof createCrystalButton>>();
  sectionIds.forEach((sectionId) => {
    const button = createCrystalButton({
      label: sectionId.toUpperCase(),
      onHover: () => orchestrator.activateSection(sectionId),
      onClick: () => {
        scrollToSection(sectionId);
        navContext?.focus(sectionId);
      },
      reducedMotion: config.reducedMotion
    });
    button.element.classList.add("crystal-nav__button");
    button.element.dataset.section = sectionId;
    button.element.setAttribute("aria-controls", sectionId);
    tray.appendChild(button.element);
    buttonMap.set(sectionId, button);
  });

  const toggle = createCrystalButton({
    label: config.reducedMotion ? "Reduced Motion: On" : "Reduced Motion: Off",
    onClick: () => {
      const next = !orchestrator.isReducedMotion();
      applyReducedMotion(next, "user");
    },
    reducedMotion: true
  });
  toggle.element.classList.add("crystal-nav__toggle");
  toggle.element.setAttribute("aria-pressed", String(config.reducedMotion ?? false));
  nav.appendChild(toggle.element);

  appRoot.prepend(nav);

  return {
    highlight(sectionId) {
      for (const [id, api] of buttonMap) {
        api.setActive(id === sectionId);
      }
    },
    updateReducedMotion(enabled) {
      toggle.setLabel(enabled ? "Reduced Motion: On" : "Reduced Motion: Off");
      toggle.element.setAttribute("aria-pressed", String(enabled));
      for (const api of buttonMap.values()) {
        if (enabled) {
          delete api.element.dataset.motion;
        } else {
          api.element.dataset.motion = "crystal";
        }
      }
    },
    focus(sectionId) {
      buttonMap.get(sectionId)?.element.focus();
    }
  };
}

function scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (!element) return;
  element.scrollIntoView({ behavior: config.reducedMotion ? "auto" : "smooth", block: "start" });
  scroll.setSection(sectionId);
}

function matchPreferredAdapter(): "quaternion" | "vib3plus" {
  const search = new URLSearchParams(window.location.search);
  const preferred = search.get("adapter");
  return preferred === "vib3plus" ? "vib3plus" : "quaternion";
}

function matchSyncChannel(): string {
  const search = new URLSearchParams(window.location.search);
  return search.get("syncChannel") ?? DEFAULT_HOME_MASTER_CHANNEL;
}

declare global {
  interface Window {
    VIB34DConfig?: VIB34DConfig;
    VIB34DSyncChannel?: string;
  }
}

window.VIB34DConfig = config;
