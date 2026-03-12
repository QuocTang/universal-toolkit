// features/md-to-docx/models/image-helpers.ts

/**
 * Image fetch, dimensions, scaling, URL collection
 */

import { type Token, type Tokens } from "marked";
import type { FetchedImage, ImageCache } from "../types";
import {
  TOKEN_TYPES,
  MAX_IMAGE_WIDTH,
  IMAGE_FALLBACK,
  SUPPORTED_IMAGE_FORMATS,
} from "../config";

export type { FetchedImage, ImageCache };

/**
 * Fetch image và lấy dimensions
 * Return null nếu: fetch fail, CORS block, hoặc format không hỗ trợ
 */
async function fetchImage(url: string): Promise<FetchedImage | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    // Detect format từ Content-Type
    const contentType = response.headers.get("content-type") || "";
    const format = SUPPORTED_IMAGE_FORMATS[contentType.split(";")[0].trim()];

    if (!format) {
      console.warn(`Unsupported image format: ${contentType} (URL: ${url}).`);
      return null;
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const dimensions = await getImageDimensions(blob);

    return {
      data: arrayBuffer,
      width: dimensions.width,
      height: dimensions.height,
      format,
    };
  } catch {
    console.warn(`Failed to fetch image: ${url}`);
    return null;
  }
}

/**
 * Lấy width/height thực tế của image
 * SVG có thể trả naturalWidth=0 → dùng fallback dimensions
 */
function getImageDimensions(
  blob: Blob,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      // SVG thường trả 0x0 nếu không set width/height cứng
      resolve(w > 0 && h > 0 ? { width: w, height: h } : IMAGE_FALLBACK);
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
