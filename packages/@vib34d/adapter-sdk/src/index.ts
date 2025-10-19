import {
  applyMatrix4,
  composeRotationMatrix,
  project4Dto3D as coreProject4Dto3D,
  type Camera4,
  type FrameStats,
  type RendererAdapter,
  type RendererAdapterOptions,
  type RendererHandle,
  type Rotor4,
  type TelemetryEvent,
  type Vec3,
  type Vec4
} from "@vib34d/core";

interface InternalHandle extends RendererHandle {
  shaderSource?: {
    glsl?: { vertex: string; fragment: string };
    wgsl?: string;
  };
  frameCallback?: (delta: number, stats: FrameStats) => void;
  lastTimestamp?: number;
  rafId?: number;
}

const math: RendererAdapter["math"] = {
  rotate4D(vector: Vec4, rotor: Rotor4): Vec4 {
    const matrix = composeRotationMatrix({
      xy: rotor.xy,
      xz: rotor.xz,
      xw: rotor.xw,
      yz: rotor.yz,
      yw: rotor.yw,
      zw: rotor.zw
    });
    return applyMatrix4(matrix, vector);
  },
  project4Dto3D(vector: Vec4, camera: Camera4): Vec3 {
    const relative: Vec4 = [
      vector[0] - camera.position[0],
      vector[1] - camera.position[1],
      vector[2] - camera.position[2],
      vector[3] - camera.position[3]
    ];
    const oriented: Vec4 = [
      dot4(relative, camera.right),
      dot4(relative, camera.up),
      dot4(relative, camera.forward),
      relative[3]
    ];
    const distance = computePerspectiveDistance(camera.fov);
    return coreProject4Dto3D(oriented, distance);
  }
};

function dot4(a: Vec4, b: Vec4): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

function computePerspectiveDistance(fov: number): number {
  const clamped = Number.isFinite(fov) ? Math.min(179, Math.max(1, fov)) : 74;
  const radians = (clamped * Math.PI) / 180;
  const tan = Math.tan(radians / 2);
  if (!Number.isFinite(tan) || tan <= 0) {
    return 3.2;
  }
  return Math.max(0.5, 1 / tan);
}

const telemetry: RendererAdapter["telemetry"] = {
  batch(events: TelemetryEvent[]) {
    if (events.length) {
      console.debug("[quaternion-sdk] batching telemetry", events.length);
    }
  },
  flush() {
    console.debug("[quaternion-sdk] flush telemetry");
  }
};

export class QuaternionSDKAdapter implements RendererAdapter {
  readonly math = math;
  readonly telemetry = telemetry;

  async init(canvas: HTMLCanvasElement, _opts: RendererAdapterOptions = {}): Promise<RendererHandle> {
    const context = canvas.getContext("webgl2");
    const handle = { canvas, context } as InternalHandle;
    return handle;
  }

  setShaders(handle: RendererHandle, source: { glsl?: { vertex: string; fragment: string }; wgsl?: string }): void {
    const internal = handle as InternalHandle;
    internal.shaderSource = source;
  }

  onFrame(handle: RendererHandle, callback: (deltaMs: number, stats: FrameStats) => void): void {
    const internal = handle as InternalHandle;
    internal.frameCallback = callback;
    const step = (timestamp: number) => {
      if (!internal.frameCallback) return;
      const delta = internal.lastTimestamp ? timestamp - internal.lastTimestamp : 16;
      internal.lastTimestamp = timestamp;
      const stats: FrameStats = {
        frameId: Math.floor(timestamp),
        timestamp,
        averageFrameTime: delta,
        droppedFrames: 0
      };
      internal.frameCallback(delta, stats);
      if (typeof window !== "undefined") {
        internal.rafId = window.requestAnimationFrame(step);
      }
    };
    if (typeof window !== "undefined") {
      internal.rafId = window.requestAnimationFrame(step);
    }
  }

  dispose(handle: RendererHandle): void {
    const internal = handle as InternalHandle;
    if (typeof window !== "undefined" && internal.rafId) {
      window.cancelAnimationFrame(internal.rafId);
    }
    internal.frameCallback = undefined;
  }
}

export function createQuaternionSDKAdapter(): RendererAdapter {
  return new QuaternionSDKAdapter();
}
