export type Size = { width: number, height: number };
export type Position = { X: number, Y: number };
export type Color = { R: number, G: number, B: number, A?: number };
export type Line = { startPosition: Position, endPosition: Position, color: Color };