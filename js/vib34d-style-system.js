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
        
        // New systems
        this.infiniteScroll = null;
        this.crystalUI = null;
        
        // Section management
        this.sections = new Map();
        this.currentSection = 'home';
        this.activeObserver = null;
        
        // PER-SECTION MULTI-INSTANCE MANAGERS
        this.multiInstanceManagers = new Map();
        this.sectionObserver = null;
        
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
            // Step 1: Initialize Home-Master controller
            if (this.options.enableHomeMaster) {
                await this.initializeHomeMaster();
            }
            
            // Step 2: Detect sections and create multi-instance managers
            if (this.options.autoDetectSections) {
                await this.detectSections();
            }
            
            // Step 3: Create multi-instance visualizers per section
            await this.createSectionMultiInstances();
            
            // Step 4: Initialize transition system
            if (this.options.enableTransitions) {
                await this.initializeTransitionSystem();
            }
            
            // Step 5: Setup global interactions
            if (this.options.enableInteractions) {
                await this.setupGlobalInteractions();
            }
            
            // Step 6: Initialize editor interfaces (disabled for clean view)
            if (this.options.enableEditor && this.options.editorMode) {
                await this.initializeEditorInterfaces();
            }
            
            // Step 7: Setup section navigation and viewport detection
            await this.setupSectionNavigation();
            
            // Step 8: Initialize infinite scroll system
            await this.initializeInfiniteScroll();
            
            // Step 9: Initialize Crystal UI Framework
            await this.initializeCrystalUI();
            
            // Step 10: Start render loop
            this.startRenderLoop();
            
            // Step 11: Load default preset and activate visible sections
            if (this.options.defaultPreset && this.homeMaster) {
                this.homeMaster.loadPreset(this.options.defaultPreset);
            }
            await this.activateVisibleSections();
            
            console.log(`✅ VIB34D Style System initialized with ${this.multiInstanceManagers.size} section managers`);
            
        } catch (error) {
            console.error('🚨 VIB34D Style System initialization failed:', error);
        }
    }
    
    // ===== SECTION MULTI-INSTANCE CREATION =====
    async createSectionMultiInstances() {
        // Create multi-instance managers for each detected section
        for (let [sectionKey, sectionData] of this.sections) {
            await this.createMultiInstanceForSection(sectionKey, sectionData);
        }
        
        console.log(`📦 Created multi-instance managers for ${this.multiInstanceManagers.size} sections`);
    }
    
    async createMultiInstanceForSection(sectionKey, sectionData) {
        if (typeof VIB34DMultiInstance === 'undefined') {
            console.error('🚨 VIB34DMultiInstance not loaded');
            return;
        }
        
        const { config } = sectionData;
        
        // Get instance configuration - use configured count or default to standard preset
        const presetName = config.instancePreset || 'standard';
        const instanceConfig = VIB34DInstancePresets ? 
            VIB34DInstancePresets.getPreset(presetName) : null;
        
        // Apply visualizer count override if specified
        if (this.options.visualizerCount && this.options.visualizerCount !== 3) {
            // Dynamically create instance config based on specified count
            const dynamicConfig = this.generateInstanceConfig(this.options.visualizerCount);
            Object.assign(instanceConfig || {}, dynamicConfig);
        }
        
        // Create multi-instance manager for this section
        const multiInstanceManager = new VIB34DMultiInstance(
            sectionData.element,
            sectionKey,
            {
                geometry: config.geometry,
                baseParameters: config.baseParameters,
                instanceConfig: instanceConfig
            }
        );
        
        this.multiInstanceManagers.set(sectionKey, multiInstanceManager);
        
        console.log(`🎭 Created multi-instance manager for [${sectionKey}] with ${multiInstanceManager.instances.size} instances`);
    }
    
    generateInstanceConfig(count) {
        // Generate dynamic instance configuration based on count
        const roles = this.options.visualizerRoles || ['background', 'content', 'accent', 'overlay', 'detail', 'atmosphere'];
        const config = {};
        
        for (let i = 0; i < count; i++) {
            const role = roles[i] || `instance-${i}`;
            const modifier = this.getRoleModifier(role);
            const opacity = this.getRoleOpacity(role);
            
            config[role] = {
                modifier: modifier,
                role: role,
                zIndex: i,
                opacity: opacity,
                position: { top: '0%', left: '0%', width: '100%', height: '100%' }
            };
        }
        
        return config;
    }
    
    getRoleOpacity(role) {
        const opacityMap = {
            background: 1.0,  // Increased for visibility
            content: 0.8,     // Increased for visibility
            accent: 0.9,      // Increased for visibility
            header: 0.7,      // Increased for visibility
            overlay: 0.6      // Increased for visibility
        };
        return opacityMap[role] || 0.8;
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
        
        // Store section data for multi-instance creation
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
        
        console.log(`📍 Detected ${detectedSections.length} sections - ready for multi-instance creation`);
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
        
        // Update home-master parameters for this section
        if (this.homeMaster) {
            const sectionParams = this.homeMaster.deriveParametersForSection(sectionKey);
            this.updateSectionParameters(sectionKey, sectionParams);
        }
        
        console.log(`✅ Section transition complete: [${sectionKey}]`);
    }
    
    updateSectionParameters(sectionKey, parameters) {
        // Update specific section's multi-instance manager
        const multiInstanceManager = this.multiInstanceManagers.get(sectionKey);
        if (multiInstanceManager) {
            multiInstanceManager.updateInstanceParameters(parameters);
        }
    }
    
    updateAllSectionParameters(parameters) {
        // Update all section multi-instance managers with derived parameters
        this.multiInstanceManagers.forEach((manager, sectionKey) => {
            if (this.homeMaster) {
                const derivedParams = this.homeMaster.deriveParametersForSection(sectionKey);
                manager.updateInstanceParameters(derivedParams);
            }
        });
        
        console.log(`📊 Updated parameters for ${this.multiInstanceManagers.size} section managers`);
    }
    
    // ===== SECTION NAVIGATION SETUP =====
    async setupSectionNavigation() {
        // Setup viewport-aware section activation
        if (!window.IntersectionObserver) {
            console.warn('⚠️ IntersectionObserver not supported - activating all sections');
            this.activateAllSections();
            return;
        }
        
        // Transition observer for current section tracking
        this.transitionObserver = new IntersectionObserver((entries) => {
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
        
        // Viewport observer for performance optimization
        this.viewportObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionKey = this.findSectionKeyByElement(entry.target);
                const sectionData = this.sections.get(sectionKey);
                const multiInstanceManager = this.multiInstanceManagers.get(sectionKey);
                
                if (entry.isIntersecting) {
                    // Section entered viewport - activate visualizers
                    if (sectionData && multiInstanceManager) {
                        sectionData.isVisible = true;
                        multiInstanceManager.activateInstances();
                        console.log(`👁️ Section [${sectionKey}] entered viewport - activated`);
                    }
                } else {
                    // Section left viewport - pause visualizers for performance
                    if (sectionData && multiInstanceManager) {
                        sectionData.isVisible = false;
                        multiInstanceManager.pauseInstances();
                        console.log(`👁️ Section [${sectionKey}] left viewport - paused`);
                    }
                }
            });
        }, {
            rootMargin: '100px', // Start loading 100px before entering viewport
            threshold: 0.1 // Trigger when 10% visible
        });
        
        // Observe all sections with both observers
        this.sections.forEach((sectionData) => {
            this.transitionObserver.observe(sectionData.element);
            this.viewportObserver.observe(sectionData.element);
        });
        
        console.log('👀 Section navigation and viewport observers setup complete');
    }
    
    async activateVisibleSections() {
        // Initially activate sections that are in viewport
        this.sections.forEach((sectionData, sectionKey) => {
            const rect = sectionData.element.getBoundingClientRect();
            const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
            
            if (isVisible) {
                sectionData.isVisible = true;
                const multiInstanceManager = this.multiInstanceManagers.get(sectionKey);
                if (multiInstanceManager) {
                    multiInstanceManager.activateInstances();
                    console.log(`🎬 Initially activated section [${sectionKey}]`);
                }
            }
        });
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
    
    // ===== SECTION ACTIVATION MANAGEMENT =====
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
    
    pauseAllSections() {
        this.multiInstanceManagers.forEach((manager, sectionKey) => {
            manager.pauseInstances();
            const sectionData = this.sections.get(sectionKey);
            if (sectionData) {
                sectionData.isVisible = false;
                sectionData.isActive = false;
            }
        });
        console.log(`⏸️ Paused all ${this.multiInstanceManagers.size} section managers`);
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
    
    // ===== INFINITE SCROLL INITIALIZATION =====
    async initializeInfiniteScroll() {
        if (typeof VIB34DInfiniteScroll === 'undefined') {
            console.warn('⚠️ VIB34DInfiniteScroll not loaded - skipping infinite scroll');
            return;
        }
        
        this.infiniteScroll = new VIB34DInfiniteScroll(this);
        console.log('🌊 Infinite scroll system initialized');
    }
    
    // ===== CRYSTAL UI INITIALIZATION =====
    async initializeCrystalUI() {
        if (typeof CrystalUIFramework === 'undefined') {
            console.warn('⚠️ CrystalUIFramework not loaded - skipping crystal UI');
            return;
        }
        
        // Crystal UI now uses single global canvas to conserve contexts
        this.crystalUI = new CrystalUIFramework(this);
        console.log('💎 Crystal UI Framework initialized (single context)');
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
        
        // Send to all active multi-instance managers
        this.multiInstanceManagers.forEach((manager, sectionKey) => {
            const sectionData = this.sections.get(sectionKey);
            if (sectionData && sectionData.isVisible) {
                manager.updateInteractionState(interactionData);
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
            
            // Render all visible multi-instance managers
            this.multiInstanceManagers.forEach((manager, sectionKey) => {
                const sectionData = this.sections.get(sectionKey);
                if (sectionData && sectionData.isVisible && manager.render) {
                    manager.render();
                }
            });
            
            requestAnimationFrame(render);
        };
        
        render();
        console.log('🎬 Multi-instance render loop started');
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
        // Cleanup observers
        if (this.transitionObserver) {
            this.transitionObserver.disconnect();
        }
        if (this.viewportObserver) {
            this.viewportObserver.disconnect();
        }
        
        // Stop render loop
        this.stopRenderLoop();
        
        // Destroy infinite scroll system
        if (this.infiniteScroll) {
            this.infiniteScroll.destroy();
        }
        
        // Destroy crystal UI framework
        if (this.crystalUI) {
            this.crystalUI.destroy();
        }
        
        // Destroy all multi-instance managers
        this.multiInstanceManagers.forEach((manager) => {
            manager.destroy();
        });
        this.multiInstanceManagers.clear();
        
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