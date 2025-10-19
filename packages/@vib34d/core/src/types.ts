export type Vec3 = readonly [number, number, number];
export type Vec4 = readonly [number, number, number, number];

export interface Rotor4 {
  readonly xy: number;
  readonly xz: number;
  readonly xw: number;
  readonly yz: number;
  readonly yw: number;
  readonly zw: number;
}

export interface Camera4 {
  position: Vec4;
  forward: Vec4;
  up: Vec4;
  right: Vec4;
  fov: number;
}

export type QualityTier = "high" | "medium" | "low";

export interface FrameStats {
  readonly frameId: number;
  readonly timestamp: number;
  readonly averageFrameTime: number;
  readonly droppedFrames: number;
}

export type RendererContext = WebGL2RenderingContext | WebGLRenderingContext | unknown;

export interface RendererHandle {
  readonly canvas: HTMLCanvasElement;
  readonly context: RendererContext | null;
}

export interface TelemetryEvent {
  readonly t: number;
  readonly type: "fps" | "error" | "pose" | "scroll";
  readonly payload: Record<string, unknown>;
}
