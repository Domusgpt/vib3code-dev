# VIB34D Configuration Guide

The VIB34D runtime is controlled through the typed `VIB34DConfig` object exported by `@vib34d/core`. This guide documents every field, where it is consumed, and recommended tuning ranges for agents integrating the system.

## 1. Applying Configuration
- **Demo**: see [`apps/vib34d-demo/src/main.ts`](apps/vib34d-demo/src/main.ts). Configuration is created from `defaultConfig` and customized per section.
- **Editor**: surfaces the same config schema for live tuning.
- **Custom Hosts**: import `{ defaultConfig, type VIB34DConfig }` from `@vib34d/core`, merge overrides, and pass to `MultiInstanceOrchestrator` + `ScrollOrchestrator`.

## 2. Core Fields
| Field | Type | Default | Description | Recommended Range |
| --- | --- | --- | --- | --- |
| `visualizerCount` | `number` | `3` | Number of renderer instances spawned per section. | 3–6 |
| `visualizerRoles` | `VisualizerRole[]` | `["background","content","accent"]` | Roles applied to instance templates for styling. | Align with templates in `@vib34d/multi` |
| `sections` | `Record<string, SectionConfig>` | `{}` | Section definitions (geometry, modifier, snap point). | Define ≥5 entries for demo parity |
| `defaultTransitionRule` | `string` | `"home.master"` | Key consumed by `TransitionEngine` when no override present. | Match a rule registered in transition catalogue |
| `portalEffectsEnabled` | `boolean` | `true` | Enables morph + portal blending during transitions; when `false` the orchestrator skips glow styling and warp boosts. | `true` for full experience, `false` for static swaps |
| `scrollSnapEnabled` | `boolean` | `true` | Governs snap-to-section behaviour when scroll velocity drops via `ScrollOrchestrator`. | Keep enabled for portal staging |
| `maxActiveVisualizers` | `number` | `6` | Cap on simultaneously animating instances; orchestration keeps the most recent sections active within this budget. | Tune based on device performance |
| `viewportMargin` | `string` | `"33%"` | Intersection observer root margin for activation. | `"25%"`–`"50%"` |
| `targetFPS` | `number` | `60` | Desired framerate; informs quality tier watchdog. | 45–120 |
| `editorMode` | `boolean` | `false` | Toggles editor-specific instrumentation. | Enable only in authoring builds |
| `showControls` | `boolean` | `false` | Allows UI overlays for debugging. | Authoring builds |
| `debugMode` | `boolean` | `false` | Expands logging and telemetry verbosity. | Development only |
| `reducedMotion` | `boolean \| undefined` | `undefined` | Forces reduced-motion behaviour when set. | Mirror `prefers-reduced-motion` |
| `telemetry` | `{ enabled: boolean; flushIntervalMs?: number }` | `{ enabled: true, flushIntervalMs: 15000 }` | Controls telemetry batching cadence. | 5s–30s intervals |
| `transitions` | `SectionTransitionConfig[]` | `undefined` | Optional overrides between specific section pairs. | Use for bespoke portal behaviours |

## 3. Section Configuration
Each section entry in `sections` uses `SectionConfig`:
```ts
interface SectionConfig {
  geometry: string;      // key from geometry catalog
  modifier: number;      // applied by HomeMaster during parameter derivation
  snapPoint: number;     // scroll index used by ScrollOrchestrator
  overrides?: Partial<Record<string, unknown>>; // custom data for host apps
}
```
Example (demo):
```ts
const sections = {
  home: { geometry: "hypercube", modifier: 1.0, snapPoint: 0 },
  articles: { geometry: "prism", modifier: 1.3, snapPoint: 1 },
  videos: { geometry: "tetra", modifier: 0.7, snapPoint: 2 },
  podcasts: { geometry: "dodeca", modifier: 0.9, snapPoint: 3 },
  ema: { geometry: "octa", modifier: 1.1, snapPoint: 4 }
};
```

## 4. Transition Overrides
Use `transitions` to customize morph behaviour between specific sections:
```ts
const config: VIB34DConfig = {
  ...defaultConfig,
  transitions: [
    {
      from: "home",
      to: "articles",
      overrides: { rule: "dramatic", durationMs: 2200 }
    }
  ]
};
```
When no override matches `(from,to)`, `defaultTransitionRule` applies.

## 5. Reduced Motion Strategy
- Set `reducedMotion` to `true` to disable morph interpolation, remove canvas CSS transitions, and clamp rotation speed.
- Demo automatically syncs with system preference via `matchMedia('(prefers-reduced-motion: reduce)')`.
- Call `orchestrator.setReducedMotion(boolean)` at runtime for manual overrides.

## 6. Telemetry Settings
- Disable telemetry by setting `telemetry.enabled = false` (not recommended for benchmarking).
- Adjust `telemetry.flushIntervalMs` to control batching cadence (demo uses 8 seconds by default via `TelemetryBatcher` options).
- Call `TelemetryBatcher.dispose()` during teardown to flush the queue and remove lifecycle listeners when swapping routes/apps.
- Telemetry output is structured events; integrate transport logic inside adapter implementations.

## 7. Editor Flags
- `editorMode` exposes extra instrumentation hooks; the editor app toggles this flag when building.
- `showControls` surfaces runtime UI (sliders, overlays) when available.
- `debugMode` extends console logging across orchestrator, scroll, and telemetry packages.

## 8. Sync Channel Coordination
- `HomeMaster` instances broadcast parameter updates on a shared channel (default `vib34d-master`).
- The demo reads `?syncChannel=` from the URL to join a specific channel and exposes the value via `window.VIB34DSyncChannel`.
- The editor advertises the active channel in its header; append `?syncChannel=` when launching multiple editors/demos to avoid collisions.

## 9. Best Practices
- Start from `defaultConfig` and apply diffs; avoid mutating the exported object directly.
- Keep `visualizerCount` in sync with role templates; extend templates in `@vib34d/multi` when adding new roles.
- Update documentation when introducing new config fields to maintain parity across guides and tooling.
- When tuning section parameters, monitor each canvas element's `data-warp` attribute. The orchestrator derives this baseline from scale/speed/luminance inputs and boosts it briefly during portal transitions when the adapter provides `math.polytopeWarp`.

For additional operational context refer to [`docs/VIB34D_AGENT_RUNBOOK.md`](docs/VIB34D_AGENT_RUNBOOK.md) and [`VIB34D_COMPLETE_DOCUMENTATION.md`](VIB34D_COMPLETE_DOCUMENTATION.md).
