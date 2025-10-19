# VIB34D Multi-Instance Visualization Workspace

The VIB34D workspace contains a pnpm-powered monorepo that delivers the multi-instance 4D visualization framework, interactive demo, and parameter editor defined in **SPEC-01-VIB34D**. It packages the runtime, scroll orchestration, transition engine, crystal UI primitives, and telemetry plumbing required for the MVP build.

## ✨ Highlights
- **True 4D ➜ 3D rendering pipeline** implemented in `@vib34d/core` with adaptive quality tiers, reduced-motion controls, and telemetry sampling.
- **Multi-instance orchestration** that mounts ≥3 synchronized canvases per section, exposes frame statistics, and bridges to both engine adapters.
- **Scroll + transition system** that binds velocity, snap points, and portal morphs, with test coverage living in `@vib34d/scroll`.
- **Crystal UI navigation** and keyboard/reduced-motion accessibility wired into the Vite demo app.
- **Adapter abstraction** allowing either the quaternion SDK or vib3-plus engine to drive the runtime behind a shared `RendererAdapter` interface.
- **Live editor synchronization** via a broadcast-backed `HomeMaster` channel that keeps the editor and demo in lock-step.

## 🧱 Repository Layout
```
apps/
  editor/           # Vite-powered authoring surface with live parameter propagation
  vib34d-demo/      # Showcase app implementing scroll portals, telemetry, and crystal navigation
packages/
  @vib34d/core/     # Renderer, geometry definitions, quality tiers, and config surface
  @vib34d/multi/    # Multi-instance manager and frame stats bridge
  @vib34d/scroll/   # Velocity tracking, snap logic, and portal trigger orchestration
  @vib34d/transition/# Transition contracts and easing metadata
  @vib34d/home-master/ # Parameter derivation pipeline
  @vib34d/crystal-ui/  # Canvas-backed crystal button primitives
  @vib34d/editor/      # Editor bridge utilities
  @vib34d/telemetry/   # Auto-flush batching infrastructure
  @vib34d/adapter-sdk/    # Quaternion SDK adapter implementation
  @vib34d/adapter-vib3plus/# Vib3-plus polytope warp adapter scaffold
```
Additional architectural context and runtime details live in [`docs/VIB34D_AGENT_RUNBOOK.md`](docs/VIB34D_AGENT_RUNBOOK.md), [`VIB34D_COMPLETE_DOCUMENTATION.md`](VIB34D_COMPLETE_DOCUMENTATION.md), and [`VIB34D_CONFIGURATION_GUIDE.md`](VIB34D_CONFIGURATION_GUIDE.md).

## 🚀 Getting Started
1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Run both demo & editor together**
   ```bash
   pnpm dev
   ```
   The demo will listen on http://localhost:5173/ and the editor on http://localhost:5174/ by default.
3. **Run the demo only** (auto-selects adapter or pass `?adapter=quaternion|vib3plus`)
   ```bash
   pnpm --filter vib34d-demo dev
   ```
   Then open http://localhost:5173/ in a browser.
4. **Launch the editor** (shares state on the `vib34d-master` channel by default)
   ```bash
   pnpm --filter editor dev
   ```
   Follow the "Launch synchronized demo" link in the editor header or open `http://localhost:5173/?syncChannel=vib34d-master` after starting the demo.
5. **Build everything**
   ```bash
   pnpm run build
   ```
6. **Execute tests**
   ```bash
   pnpm run test
   ```

## ⚙️ Configuration
The runtime uses a strongly-typed `VIB34DConfig` surface exported from `@vib34d/core`. The demo bootstraps its configuration in [`apps/vib34d-demo/src/main.ts`](apps/vib34d-demo/src/main.ts) and supports overrides through URL parameters and the editor channel. Pass `?syncChannel=<name>` to change the broadcast bridge shared with the editor. The live demo now respects `scrollSnapEnabled`, `portalEffectsEnabled`, and `maxActiveVisualizers` directly from the configuration surface, ensuring the scroll orchestrator, portal styling, and section activation budget stay in sync with operator expectations. Consult the dedicated [configuration guide](VIB34D_CONFIGURATION_GUIDE.md) for every field, defaults, and suggested tuning ranges.

## 📊 Engine Evaluation
The adapters satisfy the shared [`RendererAdapter`](packages/@vib34d/core/src/adapter.ts) contract. You can toggle adapters at runtime via the `?adapter=` query parameter or the `matchPreferredAdapter` helper in the demo. Capture measurements against identical scenes and record them in [`docs/VIB34D_ENGINE_RUBRIC.md`](docs/VIB34D_ENGINE_RUBRIC.md) to drive the selection rubric from SPEC-01-VIB34D.

## 🧪 Telemetry & Performance
Frame statistics, quality tier shifts, and scroll velocity buckets are fed into `@vib34d/telemetry`. Telemetry auto-flushes on an interval and via lifecycle hooks, while the renderer downgrades or upgrades quality tiers based on sampled frame time. Reduced-motion settings propagate from system media queries, keyboard navigation events are handled in the demo shell, and accessibility toggles flow through the orchestrator.

## 📚 Further Reading
- [`docs/VIB34D_AGENT_RUNBOOK.md`](docs/VIB34D_AGENT_RUNBOOK.md) – agentic playbook covering setup, workflows, and benchmarking strategy.
- [`VIB34D_COMPLETE_DOCUMENTATION.md`](VIB34D_COMPLETE_DOCUMENTATION.md) – deep-dive architecture, math references, and module contracts.
- [`VIB34D_CONFIGURATION_GUIDE.md`](VIB34D_CONFIGURATION_GUIDE.md) – field-by-field configuration reference with tuning advice.
- [`docs/VIB34D_ENGINE_RUBRIC.md`](docs/VIB34D_ENGINE_RUBRIC.md) – rubric template for adapter selection analysis.
- [`docs/VIB34D_VALIDATION_CHECKLIST.md`](docs/VIB34D_VALIDATION_CHECKLIST.md) – end-to-end verification list before shipping.
