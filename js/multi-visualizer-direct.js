/**
 * DIRECT Multi-Visualizer Implementation - Based on Working Demo
 * Immediate deployment without ES6 module complexity
 */

console.log('🎨 Loading VIB3CODE Multi-Visualizer Direct Implementation...');

// Working ReactiveHyperAVCore - Extracted from proven demo
class ReactiveHyperAVCore {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.warn('WebGL not supported for visualizer instance');
            return;
        }
        
        // Core state
        this.startTime = Date.now();
        this.instanceId = options.instanceId || 'default';
        this.parameterModifier = options.parameterModifier || 1.0;
        this.currentTheme = options.geometry || 'hypercube';
        
        // Interaction state
        this.interactionState = {
            type: 'idle',
            intensity: 0,
            lastActivity: Date.now(),
            holdStart: 0,
            isHolding: false,
            scrollVelocity: 0,
            mouseX: 0.5,
            mouseY: 0.5
        };
        
        // Theme configurations from working demo
        this.themeConfigs = {
            hypercube: {
                baseColor: [1.0, 0.0, 1.0],
                gridDensity: 12.0,
                morphFactor: 0.5,
                dimension: 3.5,
                glitchIntensity: 0.3,
                rotationSpeed: 0.5,
                geometry: 'hypercube'
            },
            tetrahedron: {
                baseColor: [0.0, 1.0, 1.0],
                gridDensity: 8.0,
                morphFactor: 0.7,
                dimension: 3.2,
                glitchIntensity: 0.2,
                rotationSpeed: 0.7,
                geometry: 'tetrahedron'
            },
            sphere: {
                baseColor: [1.0, 1.0, 0.0],
                gridDensity: 15.0,
                morphFactor: 0.3,
                dimension: 3.8,
                glitchIntensity: 0.1,
                rotationSpeed: 0.3,
                geometry: 'sphere'
            },
            torus: {
                baseColor: [0.0, 1.0, 0.0],
                gridDensity: 10.0,
                morphFactor: 0.8,
                dimension: 3.6,
                glitchIntensity: 0.4,
                rotationSpeed: 0.6,
                geometry: 'torus'
            },
            wave: {
                baseColor: [1.0, 0.0, 0.5],
                gridDensity: 16.0,
                morphFactor: 0.4,
                dimension: 3.3,
                glitchIntensity: 0.3,
                rotationSpeed: 0.9,
                geometry: 'wave'
            }
        };
        
        // Apply parameter modifier for multi-instance variation
        this.params = this.applyParameterModifier(this.themeConfigs[this.currentTheme]);
        
        this.initShaders();
        this.initBuffers();
        this.resize();
        
        console.log(`✅ ReactiveHyperAVCore [${this.instanceId}] initialized with ${this.currentTheme} geometry`);
    }
    
    applyParameterModifier(config) {
        const modified = { ...config };
        
        // Apply parameter variations for multi-instance diversity
        modified.gridDensity *= this.parameterModifier;
        modified.rotationSpeed *= this.parameterModifier;
        modified.morphFactor *= (0.8 + this.parameterModifier * 0.4);
        
        // Vary colors slightly for instances
        if (this.parameterModifier !== 1.0) {
            const colorShift = (this.parameterModifier - 1.0) * 0.3;
            modified.baseColor = modified.baseColor.map(c => Math.max(0, Math.min(1, c + colorShift)));
        }
        
        return modified;
    }
    
    initShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // Simplified fragment shader with core geometries
        const fragmentShaderSource = `
            precision mediump float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_morphFactor;
            uniform float u_glitchIntensity;
            uniform float u_rotationSpeed;
            uniform float u_dimension;
            uniform float u_gridDensity;
            uniform vec3 u_baseColor;
            uniform float u_interactionIntensity;
            uniform float u_geometry;
            
            float hypercubeLattice(vec3 p, float gridSize) {
                vec3 grid = fract(p * gridSize);
                vec3 edges = 1.0 - smoothstep(0.0, 0.03, abs(grid - 0.5));
                return max(max(edges.x, edges.y), edges.z);
            }
            
            float tetrahedronLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float d1 = length(q);
                float d2 = length(q - vec3(0.5, 0.0, 0.0));
                float d3 = length(q - vec3(0.0, 0.5, 0.0));
                float d4 = length(q - vec3(0.0, 0.0, 0.5));
                return 1.0 - smoothstep(0.0, 0.1, min(min(d1, d2), min(d3, d4)));
            }
            
            float sphereLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r = length(q);
                return 1.0 - smoothstep(0.2, 0.5, r);
            }
            
            float torusLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r1 = sqrt(q.x*q.x + q.y*q.y);
                float r2 = sqrt((r1 - 0.3)*(r1 - 0.3) + q.z*q.z);
                return 1.0 - smoothstep(0.0, 0.1, r2);
            }
            
            float waveLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float wave = sin(q.x * 2.0) * sin(q.y * 2.0) * sin(q.z * 2.0 + u_time);
                return smoothstep(-0.5, 0.5, wave);
            }
            
            float getGeometryValue(vec3 p, float gridSize, float geomType) {
                if (geomType < 0.5) return hypercubeLattice(p, gridSize);
                else if (geomType < 1.5) return tetrahedronLattice(p, gridSize);
                else if (geomType < 2.5) return sphereLattice(p, gridSize);
                else if (geomType < 3.5) return torusLattice(p, gridSize);
                else return waveLattice(p, gridSize);
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float aspectRatio = u_resolution.x / u_resolution.y;
                uv.x *= aspectRatio;
                
                vec2 center = vec2(u_mouse.x * aspectRatio, u_mouse.y);
                vec3 p = vec3(uv - center, 0.0);
                
                // Interaction-driven rotation
                float timeRotation = u_time * 0.2 * u_rotationSpeed * (1.0 + u_interactionIntensity);
                mat2 rotation = mat2(cos(timeRotation), -sin(timeRotation), sin(timeRotation), cos(timeRotation));
                p.xy = rotation * p.xy;
                p.z = sin(u_time * 0.1) * 0.5;
                
                // Dynamic grid density
                float dynamicGridDensity = u_gridDensity * (1.0 + u_interactionIntensity * 0.3);
                
                // Get geometry value
                float lattice = getGeometryValue(p, dynamicGridDensity, u_geometry);
                
                // Base colors with theme-specific tinting
                vec3 baseColor = vec3(0.02, 0.05, 0.1);
                vec3 latticeColor = u_baseColor * (0.8 + 0.2 * u_interactionIntensity);
                
                vec3 color = mix(baseColor, latticeColor, lattice);
                
                // Interaction-responsive glow
                color += u_baseColor * 0.1 * (0.5 + 0.5 * sin(u_time * 0.5)) * u_interactionIntensity;
                
                gl_FragColor = vec4(color, 0.95);
            }
        `;
        
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = this.createProgram(vertexShader, fragmentShader);
        
        // Get uniform locations
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
            glitchIntensity: this.gl.getUniformLocation(this.program, 'u_glitchIntensity'),
            rotationSpeed: this.gl.getUniformLocation(this.program, 'u_rotationSpeed'),
            dimension: this.gl.getUniformLocation(this.program, 'u_dimension'),
            gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
            baseColor: this.gl.getUniformLocation(this.program, 'u_baseColor'),
            interactionIntensity: this.gl.getUniformLocation(this.program, 'u_interactionIntensity'),
            geometry: this.gl.getUniformLocation(this.program, 'u_geometry')
        };
        
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(`Shader error in ${this.instanceId}:`, this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    
    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error(`Program error in ${this.instanceId}:`, this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        return program;
    }
    
    initBuffers() {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
            this.gl.STATIC_DRAW
        );
    }
    
    resize() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    render() {
        if (!this.program) return;
        
        // Apply interaction effects to parameters
        const interactionMultiplier = 1.0 + this.interactionState.intensity * 0.5;
        const currentMorphFactor = this.params.morphFactor * interactionMultiplier;
        const currentGridDensity = this.params.gridDensity * (1.0 + this.interactionState.intensity * 0.2);
        
        // Map geometry name to number
        const geometryMap = {
            'hypercube': 0, 'tetrahedron': 1, 'sphere': 2, 'torus': 3, 'wave': 4
        };
        const geometryIndex = geometryMap[this.params.geometry] || 0;
        
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        
        // Setup vertex attributes
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Set uniforms
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, (Date.now() - this.startTime) / 1000);
        this.gl.uniform2f(this.uniforms.mouse, this.interactionState.mouseX, this.interactionState.mouseY);
        this.gl.uniform1f(this.uniforms.morphFactor, currentMorphFactor);
        this.gl.uniform1f(this.uniforms.glitchIntensity, this.params.glitchIntensity);
        this.gl.uniform1f(this.uniforms.rotationSpeed, this.params.rotationSpeed);
        this.gl.uniform1f(this.uniforms.dimension, this.params.dimension);
        this.gl.uniform1f(this.uniforms.gridDensity, currentGridDensity);
        this.gl.uniform3fv(this.uniforms.baseColor, this.params.baseColor);
        this.gl.uniform1f(this.uniforms.interactionIntensity, this.interactionState.intensity);
        this.gl.uniform1f(this.uniforms.geometry, geometryIndex);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        // Decay interaction intensity
        this.interactionState.intensity *= 0.98;
    }
}

