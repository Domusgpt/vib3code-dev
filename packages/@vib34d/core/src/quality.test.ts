import { describe, expect, it } from "vitest";

import { nextHigherTier, nextLowerTier, qualityTierToStride } from "./quality.js";

describe("quality tiers", () => {
  it("maps tiers to expected edge strides", () => {
    expect(qualityTierToStride("high")).toBe(1);
    expect(qualityTierToStride("medium")).toBe(2);
    expect(qualityTierToStride("low")).toBe(4);
  });

  it("navigates to adjacent tiers", () => {
    expect(nextLowerTier("high")).toBe("medium");
    expect(nextLowerTier("medium")).toBe("low");
    expect(nextLowerTier("low")).toBe("low");

    expect(nextHigherTier("low")).toBe("medium");
    expect(nextHigherTier("medium")).toBe("high");
    expect(nextHigherTier("high")).toBe("high");
  });
});
