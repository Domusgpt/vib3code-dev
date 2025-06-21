/**
 * PPP GLASSMORPHIC UI INTEGRATION
 * VIB3CODE Multi-Visualizer Styles Package
 * 
 * Integrates 4D visualizers with glassmorphic UI elements
 * Creates holographic styling system with visual information cues
 */

console.log('🔮 PPP Glassmorphic UI Integration Loading...');

// ===== GLASSMORPHIC UI MANAGER =====
class PPPGlassmorphicUI {
    constructor(pppStyleSystem) {
        this.pppSystem = pppStyleSystem;
        this.glassmorphicElements = new Map();
        this.holographicStyles = new Map();
        this.visualCues = new Map();
        
        this.initializeGlassmorphicSystem();
        this.setupHolographicStyles();
        this.createVisualInformationCues();
        
        console.log('✨ PPP Glassmorphic UI System initialized');
    }
    
    initializeGlassmorphicSystem() {
        // Enhanced glassmorphic effects for each section
        const sections = document.querySelectorAll('[data-section]');
        
        sections.forEach(section => {
            const sectionKey = section.getAttribute('data-section');
            this.createGlassmorphicLayer(sectionKey, section);
        });
    }
    
    createGlassmorphicLayer(sectionKey, sectionElement) {
        // Create glassmorphic overlay that responds to visualizer data
        const glassLayer = document.createElement('div');
        glassLayer.className = `ppp-glass-layer ppp-glass-${sectionKey}`;
        glassLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
            backdrop-filter: blur(10px) saturate(1.2);
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 50%, 
                rgba(255, 255, 255, 0.02) 100%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        // Insert before content to create glass effect behind text
        const contentContainer = sectionElement.querySelector('.section-container') || 
                                sectionElement.querySelector('.hero-content') || 
                                sectionElement;
        contentContainer.style.position = 'relative';
        contentContainer.insertBefore(glassLayer, contentContainer.firstChild);
        
        // Create holographic accent elements
        this.createHolographicAccents(sectionKey, contentContainer);
        
        this.glassmorphicElements.set(sectionKey, {
            layer: glassLayer,
            container: contentContainer,
            isActive: false
        });
        
        console.log(`🔮 Created glassmorphic layer for ${sectionKey}`);
    }
    
