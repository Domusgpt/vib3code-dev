/**
 * VIB34D TRANSITION ENGINE
 * Handles smooth morphing between geometries and parameter interpolation
 * 
 * Core concept: Seamless transitions between 4D polytopal projections
 * with editor-controllable transition rules and multi-instance coordination
 */

console.log('🎬 VIB34D Transition Engine Loading...');

// ===== TRANSITION ENGINE CORE =====
class VIB34DTransitionEngine {
    constructor(multiInstanceManager, options = {}) {
        this.multiInstanceManager = multiInstanceManager;
        this.sectionKey = multiInstanceManager.sectionKey;
        
        // Transition state
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = options.defaultDuration || 2000; // 2 seconds
        this.transitionStartTime = 0;
        
        // Current and target states
        this.currentGeometry = multiInstanceManager.geometry;
        this.targetGeometry = null;
        this.currentParameters = { ...multiInstanceManager.baseParameters };
        this.targetParameters = {};
        
        // Transition configuration
        this.transitionRules = {
            smooth: {
                easing: this.easeInOutCubic,
                parameterBlending: 'interpolate',
                duration: 2000,
                description: 'Gentle curved transition'
            },
            dramatic: {
                easing: this.easeOutBounce,
                parameterBlending: 'stepwise',
                duration: 1500,
                description: 'Bold bounce effect'
            },
            wave: {
                easing: this.easeInOutSine,
                parameterBlending: 'oscillate',
                duration: 3000,
                description: 'Wavelike flowing motion'
            },
            instant: {
                easing: this.easeLinear,
                parameterBlending: 'snap',
                duration: 100,
                description: 'Immediate transformation'
            },
            breathing: {
                easing: this.easeInOutQuad,
                parameterBlending: 'pulse',
                duration: 4000,
                description: 'Organic breathing rhythm'
            }
        };
        
        this.currentRule = options.defaultRule || 'smooth';
        
        // Geometry transition matrix (defines which geometries can morph into others)
        this.geometryTransitionMatrix = {
            hypercube: ['tetrahedron', 'sphere', 'crystal'],
            tetrahedron: ['hypercube', 'sphere', 'torus'],
            sphere: ['hypercube', 'tetrahedron', 'torus', 'wave'],
            torus: ['sphere', 'klein', 'wave'],
            klein: ['torus', 'fractal', 'wave'],
            fractal: ['klein', 'wave', 'crystal'],
            wave: ['sphere', 'torus', 'fractal', 'crystal'],
            crystal: ['hypercube', 'fractal', 'wave']
        };
        
        console.log(`🎬 TransitionEngine [${this.sectionKey}] initialized with rule: ${this.currentRule}`);
    }
    
    // ===== EASING FUNCTIONS =====
    easeLinear(t) { return t; }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
    
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    
    // ===== GEOMETRY TRANSITION LOGIC =====
    canTransitionTo(targetGeometry) {
        return this.geometryTransitionMatrix[this.currentGeometry]?.includes(targetGeometry) || false;
    }
    
    getOptimalTransitionPath(targetGeometry) {
        // For now, direct transitions. Future: pathfinding through geometry graph
        if (this.canTransitionTo(targetGeometry)) {
            return [this.currentGeometry, targetGeometry];
        }
        
        // Find intermediate geometry
        const currentOptions = this.geometryTransitionMatrix[this.currentGeometry] || [];
        const targetOptions = this.geometryTransitionMatrix[targetGeometry] || [];
        
        // Find common geometry that both can transition to/from
        const intermediate = currentOptions.find(geom => 
            this.geometryTransitionMatrix[geom]?.includes(targetGeometry)
        );
        
        if (intermediate) {
            return [this.currentGeometry, intermediate, targetGeometry];
        }
        
        // Fallback: force transition through sphere (universal connector)
        return [this.currentGeometry, 'sphere', targetGeometry];
    }
    
