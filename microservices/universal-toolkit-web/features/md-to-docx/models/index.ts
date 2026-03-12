// features/md-to-docx/models/index.ts

/**
 * MD to DOCX Conversion — Main orchestrator
 *
 * Pipeline:
 * 1. Tokenize markdown (with math extensions)
 * 2. Prefetch math OMML + images in parallel
 * 3. Build ConversionContext
 * 4. Dispatch each token to its block handler
 * 5. Wrap in Document
 */

import { Document } from "docx";
import type { DocxOptions, ConversionContext } from "../types";
import { PAGE_MARGIN } from "../config";
import { prefetchImages } from "./image-helpers";
import {
  getMarkedInstance,
  extractMathFormulas,
  prefetchMathOmml,
} from "./math-helpers";
import { BLOCK_HANDLERS } from "./block-handlers";

/**
 * Main conversion: Markdown string → DOCX Document
 */
export async function markdownToDocx(
  markdown: string,
  options: DocxOptions,
): Promise<Document> {
  const tokens = getMarkedInstance().lexer(markdown);

  // Prefetch math + images in parallel
  const [mathCache, imageCache] = await Promise.all([
    prefetchMathOmml(extractMathFormulas(tokens)),
    prefetchImages(tokens),
  ]);

  const ctx: ConversionContext = { options, imageCache, mathCache };

  // Dispatch tokens to handlers
  const children = tokens.flatMap((token) => {
    const handler = BLOCK_HANDLERS[token.type];
    return handler ? handler(token, ctx) : [];
  });

  return new Document({
    title: options.title || "Document",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: PAGE_MARGIN,
              right: PAGE_MARGIN,
              bottom: PAGE_MARGIN,
              left: PAGE_MARGIN,
            },
          },
        },
        children,
      },
    ],
  });
}
