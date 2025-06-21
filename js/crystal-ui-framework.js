/**
 * CRYSTAL UI FRAMEWORK - VIB34D BACKBONE SYSTEM
 * Universal crystal geometry system that unifies all sections
 * 
 * Core concept: Crystal geometry as the connecting tissue
 * - Uniform crystal layer across ALL sections
 * - Interactive crystal UI elements (buttons, navigation, accents)
 * - Subtle backbone that ties different geometries together
 */

console.log('💎 Crystal UI Framework - Backbone System Loading...');

// ===== CRYSTAL UI FRAMEWORK =====
class CrystalUIFramework {
    constructor(styleSystem) {
        this.styleSystem = styleSystem;
        
        // Crystal configuration
        this.config = {
            // ===== UNIVERSAL CRYSTAL SETTINGS =====
            crystalGeometry: 'crystal',           // Always uses crystal geometry
            crystalColor: [0.0, 1.0, 0.5],      // Mint green - universal UI color
            crystalDensity: 18.0,                // Grid density for crystal lattice
            crystalMorphFactor: 0.2,             // Subtle morphing for UI elements
            
            // ===== INTERACTION EFFECTS =====
            hoverIntensity: 1.5,                 // Hover effect multiplier
            clickIntensity: 2.0,                 // Click effect multiplier
            pulseSpeed: 0.2,                     // Gentle pulsing animation
            
            // ===== CRYSTAL UI ELEMENTS =====
            enableCrystalButtons: true,           // Replace HTML buttons
            enableCrystalNavigation: true,        // Crystal navigation elements
            enableCrystalAccents: true,           // Crystal accent decorations
            
            // ===== BACKBONE UNIFICATION =====
            unifyAllSections: true,               // Add crystal layer to ALL sections
            backboneOpacity: 0.15,                // Subtle crystal backbone visibility
            backboneZIndex: -1,                   // Behind other visualizers
            backboneModifier: 0.5                 // Gentle crystal movement
        };
        
        // Crystal UI elements registry
        this.crystalElements = new Map();
        this.backboneLayers = new Map();
        this.isInitialized = false;
        
        this.initialize();
    }
    
    async initialize() {
        console.log('💎 Initializing Crystal UI Framework...');
        
        try {
            // Step 1: Create crystal backbone layers for all sections
            if (this.config.unifyAllSections) {
                await this.createCrystalBackbone();
            }
            
            // Step 2: Convert existing UI elements to crystal
            if (this.config.enableCrystalButtons) {
                await this.crystallizeButtons();
            }
            
            if (this.config.enableCrystalNavigation) {
                await this.crystallizeNavigation();
            }
            
            // Step 3: Add crystal accent decorations
            if (this.config.enableCrystalAccents) {
                await this.addCrystalAccents();
            }
            
            // Step 4: Setup crystal interaction handlers
            await this.setupCrystalInteractions();
            
            this.isInitialized = true;
            console.log('✅ Crystal UI Framework initialized');
            
        } catch (error) {
            console.error('🚨 Crystal UI Framework initialization failed:', error);
        }
    }
    
    // ===== CRYSTAL BACKBONE SYSTEM =====
    async createCrystalBackbone() {
        console.log('🔗 Creating crystal backbone layers...');
        
        // Add crystal backbone to each section
        this.styleSystem.sections.forEach((sectionData, sectionKey) => {
            this.addCrystalBackboneToSection(sectionKey, sectionData);
        });
        
        console.log(`🔗 Crystal backbone added to ${this.backboneLayers.size} sections`);
    }
    
