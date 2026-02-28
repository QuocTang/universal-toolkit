// features/base64-encoder/config.ts

/**
 * Constants & Config cho Base64 Encoder
 * Tool này hoạt động offline nên không có API endpoints.
 */

export const BASE64_CONFIG = {
  defaultMode: "encode" as const,
  modes: ["encode", "decode"] as const,
} as const;
