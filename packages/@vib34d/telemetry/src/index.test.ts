import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RendererAdapter, RendererHandle, Vec3, Vec4 } from "@vib34d/core";
import { TelemetryBatcher } from "./index.js";

type Listener = (...args: unknown[]) => void;

function createAdapter() {
  const adapter: RendererAdapter = {
    async init(canvas): Promise<RendererHandle> {
      return { canvas, context: null };
    },
    setShaders: () => {},
    onFrame: () => {},
    dispose: () => {},
    math: {
      rotate4D(vector: Vec4): Vec4 {
        return vector;
      },
      project4Dto3D(vector: Vec4): Vec3 {
        return [vector[0], vector[1], vector[2]];
      }
    },
    telemetry: {
      batch: vi.fn(),
      flush: vi.fn()
    }
  };
  return adapter;
}

function stubWindow(): {
  addEventListener: ReturnType<typeof vi.fn<[string, Listener], void>>;
  removeEventListener: ReturnType<typeof vi.fn<[string, Listener], void>>;
  setTimeoutSpy: ReturnType<typeof vi.fn<[handler: (...args: unknown[]) => void, timeout?: number], number>>;
  clearTimeoutSpy: ReturnType<typeof vi.fn<[id: number], void>>;
} {
  const listeners = new Map<string, Set<Listener>>();
  const addEventListener = vi.fn<[string, Listener], void>((type, listener) => {
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    listeners.get(type)!.add(listener);
  });
  const removeEventListener = vi.fn<[string, Listener], void>((type, listener) => {
    const set = listeners.get(type);
    if (set) {
      set.delete(listener);
    }
  });
  const setTimeoutSpy = vi.fn<[handler: (...args: unknown[]) => void, timeout?: number], number>((handler, timeout) =>
    globalThis.setTimeout(handler, timeout) as unknown as number
  );
  const clearTimeoutSpy = vi.fn<[id: number], void>((id) => {
    globalThis.clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
  });
  const stub = {
    setTimeout: setTimeoutSpy,
    clearTimeout: clearTimeoutSpy,
    addEventListener,
    removeEventListener
  } as unknown as Window;
  vi.stubGlobal("window", stub);
  return { addEventListener, removeEventListener, setTimeoutSpy, clearTimeoutSpy };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("TelemetryBatcher", () => {
  it("flushes queued events after the configured interval", () => {
    const mocks = stubWindow();
    const adapter = createAdapter();
    const batcher = new TelemetryBatcher(adapter, { flushIntervalMs: 500 });

    batcher.push({ t: 1, type: "fps", payload: { frameTime: 16 } });
    batcher.push({ t: 2, type: "scroll", payload: { deltaY: 20 } });

    expect(adapter.telemetry.batch).not.toHaveBeenCalled();
    expect(mocks.setTimeoutSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);

    expect(adapter.telemetry.batch).toHaveBeenCalledTimes(1);
    expect(adapter.telemetry.batch).toHaveBeenCalledWith([
      { t: 1, type: "fps", payload: { frameTime: 16 } },
      { t: 2, type: "scroll", payload: { deltaY: 20 } }
    ]);
    expect(adapter.telemetry.flush).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    expect(adapter.telemetry.batch).toHaveBeenCalledTimes(1);

    batcher.dispose();
  });

  it("clears timers and listeners when disposed", () => {
    const mocks = stubWindow();
    const adapter = createAdapter();
    const batcher = new TelemetryBatcher(adapter, { flushIntervalMs: 1000 });

    expect(mocks.addEventListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(mocks.addEventListener).toHaveBeenCalledWith("pagehide", expect.any(Function));

    batcher.push({ t: 5, type: "error", payload: { message: "boom" } });
    batcher.dispose();

    expect(adapter.telemetry.batch).toHaveBeenCalledTimes(1);
    expect(adapter.telemetry.flush).toHaveBeenCalledTimes(1);
    expect(mocks.clearTimeoutSpy).toHaveBeenCalledTimes(1);

    const visibilityHandler = mocks.addEventListener.mock.calls.find((call) => call[0] === "visibilitychange")?.[1];
    const pageHideHandler = mocks.addEventListener.mock.calls.find((call) => call[0] === "pagehide")?.[1];

    expect(mocks.removeEventListener).toHaveBeenCalledWith("visibilitychange", visibilityHandler);
    expect(mocks.removeEventListener).toHaveBeenCalledWith("pagehide", pageHideHandler);

    batcher.push({ t: 6, type: "fps", payload: { frameTime: 33 } });
    expect(adapter.telemetry.batch).toHaveBeenCalledTimes(1);
  });
});
