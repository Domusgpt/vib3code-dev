/**
 * CRYSTAL UI FRAMEWORK - VIB34D BACKBONE SYSTEM (SIMPLIFIED)
 * Single global crystal overlay to conserve WebGL contexts
 * 
 * Core concept: Crystal geometry as subtle background enhancement
 * - ONE crystal canvas for entire page
 * - Minimal WebGL context usage
 * - Subtle visual unification without overwhelming
 */

console.log('💎 Crystal UI Framework - Simplified System Loading...');

// ===== CRYSTAL UI FRAMEWORK =====
class CrystalUIFramework {
    constructor(styleSystem) {
        this.styleSystem = styleSystem;
        
        // Crystal configuration
        this.config = {
            // ===== UNIVERSAL CRYSTAL SETTINGS =====
            crystalGeometry: 'crystal',
            crystalColor: [0.0, 1.0, 0.5],      // Mint green
            crystalDensity: 18.0,
            crystalMorphFactor: 0.2,
            
            // ===== INTERACTION EFFECTS =====
            hoverIntensity: 1.5,
            clickIntensity: 2.0,
            pulseSpeed: 0.2,
            
            // ===== CRYSTAL UI ELEMENTS =====
            enableCrystalButtons: false,         // DISABLED - too many contexts
            enableCrystalNavigation: false,       // DISABLED - too many contexts
            enableCrystalAccents: false,          // DISABLED - too many contexts
            
            // ===== BACKBONE UNIFICATION =====
            unifyAllSections: true,               // Add crystal layer to sections
            backboneOpacity: 0.15,
            backboneZIndex: -1,
            backboneModifier: 0.5,
            maxCrystalBackbones: 2                // Limit crystal contexts
        };
        
        // Single global crystal canvas
        this.globalCrystalCanvas = null;
        this.globalCrystalRenderer = null;
        this.isInitialized = false;
        
        this.initialize();
    }
    
    async initialize() {
        console.log('💎 Initializing Crystal UI Framework (Limited Contexts)...');
        
        try {
            // Create single global crystal overlay
            if (this.config.unifyAllSections) {
                await this.createGlobalCrystalOverlay();
            }
            
            // Skip individual UI element crystallization to save contexts
            console.log('⚠️ Crystal UI elements disabled to conserve WebGL contexts');
            
            this.isInitialized = true;
            console.log('✅ Crystal UI Framework initialized with minimal contexts');
            
        } catch (error) {
            console.error('🚨 Crystal UI Framework initialization failed:', error);
        }
    }
    
    // ===== GLOBAL CRYSTAL OVERLAY =====
    async createGlobalCrystalOverlay() {
        console.log('🔗 Creating single global crystal overlay...');
        
        // Create one crystal canvas for entire page
        this.globalCrystalCanvas = document.createElement('canvas');
        this.globalCrystalCanvas.id = 'vib34d-crystal-global';
        this.globalCrystalCanvas.className = 'vib34d-crystal-overlay';
        this.globalCrystalCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
            opacity: ${this.config.backboneOpacity};
            mix-blend-mode: screen;
        `;
        
        // Size canvas
        this.globalCrystalCanvas.width = window.innerWidth;
        this.globalCrystalCanvas.height = window.innerHeight;
        
        // Add to body
        document.body.appendChild(this.globalCrystalCanvas);
        
        // Create single crystal renderer
        if (typeof VIB34DCore !== 'undefined') {
            this.globalCrystalRenderer = new VIB34DCore(this.globalCrystalCanvas, {
                instanceId: 'crystal-global',
                geometry: 'crystal',
                role: 'ui-overlay',
                modifier: this.config.backboneModifier
            });
            
            // Start the global crystal
            this.globalCrystalRenderer.start();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                this.globalCrystalCanvas.width = window.innerWidth;
                this.globalCrystalCanvas.height = window.innerHeight;
                if (this.globalCrystalRenderer && this.globalCrystalRenderer.resize) {
                    this.globalCrystalRenderer.resize();
                }
            });
            
            console.log('✅ Global crystal overlay created with 1 WebGL context');
        } else {
            console.warn('⚠️ VIB34DCore not available for crystal overlay');
        }
    }
    
    // Simplified render method for global crystal
    render() {
        if (this.globalCrystalRenderer && this.globalCrystalRenderer.render) {
            this.globalCrystalRenderer.render();
        }
    }
    
    // Update interaction state
    updateInteractionState(interactionData) {
        if (this.globalCrystalRenderer && this.globalCrystalRenderer.updateInteractionState) {
            // Apply subtle interaction to crystal
            const crystalInteraction = {
                ...interactionData,
                intensity: interactionData.intensity * 0.3 // Subtle effect
            };
            this.globalCrystalRenderer.updateInteractionState(crystalInteraction);
        }
    }
    
    destroy() {
        if (this.globalCrystalRenderer) {
            this.globalCrystalRenderer.destroy();
        }
        if (this.globalCrystalCanvas) {
            this.globalCrystalCanvas.remove();
        }
        console.log('🗑️ Crystal UI Framework destroyed');
    }
}

// Export for VIB34D Style System
window.CrystalUIFramework = CrystalUIFramework;
console.log('✅ Crystal UI Framework loaded - Simplified single-context version');