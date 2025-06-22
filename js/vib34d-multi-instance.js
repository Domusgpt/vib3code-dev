/**
 * VIB34D MULTI-INSTANCE MANAGER
 * Handles multiple visualizer instances per section with flexible UI assignment
 * 
 * Core concept: Each section has multiple full visualizer instances
 * that can be assigned to different UI roles (header, content, background, etc.)
 * with mathematical parameter variations maintaining relational coherence
 */

console.log('🎭 VIB34D Multi-Instance Manager Loading...');

// ===== MULTI-INSTANCE MANAGER =====
class VIB34DMultiInstance {
    constructor(sectionElement, sectionKey, options = {}) {
        this.sectionElement = sectionElement;
        this.sectionKey = sectionKey;
        this.geometry = options.geometry || 'hypercube';
        this.baseParameters = options.baseParameters || {};
        
        // CANVAS CONSOLIDATION: Single canvas, multiple geometry variations
        this.canvas = null;
        this.gl = null;
        this.renderer = null;
        
        // Geometry variations to render on single canvas
        this.geometryVariations = [];
        
        // Instance configuration templates
        this.instanceTemplates = {
            // Standard 3-instance setup rendered as geometry variations
            'background': { 
                modifier: 0.7, 
                role: 'background',
                opacity: 0.8,
                blend: 'add'
            },
            'content': { 
                modifier: 1.0, 
                role: 'content',
                opacity: 0.6,
                blend: 'screen'
            },
            'accent': { 
                modifier: 1.3, 
                role: 'accent',
                opacity: 0.4,
                blend: 'add'
            }
        };
        
        // Custom instance configurations can be passed in
        if (options.instanceConfig) {
            this.instanceTemplates = { ...this.instanceTemplates, ...options.instanceConfig };
        }
        
        this.setupConsolidatedCanvas();
        this.initializeRenderer();
        this.createGeometryVariations();
        
        console.log(`🎭 MultiInstance [${this.sectionKey}] created with ${this.geometryVariations.length} variations on 1 canvas`);
    }
    
    setupConsolidatedCanvas() {
        // Ensure section has relative positioning
        this.sectionElement.style.position = 'relative';
        this.sectionElement.style.overflow = 'hidden';
        
        // Create SINGLE canvas for all geometry variations
        this.canvas = document.createElement('canvas');
        this.canvas.className = `vib34d-canvas vib34d-${this.sectionKey}`;
        this.canvas.id = `vib34d-canvas-${this.sectionKey}`;
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Size canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Insert at beginning
        this.sectionElement.insertBefore(this.canvas, this.sectionElement.firstChild);
        
        console.log(`📦 Consolidated canvas created for ${this.sectionKey}`);
    }
    
    initializeRenderer() {
        // Create single VIB34D renderer for consolidated canvas
        this.renderer = new VIB34DCore(this.canvas, {
            instanceId: `${this.sectionKey}-consolidated`,
            geometry: this.geometry,
            multiGeometry: true // Enable multi-geometry rendering
        });
        
        this.gl = this.renderer.gl;
        console.log(`🎨 Initialized consolidated renderer for ${this.sectionKey}`);
    }
    
    createGeometryVariations() {
        // Convert instance templates to geometry variations
        Object.entries(this.instanceTemplates).forEach(([variantKey, config]) => {
            this.geometryVariations.push({
                key: variantKey,
                modifier: config.modifier,
                role: config.role,
                opacity: config.opacity,
                blend: config.blend,
                active: true
            });
        });
        
        // Pass variations to renderer
        if (this.renderer && this.renderer.setGeometryVariations) {
            this.renderer.setGeometryVariations(this.geometryVariations);
        }
    }
    
    addGeometryVariation(variantKey, config) {
        // Add new geometry variation to existing canvas
        const variation = {
            key: variantKey,
            modifier: config.modifier || 1.0,
            role: config.role || 'custom',
            opacity: config.opacity || 0.5,
            blend: config.blend || 'add',
            active: true
        };
        
        this.geometryVariations.push(variation);
        
        // Update renderer with new variations
        if (this.renderer && this.renderer.setGeometryVariations) {
            this.renderer.setGeometryVariations(this.geometryVariations);
        }
        
        console.log(`➕ Added geometry variation [${variantKey}] to ${this.sectionKey}`);
    }
    
