import { describe, expect, it, vi, afterEach } from "vitest";

import type { RendererAdapter, RendererAppearance, RendererHandle, Vec3, Vec4 } from "@vib34d/core";
import { MultiInstanceOrchestrator, type RendererController, type RendererFactory } from "./index.js";

interface RendererMock extends RendererController {
  readonly setScale: ReturnType<typeof vi.fn>;
  readonly setSpeedMultiplier: ReturnType<typeof vi.fn>;
  readonly setAppearance: ReturnType<typeof vi.fn>;
  readonly applyTransition: ReturnType<typeof vi.fn>;
  readonly setWarpIntensity: ReturnType<typeof vi.fn>;
  readonly setWarpAnchor: ReturnType<typeof vi.fn>;
}

function createRendererFactory(registry: RendererMock[]): RendererFactory {
  return (_context) => {
    const renderer = {
      attach: vi.fn().mockResolvedValue(undefined),
      resize: vi.fn(),
      setReducedMotion: vi.fn(),
      setSpeedMultiplier: vi.fn(),
      setScale: vi.fn(),
      setAppearance: vi.fn(),
      setWarpIntensity: vi.fn(),
      setWarpAnchor: vi.fn(),
      applyTransition: vi.fn(),
      pause: vi.fn()
    } as RendererMock;
    registry.push(renderer);
    return renderer;
  };
}

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
    },
    polytopeWarp(point: Vec4): Vec4 {
      return point;
    }
  },
  telemetry: {
    batch: () => {},
    flush: () => {}
  }
};

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("MultiInstanceOrchestrator", () => {
  it("propagates section parameters into renderer controls", async () => {
    const renderers: RendererMock[] = [];
    const orchestrator = new MultiInstanceOrchestrator(
      adapter,
      {
        sections: {
          home: { geometry: "hypercube", modifier: 1, snapPoint: 0 }
        }
      },
      { rendererFactory: createRendererFactory(renderers) }
    );

    await orchestrator.mountSection("home", () => document.createElement("canvas"));

    for (const renderer of renderers) {
      renderer.setScale.mockClear();
      renderer.setSpeedMultiplier.mockClear();
      renderer.setAppearance.mockClear();
      renderer.setWarpIntensity.mockClear();
      renderer.setWarpAnchor.mockClear();
    }

    orchestrator.applySectionParams("home", { baseScale: 52, velocity: 24, luminance: 20 });

    expect(renderers).toHaveLength(3);

    const [background, content, accent] = renderers;
    const backgroundScale = background.setScale.mock.calls[background.setScale.mock.calls.length - 1]?.[0] as number;
    const contentScale = content.setScale.mock.calls[content.setScale.mock.calls.length - 1]?.[0] as number;
    const accentScale = accent.setScale.mock.calls[accent.setScale.mock.calls.length - 1]?.[0] as number;
    expect(backgroundScale).toBeCloseTo(52 / 42, 3);
    expect(contentScale).toBeCloseTo((52 / 42) * 1.3, 3);
    expect(accentScale).toBeCloseTo((52 / 42) * 0.7, 3);

    const backgroundSpeed =
      background.setSpeedMultiplier.mock.calls[background.setSpeedMultiplier.mock.calls.length - 1]?.[0] as number;
    expect(backgroundSpeed).toBeCloseTo(24 / 18, 3);

    const appearanceArg =
      background.setAppearance.mock.calls[background.setAppearance.mock.calls.length - 1]?.[0] as Partial<RendererAppearance>;
    expect(appearanceArg?.lineColor).toBeDefined();
    expect(appearanceArg?.lineColor?.[0]).toBeGreaterThan(0.32);
    expect(appearanceArg?.lineColor?.[3]).toBeCloseTo(0.55, 2);

    const cluster = orchestrator.getCluster("home");
    expect(cluster).toBeDefined();
    const datasets = cluster?.instances.map((instance) => ({
      scale: Number(instance.canvas.dataset.scale),
      velocity: Number(instance.canvas.dataset.velocity),
      warp: Number(instance.canvas.dataset.warp)
    }));
    expect(datasets?.[0].scale).toBeCloseTo(backgroundScale, 3);
    expect(datasets?.[0].velocity).toBeCloseTo(backgroundSpeed, 3);
    datasets?.forEach((entry) => {
      expect(entry.warp).toBeGreaterThanOrEqual(0);
      expect(entry.warp).toBeLessThanOrEqual(1);
    });

    renderers.forEach((renderer) => {
      expect(renderer.setWarpIntensity).toHaveBeenCalled();
      expect(renderer.setWarpAnchor).toHaveBeenCalled();
    });
  });

  it("applies portal glow styling during transitions", async () => {
    vi.useFakeTimers();
    const renderers: RendererMock[] = [];
    const orchestrator = new MultiInstanceOrchestrator(
      adapter,
      {
        sections: {
          home: { geometry: "hypercube", modifier: 1, snapPoint: 0 }
        }
      },
      { rendererFactory: createRendererFactory(renderers) }
    );

    await orchestrator.mountSection("home", () => document.createElement("canvas"));

    orchestrator.applyTransition("home", {
      sectionId: "home",
      fromGeometry: "hypercube",
      toGeometry: "prism",
      intensity: 0.8,
      durationMs: 600,
      easing: "easeInOutCubic"
    });

    const cluster = orchestrator.getCluster("home");
    expect(cluster).toBeDefined();
    const filters = cluster?.instances.map((instance) => instance.canvas.style.filter ?? "");
    filters?.forEach((filter) => {
      expect(filter).toContain("drop-shadow");
    });

    cluster?.instances.forEach((instance, index) => {
      const baseline = Number(instance.canvas.dataset.warp ?? 0);
      const warpCalls = renderers[index].setWarpIntensity.mock.calls.map((call) => call[0] as number);
      expect(warpCalls.some((value) => value > baseline)).toBe(true);
    });

    await vi.advanceTimersByTimeAsync(620);

    cluster?.instances.forEach((instance) => {
      expect(instance.canvas.style.boxShadow).toBe("");
      expect(instance.canvas.style.filter).not.toContain("drop-shadow");
    });

    cluster?.instances.forEach((instance, index) => {
      const baseline = Number(instance.canvas.dataset.warp ?? 0);
      const lastCall = renderers[index].setWarpIntensity.mock.calls.at(-1)?.[0] as number | undefined;
      expect(lastCall).toBeCloseTo(baseline, 3);
    });

    renderers.forEach((renderer) => {
      expect(renderer.applyTransition).toHaveBeenCalled();
    });
  });

  it("disables portal styling when portalEffectsEnabled is false", async () => {
    const renderers: RendererMock[] = [];
    const orchestrator = new MultiInstanceOrchestrator(
      adapter,
      {
        sections: {
          home: { geometry: "hypercube", modifier: 1, snapPoint: 0 }
        },
        portalEffectsEnabled: false
      },
      { rendererFactory: createRendererFactory(renderers) }
    );

    await orchestrator.mountSection("home", () => document.createElement("canvas"));

    const baselineCallCounts = renderers.map((renderer) => renderer.setWarpIntensity.mock.calls.length);

    orchestrator.applyTransition("home", {
      sectionId: "home",
      fromGeometry: "hypercube",
      toGeometry: "prism",
      intensity: 0.75,
      durationMs: 500,
      easing: "easeInOutCubic"
    });

    const cluster = orchestrator.getCluster("home");
    expect(cluster).toBeDefined();
    cluster?.instances.forEach((instance) => {
      expect(instance.canvas.style.boxShadow).toBe("");
      expect(instance.canvas.style.filter).not.toContain("drop-shadow");
    });
    renderers.forEach((renderer, index) => {
      expect(renderer.setWarpIntensity.mock.calls.length).toBe(baselineCallCounts[index]);
    });
  });

  it("caps simultaneously active sections using maxActiveVisualizers", async () => {
    const renderers: RendererMock[] = [];
    const orchestrator = new MultiInstanceOrchestrator(
      adapter,
      {
        visualizerCount: 3,
        maxActiveVisualizers: 3,
        sections: {
          home: { geometry: "hypercube", modifier: 1, snapPoint: 0 },
          articles: { geometry: "prism", modifier: 1.2, snapPoint: 1 }
        }
      },
      { rendererFactory: createRendererFactory(renderers) }
    );

    await orchestrator.mountSection("home", () => document.createElement("canvas"));
    await orchestrator.mountSection("articles", () => document.createElement("canvas"));

    orchestrator.activateSection("home");
    const homeCluster = orchestrator.getCluster("home");
    expect(homeCluster?.instances.every((instance) => instance.active)).toBe(true);

    orchestrator.activateSection("articles");
    const articlesCluster = orchestrator.getCluster("articles");
    expect(articlesCluster?.instances.every((instance) => instance.active)).toBe(true);
    homeCluster?.instances.forEach((instance) => {
      expect(instance.active).toBe(false);
      expect(instance.canvas.dataset.active).toBe("false");
      expect(instance.canvas.style.opacity).toBe("0.45");
    });
  });
});
