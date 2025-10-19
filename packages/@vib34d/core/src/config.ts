export type VisualizerRole = "background" | "content" | "accent" | "foreground";

export interface SectionConfig {
  readonly geometry: string;
  readonly modifier: number;
  readonly snapPoint: number;
  readonly overrides?: Partial<Record<string, unknown>>;
}

export interface TransitionOverrides {
  readonly rule?: string;
  readonly durationMs?: number;
  readonly easing?: string;
}

export interface SectionTransitionConfig {
  readonly from: string;
  readonly to: string;
  readonly overrides?: TransitionOverrides;
}

export interface VIB34DConfig {
  visualizerCount: number;
  visualizerRoles: VisualizerRole[];
  sections: Record<string, SectionConfig>;
  defaultTransitionRule: string;
  portalEffectsEnabled: boolean;
  scrollSnapEnabled: boolean;
  maxActiveVisualizers: number;
  viewportMargin: string;
  targetFPS: number;
  editorMode: boolean;
  showControls: boolean;
  debugMode: boolean;
  reducedMotion?: boolean;
  telemetry?: {
    enabled: boolean;
    flushIntervalMs?: number;
  };
  transitions?: SectionTransitionConfig[];
}

export const defaultConfig: VIB34DConfig = {
  visualizerCount: 3,
  visualizerRoles: ["background", "content", "accent"],
  sections: {},
  defaultTransitionRule: "home.master",
  portalEffectsEnabled: true,
  scrollSnapEnabled: true,
  maxActiveVisualizers: 6,
  viewportMargin: "33%",
  targetFPS: 60,
  editorMode: false,
  showControls: false,
  debugMode: false,
  telemetry: {
    enabled: true,
    flushIntervalMs: 15000
  }
};
