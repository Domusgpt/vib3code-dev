import type { QualityTier } from "./types.js";

export function qualityTierToStride(tier: QualityTier): number {
  switch (tier) {
    case "medium":
      return 2;
    case "low":
      return 4;
    case "high":
    default:
      return 1;
  }
}

export function nextLowerTier(tier: QualityTier): QualityTier {
  if (tier === "high") return "medium";
  if (tier === "medium") return "low";
  return "low";
}

export function nextHigherTier(tier: QualityTier): QualityTier {
  if (tier === "low") return "medium";
  if (tier === "medium") return "high";
  return "high";
}