    // ===== PARAMETER BLENDING STRATEGIES =====
    blendParameters(current, target, progress, blendingType) {
        const blended = {};
        
        switch (blendingType) {
            case 'interpolate':
                // Smooth linear interpolation
                Object.keys(current).forEach(key => {
                    if (typeof current[key] === 'number' && typeof target[key] === 'number') {
                        blended[key] = current[key] + (target[key] - current[key]) * progress;
                    } else if (Array.isArray(current[key]) && Array.isArray(target[key])) {
                        // Color array interpolation
                        blended[key] = current[key].map((val, idx) => 
                            val + (target[key][idx] - val) * progress
                        );
                    } else {
                        blended[key] = progress < 0.5 ? current[key] : target[key];
                    }
                });
                break;
                
            case 'stepwise':
                // Dramatic steps at 25%, 50%, 75%
                const step = Math.floor(progress * 4) / 4;
                Object.keys(current).forEach(key => {
                    if (typeof current[key] === 'number' && typeof target[key] === 'number') {
                        blended[key] = current[key] + (target[key] - current[key]) * step;
                    } else if (Array.isArray(current[key])) {
                        blended[key] = current[key].map((val, idx) => 
                            val + (target[key][idx] - val) * step
                        );
                    } else {
                        blended[key] = step < 0.5 ? current[key] : target[key];
                    }
                });
                break;
                
            case 'oscillate':
                // Wave-like oscillation around target values
                const wave = Math.sin(progress * Math.PI * 3) * 0.2;
                Object.keys(current).forEach(key => {
                    if (typeof current[key] === 'number' && typeof target[key] === 'number') {
                        const base = current[key] + (target[key] - current[key]) * progress;
                        blended[key] = base + (target[key] - current[key]) * wave;
                    } else if (Array.isArray(current[key])) {
                        blended[key] = current[key].map((val, idx) => {
                            const base = val + (target[key][idx] - val) * progress;
                            return base + (target[key][idx] - val) * wave;
                        });
                    } else {
                        blended[key] = progress < 0.5 ? current[key] : target[key];
                    }
                });
                break;
                
            case 'snap':
                // Instant at 50% mark
                Object.keys(current).forEach(key => {
                    blended[key] = progress < 0.5 ? current[key] : target[key];
                });
                break;
                
            case 'pulse':
                // Breathing effect - expand/contract around values
                const pulse = Math.sin(progress * Math.PI * 2) * 0.1 + 1;
                Object.keys(current).forEach(key => {
                    if (typeof current[key] === 'number' && typeof target[key] === 'number') {
                        const base = current[key] + (target[key] - current[key]) * progress;
                        blended[key] = base * pulse;
                    } else if (Array.isArray(current[key])) {
                        blended[key] = current[key].map((val, idx) => {
                            const base = val + (target[key][idx] - val) * progress;
                            return base;  // Keep colors stable in pulse mode
                        });
                    } else {
                        blended[key] = progress < 0.5 ? current[key] : target[key];
                    }
                });
                break;
                
            default:
                return this.blendParameters(current, target, progress, 'interpolate');
        }
        
        return blended;
    }
    
    // ===== TRANSITION EXECUTION =====
    startTransition(targetGeometry, targetParameters = null, transitionRule = null) {
        if (this.isTransitioning) {
            console.log(`⚠️ Transition already in progress for ${this.sectionKey}`);
            return false;
        }
        
        // Validate transition
        if (!this.canTransitionTo(targetGeometry)) {
            console.log(`❌ Cannot transition from ${this.currentGeometry} to ${targetGeometry}`);
            return false;
        }
        
        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.transitionStartTime = Date.now();
        this.targetGeometry = targetGeometry;
        
        // Use provided rule or current rule
        const rule = transitionRule || this.currentRule;
        this.transitionDuration = this.transitionRules[rule].duration;
        
        // Set target parameters (derive from target geometry if not provided)
        if (targetParameters) {
            this.targetParameters = { ...targetParameters };
        } else {
            // Get default parameters for target geometry from VIB34DCore
            const tempCore = new VIB34DCore(document.createElement('canvas'), { 
                geometry: targetGeometry 
            });
            this.targetParameters = { ...tempCore.themeConfigs[targetGeometry] };
        }
        
        console.log(`🎬 Starting transition ${this.currentGeometry} → ${targetGeometry} using ${rule} rule`);
        
        // Start transition animation
        this.animateTransition();
        
        return true;
    }
    
    animateTransition() {
        if (!this.isTransitioning) return;
        
        const now = Date.now();
        const elapsed = now - this.transitionStartTime;
        this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1.0);
        
        // Apply easing function
        const rule = this.transitionRules[this.currentRule];
        const easedProgress = rule.easing(this.transitionProgress);
        
        // Blend parameters
        const blendedParameters = this.blendParameters(
            this.currentParameters,
            this.targetParameters,
            easedProgress,
            rule.parameterBlending
        );
        
        // Update all instances with blended parameters
        this.multiInstanceManager.updateInstanceParameters(blendedParameters);
        
