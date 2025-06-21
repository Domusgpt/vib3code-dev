/**
 * Multi-Visualizer Manager - Handles 3+ visualizer instances per section
 * Core component of the Multi-Visualizer Styles Package
 */

import { VIB3CoreVisualizer } from './vib3-core-visualizer.js';

class MultiVisualizerManager {
    constructor(sectionElement, geometry, instanceCount = 3) {
        this.sectionElement = sectionElement;
        this.geometry = geometry;
        this.instanceCount = instanceCount;
        this.instances = [];
        this.canvases = [];
        this.isInitialized = false;
        
        // Parameter variation patterns for instances
        this.instanceVariations = [
            1.0,    // Base instance
            1.3,    // 30% faster/larger
            0.7,    // 30% slower/smaller
            1.5,    // 50% faster/larger
            0.5     // 50% slower/smaller
        ];
        
        this.initializeInstances();
        this.setupResizeHandler();
        
        console.log(`✅ MultiVisualizerManager initialized for ${geometry} with ${instanceCount} instances`);
    }
    
    initializeInstances() {
        // Create container for multiple visualizer canvases
        this.visualizerContainer = document.createElement('div');
        this.visualizerContainer.className = 'multi-visualizer-container';
        this.visualizerContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Insert before section content to act as background
        this.sectionElement.insertBefore(this.visualizerContainer, this.sectionElement.firstChild);
        
        // Create instances with different layouts
        for (let i = 0; i < this.instanceCount; i++) {
            this.createInstance(i);
        }
        
        this.isInitialized = true;
    }
    
