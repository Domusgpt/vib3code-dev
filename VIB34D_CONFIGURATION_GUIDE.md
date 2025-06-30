# VIB34D SYSTEM CONFIGURATION GUIDE

## 🎛️ EASY ADJUSTMENT VARIABLES

This guide contains ALL the important variables you can modify to customize the VIB34D Multi-Visualizer Styles Package system.

---

## 🔧 PRIMARY CONFIGURATION (index.html)

### **Main System Settings**
```javascript
window.VIB34DConfig = {
    // ===== CORE VISUALIZER SETTINGS =====
    visualizerCount: 4,  // CHANGE THIS! (3-6 recommended)
    visualizerRoles: ['background', 'content', 'accent', 'overlay'],
    
    // ===== GEOMETRY & THEME =====
    defaultGeometry: 'hypercube',     // Starting geometry
    defaultPreset: 'editorial',       // Parameter preset
    
    // ===== PERFORMANCE SETTINGS =====
    targetFPS: 60,                    // Performance target
    enableViewportOptimization: true, // Only render visible sections
    
    // ===== TRANSITION SETTINGS =====
    enableTransitions: true,
    defaultTransitionRule: 'smooth',  // 'smooth', 'dramatic', 'wave', 'instant', 'breathing'
    portalEffectsEnabled: true,
    
    // ===== EDITOR SETTINGS =====
    editorMode: false,    // Set to TRUE for editor controls
    showControls: false,  // Set to TRUE to show parameter controls
    debugMode: false      // Set to TRUE for debug info
};
```

---

## 🎨 GEOMETRY CONFIGURATION

### **Section-to-Geometry Mapping**
*Location: `js/vib34d-style-system.js` - `determineSectionConfig()` method*

```javascript
const defaultSectionMapping = [
    { key: 'home', geometry: 'hypercube', selector: '.hero, .header, [data-section="home"]' },
    { key: 'articles', geometry: 'tetrahedron', selector: '.articles, .blog, [data-section="articles"]' },
    { key: 'videos', geometry: 'sphere', selector: '.videos, .media, [data-section="videos"]' },
    { key: 'podcasts', geometry: 'torus', selector: '.podcasts, .audio, [data-section="podcasts"]' },
    { key: 'ema', geometry: 'wave', selector: '.ema, .philosophy, [data-section="ema"]' },
    { key: 'crystal', geometry: 'crystal', selector: '.ui, .controls, [data-section="crystal"]' }
];
```

### **Available Geometries**
*Location: `js/vib34d-core.js` - Fragment shader `getGeometryValue()` function*

1. **hypercube** (0) - Magenta lattice grids, master control geometry
2. **tetrahedron** (1) - Cyan stability patterns, technical content
3. **sphere** (2) - Yellow infinite potential, conceptual content  
4. **torus** (3) - Green flow patterns, media and content
5. **klein** (4) - Orange topology, community features
6. **fractal** (5) - Purple recursive structures, development content
7. **wave** (6) - Pink probability spaces, experimental features
8. **crystal** (7) - Mint ordered complexity, **BACKBONE UI SYSTEM**

---

## 🏠 HOME-MASTER PARAMETER SYSTEM

### **Mathematical Relationships**
*Location: `js/vib34d-home-master.js` - `deriveParametersForSection()` method*

```javascript
this.sectionConfig = {
    home: { geometry: 'hypercube', modifier: 1.0 },      // BASE PARAMETERS
    articles: { geometry: 'tetrahedron', modifier: 0.8 }, // Articles = Home × 0.8
    videos: { geometry: 'sphere', modifier: 1.2 },        // Videos = Home × 1.2  
    podcasts: { geometry: 'torus', modifier: 1.1 },       // Podcasts = Home × 1.1
    ema: { geometry: 'wave', modifier: 0.9 }              // EMA = Home × 0.9
};
```

### **Master Parameters** 
*Location: `js/vib34d-home-master.js` - `masterParameters` object*

```javascript
this.masterParameters = {
    // ===== CORE VISUAL PARAMETERS =====
    gridDensity: 12.0,        // Grid line density (8.0-20.0 recommended)
    morphFactor: 0.5,         // Shape morphing intensity (0.0-1.0)
    dimension: 3.5,           // 4D projection strength (3.0-4.0)
    rotationSpeed: 0.5,       // Animation speed (0.1-1.0)
    glitchIntensity: 0.3,     // Digital glitch effects (0.0-1.0)
    
    // ===== COLOR SETTINGS =====
    baseColor: [1.0, 0.0, 1.0],  // RGB values [R, G, B] (0.0-1.0)
    
    // ===== INTERACTION SETTINGS =====
    interactionSensitivity: 1.0,  // How responsive to user input
    scrollMultiplier: 1.5,        // Scroll velocity influence
    mouseInfluence: 0.8           // Mouse movement influence
};
```

---

## 🎭 MULTI-INSTANCE CONFIGURATION