    createHolographicAccents(sectionKey, container) {
        // Create holographic geometric accents that respond to 4D data
        const accent = document.createElement('div');
        accent.className = `ppp-holographic-accent ppp-holo-${sectionKey}`;
        accent.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 80px;
            height: 80px;
            pointer-events: none;
            z-index: 6;
            opacity: 0;
            transition: all 0.5s ease;
            
            background: conic-gradient(from 0deg, 
                transparent 0deg, 
                rgba(0, 255, 255, 0.3) 90deg, 
                transparent 180deg, 
                rgba(255, 0, 255, 0.3) 270deg, 
                transparent 360deg);
            border-radius: 50%;
            filter: blur(2px);
            animation: holographicSpin 10s linear infinite;
        `;
        
        container.appendChild(accent);
        
        // Add CSS animation keyframes
        if (!document.getElementById('ppp-holographic-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'ppp-holographic-styles';
            styleSheet.textContent = `
                @keyframes holographicSpin {
                    0% { transform: rotate(0deg) scale(1); opacity: 0.3; }
                    25% { transform: rotate(90deg) scale(1.1); opacity: 0.6; }
                    50% { transform: rotate(180deg) scale(1); opacity: 0.3; }
                    75% { transform: rotate(270deg) scale(0.9); opacity: 0.8; }
                    100% { transform: rotate(360deg) scale(1); opacity: 0.3; }
                }
                
                @keyframes dataFlow {
                    0% { transform: translateY(0) opacity(0.2); }
                    50% { transform: translateY(-20px) opacity(0.8); }
                    100% { transform: translateY(-40px) opacity(0); }
                }
                
                .ppp-visual-cue {
                    animation: dataFlow 2s ease-in-out infinite;
                }
            `;
            document.head.appendChild(styleSheet);
        }
        
        this.holographicStyles.set(sectionKey, accent);
    }
    
    setupHolographicStyles() {
        // Define holographic style mappings for different geometries
        this.holographicStyleMap = {
            hypercube: {
                colors: ['#ff00ff', '#ff0080', '#8000ff'],
                pattern: 'conic-gradient',
                animation: 'spin',
                blur: '3px'
            },
            tetrahedron: {
                colors: ['#00ffff', '#0080ff', '#0040ff'],
                pattern: 'linear-gradient',
                animation: 'pulse',
                blur: '2px'
            },
            sphere: {
                colors: ['#ffff00', '#ff8000', '#ff4000'],
                pattern: 'radial-gradient',
                animation: 'glow',
                blur: '4px'
            },
            torus: {
                colors: ['#00ff00', '#80ff00', '#40ff80'],
                pattern: 'repeating-conic-gradient',
                animation: 'flow',
                blur: '2px'
            },
            wave: {
                colors: ['#ff0080', '#ff4080', '#ff8080'],
                pattern: 'linear-gradient',
                animation: 'wave',
                blur: '5px'
            }
        };
    }
    
    createVisualInformationCues() {
        // Create floating data visualizations that respond to visualizer state
        const sections = document.querySelectorAll('[data-section]');
        
        sections.forEach(section => {
            const sectionKey = section.getAttribute('data-section');
            this.createDataVisualizationCues(sectionKey, section);
        });
    }
    
    createDataVisualizationCues(sectionKey, sectionElement) {
        // Create floating information elements
        const cueContainer = document.createElement('div');
        cueContainer.className = `ppp-visual-cues ppp-cues-${sectionKey}`;
        cueContainer.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            width: 200px;
            height: 100px;
            pointer-events: none;
            z-index: 7;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        // Dimension indicator
        const dimensionCue = document.createElement('div');
        dimensionCue.className = 'ppp-dimension-cue';
        dimensionCue.innerHTML = `
            <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.8rem; margin-bottom: 5px;">
                Dimension: <span id="dim-${sectionKey}">3.5</span>D
            </div>
        `;
        
        // Grid density indicator
        const gridCue = document.createElement('div');
        gridCue.className = 'ppp-grid-cue';
        gridCue.innerHTML = `
            <div style="color: rgba(0, 255, 255, 0.8); font-size: 0.8rem; margin-bottom: 5px;">
                Grid: <span id="grid-${sectionKey}">12.0</span>
            </div>
        `;
        
        // Interaction state indicator
        const interactionCue = document.createElement('div');
        interactionCue.className = 'ppp-interaction-cue';
        interactionCue.innerHTML = `
            <div style="color: rgba(255, 0, 255, 0.8); font-size: 0.8rem;">
                State: <span id="state-${sectionKey}">idle</span>
            </div>
        `;
        
        cueContainer.appendChild(dimensionCue);
        cueContainer.appendChild(gridCue);
        cueContainer.appendChild(interactionCue);
        
        sectionElement.appendChild(cueContainer);
        
        this.visualCues.set(sectionKey, {
            container: cueContainer,
            dimension: dimensionCue.querySelector(`#dim-${sectionKey}`),
            grid: gridCue.querySelector(`#grid-${sectionKey}`),
            state: interactionCue.querySelector(`#state-${sectionKey}`)
        });
        
        console.log(`📊 Created visual information cues for ${sectionKey}`);
    }
    
    activateSection(sectionKey) {
        const glassElement = this.glassmorphicElements.get(sectionKey);
        const holoElement = this.holographicStyles.get(sectionKey);
        const cueElement = this.visualCues.get(sectionKey);
        
        if (glassElement) {
            glassElement.layer.style.opacity = '1';
            glassElement.isActive = true;
        }
        
        if (holoElement) {
            holoElement.style.opacity = '0.6';
        }
        
        if (cueElement) {
            cueElement.container.style.opacity = '1';
        }
        
        console.log(`🔮 Activated glassmorphic UI for ${sectionKey}`);
    }
    
    deactivateSection(sectionKey) {
        const glassElement = this.glassmorphicElements.get(sectionKey);
        const holoElement = this.holographicStyles.get(sectionKey);
        const cueElement = this.visualCues.get(sectionKey);
        
        if (glassElement) {
            glassElement.layer.style.opacity = '0';
            glassElement.isActive = false;
        }
        
        if (holoElement) {
            holoElement.style.opacity = '0.2';
        }
        
        if (cueElement) {
            cueElement.container.style.opacity = '0.3';
        }
        
        console.log(`🔮 Deactivated glassmorphic UI for ${sectionKey}`);
    }
    
    updateVisualizerData(sectionKey, visualizerData) {
        // Update visual information cues with real visualizer data
        const cueElement = this.visualCues.get(sectionKey);
        
        if (cueElement && visualizerData) {
            if (visualizerData.dimension) {
                cueElement.dimension.textContent = visualizerData.dimension.toFixed(1);
            }
            
            if (visualizerData.gridDensity) {
                cueElement.grid.textContent = visualizerData.gridDensity.toFixed(1);
            }
            
            if (visualizerData.interactionType) {
                cueElement.state.textContent = visualizerData.interactionType;
                cueElement.state.style.color = this.getInteractionColor(visualizerData.interactionType);
            }
            
            // Update glassmorphic effects based on data
            this.updateGlassmorphicEffects(sectionKey, visualizerData);
        }
    }
    
    updateGlassmorphicEffects(sectionKey, data) {
        const glassElement = this.glassmorphicElements.get(sectionKey);
        const holoElement = this.holographicStyles.get(sectionKey);
        
        if (glassElement && data) {
            // Adjust blur based on dimension level
            const blurAmount = 5 + (data.dimension - 3.0) * 10;
            glassElement.layer.style.backdropFilter = `blur(${blurAmount}px) saturate(1.2)`;
            
            // Adjust opacity based on interaction intensity
            const baseOpacity = data.intensity ? 0.1 + data.intensity * 0.3 : 0.1;
            glassElement.layer.style.background = `linear-gradient(135deg, 
                rgba(255, 255, 255, ${baseOpacity}) 0%, 
                rgba(255, 255, 255, ${baseOpacity * 0.5}) 50%, 
                rgba(255, 255, 255, ${baseOpacity * 0.2}) 100%)`;
        }
        
        if (holoElement && data) {
            // Adjust holographic effect based on visualizer state
            const geometry = data.geometry || 'hypercube';
            const style = this.holographicStyleMap[geometry];
            
            if (style) {
                holoElement.style.filter = `blur(${style.blur}) hue-rotate(${data.time * 10}deg)`;
                holoElement.style.transform = `scale(${1 + (data.intensity || 0) * 0.2})`;
            }
        }
    }
    
    getInteractionColor(interactionType) {
        const colors = {
            'idle': 'rgba(255, 255, 255, 0.5)',
            'mouse': 'rgba(0, 255, 255, 0.8)',
            'scroll': 'rgba(255, 255, 0, 0.8)',
            'click': 'rgba(255, 0, 255, 0.8)',
            'hold': 'rgba(255, 100, 0, 0.8)',
            'key_pulse': 'rgba(0, 255, 0, 0.8)'
        };
        
        return colors[interactionType] || colors['idle'];
    }
}

// Export for integration
window.PPPGlassmorphicUI = PPPGlassmorphicUI;
console.log('✅ PPP Glassmorphic UI System loaded - Ready for holographic integration');