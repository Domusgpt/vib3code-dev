import type { Camera4, FrameStats, RendererHandle, Rotor4, TelemetryEvent, Vec3, Vec4 } from "./types.js";

export interface RendererAdapterOptions {
  preferWebGPU?: boolean;
  xr?: boolean;
}

export interface RendererAdapter {
  init(canvas: HTMLCanvasElement, opts?: RendererAdapterOptions): Promise<RendererHandle>;
  setShaders(
    handle: RendererHandle,
    source: {
      glsl?: { vertex: string; fragment: string };
      wgsl?: string;
    }
  ): void;
  onFrame(handle: RendererHandle, callback: (deltaMs: number, stats: FrameStats) => void): void;
  dispose(handle: RendererHandle): void;
  readonly math: {
    rotate4D(vector: Vec4, rotor: Rotor4): Vec4;
    project4Dto3D(vector: Vec4, camera: Camera4): Vec3;
    polytopeWarp?: (point: Vec4, params: WarpParams) => Vec4;
  };
  readonly telemetry: {
    batch(events: TelemetryEvent[]): void;
    flush(): void;
  };
}

export interface WarpParams {
  readonly iterations: number;
  readonly tension: number;
  readonly anchor: Vec4;
}
