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
        
        // Instance collection
        this.instances = new Map();
        this.activeInstances = new Set();
        
        // Instance configuration templates
        this.instanceTemplates = {
            // Standard 3-instance setup with flexible roles
            'header': { 
                modifier: 1.0, 
                role: 'header',
                zIndex: 1,
                opacity: 0.6,
                position: { top: '0%', left: '0%', width: '100%', height: '100%' }
            },
            'content': { 
                modifier: 1.3, 
                role: 'content',
                zIndex: 2,
                opacity: 0.4,
                position: { top: '0%', left: '0%', width: '100%', height: '100%' }
            },
            'background': { 
                modifier: 0.7, 
                role: 'background',
                zIndex: 0,
                opacity: 0.8,
                position: { top: '0%', left: '0%', width: '100%', height: '100%' }
            }
        };
        
        // Custom instance configurations can be passed in
        if (options.instanceConfig) {
            this.instanceTemplates = { ...this.instanceTemplates, ...options.instanceConfig };
        }
        
        this.setupInstanceContainers();
        this.createInstances();
        
        console.log(`🎭 MultiInstance [${this.sectionKey}] created with ${this.instances.size} instances`);
    }
    
    setupInstanceContainers() {
        // Ensure section has relative positioning for instance layering
        this.sectionElement.style.position = 'relative';
        this.sectionElement.style.overflow = 'hidden';
        
        // Create instance container for all visualizers
        this.instanceContainer = document.createElement('div');
        this.instanceContainer.className = `vib34d-instances vib34d-${this.sectionKey}`;
        this.instanceContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Insert at beginning so content layers above visualizers
        this.sectionElement.insertBefore(this.instanceContainer, this.sectionElement.firstChild);
        
        console.log(`📦 Instance container created for ${this.sectionKey}`);
    }
    
    createInstances() {
        Object.entries(this.instanceTemplates).forEach(([instanceKey, config]) => {
            this.createInstance(instanceKey, config);
        });
    }
    
    createInstance(instanceKey, config) {
        // Create canvas for this instance
        const canvas = document.createElement('canvas');
        canvas.className = `vib34d-instance vib34d-${instanceKey}`;
        canvas.id = `vib34d-${this.sectionKey}-${instanceKey}`;
        
        // Apply instance positioning and styling
        canvas.style.cssText = `
            position: absolute;
            top: ${config.position.top};
            left: ${config.position.left};
            width: ${config.position.width};
            height: ${config.position.height};
            z-index: ${config.zIndex};
            opacity: ${config.opacity};
            pointer-events: none;
            mix-blend-mode: screen;
        `;
        
        // Size canvas to container
        const rect = this.instanceContainer.getBoundingClientRect();
        canvas.width = rect.width || 800;
        canvas.height = rect.height || 600;
        
        this.instanceContainer.appendChild(canvas);
        
        // Create VIB34D Core instance
        const visualizer = new VIB34DCore(canvas, {
            instanceId: `${this.sectionKey}-${instanceKey}`,
            role: config.role,
            modifier: config.modifier,
            geometry: this.geometry
        });
        
        // Store instance data
        const instanceData = {
            key: instanceKey,
            config: config,
            canvas: canvas,
            visualizer: visualizer,
            isActive: false
        };
        
        this.instances.set(instanceKey, instanceData);
        
        console.log(`🎨 Created instance [${instanceKey}] for ${this.sectionKey} with modifier: ${config.modifier}`);
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
        // Update all instances with new base parameters from home-master
        this.baseParameters = derivedParameters;
        
        this.instances.forEach((instance, instanceKey) => {
            if (instance.visualizer && instance.visualizer.updateTheme) {
                // Pass derived parameters to each instance
                instance.visualizer.updateTheme(this.geometry, derivedParameters);
            }
        });
        
        console.log(`📊 Updated parameters for ${this.instances.size} instances in ${this.sectionKey}`);
    }
    
    updateInteractionState(interactionData) {
        // Propagate interaction to all active instances
        this.activeInstances.forEach(instanceKey => {
            const instance = this.instances.get(instanceKey);
            if (instance && instance.visualizer && instance.visualizer.updateInteractionState) {
                // Apply instance-specific interaction modifications
                const modifiedInteraction = {
                    ...interactionData,
                    intensity: (interactionData.intensity || 0) * instance.config.modifier
                };
                
                instance.visualizer.updateInteractionState(modifiedInteraction);
            }
        });
    }
    
    activateInstances() {
        // Start all instances (viewport entered)
        this.instances.forEach((instance, instanceKey) => {
            if (instance.visualizer) {
                instance.visualizer.start();
                instance.isActive = true;
                this.activeInstances.add(instanceKey);
            }
        });
        
        console.log(`🎬 Activated ${this.activeInstances.size} instances in ${this.sectionKey}`);
    }
    
    pauseInstances() {
        // Pause all instances (viewport left)
        this.instances.forEach((instance, instanceKey) => {
            if (instance.visualizer) {
                instance.visualizer.pause();
                instance.isActive = false;
            }
        });
        
        this.activeInstances.clear();
        console.log(`⏸️ Paused instances in ${this.sectionKey}`);
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
        // Resize all canvases when container changes
        const rect = this.instanceContainer.getBoundingClientRect();
        
        this.instances.forEach((instance) => {
            instance.canvas.width = rect.width || 800;
            instance.canvas.height = rect.height || 600;
            
            if (instance.visualizer && instance.visualizer.resize) {
                instance.visualizer.resize();
            }
        });
    }
    
    render() {
        // Render all active instances
        this.activeInstances.forEach(instanceKey => {
            const instance = this.instances.get(instanceKey);
            if (instance && instance.visualizer && instance.visualizer.render) {
                instance.visualizer.render();
            }
        });
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
        // Clean up all instances
        this.instances.forEach((instance) => {
            instance.visualizer.destroy();
            instance.canvas.remove();
        });
        
        this.instanceContainer.remove();
        this.instances.clear();
        this.activeInstances.clear();
        
        console.log(`🗑️ Destroyed MultiInstance [${this.sectionKey}]`);
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