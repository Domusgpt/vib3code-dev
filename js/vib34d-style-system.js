/**
 * VIB34D STYLE SYSTEM - MAIN INTEGRATION
 * Brings together all components for the complete multi-visualizer framework
 * 
 * Architecture:
 * - VIB34DCore: 4D polytopal visualizer engine
 * - VIB34DMultiInstance: Multiple visualizers per section  
 * - VIB34DHomeMaster: Mathematical parameter derivation
 * - VIB34DTransitionEngine: Geometry morphing with editor controls
 * - VIB34DStyleSystem: Main orchestration and integration
 */

console.log('🌌 VIB34D Style System - Main Integration Loading...');

// ===== MAIN VIB34D STYLE SYSTEM =====
class VIB34DStyleSystem {
    constructor(options = {}) {
        this.options = {
            autoDetectSections: true,
            enableTransitions: true,
            enableHomeMaster: true,
            enableEditor: true,
            enableInteractions: true,
            defaultPreset: 'editorial',
            
            // CONFIGURABLE VISUALIZER COUNT
            visualizerCount: 3,  // Total number of visualizers (easy to adjust!)
            visualizerRoles: ['background', 'content', 'accent'], // Roles for each visualizer
            defaultGeometry: 'hypercube',
            
            ...options
        };
        
        // Core components
        this.homeMaster = null;
        this.transitionManager = null;
        this.transitionEditor = null;
        this.homeMasterPanel = null;
        
        // Section management
        this.sections = new Map();
        this.currentSection = 'home';
        this.activeObserver = null;
        
        // GLOBAL VISUALIZER POOL (not per-section!)
        this.globalVisualizers = [];
        this.visualizerContainer = null;
        
        // Global interaction state
        this.globalInteractionState = {
            isScrolling: false,
            lastScrollTime: 0,
            scrollVelocity: 0,
            mousePosition: { x: 0.5, y: 0.5 },
            isHolding: false,
            holdStart: 0,
            lastActivity: Date.now()
        };
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🚀 Initializing VIB34D Style System...');
        
        try {
            // Step 1: Create global visualizer container
            await this.createGlobalVisualizerContainer();
            
            // Step 2: Create global visualizer pool
            await this.createGlobalVisualizerPool();
            
            // Step 3: Initialize Home-Master controller
            if (this.options.enableHomeMaster) {
                await this.initializeHomeMaster();
            }
            
            // Step 4: Detect sections (but don't create visualizers per section!)
            if (this.options.autoDetectSections) {
                await this.detectSections();
            }
            
            // Step 5: Initialize transition system
            if (this.options.enableTransitions) {
                await this.initializeTransitionSystem();
            }
            
            // Step 6: Setup global interactions
            if (this.options.enableInteractions) {
                await this.setupGlobalInteractions();
            }
            
            // Step 7: Initialize editor interfaces
            if (this.options.enableEditor) {
                await this.initializeEditorInterfaces();
            }
            
            // Step 8: Setup section navigation
            await this.setupSectionNavigation();
            
            // Step 9: Start visualizers and render loop
            this.startGlobalVisualizers();
            this.startRenderLoop();
            
            // Step 10: Load default preset and set initial section
            if (this.options.defaultPreset && this.homeMaster) {
                this.homeMaster.loadPreset(this.options.defaultPreset);
            }
            await this.transitionToSection('home');
            
            console.log(`✅ VIB34D Style System initialized with ${this.globalVisualizers.length} global visualizers`);
            
        } catch (error) {
            console.error('🚨 VIB34D Style System initialization failed:', error);
        }
    }
    
    // ===== GLOBAL VISUALIZER POOL CREATION =====
    async createGlobalVisualizerContainer() {
        // Create single container for all visualizers
        this.visualizerContainer = document.createElement('div');
        this.visualizerContainer.className = 'vib34d-global-container';
        this.visualizerContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        document.body.insertBefore(this.visualizerContainer, document.body.firstChild);
        console.log('📦 Global visualizer container created');
    }
    
