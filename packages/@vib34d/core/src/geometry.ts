import type { Vec4 } from "./types.js";

export interface GeometryDefinition {
  readonly key: string;
  readonly vertices: readonly Vec4[];
  readonly edges: readonly [number, number][];
}

const baseVertices: Vec4[] = buildHypercubeVertices();
const baseEdges: Array<[number, number]> = buildHypercubeEdges(baseVertices.length);

const geometryCache = new Map<string, GeometryDefinition>();

export type GeometryKey =
  | "hypercube"
  | "prism"
  | "tetra"
  | "dodeca"
  | "octa"
  | "portal";

export function getGeometryDefinition(key: string): GeometryDefinition {
  const normalized = (key as GeometryKey) ?? "hypercube";
  if (geometryCache.has(normalized)) {
    return geometryCache.get(normalized)!;
  }

  const definition = createGeometry(normalized);
  geometryCache.set(normalized, definition);
  return definition;
}

export function listGeometryKeys(): GeometryKey[] {
  return ["hypercube", "prism", "tetra", "dodeca", "octa", "portal"];
}

function createGeometry(key: GeometryKey): GeometryDefinition {
  switch (key) {
    case "hypercube":
      return { key, vertices: baseVertices, edges: baseEdges };
    case "prism":
      return { key, vertices: transformVertices(scaleAxes([1.1, 0.85, 0.6, 0.25])), edges: baseEdges };
    case "tetra":
      return { key, vertices: transformVertices(foldTowardsSimplex(0.9)), edges: baseEdges };
    case "dodeca":
      return { key, vertices: transformVertices(goldenSpiral(1.2)), edges: baseEdges };
    case "octa":
      return { key, vertices: transformVertices(spindle(1.05)), edges: baseEdges };
    case "portal":
    default:
      return { key, vertices: transformVertices(twistAndPulse(0.75)), edges: baseEdges };
  }
}

function transformVertices(transform: (vertex: Vec4, index: number) => Vec4): Vec4[] {
  return baseVertices.map((vertex, index) => transform(vertex, index));
}

function buildHypercubeVertices(): Vec4[] {
  const vertices: Vec4[] = [];
  for (const x of [-1, 1]) {
    for (const y of [-1, 1]) {
      for (const z of [-1, 1]) {
        for (const w of [-1, 1]) {
          vertices.push([x, y, z, w]);
        }
      }
    }
  }
  return vertices;
}

function buildHypercubeEdges(vertexCount: number): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < vertexCount; i++) {
    for (let axis = 0; axis < 4; axis++) {
      const neighbor = i ^ (1 << axis);
      if (neighbor > i) {
        edges.push([i, neighbor]);
      }
    }
  }
  return edges;
}

function scaleAxes(scales: [number, number, number, number]) {
  return (vertex: Vec4): Vec4 => [
    vertex[0] * scales[0],
    vertex[1] * scales[1],
    vertex[2] * scales[2],
    vertex[3] * scales[3]
  ];
}

function foldTowardsSimplex(tension: number) {
  return (vertex: Vec4, index: number): Vec4 => {
    const simplex = simplexCorner(index % 4);
    return [
      lerp(vertex[0], simplex[0], tension),
      lerp(vertex[1], simplex[1], tension),
      lerp(vertex[2], simplex[2], tension),
      lerp(vertex[3], simplex[3], tension)
    ];
  };
}

function goldenSpiral(scale: number) {
  const phi = (1 + Math.sqrt(5)) / 2;
  return (vertex: Vec4, index: number): Vec4 => {
    const theta = (index / baseVertices.length) * Math.PI * 2;
    return [
      (vertex[0] * Math.cos(theta) - vertex[1] * Math.sin(theta)) * scale,
      (vertex[0] * Math.sin(theta) + vertex[1] * Math.cos(theta)) * scale,
      vertex[2] * phi,
      vertex[3] / phi
    ];
  };
}

function spindle(amount: number) {
  return (vertex: Vec4, index: number): Vec4 => {
    const factor = ((index % 4) / 3) * amount;
    return [vertex[0] * (1 + factor), vertex[1] * (1 - factor), vertex[2], vertex[3] * 0.4];
  };
}

function twistAndPulse(amplitude: number) {
  return (vertex: Vec4, index: number): Vec4 => {
    const theta = (index / baseVertices.length) * Math.PI * 2;
    const twist = amplitude * Math.sin(theta);
    return [
      vertex[0] * (1 + twist * 0.3),
      vertex[1] * (1 - twist * 0.25),
      vertex[2] * (1 + twist * 0.1),
      vertex[3] * Math.cos(theta) * amplitude
    ];
  };
}

function simplexCorner(index: number): Vec4 {
  switch (index) {
    case 0:
      return [1, 1, 1, 1];
    case 1:
      return [1, -1, -1, -1];
    case 2:
      return [-1, 1, -1, -1];
    default:
      return [-1, -1, 1, -1];
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
