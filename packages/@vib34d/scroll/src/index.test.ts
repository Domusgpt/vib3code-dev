import { describe, expect, it, vi } from "vitest";

import { ScrollOrchestrator } from "./index.js";

describe("ScrollOrchestrator", () => {
  it("classifies velocity buckets", () => {
    const orchestrator = new ScrollOrchestrator({ windowRef: window, snapEnabled: false, sampleWindowMs: 16 });
    let intensity = orchestrator.record(240, 16);
    expect(intensity.bucket).toBe("standard");
    intensity = orchestrator.record(1600, 16);
    expect(intensity.bucket).toBe("dramatic");
  });

  it("snaps to the nearest registered section", async () => {
    vi.useFakeTimers();
    const originalInnerHeight = window.innerHeight;
    const originalPageOffset = window.pageYOffset;
    const originalScrollTo = window.scrollTo;
    const originalScrollYDescriptor = Object.getOwnPropertyDescriptor(window, "scrollY");
    try {
      Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
      Object.defineProperty(window, "pageYOffset", { value: 900, writable: true, configurable: true });
      Object.defineProperty(window, "scrollY", { get: () => window.pageYOffset, configurable: true });
      const scrollSpy = vi.fn((options: ScrollToOptions) => {
        window.pageYOffset = options.top ?? window.pageYOffset;
      });
      Object.defineProperty(window, "scrollTo", { value: scrollSpy, configurable: true });

      const orchestrator = new ScrollOrchestrator({ windowRef: window, snapDelayMs: 25, sampleWindowMs: 16 });
      const element = document.createElement("section");
      Object.defineProperty(element, "getBoundingClientRect", {
        value: () => ({ top: 100, left: 0, right: 0, bottom: 300, width: 0, height: 200 })
      });
      orchestrator.registerSectionElement("articles", element);
      orchestrator.refresh();
      expect((orchestrator as unknown as { snapPoints: Array<{ id: string; offset: number }> }).snapPoints.length).toBeGreaterThan(0);

      orchestrator.record(320, 16);
      await vi.advanceTimersByTimeAsync(30);
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(window.pageYOffset).toBeGreaterThan(950);
    } finally {
      vi.useRealTimers();
      Object.defineProperty(window, "innerHeight", { value: originalInnerHeight, configurable: true });
      Object.defineProperty(window, "pageYOffset", { value: originalPageOffset, writable: true, configurable: true });
      if (originalScrollYDescriptor) {
        Object.defineProperty(window, "scrollY", originalScrollYDescriptor);
      } else {
        delete (window as Record<string, unknown>).scrollY;
      }
      Object.defineProperty(window, "scrollTo", { value: originalScrollTo, configurable: true });
    }
  });

  it("skips snapping when snapEnabled is false", async () => {
    vi.useFakeTimers();
    const originalInnerHeight = window.innerHeight;
    const originalPageOffset = window.pageYOffset;
    const originalScrollTo = window.scrollTo;
    const originalScrollYDescriptor = Object.getOwnPropertyDescriptor(window, "scrollY");
    try {
      Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
      Object.defineProperty(window, "pageYOffset", { value: 500, writable: true, configurable: true });
      Object.defineProperty(window, "scrollY", { get: () => window.pageYOffset, configurable: true });
      const scrollSpy = vi.fn();
      Object.defineProperty(window, "scrollTo", { value: scrollSpy, configurable: true });

      const orchestrator = new ScrollOrchestrator({ windowRef: window, snapDelayMs: 20, snapEnabled: false });
      const element = document.createElement("section");
      Object.defineProperty(element, "getBoundingClientRect", {
        value: () => ({ top: 80, left: 0, right: 0, bottom: 280, width: 0, height: 200 })
      });
      orchestrator.registerSectionElement("videos", element);
      orchestrator.refresh();

      orchestrator.record(960, 16);
      await vi.advanceTimersByTimeAsync(50);
      expect(scrollSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      Object.defineProperty(window, "innerHeight", { value: originalInnerHeight, configurable: true });
      Object.defineProperty(window, "pageYOffset", { value: originalPageOffset, writable: true, configurable: true });
      if (originalScrollYDescriptor) {
        Object.defineProperty(window, "scrollY", originalScrollYDescriptor);
      } else {
        delete (window as Record<string, unknown>).scrollY;
      }
      Object.defineProperty(window, "scrollTo", { value: originalScrollTo, configurable: true });
    }
  });
});
