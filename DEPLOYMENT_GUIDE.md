# VIB34D Monorepo Deployment Guide

## 🎯 System Status

**Branch**: `codex/16-29-52edit-vib34d-system-bootstrap-prompt2025-10-19`
**Repository**: https://github.com/Domusgpt/vib3code
**Deployment Status**: ⚠️ Ready for merge to trigger deployment

---

## ✅ Completed Setup Tasks

### 1. Environment & Dependencies
- ✅ Cloned repository and branch
- ✅ Installed pnpm dependencies (121 packages)
- ✅ Verified monorepo structure (10 @vib34d packages + 2 apps)

### 2. Build & Testing
- ✅ **Build successful**: All packages compiled without errors
  - Demo app: 38.76 kB (gzipped: 12.22 kB)
  - Editor app: 5.55 kB (gzipped: 2.33 kB)
- ✅ **Tests passed**: 14/14 tests across 5 packages
  - @vib34d/home-master: 3 tests ✅
  - @vib34d/core: 2 tests ✅
  - @vib34d/scroll: 3 tests ✅
  - @vib34d/telemetry: 2 tests ✅
  - @vib34d/multi: 4 tests ✅

### 3. Deployment Configuration
- ✅ Updated `firebase.json` for monorepo deployment
- ✅ Updated `.github/workflows/deploy.yml` with build pipeline
- ✅ Committed and pushed changes

---

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended for Testing)

**Status**: Configured but not yet triggered
**Reason**: Workflow only triggers on `main` branch pushes

**To Deploy:**

```bash
# Option A: Merge this branch to main
gh pr create --base main --head codex/16-29-52edit-vib34d-system-bootstrap-prompt2025-10-19 \
  --title "🚀 VIB34D Multi-Instance Visualization System - Initial Deployment" \
  --body "$(cat <<'EOF'
## VIB34D Monorepo - First Deployment

Complete VIB34D multi-instance 4D visualization framework ready for production testing.

### ✨ System Features
- Multi-instance orchestration (≥3 canvases per section)
- Scroll-based portal transitions
- Adaptive quality tiers
- Home-master reactive parameters
- Telemetry & performance monitoring
- Reduced motion support
- Keyboard navigation
- Crystal UI navigation

### 📊 Build Status
✅ All packages built successfully
✅ 14/14 tests passed
✅ Demo: 38.76 kB, Editor: 5.55 kB

### 🔧 Configuration
- Updated GitHub Actions workflow for pnpm monorepo
- Configured deployment from apps/vib34d-demo/dist
- Firebase config ready for future use

### 📚 Documentation
- VIB34D_AGENT_RUNBOOK.md
- VIB34D_CONFIGURATION_GUIDE.md
- VIB34D_COMPLETE_DOCUMENTATION.md
- VIB34D_ENGINE_RUBRIC.md
- VIB34D_VALIDATION_CHECKLIST.md

Ready for deployment and testing.

🌟 A Paul Phillips Manifestation
EOF
)"

# Then merge and GitHub Pages will deploy automatically

# Option B: Manual workflow trigger (if enabled)
gh workflow run deploy.yml --ref codex/16-29-52edit-vib34d-system-bootstrap-prompt2025-10-19
```

**Expected URL**: `https://domusgpt.github.io/vib3code/`

### Option 2: Firebase Hosting

**Status**: Configured but requires Firebase project setup

**To Deploy:**

```bash
# 1. Create or use existing Firebase project
firebase projects:create vib3code-demo
# OR use existing project
firebase use parserator-production

# 2. Initialize Firebase Hosting
firebase init hosting

# 3. Build the project
pnpm run build

# 4. Deploy
firebase deploy --only hosting
```

**Firebase Config** (`firebase.json`):
```json
{
  "hosting": {
    "public": "apps/vib34d-demo/dist",
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
      }
    ]
  }
}
```

---

## 🧪 Local Testing

### Run Demo Only
```bash
pnpm --filter vib34d-demo dev
# Opens on http://localhost:5173
```

### Run Demo + Editor (Synchronized)
```bash
pnpm dev
# Demo: http://localhost:5173
# Editor: http://localhost:5174
```

### Test with Different Adapters
```bash
# Quaternion SDK adapter
http://localhost:5173/?adapter=quaternion

# Vib3-plus adapter
http://localhost:5173/?adapter=vib3plus
```

### Test Editor Sync
```bash
# Start both apps, then use this URL for synchronized demo
http://localhost:5173/?syncChannel=vib34d-master
```

---

## ⚙️ Runtime Configuration Toggles

The VIB34D system respects these configuration flags (see `VIB34D_CONFIGURATION_GUIDE.md`):

