// features/json-formatter/types/index.ts

/**
 * Types & Interfaces cho JSON Formatter
 */

export interface JsonFormatterState {
  input: string;
  output: string;
  error: string | null;
  indentSize: number;
}

export type JsonFormatterAction = "format" | "minify" | "validate";
