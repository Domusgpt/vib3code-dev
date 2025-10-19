# VIB34D System – Comprehensive Documentation

This document is the authoritative reference for the VIB34D multi-instance visualization system delivered in this repository. It complements SPEC-01-VIB34D by mapping requirements to concrete modules, algorithms, and configuration entry points.

## 1. Architectural Overview
- **Apps**
  - `apps/vib34d-demo`: production-style showcase implementing infinite scroll, portal transitions, telemetry overlay, and crystal navigation.
  - `apps/editor`: authoring surface that propagates parameter adjustments to the runtime via shared packages.
- **Core Packages**
  - `@vib34d/core`: renderer, geometry definitions, math utilities, config types, quality tiers.
  - `@vib34d/multi`: multi-instance orchestration, reduced-motion plumbing, frame stats broadcast.
  - `@vib34d/scroll`: velocity tracker, snap logic, transition triggering, Vitest coverage.
  - `@vib34d/transition`: easing catalogue and typed transition requests.
  - `@vib34d/home-master`: parameter derivation system seeded by the master section.
  - `@vib34d/crystal-ui`: interactive crystal navigation controls (keyboard + hover + focus states).
  - `@vib34d/telemetry`: batching, auto-flush behaviour, and adapter sink integration.
  - `@vib34d/adapter-sdk` / `@vib34d/adapter-vib3plus`: adapters exposing external engines through the shared `RendererAdapter` contract.

## 2. Renderer Core (`@vib34d/core`)
- **Entry Point**: [`packages/@vib34d/core/src/renderer.ts`](packages/@vib34d/core/src/renderer.ts)
- **Features**
  - WebGL2 pipeline with configurable vertex/fragment shaders.
  - Morph transitions driven by `GeometryTransition` (duration, easing, intensity).
  - Adaptive quality tiers (`high`, `medium`, `low`) computed via `quality.ts` stride helpers.
  - Reduced-motion mode disables morph interpolation and CSS transitions.
  - Frame stats emission (frame time, tier) delivered via callback to orchestrator/telemetry.
- **Math**
  - 4D rotation + projection implemented in [`math4d.ts`](packages/@vib34d/core/src/math4d.ts).
  - Geometry definitions (`hypercube`, `prism`, `tetra`, `dodeca`, `octa`, etc.) live in [`geometry.ts`](packages/@vib34d/core/src/geometry.ts).
- **Config Surface**
  - `VIB34DConfig` defined in [`config.ts`](packages/@vib34d/core/src/config.ts) provides strongly-typed runtime settings used across the workspace.

## 3. Multi-Instance Layer (`@vib34d/multi`)
- **Entry Point**: [`packages/@vib34d/multi/src/index.ts`](packages/@vib34d/multi/src/index.ts)
- **Responsibilities**
  - Creates renderer instances using the adapter supplied by the host app.
  - Applies visual templates (roles, modifiers, opacity, z-index) and ensures ≥3 canvases per section.
  - Relays frame stats via `onFrameStats` subscriptions for telemetry dashboards.
  - Reacts to reduced-motion toggles and ensures CSS/renderer state stays in sync.
  - Coordinates transition requests with `TransitionEngine`.

## 4. Scroll & Transition Flow
- **Scroll Orchestrator** (`packages/@vib34d/scroll/src/index.ts`)
  - Maintains a 120ms velocity buffer and classifies intensity buckets.
  - Implements snap-to-section logic with `scrollSnapEnabled` guard.
  - Emits transition triggers consumed by the transition engine.
  - Covered by [`index.test.ts`](packages/@vib34d/scroll/src/index.test.ts) using Vitest + jsdom.
- **Transition Engine** (`packages/@vib34d/transition/src/index.ts`)
  - Maps scroll events to morph targets using easing catalogues.
  - Supports per-section overrides via `SectionTransitionConfig` entries.

## 5. Parameter Derivation (`@vib34d/home-master`)
- `HomeMaster` consumes base parameters (scale, luminance, velocity, etc.) and applies modifiers declared in the section config.
- Synchronization leverages a broadcast channel (default `vib34d-master`). Any runtime or editor launched with the same `syncChannel` shares parameter updates.
- Derived parameters are injected into DOM metadata in the demo (`data-derived` attributes) for debugging and editor introspection.

## 6. Crystal UI (`@vib34d/crystal-ui`)
- `createCrystalButton` renders a canvas-backed button with morph-on-hover/click behaviour.
- Keyboard focus outlines and reduced-motion adjustments match accessibility criteria.
- Used in the demo navigation ribbon to switch sections and propagate focus state.

