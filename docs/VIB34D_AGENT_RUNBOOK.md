# VIB34D Agent Runbook

This runbook documents how to operate, extend, and benchmark the VIB34D system for agentic workflows. It ties the SPEC-01-VIB34D requirements to concrete packages, commands, and data touchpoints inside the monorepo.

## 1. Environment Setup
- **Node.js** ≥ 20 and **pnpm** ≥ 8.15 are required.
- Install dependencies once per clone:
  ```bash
  pnpm install
  ```
- Enable Git submodules if benchmarking against external engines:
  ```bash
  git submodule update --init --recursive
  ```

## 2. Workspace Commands
| Task | Command | Notes |
| --- | --- | --- |
| Launch demo + editor | `pnpm dev` | Spawns both Vite dev servers in parallel (demo on 5173, editor on 5174).
| Launch demo | `pnpm --filter vib34d-demo dev` | Opens on port 5173 with hot reload.
| Launch editor | `pnpm --filter editor dev` | Runs parameter dashboard with broadcast status and synchronized demo link.
| Build all packages | `pnpm run build` | Executes Vite builds and TypeScript emit across workspace.
| Run tests | `pnpm run test` | Executes Vitest suites (jsdom environment for scroll + quality helpers).
| Lint (when added) | `pnpm run lint` | Placeholder for future lint integration.

## 3. Package Responsibilities
- `@vib34d/core`: renderer implementation (`VIB34DRenderer`), geometry definitions, math utilities, config contracts, and quality tier manager.
- `@vib34d/multi`: mounts multiple renderer instances per section, coordinates activation, surfaces frame stats, and routes reduced-motion changes.
- `@vib34d/scroll`: maintains scroll velocity buffers, snap logic, and raises transition requests.
- `@vib34d/transition`: houses transition catalog, easing metadata, and converts scroll triggers into renderer morph requests.
- `@vib34d/home-master`: produces derived parameters (scale, luminance, velocity) for each section modifier and synchronizes them via broadcast channels.
- `@vib34d/crystal-ui`: renders crystalized navigation elements using canvas + DOM overlays.
- `@vib34d/editor`: communication helpers that bind the editor UI to runtime packages.
- `@vib34d/telemetry`: queues FPS/error/scroll events, flushes buffers on timer and lifecycle signals, and delegates to adapter-provided sinks.
- `@vib34d/adapter-sdk` / `@vib34d/adapter-vib3plus`: wrap the external engines with the shared `RendererAdapter` contract.

## 4. Adapter Selection & Benchmarking
1. Launch the demo (or both apps): `pnpm --filter vib34d-demo dev` or `pnpm dev`.
2. Append `?adapter=quaternion` or `?adapter=vib3plus` to the local URL to pin the adapter.
3. Open the developer console and observe telemetry batches (tagged by adapter) and frame stats logged by the orchestrator.
4. Capture frame times using the built-in overlay or the console output. Populate [`docs/VIB34D_ENGINE_RUBRIC.md`](VIB34D_ENGINE_RUBRIC.md) with measured values before committing to an engine.

## 5. Telemetry Flow
1. `VIB34DRenderer` reports frame stats -> `MultiInstanceOrchestrator` -> `TelemetryBatcher`.
2. Scroll orchestrator buckets velocity bands and forwards results to telemetry.
3. `TelemetryBatcher` calls the adapter's `telemetry.batch` implementation and flushes on interval (default 8s) or page visibility change.
4. Extend telemetry by pushing new events into the batcher's queue; the adapter handles transport.

## 6. Reduced Motion & Accessibility
- System media query `prefers-reduced-motion` is mirrored into the config at bootstrap.
- `MultiInstanceOrchestrator#setReducedMotion` halts morph blending and removes CSS transitions.
- Keyboard navigation (arrow keys, Home/End) is registered in the demo shell. Focus outlines are managed by the crystal UI layer.

## 7. Quality Tier Watchdog
- Renderer samples frame time and automatically steps tiers: `high` → `medium` → `low` when average frame time exceeds thresholds.
- Manual overrides are available via `renderer.setQualityTier(...)`.
- Tier-to-geometry stride mapping lives in `@vib34d/core/src/quality.ts`.

## 8. Editor Workflow
1. `pnpm dev` (or `pnpm --filter editor dev` when running the editor alone)
2. The editor app connects to the same packages, advertises the active `syncChannel`, and emits parameter changes.
3. Parameter deltas propagate through the broadcast-enabled `HomeMaster` into `MultiInstanceOrchestrator` clusters in any open demo using the matching `?syncChannel=` query parameter.
4. Use this mode to fine-tune modifiers, transition overrides, and telemetry verbosity before exporting presets. The editor header links to a pre-filled demo URL when both dev servers run locally (`5174` ➜ `5173`).

## 9. Deployment Checklist
- Run `pnpm run build` and confirm `apps/*/dist` outputs exist.
- Execute `pnpm run test` and resolve failures.
- Update [`docs/VIB34D_ENGINE_RUBRIC.md`](VIB34D_ENGINE_RUBRIC.md) with the latest measurements.
- Refresh documentation sections (`VIB34D_COMPLETE_DOCUMENTATION.md`, `VIB34D_CONFIGURATION_GUIDE.md`) with any schema changes.
- Complete the [`VIB34D_VALIDATION_CHECKLIST`](VIB34D_VALIDATION_CHECKLIST.md) before hand-off.

## 10. Troubleshooting
| Symptom | Diagnosis | Resolution |
| --- | --- | --- |
| Blank canvas | Adapter not initialized | Ensure `createQuaternionSDKAdapter()` or `createVib3PlusAdapter()` is invoked and WebGL2 context is returned.
| Stuttering animation | Quality tier locked too high | Invoke `renderer.setQualityTier('medium')` or let auto-quality react by keeping telemetry sampling enabled.
| Scroll snaps not firing | Intersection observer disabled | Call `scroll.refresh()` after DOM changes and verify `scrollSnapEnabled` in config.
| Telemetry missing | Adapter telemetry sink undefined | Confirm adapter implements `telemetry.batch` and that `TelemetryBatcher` is constructed with adapter reference.
| Demo not reacting to editor | Sync channel mismatch | Ensure both apps share the same `?syncChannel=` value or accept the editor default `vib34d-master`.

Maintain this runbook as capabilities evolve; it is the canonical onboarding reference for agents interacting with the VIB34D system.