// Multi-Visualizer Manager for creating multiple instances per section
class MultiVisualizerDirectManager {
    constructor() {
        this.sectionManagers = new Map();
        this.isInitialized = false;
        this.animationFrame = null;
        
        // Global interaction state
        this.globalInteractionState = {
            type: 'idle',
            intensity: 0,
            mouseX: 0.5,
            mouseY: 0.5,
            lastActivity: Date.now()
        };
        
        this.initializeSections();
        this.setupInteractions();
        this.startRenderLoop();
        
        console.log('🎛️ MultiVisualizerDirectManager initialized');
    }
    
    initializeSections() {
        // Section configurations
        const sectionConfigs = [
            { selector: '[data-section="home"]', geometry: 'hypercube', key: 'home' },
            { selector: '[data-section="articles"]', geometry: 'tetrahedron', key: 'articles' },
            { selector: '[data-section="videos"]', geometry: 'sphere', key: 'videos' },
            { selector: '[data-section="podcasts"]', geometry: 'torus', key: 'podcasts' },
            { selector: '[data-section="ema"]', geometry: 'wave', key: 'ema' }
        ];
        
        sectionConfigs.forEach(config => {
            const sectionElement = document.querySelector(config.selector);
            if (sectionElement) {
                this.createSectionVisualizers(sectionElement, config.geometry, config.key);
            } else {
                console.warn(`⚠️ Section not found: ${config.selector}`);
            }
        });
        
        this.isInitialized = true;
    }
    