## 7. Telemetry Pipeline (`@vib34d/telemetry`)
- `TelemetryBatcher` accepts events from renderer and scroll subsystems.
- Flush conditions: interval (default 8s), manual `.flush()`, and page lifecycle events.
- Delegates to adapter-provided sink via `adapter.telemetry.batch(events)`.
- Expose `.dispose()` to flush outstanding events and remove lifecycle listeners when tearing down a runtime.
- Designed to incorporate auto-flush hook from quaternion SDK PR #76 or vib3-plus equivalent.

## 8. Adapter Interface & Selection
- `RendererAdapter` located at [`packages/@vib34d/core/src/adapter.ts`](packages/@vib34d/core/src/adapter.ts).
- Both adapters provide `init`, `setShaders`, `onFrame`, `math`, and `telemetry` methods.
- Demo uses `matchPreferredAdapter()` to pick adapter based on URL flag or feature heuristics.
- Benchmark data should be recorded in [`docs/VIB34D_ENGINE_RUBRIC.md`](docs/VIB34D_ENGINE_RUBRIC.md).
- Polytope warp integration: when an adapter exposes `math.polytopeWarp`, the core renderer blends warped vertices based on the orchestrator-supplied `data-warp` baseline. Portal transitions temporarily boost this intensity and revert after the glow timer completes, allowing vib3-plus to express warp advantages without breaking quaternion parity.

## 9. Demo Application (`apps/vib34d-demo`)
- Bootstraps configuration, sections, scroll orchestrator, transitions, multi-instance orchestrator, telemetry batcher, and navigation controls.
- Registers intersection observers to activate sections and maintain `activeSection` state.
- Honors `maxActiveVisualizers` by keeping only the most recent section clusters animating when several enter view, preventing unnecessary GPU churn on lower power devices.
- Configures the scroll orchestrator with `scrollSnapEnabled` and ensures portal glow styling is skipped entirely when `portalEffectsEnabled` is disabled in the config surface.
- Synchronizes reduced-motion preferences between system media query, user toggle, and orchestrator state.
- Keyboard navigation handles `ArrowUp`, `ArrowDown`, `Home`, `End`, `PageUp`, `PageDown` to cycle sections.
- Telemetry logs emitted to console with adapter identifier.

## 10. Editor Application (`apps/editor`)
- Shares packages with runtime to ensure parity.
- Offers parameter inputs (scalars, toggles) and surfaces broadcast status plus a launch link that targets the matching demo URL.
- Intended to be run alongside the demo for live authoring via the shared `syncChannel` bridge.

## 11. Configuration Reference
Key fields from `VIB34DConfig`:
- `visualizerCount` (3–6 recommended)
- `visualizerRoles` (array of role identifiers used by templates)
- `sections` (map of section key to `geometry`, `modifier`, `snapPoint`)
- `defaultTransitionRule` (string key consumed by transition engine)
- `portalEffectsEnabled`, `scrollSnapEnabled`, `maxActiveVisualizers`, `viewportMargin`
- `targetFPS`, `reducedMotion`, `telemetry.flushIntervalMs`
- `editorMode`, `showControls`, `debugMode`

Full tuning advice is captured in [`VIB34D_CONFIGURATION_GUIDE.md`](VIB34D_CONFIGURATION_GUIDE.md).

## 12. Testing & Validation
- `pnpm run build` – ensures TypeScript compilation and Vite bundling succeed.
- `pnpm run test` – executes Vitest suites (scroll behaviour, quality tier logic).
- Manual validation: run demo + editor, verify scroll portals, quality tier transitions, telemetry flush events, keyboard navigation, reduced-motion toggles.

## 13. Performance Considerations
- Renderer tracks frame time average; if >120% target, auto-downgrades tier; <80%, upgrades tier.
- `qualityTierToStride` reduces geometry sampling to maintain 60 FPS desktop / 45 FPS mobile budgets.
- Use browser devtools or telemetry logs to confirm tier behaviour.

## 14. Extensibility Hooks
- **Geometry Expansion**: add definitions in `geometry.ts`, register edges/faces, and map to transitions.
- **Transition Rules**: extend `TransitionEngine` catalogue with new easing functions and durations.
- **Telemetry Sinks**: wrap `TelemetryBatcher` with custom network or analytics transport via adapter.
- **Editor Controls**: extend editor UI to expose new parameters, ensuring propagation through `HomeMaster`.
- **Sync Channel Strategy**: adjust `syncChannel` query/defaults when running multiple editors or demos simultaneously.

## 15. Compliance Checklist
- ✅ Infinite scroll with velocity-driven portals
- ✅ ≥3 synchronized visualizer instances per section
- ✅ Reduced-motion + keyboard navigation support
- ✅ Crystal UI navigation replaces HTML buttons
- ✅ Telemetry auto-flush integration hooks
- ✅ Configurable `VIB34DConfig` surface with documentation

Keep this document updated as functionality evolves; it is the single source of truth for system design and behaviour.
