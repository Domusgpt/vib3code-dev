/**
 * PPP STYLE SYSTEM - Universal Reactive Visualizer
 * VIB3CODE Pilot Implementation
 * 
 * Master-Modifier Architecture with Multi-Visualizer Variants
 * Built from proven ReactiveHyperAVCore foundation
 */

console.log('🎨 PPP Style System - VIB3CODE Pilot Project Loading...');

// ===== CORE REACTIVE VISUALIZER ENGINE =====
class PPPReactiveVisualizer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.warn('WebGL not supported for PPP Visualizer');
            return;
        }
        
        // PPP Configuration
        this.instanceId = options.instanceId || `ppp-${Date.now()}`;
        this.variant = options.variant || 'primary';
        this.role = options.role || 'background';
        
        // Core Parameters (from PPP Codex)
        this.parameters = {
            geometry: options.geometry || 'hypercube',
            intensity: options.intensity || 1.0,
            speed: options.speed || 1.0,
            complexity: options.complexity || 'medium',
            
            // Variant-specific modifiers
            parameterModifier: options.parameterModifier || 1.0,
            opacity: options.opacity || 0.6,
            particleCount: options.particleCount || 1.0,
            interactivity: options.interactivity || 1.0,
            
            // Color system
            colorPalette: options.colorPalette || {
                primary: '#ff00ff',
                secondary: '#00ffff', 
                accent: '#ffff00'
            }
        };
        
        // Interaction state
        this.interactionState = {
            type: 'idle',
            intensity: 0.0,
            mouseX: 0.5,
            mouseY: 0.5,
            scrollVelocity: 0.0,
            lastActivity: Date.now()
        };
        
        this.startTime = Date.now();
        this.isActive = false;
        
        // Initialize color palette
        this.updateColorPalette(this.parameters.colorPalette);
        
        this.initShaders();
        this.resize();
        
        console.log(`✅ PPP Visualizer [${this.instanceId}] created - ${this.variant} variant`);
        console.log(`🔧 Canvas size: ${this.canvas.width}x${this.canvas.height}, WebGL: ${!!this.gl}`);
    }
    
    initShaders() {
        const vertexShader = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // Advanced fragment shader with PPP geometry system
        const fragmentShader = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform float u_intensity;
            uniform float u_speed;
            uniform float u_parameterModifier;
            uniform float u_geometry;
            uniform vec3 u_primaryColor;
            uniform vec3 u_secondaryColor;
            uniform vec3 u_accentColor;
            uniform float u_interactionIntensity;
            uniform vec2 u_mousePosition;
            uniform float u_scrollVelocity;
            
            // PPP Geometry Functions
            float pppHypercube(vec2 uv, float time) {
                vec2 grid = fract(uv * (8.0 + u_parameterModifier * 4.0));
                float lines = step(0.03, grid.x) * step(0.03, grid.y);
                float pulse = 0.5 + 0.5 * sin(time * u_speed * 2.0 + length(uv) * 10.0);
                return lines * pulse * u_intensity;
            }
            
            float pppTetrahedron(vec2 uv, float time) {
                vec2 center = uv - u_mousePosition;
                float angle = atan(center.y, center.x) + time * u_speed * 0.5;
                float radius = length(center);
                float triangular = sin(angle * 3.0 + u_parameterModifier) * 0.3 + 0.7;
                float structure = step(radius, triangular * 0.4);
                float energy = 0.8 + 0.2 * sin(time * u_speed * 3.0);
                return structure * energy * u_intensity;
            }
            
            float pppSphere(vec2 uv, float time) {
                vec2 center = uv - u_mousePosition;
                float radius = length(center);
                float rippleFreq = 15.0 + u_parameterModifier * 10.0;
                float ripple = sin(radius * rippleFreq - time * u_speed * 4.0) * 0.5 + 0.5;
                float spherical = smoothstep(0.5, 0.2, radius);
                return spherical * ripple * u_intensity;
            }
            
            float pppTorus(vec2 uv, float time) {
                vec2 center = uv - 0.5;
                float angle = atan(center.y, center.x);
                float radius = length(center);
                float torusRadius = abs(radius - 0.25 - u_parameterModifier * 0.1);
                float pattern = sin(angle * 8.0 + time * u_speed * 2.0) * 0.5 + 0.5;
                float torusShape = 1.0 - smoothstep(0.0, 0.15, torusRadius);
                return torusShape * pattern * u_intensity;
            }
            
            float pppWave(vec2 uv, float time) {
                float wave1 = sin(uv.x * 12.0 * u_parameterModifier + time * u_speed * 2.0) * 0.1;
                float wave2 = sin(uv.y * 10.0 * u_parameterModifier + time * u_speed * 1.5) * 0.1;
                float wavePattern = smoothstep(0.45, 0.55, uv.y + wave1 + wave2);
                return wavePattern * u_intensity;
            }
            
            vec3 pppColorMix(float pattern, vec3 primary, vec3 secondary, vec3 accent) {
                vec3 baseColor = mix(primary, secondary, sin(u_time * 0.3) * 0.5 + 0.5);
                vec3 finalColor = mix(baseColor, accent, pattern * 0.3);
                
                // Interaction-driven color enhancement
                float interactionBoost = 1.0 + u_interactionIntensity * 0.4;
                finalColor *= interactionBoost;
                
                // Scroll velocity color shift
                float scrollShift = u_scrollVelocity * 0.1;
                finalColor.rgb = mix(finalColor.rgb, accent, scrollShift);
                
                return finalColor;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float time = u_time;
                
                float pattern = 0.0;
                
                // PPP Geometry Selection
                if (u_geometry < 0.5) {
                    pattern = pppHypercube(uv, time);
                } else if (u_geometry < 1.5) {
                    pattern = pppTetrahedron(uv, time);
                } else if (u_geometry < 2.5) {
                    pattern = pppSphere(uv, time);
                } else if (u_geometry < 3.5) {
                    pattern = pppTorus(uv, time);
                } else {
                    pattern = pppWave(uv, time);
                }
                
                // PPP Color System
                vec3 finalColor = pppColorMix(pattern, u_primaryColor, u_secondaryColor, u_accentColor);
                
                // Variant-specific intensity modulation
                float variantIntensity = pattern * (0.2 + 0.8 * u_intensity);
                
                gl_FragColor = vec4(finalColor * variantIntensity, variantIntensity);
            }
        `;
        
        // Create and compile shaders
        const vs = this.createShader(this.gl.VERTEX_SHADER, vertexShader);
        const fs = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShader);
        
        if (!vs || !fs) {
            console.error('PPP Shader compilation failed');
            return;
        }
        
        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vs);
        this.gl.attachShader(this.program, fs);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('PPP Program linking failed:', this.gl.getProgramInfoLog(this.program));
            return;
        }
        
        // Create buffer
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1, 1, 1
        ]), this.gl.STATIC_DRAW);
        
        // Get uniform locations
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
            speed: this.gl.getUniformLocation(this.program, 'u_speed'),
            parameterModifier: this.gl.getUniformLocation(this.program, 'u_parameterModifier'),
            geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
            primaryColor: this.gl.getUniformLocation(this.program, 'u_primaryColor'),
            secondaryColor: this.gl.getUniformLocation(this.program, 'u_secondaryColor'),
            accentColor: this.gl.getUniformLocation(this.program, 'u_accentColor'),
            interactionIntensity: this.gl.getUniformLocation(this.program, 'u_interactionIntensity'),
            mousePosition: this.gl.getUniformLocation(this.program, 'u_mousePosition'),
            scrollVelocity: this.gl.getUniformLocation(this.program, 'u_scrollVelocity')
        };
        
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(`PPP Shader error in ${this.instanceId}:`, this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    
    resize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.gl.viewport(0, 0, width, height);
        }
    }
    
    // PPP Parameter Update System
    updateParameters(newParams) {
        Object.assign(this.parameters, newParams);
        
        // Convert color hex to RGB
        if (newParams.colorPalette) {
            this.updateColorPalette(newParams.colorPalette);
        }
    }
    
    updateColorPalette(colors) {
        this.parameters.colorPalette = colors;
        this.primaryColorRGB = this.hexToRgb(colors.primary);
        this.secondaryColorRGB = this.hexToRgb(colors.secondary);
        this.accentColorRGB = this.hexToRgb(colors.accent);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ] : [1, 0, 1]; // Default magenta
    }
    
    updateInteractionState(state) {
        Object.assign(this.interactionState, state);
    }
    
    render() {
        if (!this.program || !this.isActive) return;
        
        this.resize();
        
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        
        // Setup vertex attributes
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Set uniforms
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, (Date.now() - this.startTime) / 1000);
        this.gl.uniform1f(this.uniforms.intensity, this.parameters.intensity);
        this.gl.uniform1f(this.uniforms.speed, this.parameters.speed);
        this.gl.uniform1f(this.uniforms.parameterModifier, this.parameters.parameterModifier);
        
        // Geometry mapping
        const geometryMap = { hypercube: 0, tetrahedron: 1, sphere: 2, torus: 3, wave: 4 };
        this.gl.uniform1f(this.uniforms.geometry, geometryMap[this.parameters.geometry] || 0);
        
        // Colors
        const primary = this.primaryColorRGB || [1, 0, 1];
        const secondary = this.secondaryColorRGB || [0, 1, 1];
        const accent = this.accentColorRGB || [1, 1, 0];
        
        this.gl.uniform3fv(this.uniforms.primaryColor, primary);
        this.gl.uniform3fv(this.uniforms.secondaryColor, secondary);
        this.gl.uniform3fv(this.uniforms.accentColor, accent);
        
        // Interaction uniforms
        this.gl.uniform1f(this.uniforms.interactionIntensity, this.interactionState.intensity);
        this.gl.uniform2f(this.uniforms.mousePosition, this.interactionState.mouseX, this.interactionState.mouseY);
        this.gl.uniform1f(this.uniforms.scrollVelocity, this.interactionState.scrollVelocity);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        // Decay interaction intensity
        this.interactionState.intensity *= 0.95;
        this.interactionState.scrollVelocity *= 0.90;
    }
    
    start() {
        this.isActive = true;
    }
    
    pause() {
        this.isActive = false;
    }
    
    destroy() {
        this.isActive = false;
        if (this.program) {
            this.gl.deleteProgram(this.program);
        }
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
        }
    }
}

// ===== PPP STYLE SYSTEM MASTER CONTROLLER =====
class PPPStyleSystem {
    constructor(options = {}) {
        this.masterParameters = {
            geometry: options.geometry || 'hypercube',
            intensity: options.intensity || 1.0,
            speed: options.speed || 1.0,
            complexity: options.complexity || 'medium',
            colorPalette: options.colorPalette || {
                primary: '#ff00ff',
                secondary: '#00ffff',
                accent: '#ffff00'
            },
            mouseReactivity: options.mouseReactivity || 0.5,
            scrollReactivity: options.scrollReactivity || 0.7
        };
        
        // PPP Page Relationships (from Codex)
        this.pageRelationships = {
            'home': {
                name: 'Master Control',
                geometry: 'editor_selected',
                modifiers: {
                    intensity: 1.0,
                    speed: 1.0,
                    colorShift: { h: 0, s: 0, l: 0 }
                }
            },
            'articles': {
                name: 'Editorial Content',
                geometry: 'tetrahedron',
                modifiers: {
                    intensity: 0.8,
                    speed: 1.2,
                    colorShift: { h: 30, s: 5, l: -5 }
                }
            },
            'videos': {
                name: 'Video Content',
                geometry: 'sphere',
                modifiers: {
                    intensity: 1.3,
                    speed: 0.7,
                    colorShift: { h: -45, s: 10, l: 5 }
                }
            },
            'ema': {
                name: 'Philosophy Section',
                geometry: 'wave',
                modifiers: {
                    intensity: 1.1,
                    speed: 1.0,
                    colorShift: { h: 120, s: 15, l: -10 }
                }
            },
            'community': {
                name: 'Community Section',
                geometry: 'torus',
                modifiers: {
                    intensity: 0.6,
                    speed: 0.8,
                    colorShift: { h: 60, s: -10, l: 15 }
                }
            }
        };
        
        // PPP Variant System (3-4 per page)
        this.variantConfigs = {
            'primary': {
                name: 'Background Foundation',
                modifiers: { intensity: 1.0, speed: 1.0, opacity: 0.6, parameterModifier: 1.0 },
                layout: { top: '0%', left: '0%', width: '100%', height: '100%', zIndex: 1 }
            },
            'accent': {
                name: 'Interactive Highlight',
                modifiers: { intensity: 1.3, speed: 0.7, opacity: 0.8, parameterModifier: 1.3 },
                layout: { top: '10%', left: '15%', width: '70%', height: '80%', zIndex: 3 }
            },
            'subtle': {
                name: 'Ambient Atmosphere',
                modifiers: { intensity: 0.7, speed: 1.5, opacity: 0.3, parameterModifier: 0.7 },
                layout: { top: '-10%', left: '-10%', width: '120%', height: '120%', zIndex: 0 }
            },
            'focus': {
                name: 'Content Enhancement',
                modifiers: { intensity: 0.9, speed: 0.8, opacity: 0.5, parameterModifier: 0.9 },
                layout: { top: '20%', left: '20%', width: '60%', height: '60%', zIndex: 2 }
            }
        };
        
        this.pageManagers = new Map();
        this.isInitialized = false;
        
        this.init();
        
        console.log('🎛️ PPP Style System initialized with master-modifier architecture');
    }
    
    init() {
        this.setupGlobalInteractions();
        this.initializePages();
        this.startRenderLoop();
        
        // Initialize glassmorphic UI integration
        if (window.PPPGlassmorphicUI) {
            this.glassmorphicUI = new PPPGlassmorphicUI(this);
        }
        
        this.isInitialized = true;
        console.log('✅ PPP Style System ready!');
    }
    
    initializePages() {
        const sections = document.querySelectorAll('[data-section]');
        
        sections.forEach(section => {
            const sectionKey = section.getAttribute('data-section');
            const manager = new PPPPageManager(sectionKey, section, this);
            this.pageManagers.set(sectionKey, manager);
        });
        
        console.log(`📍 PPP: Created managers for ${this.pageManagers.size} sections`);
        
        // Setup viewport-aware loading
        this.setupViewportObserver();
        
        // Initial propagation
        this.propagateToAllPages();
    }
    
    setupViewportObserver() {
        // Intersection Observer for viewport-aware activation
        this.viewportObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionKey = entry.target.getAttribute('data-section');
                const manager = this.pageManagers.get(sectionKey);
                
                if (entry.isIntersecting) {
                    console.log(`👁️ Section ${sectionKey} entering viewport - activating visualizers`);
                    manager?.activateVisualizers();
                    
                    // Activate glassmorphic UI
                    if (this.glassmorphicUI) {
                        this.glassmorphicUI.activateSection(sectionKey);
                    }
                } else {
                    console.log(`👁️ Section ${sectionKey} leaving viewport - pausing visualizers`);
                    manager?.pauseVisualizers();
                    
                    // Deactivate glassmorphic UI
                    if (this.glassmorphicUI) {
                        this.glassmorphicUI.deactivateSection(sectionKey);
                    }
                }
            });
        }, {
            threshold: 0.1, // Activate when 10% visible
            rootMargin: '50px' // Start loading 50px before visible
        });
        
        // Observe all sections
        document.querySelectorAll('[data-section]').forEach(section => {
            this.viewportObserver.observe(section);
        });
        
        console.log('👁️ Viewport observer setup - visualizers load only when in view');
    }
    
    // ===== MASTER CONTROL METHODS =====
    updateMasterGeometry(geometry) {
        this.masterParameters.geometry = geometry;
        this.propagateToAllPages();
        console.log(`🔮 PPP: Master geometry changed to ${geometry}`);
    }
    
    updateMasterIntensity(intensity) {
        this.masterParameters.intensity = parseFloat(intensity);
        this.propagateToAllPages();
        console.log(`⚡ PPP: Master intensity changed to ${intensity}`);
    }
    
    updateMasterSpeed(speed) {
        this.masterParameters.speed = parseFloat(speed);
        this.propagateToAllPages();
        console.log(`🏃 PPP: Master speed changed to ${speed}`);
    }
    
    updateMasterColors(colors) {
        Object.assign(this.masterParameters.colorPalette, colors);
        this.propagateToAllPages();
        console.log('🎨 PPP: Master colors updated');
    }
    
    // Mathematical propagation to all pages
    propagateToAllPages() {
        this.pageManagers.forEach((manager, pageKey) => {
            const derivedParams = this.calculateDerivedParameters(pageKey);
            manager.updateFromMaster(derivedParams);
        });
    }
    
    calculateDerivedParameters(pageKey) {
        const relationship = this.pageRelationships[pageKey];
        if (!relationship) return this.masterParameters;
        
        const master = this.masterParameters;
        
        return {
            geometry: relationship.geometry === 'editor_selected' ? 
                      master.geometry : relationship.geometry,
            intensity: master.intensity * relationship.modifiers.intensity,
            speed: master.speed * relationship.modifiers.speed,
            colorPalette: this.calculateColorHarmony(master.colorPalette, relationship.modifiers.colorShift),
            complexity: master.complexity,
            mouseReactivity: master.mouseReactivity,
            scrollReactivity: master.scrollReactivity
        };
    }
    
    calculateColorHarmony(baseColors, shift) {
        // Convert hex to HSL, apply shift, convert back
        return {
            primary: this.shiftColor(baseColors.primary, shift),
            secondary: this.shiftColor(baseColors.secondary, shift),
            accent: this.shiftColor(baseColors.accent, shift)
        };
    }
    
    shiftColor(hexColor, shift) {
        // Simplified color shifting - in production would use full HSL conversion
        const variations = {
            30: '#ff6600',   // Warmer
            '-45': '#0066ff', // Cooler  
            120: '#00ff66',   // Green shift
            60: '#ffff00'     // Yellow shift
        };
        
        return variations[shift.h] || hexColor;
    }
    
    setupGlobalInteractions() {
        let lastScrollY = window.scrollY;
        let lastScrollTime = Date.now();
        let isHolding = false;
        let holdStartTime = 0;
        
        console.log('🎮 Setting up enhanced interaction system...');
        
        // Enhanced mouse tracking (EXACT from working demo)
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = 1.0 - (e.clientY / window.innerHeight);
            
            this.pageManagers.forEach(manager => {
                manager.visualizers.forEach(variant => {
                    if (variant.visualizer.updateInteractionState) {
                        variant.visualizer.updateInteractionState({
                            mouseX: mouseX,
                            mouseY: mouseY,
                            type: 'mouse',
                            lastActivity: Date.now()
                        });
                    }
                });
            });
        });
        
        // Enhanced scroll tracking with velocity calculation (EXACT from demo)
        window.addEventListener('scroll', () => {
            const currentTime = Date.now();
            const currentY = window.scrollY;
            const deltaY = Math.abs(currentY - lastScrollY);
            const deltaTime = currentTime - lastScrollTime;
            
            if (deltaTime > 0) {
                const scrollVelocity = deltaY / deltaTime * 100;
                const intensity = Math.min(scrollVelocity / 20, 1.0);
                
                this.pageManagers.forEach(manager => {
                    manager.visualizers.forEach(variant => {
                        if (variant.visualizer.updateInteractionState) {
                            variant.visualizer.updateInteractionState({
                                type: 'scroll',
                                scrollVelocity: scrollVelocity,
                                intensity: intensity,
                                lastActivity: currentTime
                            });
                        }
                    });
                });
            }
            
            lastScrollY = currentY;
            lastScrollTime = currentTime;
        });
        
        // Click/Hold interactions (EXACT from demo)
        const startHold = (e) => {
            isHolding = true;
            holdStartTime = Date.now();
            
            this.pageManagers.forEach(manager => {
                manager.visualizers.forEach(variant => {
                    if (variant.visualizer.updateInteractionState) {
                        variant.visualizer.updateInteractionState({
                            type: 'hold',
                            isHolding: true,
                            holdStart: holdStartTime,
                            intensity: 1.0,
                            lastActivity: Date.now()
                        });
                    }
                });
            });
            
            console.log('🖱️ Hold interaction started');
        };
        
        const endHold = () => {
            isHolding = false;
            
            this.pageManagers.forEach(manager => {
                manager.visualizers.forEach(variant => {
                    if (variant.visualizer.updateInteractionState) {
                        variant.visualizer.updateInteractionState({
                            type: 'release',
                            isHolding: false,
                            intensity: 0.1,
                            lastActivity: Date.now()
                        });
                    }
                });
            });
            
            console.log('🖱️ Hold interaction ended');
        };
        
        // Mouse and touch event handlers
        document.addEventListener('mousedown', startHold);
        document.addEventListener('mouseup', endHold);
        document.addEventListener('touchstart', startHold, { passive: false });
        document.addEventListener('touchend', endHold);
        
        // Click events (separate from hold)
        document.addEventListener('click', (e) => {
            this.pageManagers.forEach(manager => {
                manager.visualizers.forEach(variant => {
                    if (variant.visualizer.updateInteractionState) {
                        variant.visualizer.updateInteractionState({
                            type: 'click',
                            intensity: 0.8,
                            lastActivity: Date.now()
                        });
                    }
                });
            });
        });
        
        // Inactivity detection (EXACT from demo)
        setInterval(() => {
            const currentTime = Date.now();
            
            this.pageManagers.forEach(manager => {
                manager.visualizers.forEach(variant => {
                    if (variant.visualizer.interactionState) {
                        const timeSinceActivity = currentTime - variant.visualizer.interactionState.lastActivity;
                        
                        if (timeSinceActivity > 3000) { // 3 seconds of inactivity
                            variant.visualizer.updateInteractionState({
                                type: 'idle',
                                intensity: 0.0
                            });
                        }
                    }
                });
            });
        }, 1000);
        
        // Keyboard interactions for enhanced control
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.pageManagers.forEach(manager => {
                    manager.visualizers.forEach(variant => {
                        if (variant.visualizer.updateInteractionState) {
                            variant.visualizer.updateInteractionState({
                                type: 'key_pulse',
                                intensity: 0.9,
                                lastActivity: Date.now()
                            });
                        }
                    });
                });
            }
        });
        
        console.log('✅ Enhanced interaction system ready: mouse, scroll, click, hold, idle, keyboard');
    }
    
    startRenderLoop() {
        const renderLoop = () => {
            if (this.isInitialized) {
                this.pageManagers.forEach(manager => {
                    manager.render();
                });
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop();
    }
    
    // PPP Editor Interface Methods
    randomizeForNewIssue() {
        const geometries = ['hypercube', 'tetrahedron', 'sphere', 'torus', 'wave'];
        const randomGeometry = geometries[Math.floor(Math.random() * geometries.length)];
        const randomIntensity = 0.8 + Math.random() * 0.4;
        const randomSpeed = 0.7 + Math.random() * 0.6;
        
        this.updateMasterGeometry(randomGeometry);
        this.updateMasterIntensity(randomIntensity);
        this.updateMasterSpeed(randomSpeed);
        
        console.log('🎲 PPP: Randomized for new issue!');
    }
}

// ===== PPP PAGE MANAGER (Multi-Visualizer Per Page) =====
class PPPPageManager {
    constructor(pageKey, sectionElement, masterController) {
        this.pageKey = pageKey;
        this.section = sectionElement;
        this.master = masterController;
        this.baseParameters = null;
        this.visualizers = [];
        
        this.setupVisualizerVariants();
        
        console.log(`📄 PPP Page Manager created for ${pageKey}`);
    }
    
    setupVisualizerVariants() {
        // Create container for all visualizers
        const container = document.createElement('div');
        container.className = 'ppp-visualizer-container';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        this.section.insertBefore(container, this.section.firstChild);
        
        // Create 2 visualizer variants per page (reduced for WebGL context limits)
        const selectedVariants = ['primary', 'accent']; // Reduced from 4 to 2
        selectedVariants.forEach(variantKey => {
            const config = this.master.variantConfigs[variantKey];
            const canvas = document.createElement('canvas');
            canvas.className = `ppp-visualizer-${variantKey}`;
            
            // Apply variant layout
            canvas.style.cssText = `
                position: absolute;
                top: ${config.layout.top};
                left: ${config.layout.left};
                width: ${config.layout.width};
                height: ${config.layout.height};
                z-index: ${config.layout.zIndex};
                opacity: ${config.modifiers.opacity};
                mix-blend-mode: screen;
                pointer-events: none;
            `;
            
            container.appendChild(canvas);
            
            // Set canvas size explicitly
            const rect = this.section.getBoundingClientRect();
            canvas.width = rect.width || 800;
            canvas.height = rect.height || 600;
            
            console.log(`🖼️ Canvas created for ${this.pageKey}-${variantKey}: ${canvas.width}x${canvas.height}`);
            
            // Create PPP 4D Reactive Core instance (EXACT from working demo)
            const visualizer = new PPP4DReactiveCore(canvas, {
                instanceId: `${this.pageKey}-${variantKey}`,
                variant: variantKey,
                geometry: this.master.pageRelationships[this.pageKey]?.geometry || 'hypercube',
                parameterModifier: config.modifiers.parameterModifier
            });
            
            if (visualizer.gl) {
                console.log(`✅ 4D Reactive Core created for ${this.pageKey}-${variantKey}`);
                visualizer.start();
            } else {
                console.error(`❌ 4D Core WebGL failed for ${this.pageKey}-${variantKey}`);
            }
            
            this.visualizers.push({
                key: variantKey,
                config: config,
                visualizer: visualizer,
                canvas: canvas
            });
        });
        
        console.log(`✨ Created ${this.visualizers.length} visualizer variants for ${this.pageKey}`);
        
        // Start paused - only activate when in viewport
        this.isActive = false;
        this.pauseVisualizers();
    }
    
    activateVisualizers() {
        this.isActive = true;
        this.visualizers.forEach(variant => {
            if (variant.visualizer && variant.visualizer.start) {
                variant.visualizer.start();
            }
        });
        console.log(`🎬 Activated ${this.visualizers.length} visualizers for ${this.pageKey}`);
    }
    
    pauseVisualizers() {
        this.isActive = false;
        this.visualizers.forEach(variant => {
            if (variant.visualizer && variant.visualizer.pause) {
                variant.visualizer.pause();
            }
        });
        console.log(`⏸️ Paused visualizers for ${this.pageKey}`);
    }
    
    updateFromMaster(newBaseParameters) {
        this.baseParameters = newBaseParameters;
        
        // Apply base parameters to all variants with their modifiers
        this.visualizers.forEach(variant => {
            // Update 4D Reactive Core theme
            if (variant.visualizer.updateTheme) {
                variant.visualizer.updateTheme(newBaseParameters.geometry);
            }
            
            // Update interaction parameters
            if (variant.visualizer.updateInteractionState) {
                variant.visualizer.updateInteractionState({
                    intensity: (newBaseParameters.intensity || 1.0) * variant.config.modifiers.intensity
                });
            }
        });
    }
    
    applyVariantModifiers(baseParams, modifiers) {
        return {
            geometry: baseParams.geometry,
            intensity: baseParams.intensity * modifiers.intensity,
            speed: baseParams.speed * modifiers.speed,
            colorPalette: baseParams.colorPalette,
            complexity: baseParams.complexity,
            parameterModifier: modifiers.parameterModifier,
            opacity: modifiers.opacity
        };
    }
    
    updateGlobalInteraction(interaction) {
        this.visualizers.forEach(variant => {
            variant.visualizer.updateInteractionState(interaction);
        });
    }
    
    render() {
        if (!this.isActive) return;
        
        this.visualizers.forEach(variant => {
            variant.visualizer.render();
            
            // Send visualizer data to glassmorphic UI
            if (this.master.glassmorphicUI && variant.visualizer.params) {
                const visualizerData = {
                    dimension: variant.visualizer.params.dimension,
                    gridDensity: variant.visualizer.params.gridDensity,
                    interactionType: variant.visualizer.interactionState?.type || 'idle',
                    intensity: variant.visualizer.interactionState?.intensity || 0,
                    geometry: variant.visualizer.currentTheme,
                    time: (Date.now() - variant.visualizer.startTime) / 1000
                };
                
                this.master.glassmorphicUI.updateVisualizerData(this.pageKey, visualizerData);
            }
        });
    }
}

// ===== PPP SYSTEM INITIALIZATION =====
function initializePPPStyleSystem() {
    console.log('🎬 PPP SYSTEM INITIALIZATION STARTING...');
    console.log('📍 DOM Ready State:', document.readyState);
    console.log('🔍 Available sections:', document.querySelectorAll('[data-section]').length);
    
    // Create global PPP Style System
    window.pppStyleSystem = new PPPStyleSystem({
        geometry: 'hypercube',
        intensity: 1.2,
        speed: 1.0,
        colorPalette: {
            primary: '#ff00ff',
            secondary: '#00ffff',
            accent: '#ffff00'
        }
    });
    
    // Global control functions for editor interface
    window.updatePPPGeometry = (geometry) => window.pppStyleSystem.updateMasterGeometry(geometry);
    window.updatePPPIntensity = (intensity) => window.pppStyleSystem.updateMasterIntensity(intensity);
    window.updatePPPSpeed = (speed) => window.pppStyleSystem.updateMasterSpeed(speed);
    window.updatePPPColors = (colors) => window.pppStyleSystem.updateMasterColors(colors);
    window.randomizePPP = () => window.pppStyleSystem.randomizeForNewIssue();
    
    console.log('🚀 PPP Style System - VIB3CODE Pilot Project READY!');
    console.log('📊 Active Managers:', window.pppStyleSystem.pageManagers.size);
    console.log('🎨 Total Visualizers:', Array.from(window.pppStyleSystem.pageManagers.values()).reduce((total, manager) => total + manager.visualizers.length, 0));
    
    // Emit ready event
    window.dispatchEvent(new CustomEvent('ppp-style-ready', {
        detail: { system: window.pppStyleSystem }
    }));
    
    // Force hide loading overlay
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            console.log('🎨 Loading overlay hidden');
        }
    }, 1000);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePPPStyleSystem);
} else {
    initializePPPStyleSystem();
}