    addCrystalBackboneToSection(sectionKey, sectionData) {
        const multiInstanceManager = this.styleSystem.multiInstanceManagers.get(sectionKey);
        
        if (multiInstanceManager) {
            // Add crystal backbone instance to existing multi-instance manager
            const backboneConfig = {
                modifier: this.config.backboneModifier,
                role: 'crystal-backbone',
                zIndex: this.config.backboneZIndex,
                opacity: this.config.backboneOpacity,
                position: { top: '0%', left: '0%', width: '100%', height: '100%' }
            };
            
            // Create backbone instance with crystal geometry
            multiInstanceManager.addInstance('crystal-backbone', backboneConfig);
            
            // Force crystal geometry for backbone
            const backboneInstance = multiInstanceManager.instances.get('crystal-backbone');
            if (backboneInstance && backboneInstance.visualizer) {
                backboneInstance.visualizer.updateTheme('crystal');
            }
            
            this.backboneLayers.set(sectionKey, backboneInstance);
            
            console.log(`💎 Crystal backbone added to section [${sectionKey}]`);
        }
    }
    
    // ===== CRYSTAL UI ELEMENT CONVERSION =====
    async crystallizeButtons() {
        console.log('🔲 Converting buttons to crystal UI...');
        
        // Find all buttons and CTAs
        const buttons = document.querySelectorAll('button, .btn, .cta-button, a[class*="btn"]');
        
        buttons.forEach((button, index) => {
            this.convertElementToCrystal(button, 'button', index);
        });
        
        console.log(`🔲 Converted ${buttons.length} buttons to crystal UI`);
    }
    
    async crystallizeNavigation() {
        console.log('🧭 Converting navigation to crystal UI...');
        
        // Find navigation elements
        const navElements = document.querySelectorAll('nav a, .nav-item, .navigation a');
        
        navElements.forEach((navItem, index) => {
            this.convertElementToCrystal(navItem, 'navigation', index);
        });
        
        console.log(`🧭 Converted ${navElements.length} navigation elements to crystal UI`);
    }
    
