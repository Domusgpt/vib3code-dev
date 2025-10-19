import type { RendererAdapter, TelemetryEvent } from "@vib34d/core";

export interface TelemetryBatcherOptions {
  readonly flushIntervalMs?: number;
  readonly autoFlush?: boolean;
}

export class TelemetryBatcher {
  private readonly adapter: RendererAdapter["telemetry"];
  private readonly events: TelemetryEvent[] = [];
  private readonly flushInterval: number;
  private readonly autoFlush: boolean;
  private timer: number | null = null;
  private visibilityHandler: (() => void) | null = null;
  private disposed = false;

  constructor(adapter: RendererAdapter, options: TelemetryBatcherOptions = {}) {
    this.adapter = adapter.telemetry;
    this.flushInterval = options.flushIntervalMs ?? 10000;
    this.autoFlush = options.autoFlush ?? true;
    if (this.autoFlush && typeof window !== "undefined") {
      this.visibilityHandler = () => this.flush();
      window.addEventListener("visibilitychange", this.visibilityHandler);
      window.addEventListener("pagehide", this.visibilityHandler);
    }
  }

  push(event: TelemetryEvent): void {
    if (this.disposed) {
      return;
    }
    this.events.push(event);
    if (this.autoFlush && this.timer === null && typeof window !== "undefined") {
      this.timer = window.setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  flush(): void {
    if (!this.events.length) return;
    this.adapter.batch([...this.events]);
    this.adapter.flush();
    this.events.length = 0;
    if (this.timer !== null) {
      if (typeof window !== "undefined") {
        window.clearTimeout(this.timer);
      }
      this.timer = null;
    }
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.flush();
    if (this.autoFlush && typeof window !== "undefined" && this.visibilityHandler) {
      window.removeEventListener("visibilitychange", this.visibilityHandler);
      window.removeEventListener("pagehide", this.visibilityHandler);
    }
    this.visibilityHandler = null;
    this.disposed = true;
  }
}
