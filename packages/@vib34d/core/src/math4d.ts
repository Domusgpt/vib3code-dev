import type { Vec3, Vec4 } from "./types.js";

export type Matrix4 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export interface RotationSpeeds {
  readonly xy: number;
  readonly xz: number;
  readonly xw: number;
  readonly yz: number;
  readonly yw: number;
  readonly zw: number;
}

export const defaultRotationSpeeds: RotationSpeeds = {
  xy: 0.00035,
  xz: 0.00028,
  xw: 0.00024,
  yz: 0.00018,
  yw: 0.00022,
  zw: 0.00031
};

export function createIdentityMatrix4(): Matrix4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

export function multiplyMatrix4(a: Matrix4, b: Matrix4): Matrix4 {
  const result = new Array<number>(16);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      result[row * 4 + col] =
        a[row * 4 + 0] * b[col + 0] +
        a[row * 4 + 1] * b[col + 4] +
        a[row * 4 + 2] * b[col + 8] +
        a[row * 4 + 3] * b[col + 12];
    }
  }
  return result as unknown as Matrix4;
}

export function applyMatrix4(matrix: Matrix4, vector: Vec4): Vec4 {
  const [x, y, z, w] = vector;
  return [
    matrix[0] * x + matrix[1] * y + matrix[2] * z + matrix[3] * w,
    matrix[4] * x + matrix[5] * y + matrix[6] * z + matrix[7] * w,
    matrix[8] * x + matrix[9] * y + matrix[10] * z + matrix[11] * w,
    matrix[12] * x + matrix[13] * y + matrix[14] * z + matrix[15] * w
  ];
}

export function createPlaneRotationMatrix(axisA: number, axisB: number, angle: number): Matrix4 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const matrix = [...createIdentityMatrix4()];
  matrix[axisA * 4 + axisA] = cos;
  matrix[axisA * 4 + axisB] = -sin;
  matrix[axisB * 4 + axisA] = sin;
  matrix[axisB * 4 + axisB] = cos;
  return matrix as unknown as Matrix4;
}

export function composeRotationMatrix(angles: Partial<RotationSpeeds>): Matrix4 {
  let matrix = createIdentityMatrix4();
  const entries: Array<[number, number, number | undefined]> = [
    [0, 1, angles.xy],
    [0, 2, angles.xz],
    [0, 3, angles.xw],
    [1, 2, angles.yz],
    [1, 3, angles.yw],
    [2, 3, angles.zw]
  ];
  for (const [axisA, axisB, angle] of entries) {
    if (!angle) continue;
    matrix = multiplyMatrix4(matrix, createPlaneRotationMatrix(axisA, axisB, angle));
  }
  return matrix;
}

export function project4Dto3D(vector: Vec4, distance = 3.2): Vec3 {
  const wPerspective = distance / (distance - vector[3]);
  return [vector[0] * wPerspective, vector[1] * wPerspective, vector[2] * wPerspective];
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
