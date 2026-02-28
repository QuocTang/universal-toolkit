// features/color-picker/types/index.ts

/**
 * Types & Interfaces cho Color Picker
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface ColorValue {
  label: string;
  value: string;
}
