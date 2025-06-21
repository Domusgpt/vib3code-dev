/**
 * VIB34D HOME-MASTER CONTROLLER
 * Mathematical parameter derivation system for multi-section coordination
 * 
 * Core concept: Home section controls ALL other sections through fixed
 * mathematical relationships, creating unified design coherence
 */

console.log('🏠 VIB34D Home-Master Controller Loading...');

// ===== HOME-MASTER PARAMETER DERIVATION SYSTEM =====
class VIB34DHomeMaster {
    constructor(options = {}) {
        // Section configuration with mathematical relationships
        this.sectionConfig = {
            home: {
                geometry: 'hypercube',
                modifier: 1.0,          // Base parameters - all others derive from this
                baseParams: {
                    gridDensity: 12.0,
                    morphFactor: 0.5,
                    dimension: 3.5,
                    glitchIntensity: 0.3,
                    rotationSpeed: 0.5
                }
            },
            articles: {
                geometry: 'tetrahedron',
                modifier: 0.8,          // Articles = Home × 0.8
                derivedFromHome: true
            },
            videos: {
                geometry: 'sphere', 
                modifier: 1.2,          // Videos = Home × 1.2
                derivedFromHome: true
            },
            podcasts: {
                geometry: 'torus',
                modifier: 1.1,          // Podcasts = Home × 1.1
                derivedFromHome: true
            },
            ema: {
                geometry: 'wave',
                modifier: 0.9,          // EMA = Home × 0.9
                derivedFromHome: true
            },
            crystal: {
                geometry: 'crystal',
                modifier: 0.7,          // Crystal UI = Home × 0.7 (subtle)
                derivedFromHome: true
            }
        };
        
        // Current master parameters (from home section)
        this.masterParameters = { ...this.sectionConfig.home.baseParams };
        
        // Registered multi-instance managers
        this.registeredSections = new Map();
        
        // Parameter update subscribers
        this.subscribers = new Set();
        
        // Master interaction state for global effects
        this.masterInteractionState = {
            globalIntensity: 0,
            lastGlobalUpdate: Date.now(),
            dominantInteractionType: 'idle'
        };
        
        console.log('🏠 Home-Master Controller initialized with mathematical derivation system');
    }
    
    // ===== SECTION REGISTRATION =====
    registerSection(sectionKey, multiInstanceManager) {
        this.registeredSections.set(sectionKey, multiInstanceManager);
        
        // Apply initial derived parameters
        if (this.sectionConfig[sectionKey]?.derivedFromHome) {
            const derivedParams = this.deriveParametersForSection(sectionKey);
            multiInstanceManager.updateInstanceParameters(derivedParams);
        }
        
        console.log(`📝 Registered section [${sectionKey}] with home-master derivation`);
    }
    
    unregisterSection(sectionKey) {
        this.registeredSections.delete(sectionKey);
        console.log(`📝 Unregistered section [${sectionKey}] from home-master`);
    }
    
    // ===== PARAMETER DERIVATION ENGINE =====
    deriveParametersForSection(sectionKey) {
        const sectionConfig = this.sectionConfig[sectionKey];
        if (!sectionConfig || !sectionConfig.derivedFromHome) {
            return this.masterParameters; // Use master params directly
        }
        
        const modifier = sectionConfig.modifier;
        const derivedParams = {};
        
        // Apply mathematical derivation to each parameter
        Object.entries(this.masterParameters).forEach(([key, value]) => {
            if (typeof value === 'number') {
                derivedParams[key] = value * modifier;
            } else if (Array.isArray(value)) {
                // For arrays (like colors), keep original or apply subtle modifications
                derivedParams[key] = [...value];
            } else {
                derivedParams[key] = value;
            }
        });
        
        return derivedParams;
    }
    
    // ===== MASTER PARAMETER UPDATES =====
    updateMasterParameters(newParams, source = 'manual') {
        // Update master parameters (affects all derived sections)
        Object.assign(this.masterParameters, newParams);
        
        console.log(`🏠 Master parameters updated from ${source}:`, newParams);
        
        // Propagate to all derived sections
        this.propagateToAllSections();
        
        // Notify subscribers
        this.notifySubscribers();
    }
    
    propagateToAllSections() {
        this.registeredSections.forEach((multiInstanceManager, sectionKey) => {
            if (this.sectionConfig[sectionKey]?.derivedFromHome) {
                const derivedParams = this.deriveParametersForSection(sectionKey);
                multiInstanceManager.updateInstanceParameters(derivedParams);
            }
        });
        
        console.log(`📡 Propagated master parameters to ${this.registeredSections.size} sections`);
    }
    