    createSectionVisualizers(sectionElement, geometry, sectionKey) {
        // Create multiple visualizer instances per section
        const instanceCount = 3;
        const instances = [];
        
        // Create container for visualizers
        const container = document.createElement('div');
        container.className = 'multi-visualizer-container';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        sectionElement.insertBefore(container, sectionElement.firstChild);
        
        // Create multiple instances with variations
        const variations = [1.0, 1.3, 0.7];
        
        for (let i = 0; i < instanceCount; i++) {
            const canvas = document.createElement('canvas');
            canvas.className = `visualizer-instance-${i}`;
            
            // Different layouts for visual richness
            const layouts = [
                { left: 0, top: 0, width: 100, height: 100, opacity: 0.6 },
                { left: 50, top: 0, width: 50, height: 50, opacity: 0.8 },
                { left: 0, top: 50, width: 50, height: 50, opacity: 0.7 }
            ];
            
            const layout = layouts[i % layouts.length];
            
            canvas.style.cssText = `
                position: absolute;
                left: ${layout.left}%;
                top: ${layout.top}%;
                width: ${layout.width}%;
                height: ${layout.height}%;
                opacity: ${layout.opacity};
                mix-blend-mode: screen;
                pointer-events: none;
            `;
            
            container.appendChild(canvas);
            
            // Create visualizer instance
            const visualizer = new ReactiveHyperAVCore(canvas, {
                instanceId: `${geometry}-${i}`,
                parameterModifier: variations[i % variations.length],
                geometry: geometry
            });
            
            instances.push(visualizer);
        }
        
        this.sectionManagers.set(sectionKey, {
            instances: instances,
            container: container,
            geometry: geometry
        });
        
        console.log(`📍 Created ${instanceCount} ${geometry} visualizers for ${sectionKey} section`);
    }
    