### **Instance Role Settings**
*Location: `js/vib34d-style-system.js` - `getRoleOpacity()` and `getRoleModifier()` methods*

```javascript
// OPACITY SETTINGS (0.0 = invisible, 1.0 = fully opaque)
const opacityMap = {
    background: 0.8,   // Most visible layer
    content: 0.4,      // Medium visibility
    accent: 0.6,       // Accent highlights
    header: 0.5,       // Header regions
    overlay: 0.3       // Subtle overlay effects
};

// PARAMETER MODIFIER SETTINGS (multipliers for variation)
const modifierMap = {
    background: 0.7,   // Slower, calmer variation
    content: 1.0,      // Base parameters (no change)
    accent: 1.3,       // Faster, more intense variation
    header: 0.9,       // Slightly reduced variation
    overlay: 1.1       // Slightly increased variation
};
```

### **Instance Presets**
*Location: `js/vib34d-multi-instance.js` - `VIB34DInstancePresets` class*

```javascript
// STANDARD 3-INSTANCE LAYOUT
'standard': {
    'header': { modifier: 1.0, opacity: 0.6, zIndex: 1 },
    'content': { modifier: 1.3, opacity: 0.4, zIndex: 2 },
    'background': { modifier: 0.7, opacity: 0.8, zIndex: 0 }
},

// COMPLEX 5-INSTANCE LAYOUT  
'complex': {
    'background': { modifier: 0.5, opacity: 0.9, zIndex: 0 },
    'header': { modifier: 1.0, opacity: 0.6, zIndex: 1 },
    'content': { modifier: 1.3, opacity: 0.4, zIndex: 2 },
    'sidebar': { modifier: 0.8, opacity: 0.5, zIndex: 1 },
    'accent': { modifier: 1.5, opacity: 0.3, zIndex: 3 }
}
```

---

## 🌊 INFINITE SCROLL CONFIGURATION

### **Scroll Transition Settings**
*Location: `js/vib34d-infinite-scroll.js` (to be created)*

```javascript
// SCROLL VELOCITY THRESHOLDS
const scrollConfig = {
    // ===== SCROLL SPEED DETECTION =====
    gentleThreshold: 10,    // Slow scroll - gentle morphing
    standardThreshold: 50,  // Medium scroll - standard transition  
    dramaticThreshold: 100, // Fast scroll - dramatic portal effects
    
    // ===== TRANSITION TIMING =====
    transitionDuration: 2000,  // Milliseconds for geometry morphing
    portalIntensity: 0.8,       // Portal effect strength (0.0-1.0)
    dimensionShift: 0.5,        // 4D space distortion during transition
    
    // ===== SNAP POINTS =====
    snapPoints: [0, 1000, 2000, 3000, 4000],  // Pixel positions for sections
    snapSensitivity: 0.3,  // How easily sections snap (0.1-1.0)
    snapDuration: 800      // Smooth scrolling duration (ms)
};
```

---

## 💎 CRYSTAL BACKBONE SYSTEM

### **Crystal UI Framework Settings**
*Location: `js/crystal-ui-framework.js` (to be created)*