```typescript
{
  scrollSnapEnabled: true,        // Enable scroll snapping
  portalEffectsEnabled: true,     // Enable portal glow/morphs
  maxActiveVisualizers: 6,        // Simultaneous animation budget
  visualizerCount: 3,             // Instances per section
  targetFPS: 60,                  // Quality tier target
  reducedMotion: false,           // Accessibility mode
  telemetry: {
    enabled: true,
    flushIntervalMs: 8000
  }
}
```

---

## 🔍 Post-Deployment Verification

After deployment, verify these features:

### 1. Core Functionality
- [ ] All 5 sections load correctly (home, articles, videos, podcasts, ema)
- [ ] ≥3 canvases render per section with layered effects
- [ ] Scroll triggers section transitions smoothly
- [ ] Portal effects display (glow, morph) when enabled

### 2. Performance
- [ ] Frame rate maintains ≥45 FPS on mobile, ≥60 FPS desktop
- [ ] Quality tier auto-adjusts under load
- [ ] Telemetry batches flush every ~8 seconds (check console)

### 3. Accessibility
- [ ] Keyboard navigation works (Arrow, Page, Home, End keys)
- [ ] Reduced motion toggle disables animations
- [ ] Crystal UI buttons have proper focus states

### 4. Configuration
- [ ] URL parameters work (?adapter=quaternion, ?syncChannel=test)
- [ ] Editor synchronization works when both apps running
- [ ] Runtime toggles affect behavior correctly

### 5. Adapters
- [ ] Both adapters initialize without errors
- [ ] WebGL2 context created successfully
- [ ] No console errors or warnings

---

## 📊 Performance Benchmarks (To Collect)

After deployment, collect these metrics for `VIB34D_ENGINE_RUBRIC.md`:

### Quaternion SDK Adapter
- Frame time (ms): _____
- WebGL2 performance: _____
- 4D rotation fidelity: _____
- Morphing continuity: _____

### Vib3-plus Adapter
- Frame time (ms): _____
- WebGL2 performance: _____
- Polytope warp quality: _____
- Integration status: _____

---

## 🐛 Troubleshooting

### Issue: Blank Canvas
**Diagnosis**: Adapter not initialized
**Fix**: Check console for WebGL errors, verify adapter import

### Issue: Stuttering Animation
**Diagnosis**: Quality tier too high
**Fix**: Manual override or let auto-quality adjust

### Issue: Scroll Snaps Not Firing
**Diagnosis**: Intersection observer disabled
**Fix**: Verify `scrollSnapEnabled` config, call `scroll.refresh()`

### Issue: Telemetry Missing
**Diagnosis**: Adapter sink undefined
**Fix**: Confirm adapter implements `telemetry.batch`

### Issue: Editor Not Syncing
**Diagnosis**: Channel mismatch
**Fix**: Ensure both apps use same `?syncChannel=` value

---

## 🎨 System Architecture Summary

```
vib3code-vib34d-bootstrap/
├── apps/
│   ├── vib34d-demo/          # Main visualization showcase (port 5173)
│   │   └── dist/             # Built output for deployment
│   └── editor/               # Parameter authoring tool (port 5174)
│       └── dist/             # Built output
├── packages/@vib34d/
│   ├── core/                 # Renderer, geometry, quality tiers
│   ├── multi/                # Multi-instance orchestration
│   ├── scroll/               # Velocity tracking, snap logic
│   ├── transition/           # Transition engine
│   ├── home-master/          # Parameter derivation
│   ├── crystal-ui/           # Navigation controls
│   ├── telemetry/            # Performance monitoring
│   ├── adapter-sdk/          # Quaternion SDK adapter
│   └── adapter-vib3plus/     # Vib3-plus adapter
└── docs/
    ├── VIB34D_AGENT_RUNBOOK.md
    ├── VIB34D_ENGINE_RUBRIC.md
    ├── VIB34D_VALIDATION_CHECKLIST.md
    └── ...
```

---

## 📝 Next Steps

1. **Deploy to GitHub Pages**: Merge branch to `main` or trigger workflow
2. **Verify Deployment**: Run through verification checklist above
3. **Collect Benchmarks**: Populate `VIB34D_ENGINE_RUBRIC.md` with measurements
4. **Test Adapters**: Compare quaternion SDK vs vib3-plus performance
5. **Document Tweaks**: Update this guide with any needed adjustments
6. **Optional**: Set up Firebase hosting as alternative/production deployment

---

## 🌟 Credits

**A Paul Phillips Manifestation**
VIB34D Multi-Instance Visualization System
Advanced 4D geometric processing with reactive parameter systems

**System Components**:
- Multi-instance orchestration
- Scroll-based portal transitions
- Adaptive quality management
- Home-master reactive parameters
- Crystal UI navigation
- Telemetry & performance monitoring

**Co-Authored-By**: Claude <noreply@anthropic.com>

---

*Last Updated*: 2025-10-19
*Branch*: `codex/16-29-52edit-vib34d-system-bootstrap-prompt2025-10-19`
*Status*: ✅ Ready for deployment
