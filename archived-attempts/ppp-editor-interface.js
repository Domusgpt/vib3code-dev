/**
 * PPP STYLE EDITOR INTERFACE
 * Beautiful creator controls for the PPP Style System
 * VIB3CODE Pilot Implementation
 */

console.log('🎨 PPP Style Editor Interface Loading...');

class PPPStyleEditor {
    constructor() {
        this.isVisible = false;
        this.currentPreset = 'custom';
        
        this.presets = {
            'cyberpunk': {
                name: '🔮 Cyberpunk Future',
                geometry: 'hypercube',
                intensity: 1.4,
                speed: 1.2,
                colors: { primary: '#ff00ff', secondary: '#00ffff', accent: '#ffff00' }
            },
            'editorial': {
                name: '📰 Editorial Clean',
                geometry: 'tetrahedron',
                intensity: 0.8,
                speed: 0.9,
                colors: { primary: '#0066cc', secondary: '#004499', accent: '#ff6600' }
            },
            'ethereal': {
                name: '✨ Ethereal Flow',
                geometry: 'sphere',
                intensity: 1.1,
                speed: 0.6,
                colors: { primary: '#8000ff', secondary: '#ff0080', accent: '#00ff80' }
            },
            'minimal': {
                name: '⚪ Minimal Zen',
                geometry: 'wave',
                intensity: 0.5,
                speed: 0.7,
                colors: { primary: '#333333', secondary: '#666666', accent: '#ffffff' }
            }
        };
        
        this.createEditorInterface();
        this.setupEventListeners();
        
        console.log('🎛️ PPP Style Editor Interface ready');
    }
    
