/**
 * Home-Master Controller - Orchestrates parameter flow between sections
 * Implements the reactive parameter derivation system for Multi-Visualizer Styles Package
 */

import { 
    HomeSectionManager,
    ArticlesSectionManager,
    VideosSectionManager,
    PodcastsSectionManager,
    EMASectionManager
} from './multi-visualizer-manager.js';

class HomeMasterController {
    constructor() {
        this.sectionManagers = new Map();
        this.homeSectionManager = null;
        this.isInitialized = false;
        this.animationFrame = null;
        
        // Interaction state
        this.globalInteractionState = {
            type: 'idle',
            intensity: 0,
            mouseX: 0.5,
            mouseY: 0.5,
            lastActivity: Date.now()
        };
        
        // Initialize sections and start control loop
        this.initializeSections();
        this.setupInteractions();
        this.startControlLoop();
        
        console.log('🎛️ HomeMasterController initialized');
    }
    
    initializeSections() {
        // Find and initialize all sections with their appropriate managers
        const sectionConfigs = [
            { selector: '[data-section="home"]', manager: HomeSectionManager, key: 'home' },
            { selector: '[data-section="articles"]', manager: ArticlesSectionManager, key: 'articles' },
            { selector: '[data-section="videos"]', manager: VideosSectionManager, key: 'videos' },
            { selector: '[data-section="podcasts"]', manager: PodcastsSectionManager, key: 'podcasts' },
            { selector: '[data-section="ema"]', manager: EMASectionManager, key: 'ema' }
        ];
        
        sectionConfigs.forEach(config => {
            const sectionElement = document.querySelector(config.selector);
            if (sectionElement) {
                const manager = new config.manager(sectionElement);
                this.sectionManagers.set(config.key, manager);
                
                // Store reference to home section manager
                if (config.key === 'home') {
                    this.homeSectionManager = manager;
                }
                
                console.log(`📍 Initialized ${config.key} section with ${manager.geometry} geometry`);
            } else {
                console.warn(`⚠️ Section not found: ${config.selector}`);
            }
        });
        
        this.isInitialized = true;
    }
    
    setupInteractions() {
        // Global interaction handling for all sections
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Touch events for mobile
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Section visibility tracking
        this.setupIntersectionObserver();
        
        // Inactivity detection
        setInterval(() => {
            const timeSinceActivity = Date.now() - this.globalInteractionState.lastActivity;
            if (timeSinceActivity > 3000) { // 3 seconds
                this.updateInteractionState('idle', 0.0);
            }
        }, 1000);
        
        // Window resize
        window.addEventListener('resize', () => {
            this.sectionManagers.forEach(manager => {
                if (manager.resize) {
                    manager.resize();
                }
            });
        });
    }
    