    createInstance(index) {
        // Create canvas for this instance
        const canvas = document.createElement('canvas');
        canvas.className = `visualizer-instance-${index}`;
        
        // Position instances in different areas of the section
        const { left, top, width, height } = this.getInstanceLayout(index);
        
        canvas.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            width: ${width}%;
            height: ${height}%;
            opacity: 0.8;
            mix-blend-mode: screen;
            pointer-events: none;
        `;
        
        this.visualizerContainer.appendChild(canvas);
        this.canvases.push(canvas);
        
        // Create visualizer instance with parameter variation
        const parameterModifier = this.instanceVariations[index % this.instanceVariations.length];
        const visualizer = new VIB3CoreVisualizer(canvas, {
            instanceId: `${this.geometry}-${index}`,
            parameterModifier: parameterModifier,
            geometry: this.geometry
        });
        
        this.instances.push(visualizer);
    }
    
    getInstanceLayout(index) {
        // Define overlapping layouts for visual richness
        const layouts = [
            // Instance 0: Full background
            { left: 0, top: 0, width: 100, height: 100 },
            
            // Instance 1: Upper right quadrant
            { left: 50, top: 0, width: 50, height: 50 },
            
            // Instance 2: Lower left quadrant
            { left: 0, top: 50, width: 50, height: 50 },
            
            // Instance 3: Center overlay
            { left: 25, top: 25, width: 50, height: 50 },
            
            // Instance 4: Full overlay with different blend
            { left: 0, top: 0, width: 100, height: 100 }
        ];
        
        return layouts[index % layouts.length];
    }
    
    updateFromMaster(masterParams) {
        // Apply master parameters to all instances
        this.instances.forEach((visualizer, index) => {
            if (visualizer && visualizer.updateFromMaster) {
                visualizer.updateFromMaster(masterParams);
            }
        });
    }
    
    updateInteractionState(type, intensity, mouseX = 0.5, mouseY = 0.5) {
        // Propagate interaction state to all instances
        this.instances.forEach(visualizer => {
            if (visualizer && visualizer.updateInteractionState) {
                visualizer.updateInteractionState(type, intensity, mouseX, mouseY);
            }
        });
    }
    
    setGeometry(newGeometry) {
        if (this.geometry === newGeometry) return;
        
        this.geometry = newGeometry;
        
        // Update all instances to new geometry
        this.instances.forEach(visualizer => {
            if (visualizer && visualizer.setGeometry) {
                visualizer.setGeometry(newGeometry);
            }
        });
        
        console.log(`🎨 MultiVisualizerManager updated to ${newGeometry} geometry`);
    }
    
    resize() {
        // Resize all canvas instances
        this.instances.forEach((visualizer, index) => {
            if (visualizer && visualizer.resize) {
                visualizer.resize();
            }
        });
    }
    
    render() {
        // Render all instances
        this.instances.forEach(visualizer => {
            if (visualizer && visualizer.render) {
                visualizer.render();
            }
        });
    }
    
    setupResizeHandler() {
        // Handle window resize events
        const resizeHandler = () => {
            if (this.isInitialized) {
                this.resize();
            }
        };
        
        window.addEventListener('resize', resizeHandler);
        
        // Store reference for cleanup
        this.resizeHandler = resizeHandler;
    }
    
    destroy() {
        // Clean up all instances
        this.instances.forEach(visualizer => {
            if (visualizer && visualizer.destroy) {
                visualizer.destroy();
            }
        });
        
        // Remove DOM elements
        if (this.visualizerContainer && this.visualizerContainer.parentNode) {
            this.visualizerContainer.parentNode.removeChild(this.visualizerContainer);
        }
        
        // Remove event listeners
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        this.instances = [];
        this.canvases = [];
        this.isInitialized = false;
        
        console.log(`🗑️ MultiVisualizerManager for ${this.geometry} destroyed`);
    }
}

/**
 * Section-Specific Multi-Visualizer Managers
 * Pre-configured for each section's geometry requirements
 */

class HomeSectionManager extends MultiVisualizerManager {
    constructor(sectionElement) {
        super(sectionElement, 'hypercube', 3);
        this.isMasterSection = true;
    }
    
    // Home section acts as master controller
    getMasterParameters() {
        if (this.instances.length > 0 && this.instances[0]) {
            return {
                gridDensity: this.instances[0].params.gridDensity,
                rotationSpeed: this.instances[0].params.rotationSpeed,
                morphFactor: this.instances[0].params.morphFactor,
                glitchIntensity: this.instances[0].params.glitchIntensity,
                dimension: this.instances[0].params.dimension,
                baseColor: [...this.instances[0].params.baseColor],
                interactionIntensity: this.instances[0].interactionState.intensity
            };
        }
        
        return null;
    }
}

class ArticlesSectionManager extends MultiVisualizerManager {
    constructor(sectionElement) {
        super(sectionElement, 'tetrahedron', 3);
        this.masterMultiplier = 0.8; // Articles = Home × 0.8
    }
    
    updateFromMaster(masterParams) {
        if (!masterParams) return;
        
        // Apply section-specific derivation
        const derivedParams = {
            ...masterParams,
            gridDensity: masterParams.gridDensity * this.masterMultiplier,
            rotationSpeed: masterParams.rotationSpeed * this.masterMultiplier,
            morphFactor: masterParams.morphFactor * this.masterMultiplier
        };
        
        super.updateFromMaster(derivedParams);
    }
}

class VideosSectionManager extends MultiVisualizerManager {
    constructor(sectionElement) {
        super(sectionElement, 'sphere', 3);
        this.masterMultiplier = 1.2; // Videos = Home × 1.2
    }
    
    updateFromMaster(masterParams) {
        if (!masterParams) return;
        
        const derivedParams = {
            ...masterParams,
            gridDensity: masterParams.gridDensity * this.masterMultiplier,
            rotationSpeed: masterParams.rotationSpeed * this.masterMultiplier,
            morphFactor: masterParams.morphFactor * this.masterMultiplier
        };
        
        super.updateFromMaster(derivedParams);
    }
}

class PodcastsSectionManager extends MultiVisualizerManager {
    constructor(sectionElement) {
        super(sectionElement, 'torus', 3);
        this.masterMultiplier = 0.9; // Podcasts = Home × 0.9
    }
    
    updateFromMaster(masterParams) {
        if (!masterParams) return;
        
        const derivedParams = {
            ...masterParams,
            gridDensity: masterParams.gridDensity * this.masterMultiplier,
            rotationSpeed: masterParams.rotationSpeed * this.masterMultiplier,
            morphFactor: masterParams.morphFactor * this.masterMultiplier
        };
        
        super.updateFromMaster(derivedParams);
    }
}

class EMASectionManager extends MultiVisualizerManager {
    constructor(sectionElement) {
        super(sectionElement, 'wave', 3);
        this.masterMultiplier = 1.1; // EMA = Home × 1.1
    }
    
    updateFromMaster(masterParams) {
        if (!masterParams) return;
        
        const derivedParams = {
            ...masterParams,
            gridDensity: masterParams.gridDensity * this.masterMultiplier,
            rotationSpeed: masterParams.rotationSpeed * this.masterMultiplier,
            morphFactor: masterParams.morphFactor * this.masterMultiplier
        };
        
        super.updateFromMaster(derivedParams);
    }
}

export { 
    MultiVisualizerManager,
    HomeSectionManager,
    ArticlesSectionManager,
    VideosSectionManager,
    PodcastsSectionManager,
    EMASectionManager
};