        // Check if transition complete
        if (this.transitionProgress >= 1.0) {
            this.completeTransition();
        } else {
            // Continue animation
            requestAnimationFrame(() => this.animateTransition());
        }
    }
    
    completeTransition() {
        // Finalize transition
        this.currentGeometry = this.targetGeometry;
        this.currentParameters = { ...this.targetParameters };
        this.multiInstanceManager.geometry = this.targetGeometry;
        
        // Reset transition state
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.targetGeometry = null;
        this.targetParameters = {};
        
        console.log(`✅ Transition complete: ${this.sectionKey} now using ${this.currentGeometry}`);
        
        // Trigger completion callback if exists
        if (this.onTransitionComplete) {
            this.onTransitionComplete(this.currentGeometry);
        }
    }
    
    // ===== TRANSITION CONTROL METHODS =====
    setTransitionRule(ruleName) {
        if (this.transitionRules[ruleName]) {
            this.currentRule = ruleName;
            console.log(`🎛️ Transition rule set to: ${ruleName} - ${this.transitionRules[ruleName].description}`);
        } else {
            console.warn(`⚠️ Unknown transition rule: ${ruleName}`);
        }
    }
    
    getAvailableTransitions() {
        return this.geometryTransitionMatrix[this.currentGeometry] || [];
    }
    
    getTransitionRules() {
        return Object.keys(this.transitionRules).map(key => ({
            name: key,
            description: this.transitionRules[key].description,
            duration: this.transitionRules[key].duration
        }));
    }
    
    pauseTransition() {
        if (this.isTransitioning) {
            this.isTransitioning = false;
            console.log(`⏸️ Transition paused at ${(this.transitionProgress * 100).toFixed(1)}%`);
        }
    }
    
    resumeTransition() {
        if (!this.isTransitioning && this.targetGeometry) {
            this.isTransitioning = true;
            this.transitionStartTime = Date.now() - (this.transitionProgress * this.transitionDuration);
            this.animateTransition();
            console.log(`▶️ Transition resumed from ${(this.transitionProgress * 100).toFixed(1)}%`);
        }
    }
    
    cancelTransition() {
        if (this.isTransitioning) {
            this.isTransitioning = false;
            this.transitionProgress = 0;
            this.targetGeometry = null;
            this.targetParameters = {};
            
            // Reset to original parameters
            this.multiInstanceManager.updateInstanceParameters(this.currentParameters);
            console.log(`❌ Transition cancelled, reverted to ${this.currentGeometry}`);
        }
    }
    
    // ===== INTERACTION-DRIVEN TRANSITIONS =====
    triggerInteractionTransition(interactionType, intensity) {
        const availableGeometries = this.getAvailableTransitions();
        if (availableGeometries.length === 0) return;
        
        let targetGeometry;
        let rule = 'smooth';
        
        switch (interactionType) {
            case 'scroll':
                // Fast scroll triggers dramatic transitions
                targetGeometry = intensity > 0.5 ? 'wave' : 'sphere';
                rule = intensity > 0.7 ? 'dramatic' : 'smooth';
                break;
                
            case 'click':
                // Click triggers quick transitions
                targetGeometry = availableGeometries[Math.floor(Math.random() * availableGeometries.length)];
                rule = 'instant';
                break;
                
            case 'hold':
                // Hold triggers breathing transitions
                targetGeometry = 'crystal'; // Crystal for UI framework
                rule = 'breathing';
                break;
                
            default:
                targetGeometry = availableGeometries[0];
        }
        
        if (availableGeometries.includes(targetGeometry)) {
            this.startTransition(targetGeometry, null, rule);
        }
    }
}

// ===== TRANSITION ENGINE MANAGER =====
class VIB34DTransitionManager {
    constructor() {
        this.transitionEngines = new Map();
        this.globalTransitionRule = 'smooth';
        this.coordinatedTransitions = false; // When true, all sections transition together
    }
    
    registerSection(sectionKey, multiInstanceManager) {
        const engine = new VIB34DTransitionEngine(multiInstanceManager, {
            defaultRule: this.globalTransitionRule
        });
        
        this.transitionEngines.set(sectionKey, engine);
        console.log(`📝 Registered transition engine for ${sectionKey}`);
        
        return engine;
    }
    
    setGlobalTransitionRule(ruleName) {
        this.globalTransitionRule = ruleName;
        this.transitionEngines.forEach(engine => {
            engine.setTransitionRule(ruleName);
        });
        console.log(`🌐 Global transition rule set to: ${ruleName}`);
    }
    
    transitionAllSections(targetGeometryMap, coordinated = false) {
        if (coordinated) {
            // Synchronized start
            Object.entries(targetGeometryMap).forEach(([sectionKey, targetGeometry]) => {
                const engine = this.transitionEngines.get(sectionKey);
                if (engine) {
                    engine.startTransition(targetGeometry);
                }
            });
        } else {
            // Staggered start (wave effect)
            let delay = 0;
            Object.entries(targetGeometryMap).forEach(([sectionKey, targetGeometry]) => {
                setTimeout(() => {
                    const engine = this.transitionEngines.get(sectionKey);
                    if (engine) {
                        engine.startTransition(targetGeometry);
                    }
                }, delay);
                delay += 200; // 200ms stagger
            });
        }
    }
    
