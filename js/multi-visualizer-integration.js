/**
 * Multi-Visualizer Integration Layer
 * Connects the Multi-Visualizer Styles Package to the VIB3CODE website
 */

// Expose core classes to global scope for integration
import { VIB3CoreVisualizer } from './vib3-core-visualizer.js';
import { 
    MultiVisualizerManager,
    HomeSectionManager,
    ArticlesSectionManager,
    VideosSectionManager,
    PodcastsSectionManager,
    EMASectionManager
} from './multi-visualizer-manager.js';
import { HomeMasterController, initializeHomeMasterController } from './home-master-controller.js';

// Global exposure for website integration
window.VIB3CoreVisualizer = VIB3CoreVisualizer;
window.MultiVisualizerManager = MultiVisualizerManager;
window.HomeMasterController = HomeMasterController;

// Initialize the system
console.log('🎨 Initializing VIB3CODE Multi-Visualizer Styles Package...');

// Auto-initialize when DOM is ready
const initializeSystem = () => {
    try {
        // Initialize the home master controller which will handle everything
        const controller = initializeHomeMasterController();
        
        // Store global reference
        window.homeMasterController = controller;
        
        // Mark system as ready
        window.vib3MultiVisualizerReady = true;
        
        console.log('✅ VIB3CODE Multi-Visualizer Styles Package initialized successfully');
        
        // Dispatch ready event for other systems
        window.dispatchEvent(new CustomEvent('vib3-multi-visualizer-ready', {
            detail: { controller }
        }));
        
    } catch (error) {
        console.error('❌ Failed to initialize Multi-Visualizer Styles Package:', error);
        
        // Fallback: Mark as failed but continue
        window.vib3MultiVisualizerError = error;
    }
};

// Initialize based on DOM state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else {
    // DOM already loaded
    initializeSystem();
}