    convertElementToCrystal(element, type, index) {
        // Create crystal visualizer container for this element
        const crystalContainer = document.createElement('div');
        crystalContainer.className = `crystal-ui crystal-${type}`;
        crystalContainer.id = `crystal-${type}-${index}`;
        
        // Position crystal container behind the element
        crystalContainer.style.cssText = `
            position: absolute;
            top: -5px;
            left: -5px;
            width: calc(100% + 10px);
            height: calc(100% + 10px);
            pointer-events: none;
            z-index: -1;
            border-radius: inherit;
            overflow: hidden;
        `;
        
        // Ensure parent has relative positioning
        const parent = element.parentElement;
        if (parent && getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
        }
        
        // Create crystal canvas
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 60;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            opacity: 0.3;
        `;
        
        crystalContainer.appendChild(canvas);
        element.parentElement.insertBefore(crystalContainer, element);
        
        // Create crystal visualizer for this element
        if (typeof VIB34DCore !== 'undefined') {
            const crystalVisualizer = new VIB34DCore(canvas, {
                instanceId: `crystal-${type}-${index}`,
                role: 'crystal-ui',
                modifier: 1.0,
                geometry: 'crystal'
            });
            
            // Store crystal element data
            this.crystalElements.set(element, {
                type: type,
                container: crystalContainer,
                canvas: canvas,
                visualizer: crystalVisualizer,
                isActive: false
            });
            
            // Setup element-specific interactions
            this.setupElementInteractions(element);
        }
    }
    
    setupElementInteractions(element) {
        const crystalData = this.crystalElements.get(element);
        if (!crystalData) return;
        
        // Hover effects
        element.addEventListener('mouseenter', () => {
            this.activateCrystalElement(element, 'hover');
        });
        
        element.addEventListener('mouseleave', () => {
            this.deactivateCrystalElement(element);
        });
        
        // Click effects
        element.addEventListener('click', () => {
            this.triggerCrystalClick(element);
        });
        
        // Focus effects (for keyboard navigation)
        element.addEventListener('focus', () => {
            this.activateCrystalElement(element, 'focus');
        });
        
        element.addEventListener('blur', () => {
            this.deactivateCrystalElement(element);
        });
    }
    
    activateCrystalElement(element, interactionType) {
        const crystalData = this.crystalElements.get(element);
        if (!crystalData || crystalData.isActive) return;
        
        crystalData.isActive = true;
        
        // Start crystal visualizer
        if (crystalData.visualizer) {
            crystalData.visualizer.start();
            
            // Apply interaction effects
            const intensity = interactionType === 'hover' ? this.config.hoverIntensity : 1.0;
            
            crystalData.visualizer.updateInteractionState({
                type: 'crystal_ui_interaction',
                interactionType: interactionType,
                intensity: intensity,
                mouseX: 0.5,
                mouseY: 0.5
            });
        }
        
        // Visual feedback
        crystalData.canvas.style.opacity = interactionType === 'hover' ? '0.6' : '0.4';
        
        console.log(`💎 Crystal element activated: ${crystalData.type} (${interactionType})`);
    }
    
    deactivateCrystalElement(element) {
        const crystalData = this.crystalElements.get(element);
        if (!crystalData || !crystalData.isActive) return;
        
        crystalData.isActive = false;
        
        // Pause crystal visualizer
        if (crystalData.visualizer) {
            crystalData.visualizer.pause();
        }
        
        // Reset visual state
        crystalData.canvas.style.opacity = '0.3';
        
        console.log(`💎 Crystal element deactivated: ${crystalData.type}`);
    }
    
    triggerCrystalClick(element) {
        const crystalData = this.crystalElements.get(element);
        if (!crystalData) return;
        
        // Temporary intense crystal effect on click
        if (crystalData.visualizer) {
            crystalData.visualizer.updateInteractionState({
                type: 'crystal_click',
                intensity: this.config.clickIntensity,
                mouseX: 0.5,
                mouseY: 0.5
            });
        }
        
        // Visual flash effect
        crystalData.canvas.style.opacity = '0.9';
        
        setTimeout(() => {
            crystalData.canvas.style.opacity = crystalData.isActive ? '0.6' : '0.3';
        }, 200);
        
        console.log(`💎 Crystal click effect: ${crystalData.type}`);
    }
    
    // ===== CRYSTAL ACCENT DECORATIONS =====
    async addCrystalAccents() {
        console.log('✨ Adding crystal accent decorations...');
        
        // Add crystal accents to specific areas
        this.addCrystalToHeaders();
        this.addCrystalToCards();
        this.addCrystalToFooter();
        
        console.log('✨ Crystal accent decorations added');
    }
    
    addCrystalToHeaders() {
        const headers = document.querySelectorAll('h1, h2, h3, .section-title');
        
        headers.forEach((header, index) => {
            this.addCrystalAccent(header, 'header-accent', index);
        });
    }
    
    addCrystalToCards() {
        const cards = document.querySelectorAll('.content-card, .feature-card, .card');
        
        cards.forEach((card, index) => {
            this.addCrystalAccent(card, 'card-accent', index);
        });
    }
    
    addCrystalToFooter() {
        const footer = document.querySelector('.footer, footer');
        
        if (footer) {
            this.addCrystalAccent(footer, 'footer-accent', 0);
        }
    }
    
    addCrystalAccent(element, accentType, index) {
        // Create subtle crystal accent decoration
        const accentContainer = document.createElement('div');
        accentContainer.className = `crystal-accent crystal-${accentType}`;
        accentContainer.id = `crystal-accent-${accentType}-${index}`;
        
        accentContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.1;
        `;
        
        // Ensure parent positioning
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        // Create crystal canvas for accent
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
        `;
        
        accentContainer.appendChild(canvas);
        element.appendChild(accentContainer);
        
        // Create crystal visualizer for accent
        if (typeof VIB34DCore !== 'undefined') {
            const accentVisualizer = new VIB34DCore(canvas, {
                instanceId: `crystal-accent-${accentType}-${index}`,
                role: 'crystal-accent',
                modifier: 0.3,  // Very subtle movement
                geometry: 'crystal'
            });
            
            // Start accent (always active, very subtle)
            accentVisualizer.start();
            
            this.crystalElements.set(element, {
                type: accentType,
                container: accentContainer,
                canvas: canvas,
                visualizer: accentVisualizer,
                isActive: true,
                isAccent: true
            });
        }
    }
    
    // ===== CRYSTAL INTERACTION SYSTEM =====
    async setupCrystalInteractions() {
        console.log('🎯 Setting up crystal interaction system...');
        
        // Global crystal pulse effect
        setInterval(() => {
            this.triggerGlobalCrystalPulse();
        }, 5000);
        
        // Crystal backbone synchronization
        setInterval(() => {
            this.synchronizeCrystalBackbone();
        }, 1000);
        
        console.log('🎯 Crystal interaction system active');
    }
    
    triggerGlobalCrystalPulse() {
        // Gentle pulse effect across all crystal elements
        this.crystalElements.forEach((crystalData, element) => {
            if (crystalData.visualizer && crystalData.isActive) {
                crystalData.visualizer.updateInteractionState({
                    type: 'crystal_pulse',
                    intensity: 0.3,
                    pulseSpeed: this.config.pulseSpeed
                });
            }
        });
        
        // Pulse backbone layers
        this.backboneLayers.forEach((backboneInstance, sectionKey) => {
            if (backboneInstance && backboneInstance.visualizer) {
                backboneInstance.visualizer.updateInteractionState({
                    type: 'backbone_pulse',
                    intensity: 0.2
                });
            }
        });
    }
    
    synchronizeCrystalBackbone() {
        // Ensure all crystal backbone layers are synchronized
        const currentSection = this.styleSystem.currentSection;
        
        this.backboneLayers.forEach((backboneInstance, sectionKey) => {
            if (backboneInstance && backboneInstance.visualizer) {
                // Slightly increase intensity for current section's backbone
                const intensity = sectionKey === currentSection ? 0.3 : 0.1;
                
                backboneInstance.visualizer.updateInteractionState({
                    type: 'backbone_sync',
                    intensity: intensity,
                    currentSection: currentSection
                });
            }
        });
    }
    
    // ===== PUBLIC API =====
    
    enableCrystalUI() {
        this.config.enableCrystalButtons = true;
        this.config.enableCrystalNavigation = true;
        this.config.enableCrystalAccents = true;
        
        if (!this.isInitialized) {
            this.initialize();
        }
        
        console.log('💎 Crystal UI enabled');
    }
    
    disableCrystalUI() {
        this.config.enableCrystalButtons = false;
        this.config.enableCrystalNavigation = false;
        this.config.enableCrystalAccents = false;
        
        // Pause all crystal elements
        this.crystalElements.forEach((crystalData) => {
            if (crystalData.visualizer) {
                crystalData.visualizer.pause();
            }
        });
        
        console.log('💎 Crystal UI disabled');
    }
    
    setCrystalConfig(newConfig) {
        Object.assign(this.config, newConfig);
        console.log('🔧 Crystal configuration updated');
    }
    
    getCrystalElementCount() {
        return this.crystalElements.size;
    }
    
    getBackboneLayerCount() {
        return this.backboneLayers.size;
    }
    
    destroy() {
        // Cleanup all crystal elements
        this.crystalElements.forEach((crystalData, element) => {
            if (crystalData.visualizer) {
                crystalData.visualizer.destroy();
            }
            if (crystalData.container) {
                crystalData.container.remove();
            }
        });
        
        // Cleanup backbone layers
        this.backboneLayers.forEach((backboneInstance) => {
            if (backboneInstance && backboneInstance.visualizer) {
                backboneInstance.visualizer.destroy();
            }
        });
        
        this.crystalElements.clear();
        this.backboneLayers.clear();
        
        console.log('🗑️ Crystal UI Framework destroyed');
    }
}

// Export for VIB34D Style System
window.CrystalUIFramework = CrystalUIFramework;
console.log('✅ Crystal UI Framework - Backbone System loaded');