    // ===== INTERACTION INTEGRATION =====
    updateMasterInteraction(interactionData) {
        // Update global interaction state
        this.masterInteractionState = {
            ...this.masterInteractionState,
            ...interactionData,
            lastGlobalUpdate: Date.now()
        };
        
        // Derive interaction-modified parameters
        const interactionModifiedParams = this.applyInteractionToMasterParams(interactionData);
        
        // Propagate interaction effects to all sections
        this.registeredSections.forEach((multiInstanceManager, sectionKey) => {
            let sectionParams;
            
            if (this.sectionConfig[sectionKey]?.derivedFromHome) {
                // Apply section modifier to interaction-modified master params
                const modifier = this.sectionConfig[sectionKey].modifier;
                sectionParams = {};
                Object.entries(interactionModifiedParams).forEach(([key, value]) => {
                    if (typeof value === 'number') {
                        sectionParams[key] = value * modifier;
                    } else {
                        sectionParams[key] = value;
                    }
                });
            } else {
                sectionParams = interactionModifiedParams;
            }
            
            // Update section with interaction-aware parameters
            multiInstanceManager.updateInstanceParameters(sectionParams);
            
            // Also propagate interaction state
            multiInstanceManager.updateInteractionState(interactionData);
        });
    }
    
    applyInteractionToMasterParams(interactionData) {
        const modifiedParams = { ...this.masterParameters };
        
        switch (interactionData.type) {
            case 'scroll':
                const scrollIntensity = Math.min(interactionData.scrollVelocity / 20, 1.0);
                modifiedParams.gridDensity = this.masterParameters.gridDensity * (1.0 + scrollIntensity * 0.5);
                modifiedParams.dimension = this.masterParameters.dimension + scrollIntensity * 0.3;
                break;
                
            case 'hold':
                if (interactionData.isHolding) {
                    const holdDuration = (Date.now() - interactionData.holdStart) / 1000;
                    modifiedParams.morphFactor = Math.min(this.masterParameters.morphFactor + holdDuration * 0.2, 1.0);
                    modifiedParams.dimension = Math.min(this.masterParameters.dimension + holdDuration * 0.1, 4.0);
                }
                break;
                
            case 'click':
                modifiedParams.glitchIntensity = this.masterParameters.glitchIntensity + 0.3;
                break;
                
            case 'idle':
                // Return to base parameters with decay
                Object.keys(modifiedParams).forEach(key => {
                    if (typeof this.masterParameters[key] === 'number') {
                        modifiedParams[key] = this.masterParameters[key] * 0.95 + modifiedParams[key] * 0.05;
                    }
                });
                break;
        }
        
        return modifiedParams;
    }
    
    // ===== GEOMETRY COORDINATION =====
    triggerGeometryTransition(sectionKey, targetGeometry, coordinated = false) {
        if (coordinated) {
            // Coordinated transition - all sections transition together
            this.registeredSections.forEach((multiInstanceManager, key) => {
                if (key !== sectionKey && multiInstanceManager.transitionEngine) {
                    // Get appropriate target geometry for each section
                    const sectionTargetGeometry = this.getSectionAppropriateGeometry(key, targetGeometry);
                    multiInstanceManager.transitionEngine.startTransition(sectionTargetGeometry);
                }
            });
        }
        
        // Start transition for requested section
        const targetSection = this.registeredSections.get(sectionKey);
        if (targetSection && targetSection.transitionEngine) {
            targetSection.transitionEngine.startTransition(targetGeometry);
        }
    }
    
    getSectionAppropriateGeometry(sectionKey, referenceGeometry) {
        // Return geometry that makes sense for each section
        const sectionDefaults = {
            home: 'hypercube',
            articles: 'tetrahedron', 
            videos: 'sphere',
            podcasts: 'torus',
            ema: 'wave',
            crystal: 'crystal'
        };
        
        // For now, return default geometry for section
        // Future: Implement intelligent geometry selection based on reference
        return sectionDefaults[sectionKey] || referenceGeometry;
    }
    
