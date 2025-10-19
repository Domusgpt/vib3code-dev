import {
  type RendererAdapter,
  type RendererAdapterOptions,
  type WarpParams
} from "./adapter.js";
import { getGeometryDefinition, type GeometryDefinition } from "./geometry.js";
import {
  clamp,
  composeRotationMatrix,
  createIdentityMatrix4,
  defaultRotationSpeeds,
  easeInOutCubic,
  project4Dto3D
} from "./math4d.js";
import type { Matrix4 } from "./math4d.js";
import { nextHigherTier, nextLowerTier, qualityTierToStride } from "./quality.js";
import type { FrameStats, QualityTier, RendererHandle, Vec3, Vec4 } from "./types.js";

export interface RendererAppearance {
  readonly lineColor: readonly [number, number, number, number];
  readonly backgroundColor: readonly [number, number, number, number];
}

export interface GeometryTransition {
  readonly fromGeometry?: string;
  readonly toGeometry: string;
  readonly durationMs: number;
  readonly intensity: number;
  readonly easing?: (t: number) => number;
}

export interface VIB34DRendererOptions {
  readonly geometryKey?: string;
  readonly scale?: number;
  readonly rotationMultiplier?: number;
  readonly appearance?: RendererAppearance;
  readonly adapterOptions?: RendererAdapterOptions;
  readonly targetFrameTime?: number;
  readonly qualityTier?: QualityTier;
  readonly onFrameStats?: (stats: FrameStats, meta: { quality: QualityTier; reducedMotion: boolean }) => void;
  readonly reducedMotion?: boolean;
  readonly autoQuality?: boolean;
}

const vertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec3 position;
uniform mat4 u_projection;

void main() {
  gl_Position = u_projection * vec4(position, 1.0);
}`;

const fragmentShader = `#version 300 es
precision highp float;

out vec4 outColor;
uniform vec4 u_color;

