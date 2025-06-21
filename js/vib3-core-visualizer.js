/**
 * VIB3CODE Core Visualizer - Extracted from Working Demo
 * Production-ready single visualizer instance for multi-instance deployment
 */

class VIB3CoreVisualizer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported for visualizer instance');
            return;
        }
        
        // Core state
        this.startTime = Date.now();
        this.instanceId = options.instanceId || 'default';
        this.parameterModifier = options.parameterModifier || 1.0;
        this.geometry = options.geometry || 'hypercube';
        
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
        
        // Base theme configurations (from working demo)
        this.geometryConfigs = {
            hypercube: {
                baseColor: [1.0, 0.0, 1.0],
                gridDensity: 12.0,
                morphFactor: 0.5,
                dimension: 3.5,
                glitchIntensity: 0.3,
                rotationSpeed: 0.5,
                geometryIndex: 0
            },
            tetrahedron: {
                baseColor: [0.0, 1.0, 1.0],
                gridDensity: 8.0,
                morphFactor: 0.7,
                dimension: 3.2,
                glitchIntensity: 0.2,
                rotationSpeed: 0.7,
                geometryIndex: 1
            },
            sphere: {
                baseColor: [1.0, 1.0, 0.0],
                gridDensity: 15.0,
                morphFactor: 0.3,
                dimension: 3.8,
                glitchIntensity: 0.1,
                rotationSpeed: 0.3,
                geometryIndex: 2
            },
            torus: {
                baseColor: [0.0, 1.0, 0.0],
                gridDensity: 10.0,
                morphFactor: 0.8,
                dimension: 3.6,
                glitchIntensity: 0.4,
                rotationSpeed: 0.6,
                geometryIndex: 3
            },
            wave: {
                baseColor: [1.0, 0.0, 0.5],
                gridDensity: 16.0,
                morphFactor: 0.4,
                dimension: 3.3,
                glitchIntensity: 0.3,
                rotationSpeed: 0.9,
                geometryIndex: 6
            }
        };
        
        // Apply parameter modifier to base config
        this.baseParams = this.applyParameterModifier(this.geometryConfigs[this.geometry]);
        this.params = { ...this.baseParams };
        
        this.initShaders();
        this.initBuffers();
        this.resize();
        
        console.log(`✅ VIB3CoreVisualizer [${this.instanceId}] initialized with ${this.geometry} geometry`);
    }
    
    applyParameterModifier(config) {
        const modified = { ...config };
        
        // Apply parameter variations for multi-instance diversity
        modified.gridDensity *= this.parameterModifier;
        modified.rotationSpeed *= this.parameterModifier;
        modified.morphFactor *= (0.8 + this.parameterModifier * 0.4); // Keep in reasonable range
        
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
        
        // Enhanced fragment shader from working demo
        const fragmentShaderSource = `
            precision highp float;
            
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
            
            // 4D rotation matrices
            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c);
            }
            
            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, c, 0, -s, 0, 0, 1, 0, 0, s, 0, c);
            }
            
            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, c, -s, 0, 0, s, c);
            }
            
            vec3 project4Dto3D(vec4 p) {
                float w = 2.0 / (2.0 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
            
            // Geometry generators
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
                
                // Apply 4D transformations
                if (u_dimension > 3.0) {
                    float w = sin(length(p) * 3.0 + u_time * 0.3) * (u_dimension - 3.0) * (1.0 + u_interactionIntensity * 0.5);
                    vec4 p4d = vec4(p, w);
                    
                    p4d = rotateXW(timeRotation * 0.31) * p4d;
                    p4d = rotateYW(timeRotation * 0.27) * p4d;
                    p4d = rotateZW(timeRotation * 0.23) * p4d;
                    
                    p = project4Dto3D(p4d);
                }
                
                // Dynamic grid density
                float dynamicGridDensity = u_gridDensity * (1.0 + u_interactionIntensity * 0.3);
                
                // Get geometry value
                float lattice = getGeometryValue(p, dynamicGridDensity, u_geometry);
                
                // Glitch effects
                float glitchAmount = u_glitchIntensity * (0.1 + 0.1 * sin(u_time * 5.0)) * (1.0 + u_interactionIntensity);
                
                vec2 rOffset = vec2(glitchAmount, glitchAmount * 0.5);
                vec2 gOffset = vec2(-glitchAmount * 0.3, glitchAmount * 0.2);
                vec2 bOffset = vec2(glitchAmount * 0.1, -glitchAmount * 0.4);
                
                float r = getGeometryValue(vec3(p.xy + rOffset, p.z), dynamicGridDensity, u_geometry);
                float g = getGeometryValue(vec3(p.xy + gOffset, p.z), dynamicGridDensity, u_geometry);
                float b = getGeometryValue(vec3(p.xy + bOffset, p.z), dynamicGridDensity, u_geometry);
                
                // Base colors with theme-specific tinting
                vec3 baseColor = vec3(0.02, 0.05, 0.1);
                vec3 latticeColor = u_baseColor * (0.8 + 0.2 * u_interactionIntensity);
                
                vec3 color = mix(baseColor, latticeColor, vec3(r, g, b));
                
                // Interaction-responsive glow
                color += u_baseColor * 0.1 * (0.5 + 0.5 * sin(u_time * 0.5)) * u_interactionIntensity;
                
                // Vignette
                float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - vec2(center.x, center.y)));
                color *= vignette;
                
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
    
    updateFromMaster(masterParams) {
        // Apply master parameters with this instance's modifier
        Object.keys(masterParams).forEach(key => {
            if (key === 'baseColor') {
                this.params[key] = [...masterParams[key]];
            } else if (typeof masterParams[key] === 'number') {
                this.params[key] = masterParams[key] * this.parameterModifier;
            } else {
                this.params[key] = masterParams[key];
            }
        });
    }
    
    updateInteractionState(type, intensity, mouseX = 0.5, mouseY = 0.5) {
        this.interactionState.type = type;
        this.interactionState.intensity = Math.max(this.interactionState.intensity * 0.9, intensity);
        this.interactionState.mouseX = mouseX;
        this.interactionState.mouseY = mouseY;
        this.interactionState.lastActivity = Date.now();
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
        
        // Handle hold interactions (dimensional shift)
        let holdEffect = 0;
        if (this.interactionState.isHolding) {
            const holdDuration = Date.now() - this.interactionState.holdStart;
            holdEffect = Math.min(holdDuration / 2000, 1.0);
        }
        const currentDimension = this.params.dimension + holdEffect * 0.5;
        
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0); // Transparent background for layering
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
        this.gl.uniform1f(this.uniforms.dimension, currentDimension);
        this.gl.uniform1f(this.uniforms.gridDensity, currentGridDensity);
        this.gl.uniform3fv(this.uniforms.baseColor, this.params.baseColor);
        this.gl.uniform1f(this.uniforms.interactionIntensity, this.interactionState.intensity);
        this.gl.uniform1f(this.uniforms.geometry, this.params.geometryIndex);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        // Decay interaction intensity
        this.interactionState.intensity *= 0.98;
    }
    
    setGeometry(geometryName) {
        if (this.geometryConfigs[geometryName]) {
            this.geometry = geometryName;
            this.baseParams = this.applyParameterModifier(this.geometryConfigs[geometryName]);
            
            // Smooth transition to new geometry
            const targetParams = { ...this.baseParams };
            this.transitionToParams(targetParams, 1000);
        }
    }
    
    transitionToParams(targetParams, duration = 1000) {
        const startParams = { ...this.params };
        const startTime = Date.now();
        
        const transition = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);
            const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
            
            Object.keys(targetParams).forEach(key => {
                if (typeof targetParams[key] === 'number') {
                    this.params[key] = startParams[key] + (targetParams[key] - startParams[key]) * eased;
                } else if (Array.isArray(targetParams[key])) {
                    this.params[key] = startParams[key].map((val, i) => 
                        val + (targetParams[key][i] - val) * eased
                    );
                } else {
                    this.params[key] = targetParams[key];
                }
            });
            
            if (progress < 1.0) {
                requestAnimationFrame(transition);
            }
        };
        
        transition();
    }
    
    destroy() {
        if (this.program) {
            this.gl.deleteProgram(this.program);
        }
        if (this.positionBuffer) {
            this.gl.deleteBuffer(this.positionBuffer);
        }
        console.log(`🗑️ VIB3CoreVisualizer [${this.instanceId}] destroyed`);
    }
}

export { VIB3CoreVisualizer };