```javascript
const crystalConfig = {
    // ===== UNIVERSAL CRYSTAL SETTINGS =====
    crystalGeometry: 'crystal',        // Always uses crystal geometry
    crystalColor: [0.0, 1.0, 0.5],    // Mint green - universal UI color
    crystalDensity: 18.0,              // Grid density for crystal lattice
    crystalMorphFactor: 0.2,           // Subtle morphing for UI elements
    
    // ===== INTERACTION EFFECTS =====
    hoverIntensity: 1.5,               // Hover effect multiplier
    clickIntensity: 2.0,               // Click effect multiplier
    pulseSpeed: 0.2,                   // Gentle pulsing animation
    
    // ===== CRYSTAL UI ELEMENTS =====
    enableCrystalButtons: true,         // Replace HTML buttons
    enableCrystalNavigation: true,      // Crystal navigation elements
    enableCrystalAccents: true,         // Crystal accent decorations
    
    // ===== BACKBONE UNIFICATION =====
    unifyAllSections: true,             // Add crystal layer to ALL sections
    backboneOpacity: 0.2,               // Subtle crystal backbone visibility
    backboneZIndex: -1                  // Behind other visualizers
};
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### **Viewport Detection Settings**
*Location: `js/vib34d-style-system.js` - `setupSectionNavigation()` method*

```javascript
// INTERSECTION OBSERVER SETTINGS
const viewportConfig = {
    // ===== ACTIVATION MARGINS =====
    rootMargin: '100px',      // Start loading 100px before viewport
    threshold: 0.1,           // Trigger when 10% visible
    
    // ===== TRANSITION DETECTION =====
    transitionThreshold: 0.5, // 50% visible = current section
    transitionMargin: '0px',  // No margin for section transitions
    
    // ===== PERFORMANCE LIMITS =====
    maxActiveVisualizers: 12, // 3 sections × 4 visualizers each
    pauseOffscreenSections: true,  // Pause non-visible sections
    enableSmartLoading: true       // Progressive loading based on scroll
};
```

### **WebGL Performance Settings**
*Location: `js/vib34d-core.js` - Shader parameters*

```javascript
// SHADER OPTIMIZATION SETTINGS
const performanceConfig = {
    // ===== RENDERING QUALITY =====
    shaderPrecision: 'highp',     // 'lowp', 'mediump', 'highp'
    maxIterations: 4,             // Fractal calculation iterations
    gridResolution: 0.03,         // Grid line sharpness (lower = sharper)
    
    // ===== INTERACTION OPTIMIZATION =====
    interactionDecay: 0.95,       // How quickly interactions fade
    maxInteractionIntensity: 1.0, // Cap interaction effects
    idleTimeout: 3000             // Return to calm after 3 seconds
};
```

---

## 🎨 COLOR THEME CONFIGURATION

### **Geometry Color Mapping**
*Location: `js/vib34d-core.js` - `themeConfigs` object*

```javascript
const colorThemes = {
    hypercube: { baseColor: [1.0, 0.0, 1.0] },    // Magenta - sovereignty
    tetrahedron: { baseColor: [0.0, 1.0, 1.0] },  // Cyan - technical precision  
    sphere: { baseColor: [1.0, 1.0, 0.0] },       // Yellow - infinite potential
    torus: { baseColor: [0.0, 1.0, 0.0] },        // Green - continuous flow
    klein: { baseColor: [1.0, 0.5, 0.0] },        // Orange - boundary transcendence
    fractal: { baseColor: [0.5, 0.0, 1.0] },      // Purple - recursive complexity
    wave: { baseColor: [1.0, 0.0, 0.5] },         // Pink - probability spaces
    crystal: { baseColor: [0.0, 1.0, 0.5] }       // Mint - universal UI backbone
};
```

---

## 🔄 TRANSITION EFFECTS

### **Transition Rule Configuration**
*Location: `js/vib34d-transition-engine.js` - `transitionRules` object*

```javascript
const transitionRules = {
    // ===== TRANSITION TYPES =====
    smooth: { 
        easing: 'easeInOutCubic', 
        duration: 2000,
        intensity: 0.5 
    },
    dramatic: { 
        easing: 'easeOutBounce', 
        duration: 1500,
        intensity: 0.8 
    },
    wave: { 
        easing: 'easeInOutSine', 
        duration: 3000,
        intensity: 0.3 
    },
    instant: { 
        easing: 'easeLinear', 
        duration: 100,
        intensity: 1.0 
    },
    breathing: { 
        easing: 'easeInOutQuad', 
        duration: 4000,
        intensity: 0.2 
    }
};
```

---

## 📱 RESPONSIVE CONFIGURATION

### **Device-Specific Settings**
*Location: CSS and JavaScript performance detection*

```javascript
const responsiveConfig = {
    // ===== DEVICE DETECTION =====
    mobile: {
        maxVisualizers: 2,        // Reduce visualizers on mobile
        reducedEffects: true,     // Disable heavy effects
        targetFPS: 30            // Lower FPS target
    },
    tablet: {
        maxVisualizers: 3,        // Moderate visualizer count
        reducedEffects: false,    // Keep most effects
        targetFPS: 45            // Moderate FPS target  
    },
    desktop: {
        maxVisualizers: 4,        // Full visualizer count
        reducedEffects: false,    // All effects enabled
        targetFPS: 60            // Full FPS target
    }
};
```

---

## 🎛️ QUICK CONFIGURATION EXAMPLES

### **Minimal Performance Setup**
```javascript
window.VIB34DConfig = {
    visualizerCount: 2,
    visualizerRoles: ['background', 'accent'],
    targetFPS: 30,
    enableViewportOptimization: true,
    editorMode: false
};
```

### **Maximum Visual Impact Setup**  
```javascript
window.VIB34DConfig = {
    visualizerCount: 6,
    visualizerRoles: ['background', 'content', 'accent', 'overlay', 'detail', 'atmosphere'],
    targetFPS: 60,
    portalEffectsEnabled: true,
    defaultTransitionRule: 'dramatic'
};
```

### **Crystal Backbone Focus Setup**
```javascript
window.VIB34DConfig = {
    visualizerCount: 4,
    defaultGeometry: 'crystal',     // Start with crystal
    crystalBackboneEnabled: true,   // Enable crystal backbone
    unifyAllSections: true,         // Crystal layer on all sections
    enableCrystalUI: true          // Crystal UI elements
};
```

---

## 🚀 DEVELOPMENT MODE

### **Editor Controls Setup**
```javascript
window.VIB34DConfig = {
    editorMode: true,      // Enable editor controls
    showControls: true,    // Show parameter sliders
    debugMode: true,       // Show debug information
    enableTransitions: true // Test transition effects
};
```

---

**Remember**: All changes take effect immediately when you refresh the page. The system is designed to be easily configurable through these documented variables.