    setupIntersectionObserver() {
        // Track which section is currently visible for context
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionKey = entry.target.dataset.section;
                    this.setActiveSection(sectionKey);
                }
            });
        }, { threshold: 0.5 });
        
        // Observe all sections
        this.sectionManagers.forEach((manager, key) => {
            if (manager.sectionElement) {
                observer.observe(manager.sectionElement);
            }
        });
    }
    
    handleMouseMove(event) {
        const rect = document.documentElement.getBoundingClientRect();
        this.globalInteractionState.mouseX = event.clientX / window.innerWidth;
        this.globalInteractionState.mouseY = 1.0 - (event.clientY / window.innerHeight);
        this.globalInteractionState.lastActivity = Date.now();
        
        this.updateInteractionState('move', 0.3);
    }
    
    handleMouseDown(event) {
        this.updateInteractionState('hold', 1.0);
        this.globalInteractionState.lastActivity = Date.now();
    }
    
    handleMouseUp(event) {
        this.updateInteractionState('release', 0.1);
        this.globalInteractionState.lastActivity = Date.now();
    }
    
    handleScroll(event) {
        const scrollIntensity = Math.min(Math.abs(event.deltaY || window.scrollY) / 100, 1.0);
        this.updateInteractionState('scroll', scrollIntensity);
        this.globalInteractionState.lastActivity = Date.now();
    }
    
    handleTouchStart(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.globalInteractionState.mouseX = touch.clientX / window.innerWidth;
            this.globalInteractionState.mouseY = 1.0 - (touch.clientY / window.innerHeight);
        }
        this.updateInteractionState('hold', 1.0);
        event.preventDefault();
    }
    
    handleTouchMove(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.globalInteractionState.mouseX = touch.clientX / window.innerWidth;
            this.globalInteractionState.mouseY = 1.0 - (touch.clientY / window.innerHeight);
        }
        this.updateInteractionState('move', 0.5);
        event.preventDefault();
    }
    
    handleTouchEnd(event) {
        this.updateInteractionState('release', 0.1);
    }
    
    updateInteractionState(type, intensity) {
        this.globalInteractionState.type = type;
        this.globalInteractionState.intensity = Math.max(
            this.globalInteractionState.intensity * 0.9, 
            intensity
        );
        
        // Propagate to all section managers
        this.sectionManagers.forEach(manager => {
            if (manager.updateInteractionState) {
                manager.updateInteractionState(
                    type, 
                    intensity, 
                    this.globalInteractionState.mouseX, 
                    this.globalInteractionState.mouseY
                );
            }
        });
    }
    
    setActiveSection(sectionKey) {
        // Update which section is active (could drive future enhancements)
        this.activeSection = sectionKey;
        console.log(`🎯 Active section: ${sectionKey}`);
    }
    
    startControlLoop() {
        // Main control loop that propagates master parameters
        const controlLoop = () => {
            if (this.isInitialized && this.homeSectionManager) {
                // Get master parameters from home section
                const masterParams = this.homeSectionManager.getMasterParameters();
                
                if (masterParams) {
                    // Apply to all non-home sections
                    this.sectionManagers.forEach((manager, key) => {
                        if (key !== 'home' && manager.updateFromMaster) {
                            manager.updateFromMaster(masterParams);
                        }
                    });
                }
                
                // Render all sections
                this.sectionManagers.forEach(manager => {
                    if (manager.render) {
                        manager.render();
                    }
                });
                
                // Decay global interaction intensity
                this.globalInteractionState.intensity *= 0.98;
            }
            
            this.animationFrame = requestAnimationFrame(controlLoop);
        };
        
        controlLoop();
    }
    
    // API methods for external control
    setGlobalGeometry(sectionKey, geometry) {
        const manager = this.sectionManagers.get(sectionKey);
        if (manager && manager.setGeometry) {
            manager.setGeometry(geometry);
        }
    }
    
    getParameterSnapshot() {
        // Return current state of all sections for debugging
        const snapshot = {
            globalInteraction: { ...this.globalInteractionState },
            sections: {}
        };
        
        this.sectionManagers.forEach((manager, key) => {
            if (manager.instances && manager.instances.length > 0) {
                const firstInstance = manager.instances[0];
                if (firstInstance && firstInstance.params) {
                    snapshot.sections[key] = {
                        geometry: manager.geometry,
                        instanceCount: manager.instances.length,
                        params: { ...firstInstance.params },
                        interactionState: { ...firstInstance.interactionState }
                    };
                }
            }
        });
        
        return snapshot;
    }
    
    destroy() {
        // Clean up control loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Destroy all section managers
        this.sectionManagers.forEach(manager => {
            if (manager.destroy) {
                manager.destroy();
            }
        });
        
        this.sectionManagers.clear();
        this.homeSectionManager = null;
        this.isInitialized = false;
        
        console.log('🗑️ HomeMasterController destroyed');
    }
}

// Global instance for easy access
let globalHomeMasterController = null;

// Initialize when DOM is ready
function initializeHomeMasterController() {
    if (globalHomeMasterController) {
        globalHomeMasterController.destroy();
    }
    
    globalHomeMasterController = new HomeMasterController();
    
    // Expose to window for debugging
    window.homeMasterController = globalHomeMasterController;
    
    return globalHomeMasterController;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHomeMasterController);
} else {
    // DOM already loaded
    initializeHomeMasterController();
}

export { HomeMasterController, initializeHomeMasterController };