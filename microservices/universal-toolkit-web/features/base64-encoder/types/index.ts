// features/base64-encoder/types/index.ts

/**
 * Types & Interfaces cho Base64 Encoder
 */

export type Base64Mode = "encode" | "decode";

export interface Base64EncoderState {
  input: string;
  output: string;
  mode: Base64Mode;
  error: string | null;
}