    // ===== SUBSCRIPTION SYSTEM =====
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    
    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback({
                    masterParameters: this.masterParameters,
                    sectionStates: this.getSectionStates(),
                    interactionState: this.masterInteractionState
                });
            } catch (error) {
                console.error('🚨 Error in home-master subscriber:', error);
            }
        });
    }
    
    // ===== STATUS AND DEBUGGING =====
    getSectionStates() {
        const states = {};
        this.registeredSections.forEach((multiInstanceManager, sectionKey) => {
            states[sectionKey] = {
                geometry: multiInstanceManager.geometry,
                instanceCount: multiInstanceManager.instances.size,
                activeInstances: multiInstanceManager.activeInstances.size,
                derivedParameters: this.deriveParametersForSection(sectionKey)
            };
        });
        return states;
    }
    
    getMasterStatus() {
        return {
            masterParameters: this.masterParameters,
            registeredSections: Array.from(this.registeredSections.keys()),
            sectionStates: this.getSectionStates(),
            interactionState: this.masterInteractionState,
            lastUpdate: Date.now()
        };
    }
    
    // ===== PRESET CONFIGURATIONS =====
    loadPreset(presetName) {
        const presets = {
            calm: {
                gridDensity: 8.0,
                morphFactor: 0.3,
                dimension: 3.2,
                glitchIntensity: 0.1,
                rotationSpeed: 0.3
            },
            dynamic: {
                gridDensity: 16.0,
                morphFactor: 0.7,
                dimension: 3.8,
                glitchIntensity: 0.5,
                rotationSpeed: 0.8
            },
            hyperdimensional: {
                gridDensity: 20.0,
                morphFactor: 0.9,
                dimension: 3.95,
                glitchIntensity: 0.7,
                rotationSpeed: 1.0
            },
            editorial: {
                gridDensity: 12.0,
                morphFactor: 0.4,
                dimension: 3.3,
                glitchIntensity: 0.2,
                rotationSpeed: 0.4
            }
        };
        
        if (presets[presetName]) {
            this.updateMasterParameters(presets[presetName], `preset:${presetName}`);
            console.log(`🎨 Loaded preset: ${presetName}`);
        } else {
            console.warn(`⚠️ Unknown preset: ${presetName}`);
        }
    }
    
    // ===== ANIMATION COORDINATION =====
    startGlobalAnimation() {
        // Start animation loop for all registered sections
        this.registeredSections.forEach((multiInstanceManager) => {
            multiInstanceManager.activateInstances();
        });
        console.log('🎬 Started global animation for all sections');
    }
    
    pauseGlobalAnimation() {
        // Pause animation for all registered sections
        this.registeredSections.forEach((multiInstanceManager) => {
            multiInstanceManager.pauseInstances();
        });
        console.log('⏸️ Paused global animation for all sections');
    }
    
    // ===== MATHEMATICAL VALIDATION =====
    validateParameterRange(params) {
        const validRanges = {
            gridDensity: [1.0, 50.0],
            morphFactor: [0.0, 1.0],
            dimension: [3.0, 4.0],
            glitchIntensity: [0.0, 1.0],
            rotationSpeed: [0.0, 2.0]
        };
        
        const clampedParams = {};
        Object.entries(params).forEach(([key, value]) => {
            if (validRanges[key] && typeof value === 'number') {
                const [min, max] = validRanges[key];
                clampedParams[key] = Math.max(min, Math.min(max, value));
                
                if (clampedParams[key] !== value) {
                    console.warn(`⚠️ Parameter ${key} clamped from ${value} to ${clampedParams[key]}`);
                }
            } else {
                clampedParams[key] = value;
            }
        });
        
        return clampedParams;
    }
}

// ===== HOME-MASTER CONTROL PANEL =====
class VIB34DHomeMasterPanel {
    constructor(homeMaster) {
        this.homeMaster = homeMaster;
        this.createControlPanel();
        this.setupEventListeners();
    }
    
    createControlPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'vib34d-home-master-panel';
        this.panel.innerHTML = `
            <div class="panel-header">
                <h3>🏠 Home-Master Control</h3>
                <button class="toggle-panel">−</button>
            </div>
            <div class="panel-content">
                <div class="parameter-controls">
                    <div class="control-group">
                        <label>Grid Density: <span class="value-display">12.0</span></label>
                        <input type="range" class="param-slider" data-param="gridDensity" 
                               min="1" max="50" step="0.1" value="12">
                    </div>
                    <div class="control-group">
                        <label>Morph Factor: <span class="value-display">0.5</span></label>
                        <input type="range" class="param-slider" data-param="morphFactor" 
                               min="0" max="1" step="0.01" value="0.5">
                    </div>
                    <div class="control-group">
                        <label>Dimension: <span class="value-display">3.5</span></label>
                        <input type="range" class="param-slider" data-param="dimension" 
                               min="3" max="4" step="0.01" value="3.5">
                    </div>
                    <div class="control-group">
                        <label>Glitch Intensity: <span class="value-display">0.3</span></label>
                        <input type="range" class="param-slider" data-param="glitchIntensity" 
                               min="0" max="1" step="0.01" value="0.3">
                    </div>
                    <div class="control-group">
                        <label>Rotation Speed: <span class="value-display">0.5</span></label>
                        <input type="range" class="param-slider" data-param="rotationSpeed" 
                               min="0" max="2" step="0.01" value="0.5">
                    </div>
                </div>
                <div class="preset-controls">
                    <label>Presets:</label>
                    <div class="preset-buttons">
                        <button data-preset="calm">Calm</button>
                        <button data-preset="dynamic">Dynamic</button>
                        <button data-preset="hyperdimensional">4D Max</button>
                        <button data-preset="editorial">Editorial</button>
                    </div>
                </div>
                <div class="animation-controls">
                    <button class="start-global">▶ Start All</button>
                    <button class="pause-global">⏸ Pause All</button>
                </div>
                <div class="status-display">
                    <div class="section-status"></div>
                </div>
            </div>
        `;
        
        this.panel.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-family: monospace;
            z-index: 10001;
            max-width: 280px;
            backdrop-filter: blur(10px);
            font-size: 12px;
        `;
        
        document.body.appendChild(this.panel);
        console.log('🎛️ Home-Master Control Panel created');
    }
    
    setupEventListeners() {
        // Parameter sliders
        const sliders = this.panel.querySelectorAll('.param-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const param = e.target.dataset.param;
                const value = parseFloat(e.target.value);
                
                // Update display
                const display = e.target.parentElement.querySelector('.value-display');
                display.textContent = value.toFixed(2);
                
                // Update home-master
                this.homeMaster.updateMasterParameters({
                    [param]: value
                }, 'control-panel');
            });
        });
        
        // Preset buttons
        const presetButtons = this.panel.querySelectorAll('[data-preset]');
        presetButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.homeMaster.loadPreset(preset);
                this.updateSliderValues();
            });
        });
        
        // Animation controls
        this.panel.querySelector('.start-global').addEventListener('click', () => {
            this.homeMaster.startGlobalAnimation();
        });
        
        this.panel.querySelector('.pause-global').addEventListener('click', () => {
            this.homeMaster.pauseGlobalAnimation();
        });
        
        // Panel toggle
        this.panel.querySelector('.toggle-panel').addEventListener('click', () => {
            const content = this.panel.querySelector('.panel-content');
            const toggle = this.panel.querySelector('.toggle-panel');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                toggle.textContent = '−';
            } else {
                content.style.display = 'none';
                toggle.textContent = '+';
            }
        });
        
        // Subscribe to home-master updates
        this.homeMaster.subscribe((data) => {
            this.updateStatusDisplay(data);
        });
        
        // Update status periodically
        setInterval(() => {
            const status = this.homeMaster.getMasterStatus();
            this.updateStatusDisplay(status);
        }, 1000);
    }
    
    updateSliderValues() {
        const params = this.homeMaster.masterParameters;
        const sliders = this.panel.querySelectorAll('.param-slider');
        
        sliders.forEach(slider => {
            const param = slider.dataset.param;
            if (params[param] !== undefined) {
                slider.value = params[param];
                const display = slider.parentElement.querySelector('.value-display');
                display.textContent = params[param].toFixed(2);
            }
        });
    }
    
    updateStatusDisplay(data) {
        const statusDiv = this.panel.querySelector('.section-status');
        let statusHTML = '<strong>Sections:</strong><br>';
        
        Object.entries(data.sectionStates || {}).forEach(([section, state]) => {
            statusHTML += `
                <div style="margin: 2px 0; font-size: 10px;">
                    ${section}: ${state.geometry} (${state.activeInstances}/${state.instanceCount})
                </div>
            `;
        });
        
        statusDiv.innerHTML = statusHTML;
    }
}

// Export for VIB34D Style System
window.VIB34DHomeMaster = VIB34DHomeMaster;
window.VIB34DHomeMasterPanel = VIB34DHomeMasterPanel;
console.log('✅ VIB34D Home-Master Controller loaded - Ready for mathematical parameter derivation');