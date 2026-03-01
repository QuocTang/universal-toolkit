// features/md-to-docx/models/image-helpers.ts

/**
 * Image fetch, dimensions, scaling, URL collection
 */

import { type Token, type Tokens } from "marked";
import { TOKEN_TYPES, MAX_IMAGE_WIDTH, IMAGE_FALLBACK } from "../config";

export interface FetchedImage {
  data: ArrayBuffer;
  width: number;
  height: number;
}

export type ImageCache = Map<string, FetchedImage>;

/**
 * Fetch image và lấy dimensions
 */
async function fetchImage(url: string): Promise<FetchedImage | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const dimensions = await getImageDimensions(blob);

    return {
      data: arrayBuffer,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch {
    console.warn(`Failed to fetch image: ${url}`);
    return null;
  }
}

/**
 * Lấy width/height thực tế của image bằng Image element
 */
function getImageDimensions(
  blob: Blob,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve(IMAGE_FALLBACK);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Scale image để fit max width, giữ tỷ lệ
 */
export function scaleImage(
  width: number,
  height: number,
): { width: number; height: number } {
  if (width <= MAX_IMAGE_WIDTH) return { width, height };
  const ratio = MAX_IMAGE_WIDTH / width;
  return {
    width: MAX_IMAGE_WIDTH,
    height: Math.round(height * ratio),
  };
}

/**
 * Thu thập tất cả image URLs từ tokens (recursive)
 */
function collectImageUrls(tokens: Token[]): string[] {
  const urls: string[] = [];

  for (const token of tokens) {
    if (token.type === TOKEN_TYPES.IMAGE) {
      const img = token as Tokens.Image;
      if (img.href) urls.push(img.href);
    }

    if (
      "tokens" in token &&
      Array.isArray((token as { tokens: Token[] }).tokens)
    ) {
      urls.push(...collectImageUrls((token as { tokens: Token[] }).tokens));
    }
    if ("items" in token && Array.isArray((token as Tokens.List).items)) {
      for (const item of (token as Tokens.List).items) {
        if (item.tokens) urls.push(...collectImageUrls(item.tokens));
      }
    }
  }

  return [...new Set(urls)];
}

/**
 * Fetch tất cả images song song, return cache
 */
export async function prefetchImages(tokens: Token[]): Promise<ImageCache> {
  const urls = collectImageUrls(tokens);
  const cache: ImageCache = new Map();

  await Promise.allSettled(
    urls.map(async (url) => {
      const img = await fetchImage(url);
      if (img) cache.set(url, img);
    }),
  );

  return cache;
}
