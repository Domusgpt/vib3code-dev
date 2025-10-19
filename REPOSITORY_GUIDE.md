# VIB34D Repository Structure & Purpose

## 📂 Repository Overview

The VIB34D Multi-Instance Visualization System is maintained across two repositories with distinct purposes:

### 1. **vib3code** (Production Repository)
**URL**: https://github.com/Domusgpt/vib3code
**Live Site**: https://domusgpt.github.io/vib3code/ (after merge)
**Purpose**: Production-ready, stable releases
**Branch Strategy**:
- `main` - Production deployment branch
- `codex/*` - Feature development branches
- Active PR: [#36 - VIB34D Runtime Toggles](https://github.com/Domusgpt/vib3code/pull/36)

### 2. **vib3code-dev** (Development Repository)
**URL**: https://github.com/Domusgpt/vib3code-dev
**Live Site**: https://domusgpt.github.io/vib3code-dev/
**Purpose**: Safe development, testing, and experimentation
**Branch Strategy**:
- `main` - Development version (mirrors production PR branch)
- Additional branches - Experimental features

---

## 🎯 Repository Purposes

### Production Repository (vib3code)

**Primary Use Cases**:
- ✅ Production deployments to main audience
- ✅ Stable feature releases
- ✅ Version-controlled releases
- ✅ Public-facing documentation
- ✅ Community contributions via PRs

**Deployment Strategy**:
- Merge to `main` triggers automatic GitHub Actions workflow
- Builds entire pnpm monorepo
- Deploys demo app to GitHub Pages
- Maintains production stability

**Protection**:
- Requires PR review before merging to main
- All tests must pass
- Build must succeed
- Documentation must be updated

### Development Repository (vib3code-dev)

**Primary Use Cases**:
- ✅ Safe testing environment before production merge
- ✅ Experimental feature development
- ✅ Breaking change testing
- ✅ Performance benchmarking
- ✅ Integration testing with external systems
- ✅ Developer sandbox

**Deployment Strategy**:
- Any push to `main` triggers deployment
- Rapid iteration without production impact
- Can be reset or force-pushed if needed
- Lower stability requirements

**Freedom**:
- No PR approval required
- Experimental commits allowed
- Can test breaking changes
- Rapid development cycle

---

## 🔄 Workflow: From Development to Production

### Step 1: Develop in vib3code-dev
```bash
cd /path/to/vib3code-dev

# Make changes
git add .
git commit -m "Experimental feature"
git push origin main

# Automatically deploys to https://domusgpt.github.io/vib3code-dev/
```

### Step 2: Test & Verify
- ✅ Test all features in dev deployment
- ✅ Run full test suite: `pnpm run test`
- ✅ Verify build: `pnpm run build`
- ✅ Check performance benchmarks
- ✅ Validate configuration changes

### Step 3: Port to Production (vib3code)
```bash
cd /path/to/vib3code-vib34d-bootstrap

# Create feature branch
git checkout -b codex/feature-name

# Make same changes
git add .
git commit -m "Feature ready for production"
git push origin codex/feature-name

# Create PR to main
gh pr create --base main --head codex/feature-name
```

### Step 4: Production Deployment
- ✅ PR review and approval
- ✅ Merge to main
- ✅ Automatic deployment to https://domusgpt.github.io/vib3code/

---

## 📊 Current Status

### Production Repository (vib3code)
- **Status**: ⏳ Awaiting PR merge
- **PR**: #36 - VIB34D Runtime Toggles
- **Branch**: `codex/16-29-52edit-vib34d-system-bootstrap-prompt2025-10-19`
- **Commits**: Latest deployment configuration + comprehensive docs
- **Tests**: ✅ 14/14 passed
- **Build**: ✅ Successful

### Development Repository (vib3code-dev)
- **Status**: ✅ Live and deployed
- **URL**: https://domusgpt.github.io/vib3code-dev/
- **Branch**: `main` (mirrors production PR)
- **Deployment**: ✅ Successful
- **Workflow**: ✅ All checks passed

---

## 🛠️ Local Development Setup

### Clone Both Repositories

```bash
# Production repository
gh repo clone Domusgpt/vib3code vib3code-production
cd vib3code-production
git checkout codex/16-29-52edit-vib34d-system-bootstrap-prompt2025-10-19
pnpm install

# Development repository
gh repo clone Domusgpt/vib3code-dev vib3code-development
cd vib3code-development
pnpm install
```

### Run Local Development Servers

```bash
# In either repository:

# Demo only
pnpm --filter vib34d-demo dev
# Opens: http://localhost:5173

# Demo + Editor
pnpm dev
# Demo: http://localhost:5173
# Editor: http://localhost:5174
```

---

## 🔐 Access & Permissions

### Production Repository (vib3code)
- **Visibility**: Public
- **Branch Protection**: Enabled on `main`
- **Required Reviews**: 1 (recommended)
- **Required Status Checks**: Tests + Build
- **Deployment**: GitHub Actions

### Development Repository (vib3code-dev)
- **Visibility**: Public
- **Branch Protection**: None (for rapid development)
- **Required Reviews**: None
- **Required Status Checks**: None (but workflow runs)
- **Deployment**: GitHub Actions

---

## 📚 Documentation Locations

### Common Documentation (Both Repos)
- `README.md` - System overview and getting started
- `VIB34D_AGENT_RUNBOOK.md` - Operational playbook
- `VIB34D_CONFIGURATION_GUIDE.md` - Configuration reference
- `VIB34D_COMPLETE_DOCUMENTATION.md` - Architecture details
- `VIB34D_ENGINE_RUBRIC.md` - Adapter evaluation
- `VIB34D_VALIDATION_CHECKLIST.md` - Pre-deployment checks
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

### Repository-Specific
- `REPOSITORY_GUIDE.md` (this file) - Repository structure
- `.github/workflows/deploy.yml` - Deployment automation
- `firebase.json` - Firebase hosting config

---

## 🎨 VIB34D System Architecture

Both repositories contain the same monorepo structure:

```
vib3code(-dev)/
├── apps/
│   ├── vib34d-demo/          # Main visualization showcase
│   │   ├── src/
│   │   └── dist/             # Built for deployment
│   └── editor/               # Parameter authoring tool
│       ├── src/
│       └── dist/             # Built for deployment
├── packages/@vib34d/
│   ├── core/                 # Renderer, geometry, quality
│   ├── multi/                # Multi-instance orchestration
│   ├── scroll/               # Velocity tracking, snapping
│   ├── transition/           # Transition engine
│   ├── home-master/          # Parameter derivation
│   ├── crystal-ui/           # Navigation controls
│   ├── telemetry/            # Performance monitoring
│   ├── editor/               # Editor utilities
│   ├── adapter-sdk/          # Quaternion SDK adapter
│   └── adapter-vib3plus/     # Vib3-plus adapter
├── docs/                     # Additional documentation
├── .github/workflows/        # CI/CD automation
└── [configuration files]
```

---

## 🚀 Deployment URLs

### After Production Merge
- **Production**: https://domusgpt.github.io/vib3code/
- **Development**: https://domusgpt.github.io/vib3code-dev/

### Testing URLs
```bash
# Production (after merge)
https://domusgpt.github.io/vib3code/?adapter=quaternion
https://domusgpt.github.io/vib3code/?adapter=vib3plus
https://domusgpt.github.io/vib3code/?syncChannel=test

# Development (live now)
https://domusgpt.github.io/vib3code-dev/?adapter=quaternion
https://domusgpt.github.io/vib3code-dev/?adapter=vib3plus
https://domusgpt.github.io/vib3code-dev/?syncChannel=test
```

---

## 🎯 Next Steps

### Immediate Actions
1. ✅ vib3code-dev deployed and verified
2. ⏳ **Merge PR #36 to vib3code main**
3. ⏳ Verify production deployment
4. ⏳ Collect performance benchmarks

### Ongoing Development
1. Continue experimental work in vib3code-dev
2. Port stable features to vib3code via PRs
3. Maintain documentation parity
4. Regular testing across both environments

---

## 🌟 A Paul Phillips Manifestation

**VIB34D Multi-Instance Visualization System**

Revolutionary 4D geometric processing with reactive parameter systems and multi-instance orchestration.

**Production**: https://github.com/Domusgpt/vib3code
**Development**: https://github.com/Domusgpt/vib3code-dev

---

*Last Updated*: 2025-10-19
*Status*: vib3code-dev ✅ Live | vib3code ⏳ Awaiting merge
*Co-Authored-By*: Claude <noreply@anthropic.com>