    addInstance(instanceKey, config) {
        // Dynamically add new instance (for flexible configurations)
        if (!this.instances.has(instanceKey)) {
            this.createInstance(instanceKey, config);
            console.log(`➕ Added dynamic instance [${instanceKey}] to ${this.sectionKey}`);
        }
    }
    
    removeInstance(instanceKey) {
        // Remove instance if it exists
        const instance = this.instances.get(instanceKey);
        if (instance) {
            instance.visualizer.destroy();
            instance.canvas.remove();
            this.instances.delete(instanceKey);
            this.activeInstances.delete(instanceKey);
            console.log(`➖ Removed instance [${instanceKey}] from ${this.sectionKey}`);
        }
    }
    
    updateInstanceParameters(derivedParameters) {
        // Update consolidated renderer with new parameters
        this.baseParameters = derivedParameters;
        
        if (this.renderer && this.renderer.updateTheme) {
            this.renderer.updateTheme(this.geometry, derivedParameters);
        }
        
        console.log(`📊 Updated parameters for consolidated renderer in ${this.sectionKey}`);
    }
    
    updateInteractionState(interactionData) {
        // Send interaction data to consolidated renderer
        if (this.renderer && this.renderer.updateInteractionState) {
            // Renderer will apply variations internally
            this.renderer.updateInteractionState(interactionData);
        }
    }
    
    activateInstances() {
        // Start consolidated renderer
        if (this.renderer) {
            this.renderer.start();
            this.isActive = true;
            console.log(`🎬 Activated consolidated renderer in ${this.sectionKey}`);
        }
    }
    
    pauseInstances() {
        // Pause consolidated renderer
        if (this.renderer) {
            this.renderer.pause();
            this.isActive = false;
            console.log(`⏸️ Paused consolidated renderer in ${this.sectionKey}`);
        }
    }
    
    activateInstance(instanceKey) {
        // Activate specific instance
        const instance = this.instances.get(instanceKey);
        if (instance && instance.visualizer) {
            instance.visualizer.start();
            instance.isActive = true;
            this.activeInstances.add(instanceKey);
            console.log(`🎬 Activated instance [${instanceKey}] in ${this.sectionKey}`);
        }
    }
    
    pauseInstance(instanceKey) {
        // Pause specific instance
        const instance = this.instances.get(instanceKey);
        if (instance && instance.visualizer) {
            instance.visualizer.pause();
            instance.isActive = false;
            this.activeInstances.delete(instanceKey);
            console.log(`⏸️ Paused instance [${instanceKey}] in ${this.sectionKey}`);
        }
    }
    
    setInstanceOpacity(instanceKey, opacity) {
        // Dynamically adjust instance opacity
        const instance = this.instances.get(instanceKey);
        if (instance) {
            instance.canvas.style.opacity = opacity;
            instance.config.opacity = opacity;
        }
    }
    
    setInstancePosition(instanceKey, position) {
        // Dynamically reposition instance
        const instance = this.instances.get(instanceKey);
        if (instance) {
            Object.assign(instance.canvas.style, {
                top: position.top || instance.config.position.top,
                left: position.left || instance.config.position.left,
                width: position.width || instance.config.position.width,
                height: position.height || instance.config.position.height
            });
            Object.assign(instance.config.position, position);
        }
    }
    
