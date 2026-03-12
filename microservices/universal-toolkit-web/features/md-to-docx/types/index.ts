// features/md-to-docx/types/index.ts

export interface MdToDocxState {
  markdown: string;
  fileName: string;
  isConverting: boolean;
  error: string | null;
  lastConvertedAt: Date | null;
}

/** User-facing options passed from UI */
export interface DocxOptions {
  fontSize: number;
  fontFamily: string;
  title: string;
}

export interface FetchedImage {
  data: ArrayBuffer;
  width: number;
  height: number;
  format: string;
}

export type ImageCache = Map<string, FetchedImage>;

/**
 * Internal conversion context — bundles options + all caches.
 * Passed through the entire conversion pipeline so adding a new cache
 * (e.g. syntax highlight, diagrams) only requires adding a field here.
 */
export interface ConversionContext {
  options: DocxOptions;
  imageCache: ImageCache;
  mathCache: Map<string, string>;
}