    getTransitionStatus() {
        const status = {};
        this.transitionEngines.forEach((engine, sectionKey) => {
            status[sectionKey] = {
                isTransitioning: engine.isTransitioning,
                currentGeometry: engine.currentGeometry,
                targetGeometry: engine.targetGeometry,
                progress: engine.transitionProgress,
                rule: engine.currentRule
            };
        });
        return status;
    }
}

// ===== TRANSITION EDITOR INTERFACE =====
class VIB34DTransitionEditor {
    constructor(transitionManager) {
        this.transitionManager = transitionManager;
        this.createEditorUI();
    }
    
    createEditorUI() {
        // Create floating editor panel
        this.editorPanel = document.createElement('div');
        this.editorPanel.className = 'vib34d-transition-editor';
        this.editorPanel.innerHTML = `
            <div class="editor-header">
                <h3>🎬 VIB34D Transition Editor</h3>
                <button class="toggle-editor">×</button>
            </div>
            <div class="editor-content">
                <div class="rule-selector">
                    <label>Transition Rule:</label>
                    <select class="transition-rule-select">
                        <option value="smooth">Smooth</option>
                        <option value="dramatic">Dramatic</option>
                        <option value="wave">Wave</option>
                        <option value="instant">Instant</option>
                        <option value="breathing">Breathing</option>
                    </select>
                </div>
                <div class="geometry-controls">
                    <label>Quick Transitions:</label>
                    <div class="geometry-buttons">
                        <button data-geometry="hypercube">🔮 Hypercube</button>
                        <button data-geometry="tetrahedron">🔺 Tetrahedron</button>
                        <button data-geometry="sphere">⚪ Sphere</button>
                        <button data-geometry="torus">🍩 Torus</button>
                        <button data-geometry="wave">🌊 Wave</button>
                        <button data-geometry="crystal">💎 Crystal</button>
                    </div>
                </div>
                <div class="transition-status">
                    <label>Status:</label>
                    <div class="status-display"></div>
                </div>
            </div>
        `;
        
        this.editorPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 20px;
            color: white;
            font-family: monospace;
            z-index: 10000;
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(this.editorPanel);
        this.setupEditorEvents();
        
        console.log('🎛️ Transition Editor UI created');
    }
    
    setupEditorEvents() {
        // Rule selector
        const ruleSelect = this.editorPanel.querySelector('.transition-rule-select');
        ruleSelect.addEventListener('change', (e) => {
            this.transitionManager.setGlobalTransitionRule(e.target.value);
        });
        
        // Geometry buttons
        const geometryButtons = this.editorPanel.querySelectorAll('[data-geometry]');
        geometryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetGeometry = e.target.dataset.geometry;
                this.triggerGlobalTransition(targetGeometry);
            });
        });
        
        // Toggle editor
        const toggleButton = this.editorPanel.querySelector('.toggle-editor');
        toggleButton.addEventListener('click', () => {
            this.editorPanel.style.display = this.editorPanel.style.display === 'none' ? 'block' : 'none';
        });
        
        // Update status periodically
        setInterval(() => this.updateStatusDisplay(), 500);
    }
    
    triggerGlobalTransition(targetGeometry) {
        // Create transition map for all sections
        const targetMap = {};
        this.transitionManager.transitionEngines.forEach((engine, sectionKey) => {
            if (engine.canTransitionTo(targetGeometry)) {
                targetMap[sectionKey] = targetGeometry;
            }
        });
        
        this.transitionManager.transitionAllSections(targetMap, false);
    }
    
    updateStatusDisplay() {
        const statusDiv = this.editorPanel.querySelector('.status-display');
        const status = this.transitionManager.getTransitionStatus();
        
        let statusHTML = '';
        Object.entries(status).forEach(([section, data]) => {
            const progressBar = data.isTransitioning ? 
                `<div style="width: ${data.progress * 100}%; height: 4px; background: cyan; margin: 2px 0;"></div>` : '';
            statusHTML += `
                <div style="margin: 5px 0; font-size: 11px;">
                    <strong>${section}:</strong> ${data.currentGeometry}
                    ${data.isTransitioning ? ` → ${data.targetGeometry}` : ''}
                    ${progressBar}
                </div>
            `;
        });
        
        statusDiv.innerHTML = statusHTML;
    }
}

// Export for VIB34D Style System
window.VIB34DTransitionEngine = VIB34DTransitionEngine;
window.VIB34DTransitionManager = VIB34DTransitionManager;
window.VIB34DTransitionEditor = VIB34DTransitionEditor;
console.log('✅ VIB34D Transition Engine loaded - Ready for smooth geometry morphing with editor controls');