    setupInteractions() {
        // Global interaction handling
        document.addEventListener('mousemove', (e) => {
            this.globalInteractionState.mouseX = e.clientX / window.innerWidth;
            this.globalInteractionState.mouseY = 1.0 - (e.clientY / window.innerHeight);
            this.globalInteractionState.lastActivity = Date.now();
            this.updateInteractionState('move', 0.3);
        });
        
        document.addEventListener('scroll', () => {
            this.updateInteractionState('scroll', 0.5);
            this.globalInteractionState.lastActivity = Date.now();
        });
        
        document.addEventListener('mousedown', () => {
            this.updateInteractionState('hold', 1.0);
        });
        
        document.addEventListener('mouseup', () => {
            this.updateInteractionState('release', 0.1);
        });
        
        // Inactivity detection
        setInterval(() => {
            const timeSinceActivity = Date.now() - this.globalInteractionState.lastActivity;
            if (timeSinceActivity > 3000) {
                this.updateInteractionState('idle', 0.0);
            }
        }, 1000);
        
        // Window resize
        window.addEventListener('resize', () => {
            this.sectionManagers.forEach(manager => {
                manager.instances.forEach(instance => {
                    if (instance.resize) instance.resize();
                });
            });
        });
    }
    
    updateInteractionState(type, intensity) {
        this.globalInteractionState.type = type;
        this.globalInteractionState.intensity = Math.max(
            this.globalInteractionState.intensity * 0.9, 
            intensity
        );
        
        // Propagate to all instances
        this.sectionManagers.forEach(manager => {
            manager.instances.forEach(instance => {
                instance.interactionState.type = type;
                instance.interactionState.intensity = intensity;
                instance.interactionState.mouseX = this.globalInteractionState.mouseX;
                instance.interactionState.mouseY = this.globalInteractionState.mouseY;
            });
        });
    }
    
    startRenderLoop() {
        const renderLoop = () => {
            if (this.isInitialized) {
                // Render all instances
                this.sectionManagers.forEach(manager => {
                    manager.instances.forEach(instance => {
                        if (instance.render) {
                            instance.render();
                        }
                    });
                });
                
                // Decay global interaction intensity
                this.globalInteractionState.intensity *= 0.98;
            }
            
            this.animationFrame = requestAnimationFrame(renderLoop);
        };
        
        renderLoop();
    }
}

// Initialize the system immediately
console.log('🚀 Starting VIB3CODE Multi-Visualizer Direct Implementation...');

// Wait for DOM then initialize
const initializeDirectSystem = () => {
    try {
        const manager = new MultiVisualizerDirectManager();
        
        // Expose to global scope
        window.multiVisualizerManager = manager;
        window.vib3MultiVisualizerReady = true;
        window.homeMasterController = manager; // Compatibility
        window.VIB3CoreVisualizer = ReactiveHyperAVCore; // Compatibility
        
        console.log('✅ VIB3CODE Multi-Visualizer Direct Implementation ready!');
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('vib3-multi-visualizer-ready'));
        
    } catch (error) {
        console.error('❌ Failed to initialize Multi-Visualizer Direct Implementation:', error);
    }
};

// Initialize based on DOM state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDirectSystem);
} else {
    initializeDirectSystem();
}