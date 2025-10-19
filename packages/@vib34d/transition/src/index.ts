import type { RendererAdapter } from "@vib34d/core";

export interface TransitionRequest {
  readonly sectionId?: string;
  readonly fromGeometry: string;
  readonly toGeometry: string;
  readonly intensity: number;
  readonly durationMs: number;
  readonly easing: string;
}

export type TransitionListener = (request: TransitionRequest) => void;

export class TransitionEngine {
  private readonly adapter: RendererAdapter;
  private readonly listeners = new Set<TransitionListener>();

  constructor(adapter: RendererAdapter) {
    this.adapter = adapter;
  }

  apply(request: TransitionRequest): void {
    const normalized = this.normalize(request);
    for (const listener of this.listeners) {
      listener(normalized);
    }
  }

  onTransition(listener: TransitionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private normalize(request: TransitionRequest): TransitionRequest {
    const intensity = Math.min(Math.max(request.intensity, 0), 1);
    const durationMs = Math.max(0, request.durationMs);
    return { ...request, intensity, durationMs };
  }
}
