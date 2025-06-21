# Quick Reference: Multi-Visualizer Styles Package

## 🎯 Core Concept
**MULTI-VISUALIZER STYLES PACKAGE** = Multiple visualizers per section, NOT single background

## 📍 Starting Point
```
WORKING DEMO: C:\Users\millz\Desktop\vibecodestyle demo\index.html.html
PROJECT DIR: /mnt/c/Users/millz/ParseratorMarketing/vib3code-blog-experiment/
```

## 🔢 Instance Requirements
Each section shows 3+ visualizers:
- **Home**: 3+ hypercubes
- **Articles**: 3+ tetrahedrons  
- **Videos**: 3+ spheres
- **Podcasts**: 3+ tori
- **EMA**: 3+ waves

## 🎛️ Parameter System
```javascript
// Within section variations
instance1 = base * 1.0
instance2 = base * 1.3  
instance3 = base * 0.7

// Cross-section relationships
articles = home * 0.8
videos = home * 1.2
podcasts = home * 0.9
ema = home * 1.1
```

## ❌ Current Errors
- `this.createGlassmorphicPanels is not a function`
- Canvas context null in 2D fallback
- WebGL shader compilation failures

## ✅ Success Checklist
- [ ] Extract working code from demo
- [ ] Create multi-instance manager
- [ ] 3+ visualizers per section
- [ ] Same geometry, different params
- [ ] Home-master control working
- [ ] Glassmorphic UI overlays
- [ ] 60 FPS performance
- [ ] No console errors

## 🚀 Implementation Order
1. Start with working demo code
2. Build MultiVisualizerManager class
3. Implement one section fully (Home)
4. Replicate to other sections
5. Add reactive parameter system
6. Polish with glassmorphic UI

## ⚠️ Remember
- NOT a single background visualizer
- MULTIPLE instances per section
- USE the working demo, don't debug kernel
- Visualizers are the STAR - make them impressive