    createEditorInterface() {
        const editorHTML = `
            <div id="ppp-editor" class="ppp-editor-panel">
                <div class="ppp-editor-header">
                    <h2>🎛️ PPP Style Control Center</h2>
                    <p>Master controls affect all pages through mathematical relationships</p>
                    <button id="ppp-toggle-btn" class="ppp-toggle-btn">❌</button>
                </div>
                
                <div class="ppp-editor-content">
                    <!-- Quick Presets -->
                    <section class="ppp-control-section">
                        <h3>🎨 Quick Presets</h3>
                        <div class="ppp-preset-grid">
                            ${Object.entries(this.presets).map(([key, preset]) => `
                                <button class="ppp-preset-btn" data-preset="${key}">
                                    <span class="preset-name">${preset.name}</span>
                                    <span class="preset-geometry">${preset.geometry}</span>
                                </button>
                            `).join('')}
                        </div>
                    </section>
                    
                    <!-- Master Geometry Control -->
                    <section class="ppp-control-section">
                        <h3>🔮 Master Geometry</h3>
                        <div class="ppp-geometry-selector">
                            <button class="ppp-geometry-btn active" data-geometry="hypercube">
                                <span class="geometry-icon">🔮</span>
                                <span class="geometry-name">Hypercube</span>
                                <span class="geometry-desc">4D Technical Grid</span>
                            </button>
                            <button class="ppp-geometry-btn" data-geometry="tetrahedron">
                                <span class="geometry-icon">🔺</span>
                                <span class="geometry-name">Tetrahedron</span>
                                <span class="geometry-desc">Structural Forms</span>
                            </button>
                            <button class="ppp-geometry-btn" data-geometry="sphere">
                                <span class="geometry-icon">🌐</span>
                                <span class="geometry-name">Sphere</span>
                                <span class="geometry-desc">Organic Flow</span>
                            </button>
                            <button class="ppp-geometry-btn" data-geometry="torus">
                                <span class="geometry-icon">🍩</span>
                                <span class="geometry-name">Torus</span>
                                <span class="geometry-desc">Continuous Loop</span>
                            </button>
                            <button class="ppp-geometry-btn" data-geometry="wave">
                                <span class="geometry-icon">🌊</span>
                                <span class="geometry-name">Wave</span>
                                <span class="geometry-desc">Fluid Motion</span>
                            </button>
                        </div>
                    </section>
                    
                    <!-- Parameter Controls -->
                    <section class="ppp-control-section">
                        <h3>⚡ Visual Parameters</h3>
                        
                        <div class="ppp-slider-control">
                            <label>
                                <span>Visual Intensity</span>
                                <span id="intensity-value" class="param-value">1.0</span>
                            </label>
                            <input type="range" id="intensity-slider" min="0.1" max="2.0" step="0.1" value="1.0">
                        </div>
                        
                        <div class="ppp-slider-control">
                            <label>
                                <span>Animation Speed</span>
                                <span id="speed-value" class="param-value">1.0</span>
                            </label>
                            <input type="range" id="speed-slider" min="0.1" max="3.0" step="0.1" value="1.0">
                        </div>
                        
                        <div class="ppp-slider-control">
                            <label>
                                <span>Mouse Reactivity</span>
                                <span id="mouse-value" class="param-value">0.5</span>
                            </label>
                            <input type="range" id="mouse-slider" min="0.0" max="1.0" step="0.1" value="0.5">
                        </div>
                        
                        <div class="ppp-slider-control">
                            <label>
                                <span>Scroll Reactivity</span>
                                <span id="scroll-value" class="param-value">0.7</span>
                            </label>
                            <input type="range" id="scroll-slider" min="0.0" max="1.0" step="0.1" value="0.7">
                        </div>
                    </section>
                    
                    <!-- Color Palette -->
                    <section class="ppp-control-section">
                        <h3>🎨 Color Harmony</h3>
                        <div class="ppp-color-palette">
                            <div class="ppp-color-input">
                                <label>Primary</label>
                                <input type="color" id="primary-color" value="#ff00ff">
                                <span class="color-hex">#ff00ff</span>
                            </div>
                            <div class="ppp-color-input">
                                <label>Secondary</label>
                                <input type="color" id="secondary-color" value="#00ffff">
                                <span class="color-hex">#00ffff</span>
                            </div>
                            <div class="ppp-color-input">
                                <label>Accent</label>
                                <input type="color" id="accent-color" value="#ffff00">
                                <span class="color-hex">#ffff00</span>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Page Relationship Preview -->
                    <section class="ppp-control-section">
                        <h3>🔗 Page Relationships</h3>
                        <div class="ppp-relationship-preview">
                            <div class="relationship-item">
                                <span class="page-name">🏠 Home</span>
                                <span class="page-geometry">Master Control</span>
                                <span class="page-intensity">100%</span>
                            </div>
                            <div class="relationship-item">
                                <span class="page-name">📰 Articles</span>
                                <span class="page-geometry">Tetrahedron</span>
                                <span class="page-intensity">80%</span>
                            </div>
                            <div class="relationship-item">
                                <span class="page-name">🎥 Videos</span>
                                <span class="page-geometry">Sphere</span>
                                <span class="page-intensity">130%</span>
                            </div>
                            <div class="relationship-item">
                                <span class="page-name">👥 Community</span>
                                <span class="page-geometry">Torus</span>
                                <span class="page-intensity">60%</span>
                            </div>
                            <div class="relationship-item">
                                <span class="page-name">⚖️ EMA</span>
                                <span class="page-geometry">Wave</span>
                                <span class="page-intensity">110%</span>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Quick Actions -->
                    <section class="ppp-control-section">
                        <h3>🚀 Quick Actions</h3>
                        <div class="ppp-action-buttons">
                            <button id="randomize-btn" class="ppp-action-btn primary">
                                🎲 Randomize for New Issue
                            </button>
                            <button id="save-preset-btn" class="ppp-action-btn secondary">
                                💾 Save Preset
                            </button>
                            <button id="export-config-btn" class="ppp-action-btn secondary">
                                📤 Export Config
                            </button>
                        </div>
                    </section>
                </div>
            </div>
            
            <!-- Toggle Button -->
            <button id="ppp-editor-toggle" class="ppp-editor-toggle-btn">
                🎛️ PPP Controls
            </button>
        `;
        
        // Create styles
        const styles = `
            <style>
                .ppp-editor-panel {
                    position: fixed;
                    top: 20px;
                    right: -400px;
                    width: 380px;
                    max-height: calc(100vh - 40px);
                    background: rgba(10, 10, 20, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    z-index: 10000;
                    transition: right 0.3s ease;
                    overflow-y: auto;
                    font-family: 'Inter', sans-serif;
                    color: #ffffff;
                }
                
                .ppp-editor-panel.visible {
                    right: 20px;
                }
                
                .ppp-editor-header {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    position: relative;
                }
                
                .ppp-editor-header h2 {
                    margin: 0 0 8px 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                    background: linear-gradient(45deg, #ff00ff, #00ffff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .ppp-editor-header p {
                    margin: 0;
                    font-size: 0.85rem;
                    opacity: 0.7;
                    line-height: 1.4;
                }
                
                .ppp-toggle-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 5px;
                    transition: background 0.2s ease;
                }
                
                .ppp-toggle-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .ppp-editor-content {
                    padding: 20px;
                }
                
                .ppp-control-section {
                    margin-bottom: 30px;
                }
                
                .ppp-control-section h3 {
                    margin: 0 0 15px 0;
                    font-size: 1rem;
                    font-weight: 500;
                    color: #00ffff;
                }
                
                /* Preset Grid */
                .ppp-preset-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                
                .ppp-preset-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 12px;
                    color: #ffffff;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }
                
                .ppp-preset-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #ff00ff;
                }
                
                .preset-name {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-bottom: 4px;
                }
                
                .preset-geometry {
                    display: block;
                    font-size: 0.75rem;
                    opacity: 0.7;
                }
                
                /* Geometry Selector */
                .ppp-geometry-selector {
                    display: grid;
                    gap: 8px;
                }
                
                .ppp-geometry-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 15px;
                    color: #ffffff;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }
                
                .ppp-geometry-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #00ffff;
                }
                
                .ppp-geometry-btn.active {
                    background: rgba(255, 0, 255, 0.2);
                    border-color: #ff00ff;
                }
                
                .geometry-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }
                
                .geometry-name {
                    font-weight: 500;
                    font-size: 0.9rem;
                }
                
                .geometry-desc {
                    font-size: 0.75rem;
                    opacity: 0.7;
                    margin-left: auto;
                }
                
                /* Slider Controls */
                .ppp-slider-control {
                    margin-bottom: 20px;
                }
                
                .ppp-slider-control label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                
                .param-value {
                    color: #00ffff;
                    font-family: monospace;
                    font-size: 0.85rem;
                }
                
                .ppp-slider-control input[type="range"] {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    outline: none;
                    -webkit-appearance: none;
                }
                
                .ppp-slider-control input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    background: linear-gradient(45deg, #ff00ff, #00ffff);
                    border-radius: 50%;
                    cursor: pointer;
                }
                
                .ppp-slider-control input[type="range"]::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    background: linear-gradient(45deg, #ff00ff, #00ffff);
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                }
                
                /* Color Palette */
                .ppp-color-palette {
                    display: grid;
                    gap: 15px;
                }
                
                .ppp-color-input {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .ppp-color-input label {
                    min-width: 70px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                
                .ppp-color-input input[type="color"] {
                    width: 40px;
                    height: 40px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    background: transparent;
                    cursor: pointer;
                    -webkit-appearance: none;
                }
                
                .ppp-color-input input[type="color"]::-webkit-color-swatch {
                    border: none;
                    border-radius: 6px;
                }
                
                .color-hex {
                    font-family: monospace;
                    font-size: 0.8rem;
                    color: #888;
                    margin-left: auto;
                }
                
                /* Relationship Preview */
                .ppp-relationship-preview {
                    display: grid;
                    gap: 8px;
                }
                
                .relationship-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    font-size: 0.85rem;
                }
                
                .page-name {
                    font-weight: 500;
                    min-width: 80px;
                }
                
                .page-geometry {
                    opacity: 0.7;
                    flex: 1;
                    text-align: center;
                }
                
                .page-intensity {
                    color: #00ffff;
                    font-family: monospace;
                    min-width: 50px;
                    text-align: right;
                }
                
                /* Action Buttons */
                .ppp-action-buttons {
                    display: grid;
                    gap: 10px;
                }
                
                .ppp-action-btn {
                    padding: 12px 16px;
                    border: 1px solid;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: transparent;
                    color: #ffffff;
                }
                
                .ppp-action-btn.primary {
                    border-color: #ff00ff;
                    background: rgba(255, 0, 255, 0.1);
                }
                
                .ppp-action-btn.primary:hover {
                    background: rgba(255, 0, 255, 0.2);
                }
                
                .ppp-action-btn.secondary {
                    border-color: rgba(255, 255, 255, 0.3);
                }
                
                .ppp-action-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                /* Toggle Button */
                .ppp-editor-toggle-btn {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(10, 10, 20, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    padding: 12px 16px;
                    color: #ffffff;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    z-index: 9999;
                }
                
                .ppp-editor-toggle-btn:hover {
                    background: rgba(10, 10, 20, 1);
                    border-color: #ff00ff;
                }
                
                /* Hide toggle when editor is open */
                .ppp-editor-panel.visible ~ .ppp-editor-toggle-btn {
                    display: none;
                }
                
                /* Scrollbar Styling */
                .ppp-editor-panel::-webkit-scrollbar {
                    width: 6px;
                }
                
                .ppp-editor-panel::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .ppp-editor-panel::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }
                
                .ppp-editor-panel::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            </style>
        `;
        
        // Add to page
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.insertAdjacentHTML('beforeend', editorHTML);
    }
    