    resizeInstances() {
        // Resize single canvas
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            if (this.renderer && this.renderer.resize) {
                this.renderer.resize();
            }
        }
    }
    
    render() {
        // Render consolidated canvas with all variations
        if (this.renderer && this.renderer.render && this.isActive) {
            this.renderer.render();
        }
    }
    
    getInstanceData() {
        // Return data for external systems (like glassmorphic UI)
        const activeData = [];
        
        this.activeInstances.forEach(instanceKey => {
            const instance = this.instances.get(instanceKey);
            if (instance && instance.visualizer) {
                activeData.push({
                    key: instanceKey,
                    role: instance.config.role,
                    modifier: instance.config.modifier,
                    geometry: this.geometry,
                    parameters: instance.visualizer.params,
                    interactionState: instance.visualizer.interactionState
                });
            }
        });
        
        return activeData;
    }
    
    destroy() {
        // Clean up consolidated renderer and canvas
        if (this.renderer) {
            this.renderer.destroy();
        }
        
        if (this.canvas) {
            this.canvas.remove();
        }
        
        this.geometryVariations = [];
        
        console.log(`🗑️ Destroyed consolidated MultiInstance [${this.sectionKey}]`);
    }
}

// ===== INSTANCE PRESET CONFIGURATIONS =====
class VIB34DInstancePresets {
    static getPreset(presetName) {
        const presets = {
            // Standard 3-instance layout
            'standard': {
                'header': { 
                    modifier: 1.0, role: 'header', zIndex: 1, opacity: 0.6,
                    position: { top: '0%', left: '0%', width: '100%', height: '100%' }
                },
                'content': { 
                    modifier: 1.3, role: 'content', zIndex: 2, opacity: 0.4,
                    position: { top: '0%', left: '0%', width: '100%', height: '100%' }
                },
                'background': { 
                    modifier: 0.7, role: 'background', zIndex: 0, opacity: 0.8,
                    position: { top: '0%', left: '0%', width: '100%', height: '100%' }
                }
            },
            
            // 5-instance complex layout  
            'complex': {
                'background': { modifier: 0.5, role: 'background', zIndex: 0, opacity: 0.9, position: { top: '0%', left: '0%', width: '100%', height: '100%' } },
                'header': { modifier: 1.0, role: 'header', zIndex: 1, opacity: 0.6, position: { top: '0%', left: '0%', width: '100%', height: '30%' } },
                'content': { modifier: 1.3, role: 'content', zIndex: 2, opacity: 0.4, position: { top: '20%', left: '10%', width: '80%', height: '60%' } },
                'sidebar': { modifier: 0.8, role: 'sidebar', zIndex: 1, opacity: 0.5, position: { top: '0%', left: '80%', width: '20%', height: '100%' } },
                'accent': { modifier: 1.5, role: 'accent', zIndex: 3, opacity: 0.3, position: { top: '10%', left: '10%', width: '20%', height: '20%' } }
            },
            
            // Minimal 2-instance layout
            'minimal': {
                'background': { modifier: 0.8, role: 'background', zIndex: 0, opacity: 0.7, position: { top: '0%', left: '0%', width: '100%', height: '100%' } },
                'overlay': { modifier: 1.2, role: 'overlay', zIndex: 2, opacity: 0.3, position: { top: '0%', left: '0%', width: '100%', height: '100%' } }
            },
            
            // Hero section with 4 instances
            'hero': {
                'background': { modifier: 0.6, role: 'background', zIndex: 0, opacity: 0.9, position: { top: '0%', left: '0%', width: '100%', height: '100%' } },
                'main': { modifier: 1.0, role: 'main', zIndex: 1, opacity: 0.7, position: { top: '20%', left: '20%', width: '60%', height: '60%' } },
                'accent_left': { modifier: 1.4, role: 'accent', zIndex: 2, opacity: 0.4, position: { top: '0%', left: '0%', width: '30%', height: '100%' } },
                'accent_right': { modifier: 1.4, role: 'accent', zIndex: 2, opacity: 0.4, position: { top: '0%', left: '70%', width: '30%', height: '100%' } }
            }
        };
        
        return presets[presetName] || presets['standard'];
    }
    
    static getAllPresets() {
        return ['standard', 'complex', 'minimal', 'hero'];
    }
}

// Export for VIB34D Style System
window.VIB34DMultiInstance = VIB34DMultiInstance;
window.VIB34DInstancePresets = VIB34DInstancePresets;
console.log('✅ VIB34D Multi-Instance Manager loaded - Ready for flexible instance assignment');