void main() {
  outColor = u_color;
}`;

export class VIB34DRenderer {
  private readonly adapter: RendererAdapter;
  private readonly options: VIB34DRendererOptions;
  private handle?: RendererHandle;
  private gl?: WebGL2RenderingContext;
  private program?: WebGLProgram;
  private vao?: WebGLVertexArrayObject;
  private positionBuffer?: WebGLBuffer;
  private projectionLocation: WebGLUniformLocation | null = null;
  private colorLocation: WebGLUniformLocation | null = null;
  private vertices = new Float32Array(16 * 4);
  private previousVertices = new Float32Array(16 * 4);
  private targetVertices = new Float32Array(16 * 4);
  private rotatedVertices = new Float32Array(16 * 4);
  private linePositions = new Float32Array(32 * 2 * 3);
  private lineBufferSize = this.linePositions.length;
  private readonly rotationAngles = { ...defaultRotationSpeeds };
  private elapsed = 0;
  private morphStart = 0;
  private morphDuration = 0;
  private morphActive = false;
  private morphEasing: (t: number) => number = easeInOutCubic;
  private edges: Array<[number, number]> = [];
  private activeEdges: Array<[number, number]> = [];
  private drawVertexCount = 0;
  private readonly fov = 1.3;
  private readonly near = 0.1;
  private readonly far = 20;
  private projectionMatrix = createProjectionMatrix(this.fov, this.near, this.far, 16 / 9);
  private speedMultiplier: number;
  private scale: number;
  private geometryKey: string;
  private appearance: RendererAppearance;
  private qualityTier: QualityTier;
  private readonly targetFrameTime: number;
  private frameTimeAccumulator = 0;
  private frameSampleCount = 0;
  private statsEmissionCounter = 0;
  private readonly autoQuality: boolean;
  private reducedMotion: boolean;
  private readonly polytopeWarp?: (point: Vec4, params: WarpParams) => Vec4;
  private warpAnchor: Vec4 = [0, 0, 0, 0];
  private warpIntensity = 0;

  constructor(adapter: RendererAdapter, options: VIB34DRendererOptions = {}) {
    this.adapter = adapter;
    this.options = options;
    this.geometryKey = options.geometryKey ?? "hypercube";
    this.speedMultiplier = options.rotationMultiplier ?? 1;
    this.scale = options.scale ?? 1;
    this.appearance = options.appearance ?? {
      lineColor: [0.82, 0.97, 1, 0.92],
      backgroundColor: [0.04, 0.05, 0.08, 1]
    };
    this.qualityTier = options.qualityTier ?? "high";
    this.targetFrameTime = options.targetFrameTime ?? 16.7;
    this.autoQuality = options.autoQuality ?? true;
    this.reducedMotion = options.reducedMotion ?? false;
    this.polytopeWarp = this.adapter.math.polytopeWarp;
    this.applyGeometry(getGeometryDefinition(this.geometryKey), true);
  }

  async attach(canvas: HTMLCanvasElement): Promise<void> {
    this.handle = await this.adapter.init(canvas, this.options.adapterOptions ?? {});
    const context = this.handle.context;
    if (!(context instanceof WebGL2RenderingContext)) {
      throw new Error("Quaternion adapter returned a non-WebGL2 context");
    }
    this.gl = context;
    this.setupContext();
    const dpr = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
    const width = Math.max(1, Math.floor((canvas.clientWidth || canvas.width || 1) * dpr));
    const height = Math.max(1, Math.floor((canvas.clientHeight || canvas.height || 1) * dpr));
    this.resize(width, height);
    this.adapter.onFrame(this.handle, (delta, stats) => this.render(delta, stats));
  }

  resize(width: number, height: number): void {
    if (!this.gl || !this.handle) return;
    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));
    this.handle.canvas.width = safeWidth;
    this.handle.canvas.height = safeHeight;
    this.gl.viewport(0, 0, safeWidth, safeHeight);
    this.updateProjectionMatrix(safeWidth, safeHeight);
  }

  applyTransition(transition: GeometryTransition): void {
    const targetKey = transition.toGeometry;
    const targetDefinition = getGeometryDefinition(targetKey);
    const fromDefinition = transition.fromGeometry ? getGeometryDefinition(transition.fromGeometry) : undefined;
    if (fromDefinition) {
      this.applyGeometry(fromDefinition, true);
    }
    this.applyGeometry(targetDefinition, false, {
      durationMs: transition.durationMs,
      intensity: transition.intensity,
      easing: transition.easing
    });
    this.geometryKey = targetKey;
  }

  setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  setScale(scale: number): void {
    if (!Number.isFinite(scale) || scale <= 0) {
      return;
    }
    this.scale = scale;
  }

  setAppearance(appearance: Partial<RendererAppearance>): void {
    this.appearance = { ...this.appearance, ...appearance };
  }

  setQualityTier(tier: QualityTier): void {
    if (this.qualityTier === tier) return;
    this.qualityTier = tier;
    this.updateActiveEdges();
  }

  getQualityTier(): QualityTier {
    return this.qualityTier;
  }

  setReducedMotion(enabled: boolean): void {
    if (this.reducedMotion === enabled) return;
    this.reducedMotion = enabled;
    if (enabled) {
      this.morphActive = false;
      this.applyGeometry(getGeometryDefinition(this.geometryKey), true);
      this.warpIntensity = 0;
    }
  }

  isReducedMotion(): boolean {
    return this.reducedMotion;
  }

  pause(): void {
    if (this.handle) {
      this.adapter.dispose(this.handle);
    }
    this.handle = undefined;
    this.warpIntensity = 0;
  }

  setWarpIntensity(intensity: number): void {
    if (!this.polytopeWarp) {
      return;
    }
    const value = Number.isFinite(intensity) ? intensity : 0;
    this.warpIntensity = clamp(value, 0, 1);
  }

  setWarpAnchor(anchor: Vec4): void {
    if (!this.polytopeWarp) {
      return;
    }
    this.warpAnchor = sanitizeVec4(anchor);
  }

  private setupContext(): void {
    if (!this.gl) return;
    const gl = this.gl;
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    this.program = program;

    this.projectionLocation = gl.getUniformLocation(program, "u_projection");
    this.colorLocation = gl.getUniformLocation(program, "u_color");

    this.vao = gl.createVertexArray() ?? undefined;
    gl.bindVertexArray(this.vao);

    this.positionBuffer = gl.createBuffer() ?? undefined;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.linePositions, gl.DYNAMIC_DRAW);
    this.lineBufferSize = this.linePositions.length;

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(
      this.appearance.backgroundColor[0],
      this.appearance.backgroundColor[1],
      this.appearance.backgroundColor[2],
      this.appearance.backgroundColor[3]
    );
  }

  private render(deltaMs: number, stats: FrameStats): void {
    if (!this.gl || !this.program || !this.handle) return;
    const gl = this.gl;
    const delta = this.reducedMotion ? 0 : deltaMs;
    this.elapsed += delta;
    gl.viewport(0, 0, this.handle.canvas.width, this.handle.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this.autoQuality) {
      this.samplePerformance(stats);
    }

    if (this.options.onFrameStats) {
      this.statsEmissionCounter += 1;
      if (this.statsEmissionCounter >= 15) {
        this.options.onFrameStats(stats, { quality: this.qualityTier, reducedMotion: this.reducedMotion });
        this.statsEmissionCounter = 0;
      }
    }

    const easedProgress = this.computeMorphProgress();
    if (this.morphActive && easedProgress >= 1) {
      this.vertices.set(this.targetVertices);
      this.morphActive = false;
    }

    const rotationMatrix = this.reducedMotion
      ? createIdentityMatrix4()
      : composeRotationMatrix({
          xy: this.rotationAngles.xy * this.speedMultiplier * this.elapsed,
          xz: this.rotationAngles.xz * this.speedMultiplier * this.elapsed,
          xw: this.rotationAngles.xw * this.speedMultiplier * this.elapsed,
          yz: this.rotationAngles.yz * this.speedMultiplier * this.elapsed,
          yw: this.rotationAngles.yw * this.speedMultiplier * this.elapsed,
          zw: this.rotationAngles.zw * this.speedMultiplier * this.elapsed
        });

    const currentVertices = this.morphActive ? this.previousVertices : this.vertices;
    const targetVertices = this.morphActive ? this.targetVertices : this.vertices;
    const mixT = this.morphActive ? easedProgress : 1;

    for (let i = 0; i < currentVertices.length; i += 4) {
      const fromX = currentVertices[i];
      const fromY = currentVertices[i + 1];
      const fromZ = currentVertices[i + 2];
      const fromW = currentVertices[i + 3];
      const toX = targetVertices[i];
      const toY = targetVertices[i + 1];
      const toZ = targetVertices[i + 2];
      const toW = targetVertices[i + 3];
      this.rotatedVertices[i] = fromX + (toX - fromX) * mixT;
      this.rotatedVertices[i + 1] = fromY + (toY - fromY) * mixT;
      this.rotatedVertices[i + 2] = fromZ + (toZ - fromZ) * mixT;
      this.rotatedVertices[i + 3] = fromW + (toW - fromW) * mixT;
    }

    const positions3D = this.buildLinePositions(rotationMatrix);
    if (!positions3D.length || this.drawVertexCount === 0) {
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer ?? null);
    if (this.linePositions.length !== this.lineBufferSize) {
      gl.bufferData(gl.ARRAY_BUFFER, this.linePositions, gl.DYNAMIC_DRAW);
      this.lineBufferSize = this.linePositions.length;
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions3D);
    }

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao ?? null);
    if (this.projectionLocation) {
      gl.uniformMatrix4fv(this.projectionLocation, false, this.projectionMatrix);
    }
    const alpha = clamp(0.6 + stats.averageFrameTime / 160, 0.55, 0.9);
    if (this.colorLocation) {
      gl.uniform4f(
        this.colorLocation,
        this.appearance.lineColor[0],
        this.appearance.lineColor[1],
        this.appearance.lineColor[2],
        this.appearance.lineColor[3] * alpha
      );
    }
    gl.drawArrays(gl.LINES, 0, this.drawVertexCount);
  }

  private updateProjectionMatrix(width: number, height: number): void {
    const aspect = height <= 0 ? 1 : width / height;
    this.projectionMatrix = createProjectionMatrix(this.fov, this.near, this.far, aspect);
  }

  private buildLinePositions(rotationMatrix: Matrix4): Float32Array {
    const positions = this.linePositions;
    if (!positions.length) {
      return positions;
    }
    const scale = this.scale;
    let offset = 0;
    for (const [startIndex, endIndex] of this.activeEdges) {
      const startRotated = applyRotation(rotationMatrix, this.getVertex(startIndex));
      const endRotated = applyRotation(rotationMatrix, this.getVertex(endIndex));
      const startWarped = this.applyWarp(startRotated);
      const endWarped = this.applyWarp(endRotated);
      const start = project4Dto3D(startWarped);
      const end = project4Dto3D(endWarped);
      const scaledStart = scaleVec(start, scale);
      const scaledEnd = scaleVec(end, scale);
      positions[offset++] = scaledStart[0];
      positions[offset++] = scaledStart[1];
      positions[offset++] = scaledStart[2];
      positions[offset++] = scaledEnd[0];
      positions[offset++] = scaledEnd[1];
      positions[offset++] = scaledEnd[2];
    }
    return positions;
  }

  private getVertex(index: number): Vec4 {
    const baseIndex = index * 4;
    return [
      this.rotatedVertices[baseIndex],
      this.rotatedVertices[baseIndex + 1],
      this.rotatedVertices[baseIndex + 2],
      this.rotatedVertices[baseIndex + 3]
    ] as Vec4;
  }

  private applyWarp(vertex: Vec4): Vec4 {
    if (!this.polytopeWarp || this.reducedMotion || this.warpIntensity <= 0) {
      return vertex;
    }
    const params: WarpParams = {
      iterations: Math.max(1, Math.round(1 + this.warpIntensity * 5)),
      tension: 0.15 + this.warpIntensity * 2.1,
      anchor: this.warpAnchor
    };
    const warped = sanitizeVec4(this.polytopeWarp(vertex, params));
    return mixVec4(vertex, warped, this.warpIntensity);
  }

  private computeMorphProgress(): number {
    if (this.reducedMotion) return 1;
    if (!this.morphActive || this.morphDuration <= 0) return 1;
    const elapsed = this.elapsed - this.morphStart;
    const t = clamp(elapsed / this.morphDuration, 0, 1);
    return this.morphEasing(t);
  }

  private applyGeometry(definition: GeometryDefinition, immediate: boolean, options?: { durationMs: number; intensity: number; easing?: (t: number) => number }): void {
    this.edges = definition.edges.map((edge) => [edge[0], edge[1]]);
    this.updateActiveEdges();
    const instant = immediate || this.reducedMotion;
    if (instant) {
      const flattened = flattenVertices(definition.vertices);
      if (flattened.length !== this.vertices.length) {
        this.vertices = new Float32Array(flattened.length);
        this.previousVertices = new Float32Array(flattened.length);
        this.targetVertices = new Float32Array(flattened.length);
        this.rotatedVertices = new Float32Array(flattened.length);
      }
      this.vertices.set(flattened);
      this.previousVertices.set(flattened);
      this.targetVertices.set(flattened);
      this.rotatedVertices.set(flattened);
      this.morphActive = false;
      return;
    }
    this.previousVertices.set(this.vertices);
    const target = flattenVertices(definition.vertices);
    this.targetVertices.set(target);
    this.morphDuration = options?.durationMs ?? 1200;
    const intensity = clamp(options?.intensity ?? 1, 0, 1);
    this.morphDuration *= intensity <= 0.3 ? 0.65 : intensity >= 0.9 ? 1.4 : 1;
    this.morphStart = this.elapsed;
    this.morphActive = true;
    this.morphEasing = options?.easing ?? easeInOutCubic;
  }

  private updateActiveEdges(): void {
    if (!this.edges.length) {
      this.activeEdges = [];
      this.drawVertexCount = 0;
      this.linePositions = new Float32Array(0);
      this.lineBufferSize = 0;
      return;
    }
    const stride = qualityTierToStride(this.qualityTier);
    const filtered: Array<[number, number]> = [];
    for (let i = 0; i < this.edges.length; i += stride) {
      filtered.push(this.edges[i]);
    }
    if (!filtered.length) {
      filtered.push(this.edges[0]);
    }
    this.activeEdges = filtered;
    this.drawVertexCount = this.activeEdges.length * 2;
    this.linePositions = new Float32Array(this.activeEdges.length * 2 * 3);
    this.lineBufferSize = 0;
  }

  private samplePerformance(stats: FrameStats): void {
    this.frameTimeAccumulator += stats.averageFrameTime;
    this.frameSampleCount += 1;
    if (this.frameSampleCount < 30) {
      return;
    }
    const average = this.frameTimeAccumulator / this.frameSampleCount;
    let nextTier = this.qualityTier;
    if (average > this.targetFrameTime * 1.25) {
      nextTier = nextLowerTier(this.qualityTier);
    } else if (average < this.targetFrameTime * 0.85) {
      nextTier = nextHigherTier(this.qualityTier);
    }
    if (nextTier !== this.qualityTier) {
      this.qualityTier = nextTier;
      this.updateActiveEdges();
    }
    this.frameTimeAccumulator = 0;
    this.frameSampleCount = 0;
  }
}

function createProjectionMatrix(fov: number, near: number, far: number, aspect: number): Float32Array {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const f = 1.0 / Math.tan(fov / 2);
  return new Float32Array([
    f / safeAspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0
  ]);
}

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create WebGL program");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown program error";
    throw new Error(`Failed to link program: ${message}`);
  }
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader compilation error";
    throw new Error(`Failed to compile shader: ${message}`);
  }
  return shader;
}

function flattenVertices(vertices: readonly (readonly [number, number, number, number])[]): Float32Array {
  const flattened = new Float32Array(vertices.length * 4);
  let offset = 0;
  for (const vertex of vertices) {
    flattened[offset++] = vertex[0];
    flattened[offset++] = vertex[1];
    flattened[offset++] = vertex[2];
    flattened[offset++] = vertex[3];
  }
  return flattened;
}

function applyRotation(matrix: Matrix4, vertex: readonly [number, number, number, number]): readonly [number, number, number, number] {
  const x = matrix[0] * vertex[0] + matrix[1] * vertex[1] + matrix[2] * vertex[2] + matrix[3] * vertex[3];
  const y = matrix[4] * vertex[0] + matrix[5] * vertex[1] + matrix[6] * vertex[2] + matrix[7] * vertex[3];
  const z = matrix[8] * vertex[0] + matrix[9] * vertex[1] + matrix[10] * vertex[2] + matrix[11] * vertex[3];
  const w = matrix[12] * vertex[0] + matrix[13] * vertex[1] + matrix[14] * vertex[2] + matrix[15] * vertex[3];
  return [x, y, z, w] as const;
}

function scaleVec(vector: Vec3, scale = 1): Vec3 {
  return [vector[0] * scale, vector[1] * scale, vector[2] * scale];
}

function mixVec4(a: Vec4, b: Vec4, t: number): Vec4 {
  const clamped = clamp(t, 0, 1);
  return [
    a[0] + (b[0] - a[0]) * clamped,
    a[1] + (b[1] - a[1]) * clamped,
    a[2] + (b[2] - a[2]) * clamped,
    a[3] + (b[3] - a[3]) * clamped
  ] as Vec4;
}

function sanitizeVec4(vector: Vec4): Vec4 {
  return [
    Number.isFinite(vector[0]) ? vector[0] : 0,
    Number.isFinite(vector[1]) ? vector[1] : 0,
    Number.isFinite(vector[2]) ? vector[2] : 0,
    Number.isFinite(vector[3]) ? vector[3] : 0
  ] as Vec4;
}