    setupEventListeners() {
        // Toggle editor visibility
        document.getElementById('ppp-editor-toggle').addEventListener('click', () => {
            this.toggleEditor();
        });
        
        document.getElementById('ppp-toggle-btn').addEventListener('click', () => {
            this.toggleEditor();
        });
        
        // Preset buttons
        document.querySelectorAll('.ppp-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = this.presets[btn.dataset.preset];
                this.applyPreset(preset);
            });
        });
        
        // Geometry buttons
        document.querySelectorAll('.ppp-geometry-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectGeometry(btn.dataset.geometry);
            });
        });
        
        // Parameter sliders
        this.setupSlider('intensity-slider', 'intensity-value', window.updatePPPIntensity);
        this.setupSlider('speed-slider', 'speed-value', window.updatePPPSpeed);
        this.setupSlider('mouse-slider', 'mouse-value', (val) => console.log('Mouse reactivity:', val));
        this.setupSlider('scroll-slider', 'scroll-value', (val) => console.log('Scroll reactivity:', val));
        
        // Color inputs
        this.setupColorInput('primary-color', 'primary');
        this.setupColorInput('secondary-color', 'secondary');
        this.setupColorInput('accent-color', 'accent');
        
        // Action buttons
        document.getElementById('randomize-btn').addEventListener('click', () => {
            this.randomizeAll();
        });
        
        document.getElementById('save-preset-btn').addEventListener('click', () => {
            this.saveCurrentAsPreset();
        });
        
        document.getElementById('export-config-btn').addEventListener('click', () => {
            this.exportConfiguration();
        });
    }
    
    setupSlider(sliderId, valueId, callback) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            valueDisplay.textContent = value.toFixed(1);
            callback(value);
        });
    }
    
    setupColorInput(inputId, colorRole) {
        const input = document.getElementById(inputId);
        const hexDisplay = input.parentNode.querySelector('.color-hex');
        
        input.addEventListener('change', (e) => {
            const color = e.target.value;
            hexDisplay.textContent = color;
            
            const colors = {
                primary: document.getElementById('primary-color').value,
                secondary: document.getElementById('secondary-color').value,
                accent: document.getElementById('accent-color').value
            };
            
            window.updatePPPColors(colors);
        });
    }
    
    selectGeometry(geometry) {
        // Update UI
        document.querySelectorAll('.ppp-geometry-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-geometry="${geometry}"]`).classList.add('active');
        
        // Update system
        window.updatePPPGeometry(geometry);
        
        console.log(`🔮 PPP Editor: Geometry changed to ${geometry}`);
    }
    
    applyPreset(preset) {
        // Update geometry
        this.selectGeometry(preset.geometry);
        
        // Update sliders
        document.getElementById('intensity-slider').value = preset.intensity;
        document.getElementById('intensity-value').textContent = preset.intensity.toFixed(1);
        
        document.getElementById('speed-slider').value = preset.speed;
        document.getElementById('speed-value').textContent = preset.speed.toFixed(1);
        
        // Update colors
        document.getElementById('primary-color').value = preset.colors.primary;
        document.getElementById('secondary-color').value = preset.colors.secondary;
        document.getElementById('accent-color').value = preset.colors.accent;
        
        // Update hex displays
        document.querySelectorAll('.color-hex').forEach((display, index) => {
            const colors = [preset.colors.primary, preset.colors.secondary, preset.colors.accent];
            display.textContent = colors[index];
        });
        
        // Apply to system
        window.updatePPPIntensity(preset.intensity);
        window.updatePPPSpeed(preset.speed);
        window.updatePPPColors(preset.colors);
        
        console.log(`🎨 PPP Editor: Applied preset ${preset.name}`);
    }
    
    randomizeAll() {
        // Use system's randomization
        window.randomizePPP();
        
        // Update UI to reflect changes
        setTimeout(() => {
            this.updateUIFromSystem();
        }, 100);
        
        console.log('🎲 PPP Editor: Randomized all parameters');
    }
    
    updateUIFromSystem() {
        // This would sync the UI with the current system state
        // Implementation depends on exposing current state from PPP system
        console.log('🔄 PPP Editor: UI updated from system state');
    }
    
    saveCurrentAsPreset() {
        const name = prompt('Enter preset name:');
        if (!name) return;
        
        const currentConfig = {
            name: name,
            geometry: document.querySelector('.ppp-geometry-btn.active').dataset.geometry,
            intensity: parseFloat(document.getElementById('intensity-slider').value),
            speed: parseFloat(document.getElementById('speed-slider').value),
            colors: {
                primary: document.getElementById('primary-color').value,
                secondary: document.getElementById('secondary-color').value,
                accent: document.getElementById('accent-color').value
            }
        };
        
        // Store in localStorage
        const presets = JSON.parse(localStorage.getItem('ppp-presets') || '{}');
        presets[name.toLowerCase().replace(/\s+/g, '_')] = currentConfig;
        localStorage.setItem('ppp-presets', JSON.stringify(presets));
        
        console.log('💾 PPP Editor: Preset saved', currentConfig);
        alert(`Preset "${name}" saved successfully!`);
    }
    
    exportConfiguration() {
        const config = {
            geometry: document.querySelector('.ppp-geometry-btn.active').dataset.geometry,
            intensity: parseFloat(document.getElementById('intensity-slider').value),
            speed: parseFloat(document.getElementById('speed-slider').value),
            mouseReactivity: parseFloat(document.getElementById('mouse-slider').value),
            scrollReactivity: parseFloat(document.getElementById('scroll-slider').value),
            colorPalette: {
                primary: document.getElementById('primary-color').value,
                secondary: document.getElementById('secondary-color').value,
                accent: document.getElementById('accent-color').value
            },
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ppp-style-config-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('📤 PPP Editor: Configuration exported', config);
    }
    
    toggleEditor() {
        const panel = document.getElementById('ppp-editor');
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            panel.classList.add('visible');
        } else {
            panel.classList.remove('visible');
        }
        
        console.log(`👁️ PPP Editor: ${this.isVisible ? 'Shown' : 'Hidden'}`);
    }
    
    show() {
        this.isVisible = true;
        document.getElementById('ppp-editor').classList.add('visible');
    }
    
    hide() {
        this.isVisible = false;
        document.getElementById('ppp-editor').classList.remove('visible');
    }
}

// Initialize PPP Editor when PPP System is ready
window.addEventListener('ppp-style-ready', () => {
    window.pppStyleEditor = new PPPStyleEditor();
    console.log('🎛️ PPP Style Editor initialized and ready!');
});

// Fallback initialization
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!window.pppStyleEditor) {
            window.pppStyleEditor = new PPPStyleEditor();
        }
    }, 1000);
});