    async createGlobalVisualizerPool() {
        const { visualizerCount, visualizerRoles, defaultGeometry } = this.options;
        
        for (let i = 0; i < visualizerCount; i++) {
            const role = visualizerRoles[i] || `visualizer-${i}`;
            
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.className = `vib34d-global vib34d-${role}`;
            canvas.id = `vib34d-global-${i}`;
            
            // Position canvas
            canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: ${i};
                opacity: ${this.getRoleOpacity(role)};
                pointer-events: none;
                mix-blend-mode: screen;
            `;
            
            // Size canvas
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            this.visualizerContainer.appendChild(canvas);
            
            // Create VIB34D Core instance
            const visualizer = new VIB34DCore(canvas, {
                instanceId: `global-${role}`,
                role: role,
                modifier: this.getRoleModifier(role),
                geometry: defaultGeometry
            });
            
            this.globalVisualizers.push({
                canvas: canvas,
                visualizer: visualizer,
                role: role,
                isActive: false
            });
            
            console.log(`🎨 Created global visualizer [${role}] with modifier: ${this.getRoleModifier(role)}`);
        }
    }
    
    getRoleOpacity(role) {
        const opacityMap = {
            background: 0.8,
            content: 0.4,
            accent: 0.6,
            header: 0.5,
            overlay: 0.3
        };
        return opacityMap[role] || 0.5;
    }
    
    getRoleModifier(role) {
        const modifierMap = {
            background: 0.7,
            content: 1.0,
            accent: 1.3,
            header: 0.9,
            overlay: 1.1
        };
        return modifierMap[role] || 1.0;
    }

    // ===== HOME-MASTER INITIALIZATION =====
    async initializeHomeMaster() {
        if (typeof VIB34DHomeMaster === 'undefined') {
            console.error('🚨 VIB34DHomeMaster not loaded');
            return;
        }
        
        this.homeMaster = new VIB34DHomeMaster();
        console.log('🏠 Home-Master controller initialized');
    }
    
    // ===== SECTION DETECTION (NO VISUALIZER CREATION!) =====
    async detectSections() {
        // Detect sections with data-vib34d attributes or common patterns
        const sectionSelectors = [
            '[data-vib34d]',
            '[data-geometry]',
            '.vib34d-section',
            'section',
            '.section',
            'main',
            'article'
        ];
        
        const detectedSections = [];
        sectionSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!detectedSections.includes(el)) {
                    detectedSections.push(el);
                }
            });
        });
        
        // Store section data (NO visualizer creation!)
        for (let i = 0; i < detectedSections.length; i++) {
            const section = detectedSections[i];
            const sectionConfig = this.determineSectionConfig(section, i);
            
            this.sections.set(sectionConfig.key, {
                element: section,
                config: sectionConfig,
                isVisible: false,
                isActive: false
            });
            
            console.log(`📍 Detected section [${sectionConfig.key}] with geometry: ${sectionConfig.geometry}`);
        }
        
        console.log(`📍 Detected ${detectedSections.length} sections (no visualizers created per section)`);
    }
    
    // ===== SECTION TRANSITION SYSTEM =====
    async transitionToSection(sectionKey) {
        const section = this.sections.get(sectionKey);
        if (!section) {
            console.warn(`⚠️ Section [${sectionKey}] not found`);
            return;
        }
        
        const previousSection = this.currentSection;
        this.currentSection = sectionKey;
        const targetGeometry = section.config.geometry;
        
        console.log(`🔄 Transitioning from [${previousSection}] to [${sectionKey}] (${targetGeometry})`);
        
        // Transition all global visualizers to new geometry
        await this.transitionGlobalVisualizers(targetGeometry);
        
        // Update home-master parameters for this section
        if (this.homeMaster) {
            const sectionParams = this.homeMaster.deriveParametersForSection(sectionKey);
            this.updateGlobalVisualizerParameters(sectionParams);
        }
        
        console.log(`✅ Section transition complete: [${sectionKey}]`);
    }
    
    async transitionGlobalVisualizers(targetGeometry) {
        // Transition all global visualizers to the new geometry
        this.globalVisualizers.forEach((viz, index) => {
            if (viz.visualizer && viz.visualizer.updateTheme) {
                viz.visualizer.updateTheme(targetGeometry);
                console.log(`🎨 Global visualizer [${viz.role}] transitioned to ${targetGeometry}`);
            }
        });
    }
    
    updateGlobalVisualizerParameters(parameters) {
        // Update all global visualizers with new parameters
        this.globalVisualizers.forEach((viz) => {
            if (viz.visualizer && viz.visualizer.updateTheme) {
                viz.visualizer.updateTheme(viz.visualizer.currentTheme, parameters);
            }
        });
        
        console.log(`📊 Updated ${this.globalVisualizers.length} global visualizers with new parameters`);
    }
    
    // ===== SECTION NAVIGATION SETUP =====
    async setupSectionNavigation() {
        // Setup scroll-based section detection
        if (!window.IntersectionObserver) {
            console.warn('⚠️ IntersectionObserver not supported');
            return;
        }
        
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionKey = this.findSectionKeyByElement(entry.target);
                    if (sectionKey && sectionKey !== this.currentSection) {
                        this.transitionToSection(sectionKey);
                    }
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.5 // Trigger when 50% of section is visible
        });
        
        // Observe all sections
        this.sections.forEach((sectionData) => {
            this.sectionObserver.observe(sectionData.element);
        });
        
        console.log('👀 Section navigation observer setup complete');
    }
    
    determineSectionConfig(element, index) {
        // Check for explicit configuration
        const explicitGeometry = element.dataset.geometry || element.dataset.vib34d;
        const explicitKey = element.dataset.sectionKey || element.id;
        
        // Section mapping based on common patterns
        const defaultSectionMapping = [
            { key: 'home', geometry: 'hypercube', selector: '.hero, .header, [data-section="home"]' },
            { key: 'articles', geometry: 'tetrahedron', selector: '.articles, .blog, [data-section="articles"]' },
            { key: 'videos', geometry: 'sphere', selector: '.videos, .media, [data-section="videos"]' },
            { key: 'podcasts', geometry: 'torus', selector: '.podcasts, .audio, [data-section="podcasts"]' },
            { key: 'ema', geometry: 'wave', selector: '.ema, .philosophy, [data-section="ema"]' },
            { key: 'crystal', geometry: 'crystal', selector: '.ui, .controls, [data-section="crystal"]' }
        ];
        
        // Determine section key and geometry
        let sectionKey, geometry;
        
        if (explicitKey && explicitGeometry) {
            sectionKey = explicitKey;
            geometry = explicitGeometry;
        } else {
            // Try to match against default mapping
            const matched = defaultSectionMapping.find(mapping => 
                element.matches(mapping.selector)
            );
            
            if (matched) {
                sectionKey = matched.key;
                geometry = matched.geometry;
            } else {
                // Fallback based on position
                const fallbackMapping = ['home', 'articles', 'videos', 'podcasts', 'ema', 'crystal'];
                sectionKey = fallbackMapping[index % fallbackMapping.length] || `section-${index}`;
                geometry = defaultSectionMapping[index % defaultSectionMapping.length]?.geometry || 'hypercube';
            }
        }
        
        // Get instance configuration (check for preset or use default)
        const presetName = element.dataset.preset || 'standard';
        const instanceConfig = VIB34DInstancePresets ? 
            VIB34DInstancePresets.getPreset(presetName) : null;
        
        return {
            key: sectionKey,
            geometry: geometry,
            baseParameters: null, // Will be derived from home-master
            instanceConfig: instanceConfig
        };
    }
    
    // ===== GLOBAL VISUALIZER ACTIVATION =====
    startGlobalVisualizers() {
        this.globalVisualizers.forEach((viz) => {
            if (viz.visualizer) {
                viz.visualizer.start();
                viz.isActive = true;
            }
        });
        console.log(`🎬 Started ${this.globalVisualizers.length} global visualizers`);
    }
    
    pauseGlobalVisualizers() {
        this.globalVisualizers.forEach((viz) => {
            if (viz.visualizer) {
                viz.visualizer.pause();
                viz.isActive = false;
            }
        });
        console.log(`⏸️ Paused ${this.globalVisualizers.length} global visualizers`);
    }
    
    // ===== TRANSITION SYSTEM INITIALIZATION =====
    async initializeTransitionSystem() {
        if (typeof VIB34DTransitionManager === 'undefined') {
            console.error('🚨 VIB34DTransitionManager not loaded');
            return;
        }
        
        this.transitionManager = new VIB34DTransitionManager();
        console.log('🎬 Transition system initialized for global visualizers');
    }
    
    // ===== GLOBAL INTERACTION SETUP =====
    async setupGlobalInteractions() {
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            this.globalInteractionState.mousePosition = {
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight
            };
            this.globalInteractionState.lastActivity = Date.now();
            
            this.propagateInteraction({
                type: 'mouse',
                mouseX: this.globalInteractionState.mousePosition.x,
                mouseY: this.globalInteractionState.mousePosition.y,
                intensity: 0.2
            });
        });
        
        // Scroll velocity tracking
        let lastScrollY = window.scrollY;
        let lastScrollTime = Date.now();
        
        document.addEventListener('scroll', () => {
            const now = Date.now();
            const deltaY = window.scrollY - lastScrollY;
            const deltaTime = now - lastScrollTime;
            
            if (deltaTime > 0) {
                this.globalInteractionState.scrollVelocity = Math.abs(deltaY / deltaTime * 100);
                this.globalInteractionState.isScrolling = true;
                this.globalInteractionState.lastScrollTime = now;
                this.globalInteractionState.lastActivity = now;
                
                this.propagateInteraction({
                    type: 'scroll',
                    scrollVelocity: this.globalInteractionState.scrollVelocity,
                    intensity: Math.min(this.globalInteractionState.scrollVelocity / 20, 1.0)
                });
                
                // Clear scrolling flag after delay
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    this.globalInteractionState.isScrolling = false;
                    this.globalInteractionState.scrollVelocity = 0;
                }, 100);
            }
            
            lastScrollY = window.scrollY;
            lastScrollTime = now;
        });
        
        // Click interactions
        document.addEventListener('click', (e) => {
            this.globalInteractionState.lastActivity = Date.now();
            
            this.propagateInteraction({
                type: 'click',
                clickX: e.clientX / window.innerWidth,
                clickY: e.clientY / window.innerHeight,
                intensity: 0.8
            });
        });
        
        // Hold interactions (mouse down/up)
        document.addEventListener('mousedown', (e) => {
            this.globalInteractionState.isHolding = true;
            this.globalInteractionState.holdStart = Date.now();
            this.globalInteractionState.lastActivity = Date.now();
        });
        
        document.addEventListener('mouseup', () => {
            this.globalInteractionState.isHolding = false;
            this.globalInteractionState.holdStart = 0;
        });
        
        // Keyboard interactions
        document.addEventListener('keydown', (e) => {
            this.globalInteractionState.lastActivity = Date.now();
            
            if (e.code === 'Space') {
                e.preventDefault();
                this.propagateInteraction({
                    type: 'keyboard',
                    key: 'space',
                    intensity: 0.6
                });
            }
        });
        
        // Idle detection
        setInterval(() => {
            const timeSinceActivity = Date.now() - this.globalInteractionState.lastActivity;
            
            if (timeSinceActivity > 3000) { // 3 seconds
                this.propagateInteraction({
                    type: 'idle',
                    timeSinceActivity: timeSinceActivity,
                    intensity: 0
                });
            }
        }, 1000);
        
        console.log('🎯 Global interaction system initialized');
    }
    
    propagateInteraction(interactionData) {
        // Send to home-master for global coordination
        if (this.homeMaster) {
            this.homeMaster.updateMasterInteraction(interactionData);
        }
        
        // Send directly to all global visualizers
        this.globalVisualizers.forEach((viz) => {
            if (viz.isActive && viz.visualizer && viz.visualizer.updateInteractionState) {
                viz.visualizer.updateInteractionState(interactionData);
            }
        });
    }
    
    // ===== EDITOR INTERFACE INITIALIZATION =====
    async initializeEditorInterfaces() {
        // Initialize transition editor
        if (this.transitionManager && typeof VIB34DTransitionEditor !== 'undefined') {
            this.transitionEditor = new VIB34DTransitionEditor(this.transitionManager);
            console.log('🎛️ Transition editor initialized');
        }
        
        // Initialize home-master panel
        if (this.homeMaster && typeof VIB34DHomeMasterPanel !== 'undefined') {
            this.homeMasterPanel = new VIB34DHomeMasterPanel(this.homeMaster);
            console.log('🎛️ Home-master control panel initialized');
        }
    }
    
    // ===== RENDER LOOP =====
    startRenderLoop() {
        if (this.renderLoopActive) return;
        
        this.renderLoopActive = true;
        
        const render = () => {
            if (!this.renderLoopActive) return;
            
            // Render all active global visualizers
            this.globalVisualizers.forEach((viz) => {
                if (viz.isActive && viz.visualizer && viz.visualizer.render) {
                    viz.visualizer.render();
                }
            });
            
            requestAnimationFrame(render);
        };
        
        render();
        console.log('🎬 Global render loop started');
    }
    
    stopRenderLoop() {
        this.renderLoopActive = false;
        console.log('⏸️ Global render loop stopped');
    }
    
    findSectionKeyByElement(element) {
        for (let [key, sectionData] of this.sections) {
            if (sectionData.element === element) {
                return key;
            }
        }
        return null;
    }
    
    activateAllSections() {
        // Fallback: activate all sections when IntersectionObserver not available
        this.sections.forEach((sectionData, sectionKey) => {
            sectionData.isVisible = true;
            sectionData.isActive = true;
            
            const multiInstanceManager = this.multiInstanceManagers.get(sectionKey);
            if (multiInstanceManager) {
                multiInstanceManager.activateInstances();
            }
        });
        console.log('🎬 All sections activated (fallback mode)');
    }
    
    // ===== PUBLIC API METHODS =====
    
    // Section control
    activateSection(sectionKey) {
        const multiInstanceManager = this.multiInstanceManagers.get(sectionKey);
        if (multiInstanceManager) {
            multiInstanceManager.activateInstances();
            this.sections.get(sectionKey).isActive = true;
            console.log(`🎬 Manually activated section [${sectionKey}]`);
        }
    }
    
    pauseSection(sectionKey) {
        const multiInstanceManager = this.multiInstanceManagers.get(sectionKey);
        if (multiInstanceManager) {
            multiInstanceManager.pauseInstances();
            this.sections.get(sectionKey).isActive = false;
            console.log(`⏸️ Manually paused section [${sectionKey}]`);
        }
    }
    
    // Transition control
    transitionSection(sectionKey, targetGeometry, transitionRule = null) {
        const multiInstanceManager = this.multiInstanceManagers.get(sectionKey);
        if (multiInstanceManager && multiInstanceManager.transitionEngine) {
            return multiInstanceManager.transitionEngine.startTransition(targetGeometry, null, transitionRule);
        }
        return false;
    }
    
    transitionAllSections(targetGeometryMap, coordinated = false) {
        if (this.transitionManager) {
            this.transitionManager.transitionAllSections(targetGeometryMap, coordinated);
        }
    }
    
    // Parameter control
    updateMasterParameters(newParams) {
        if (this.homeMaster) {
            this.homeMaster.updateMasterParameters(newParams, 'api');
        }
    }
    
    loadPreset(presetName) {
        if (this.homeMaster) {
            this.homeMaster.loadPreset(presetName);
        }
    }
    
    // Status and debugging
    getSystemStatus() {
        return {
            sections: Array.from(this.sections.keys()),
            activeSections: Array.from(this.sections.entries())
                .filter(([key, data]) => data.isActive)
                .map(([key, data]) => key),
            homeMasterStatus: this.homeMaster ? this.homeMaster.getMasterStatus() : null,
            transitionStatus: this.transitionManager ? this.transitionManager.getTransitionStatus() : null,
            globalInteractionState: this.globalInteractionState
        };
    }
    
    // Cleanup
    destroy() {
        // Cleanup viewport observer
        if (this.activeObserver) {
            this.activeObserver.disconnect();
        }
        
        // Destroy all multi-instance managers
        this.multiInstanceManagers.forEach((manager) => {
            manager.destroy();
        });
        
        // Remove editor interfaces
        if (this.transitionEditor && this.transitionEditor.editorPanel) {
            this.transitionEditor.editorPanel.remove();
        }
        if (this.homeMasterPanel && this.homeMasterPanel.panel) {
            this.homeMasterPanel.panel.remove();
        }
        
        console.log('🗑️ VIB34D Style System destroyed and cleaned up');
    }
}

// ===== AUTO-INITIALIZATION =====
let globalVIB34DStyleSystem = null;

function initializeVIB34DStyleSystem(options = {}) {
    if (globalVIB34DStyleSystem) {
        console.warn('⚠️ VIB34D Style System already initialized');
        return globalVIB34DStyleSystem;
    }
    
    globalVIB34DStyleSystem = new VIB34DStyleSystem(options);
    return globalVIB34DStyleSystem;
}

// Auto-initialize when DOM is ready with configurable options
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            // Check for global config
            const config = window.VIB34DConfig || {};
            initializeVIB34DStyleSystem(config);
        }, 100);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        const config = window.VIB34DConfig || {};
        initializeVIB34DStyleSystem(config);
    }, 100);
}

// Export for global access
window.VIB34DStyleSystem = VIB34DStyleSystem;
window.initializeVIB34DStyleSystem = initializeVIB34DStyleSystem;
window.getVIB34DStyleSystem = () => globalVIB34DStyleSystem;

console.log('✅ VIB34D Style System - Main Integration loaded - Auto-initialization enabled');