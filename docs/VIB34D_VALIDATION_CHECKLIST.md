# VIB34D Validation Checklist

Use this checklist before declaring a VIB34D iteration "done". It consolidates build commands, manual QA steps, and data captures that leadership expects for sign-off.

## 1. Environment Sanity
- [ ] Node.js ≥ 20.0 verified with `node -v`.
- [ ] Dependencies installed via `pnpm install` without errors.
- [ ] Optional engine submodules (`external/*`) initialized when benchmarking adapters.

## 2. Automated Verification
- [ ] `pnpm run build` completes without warnings or type errors.
- [ ] `pnpm run test` passes across every workspace package.
- [ ] Linting (when enabled) reports no violations.

## 3. Runtime Spot Checks
- [ ] Launch both dev servers with `pnpm dev` and confirm the demo (5173) and editor (5174) boot.
- [ ] Scroll through all five sections; ensure ≥3 layered canvases are active with role-specific opacity.
- [ ] Observe portal transitions triggered by velocity changes (check for glow and morph intensity).
- [ ] Toggle reduced-motion from the crystal nav toggle; verify animations drop to static fades and CSS transitions disable.
- [ ] Use keyboard navigation (Arrow/Page/Home/End) to traverse sections and confirm focus lands on the crystal buttons.
- [ ] Adjust parameters in the editor sliders and confirm live updates in the demo when sharing the same `syncChannel`.

## 4. Telemetry & Performance
- [ ] Confirm the console logs batched telemetry every ~8s and on tab visibility changes.
- [ ] Validate quality tier downshifts/upshifts by simulating heavy load (resize window, throttle device) and monitoring frame stats events.
- [ ] Capture FPS and scroll bucket stats for status reporting.

## 5. Adapter Evaluation
- [ ] Run the demo with `?adapter=quaternion` and `?adapter=vib3plus` to gather identical scene metrics.
- [ ] Populate [`docs/VIB34D_ENGINE_RUBRIC.md`](VIB34D_ENGINE_RUBRIC.md) with measured numbers and qualitative notes.
- [ ] Record the chosen adapter and justification in the release notes or deployment summary.

## 6. Documentation Updates
- [ ] Ensure `README.md`, `VIB34D_COMPLETE_DOCUMENTATION.md`, and `VIB34D_CONFIGURATION_GUIDE.md` reflect any schema or workflow changes.
- [ ] Append any new learnings to [`docs/VIB34D_AGENT_RUNBOOK.md`](VIB34D_AGENT_RUNBOOK.md) as operational guidance.
- [ ] Attach telemetry snapshots or KPI summaries to the deployment artifacts when available.

Checking every box keeps the build in a "boss-ready" state and provides a repeatable hand-off path for subsequent agent iterations.
