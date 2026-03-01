// features/md-to-docx/models/index.ts

/**
 * MD to DOCX Conversion — Main orchestrator
 *
 * Cấu trúc models/:
 * - image-helpers.ts → Fetch, dimensions, scale, prefetch cache
 * - inline-parser.ts → Parse inline tokens (bold, italic, code, link, image...)
 * - block-parsers.ts → Parse block tokens (table, list)
 * - index.ts         → Main markdownToDocx() orchestrator (file này)
 *
 * Config tập trung tại: ../config.ts
 */

import {
  Document,
  Paragraph,
  TextRun,
  BorderStyle,
  type IParagraphOptions,
} from "docx";
import { marked, type Tokens } from "marked";
import type { DocxOptions } from "../types";

import {
  TOKEN_TYPES,
  HEADING_MAP,
  HEADING_SCALE,
  INDENT_SIZE,
  PAGE_MARGIN,
  SPACING,
  CODE_STYLE,
  BLOCKQUOTE_STYLE,
  HR_STYLE,
} from "../config";
import { prefetchImages } from "./image-helpers";
import { parseInlineTokens } from "./inline-parser";
import { parseTable, parseList } from "./block-parsers";

// Re-export cho external usage
export { prefetchImages } from "./image-helpers";
export { parseInlineTokens } from "./inline-parser";
export { parseTable, parseList } from "./block-parsers";

/**
 * Main conversion: Markdown string → DOCX Document
 * Async vì cần fetch images từ URL
 */
export async function markdownToDocx(
  markdown: string,
  options: DocxOptions,
): Promise<Document> {
  const tokens = marked.lexer(markdown);
  const imageCache = await prefetchImages(tokens);
  const children: (Paragraph | import("docx").Table)[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case TOKEN_TYPES.HEADING: {
        const heading = token as Tokens.Heading;
        const headingLevel = HEADING_MAP[heading.depth] || HEADING_MAP[1];
        const scale = HEADING_SCALE[heading.depth] || 1;
        const headingFontSize = Math.round(options.fontSize * scale);
        const headingOptions: DocxOptions = {
          ...options,
          fontSize: headingFontSize,
        };
        children.push(
          new Paragraph({
            heading: headingLevel,
            children: heading.tokens
              ? parseInlineTokens(heading.tokens, headingOptions, imageCache, {
                  bold: true,
                })
              : [
                  new TextRun({
                    text: heading.text,
                    bold: true,
                    size: headingFontSize,
                  }),
                ],
            spacing: {
              before: SPACING.headingBefore,
              after: SPACING.headingAfter,
            },
          } as IParagraphOptions),
        );
        break;
      }

      case TOKEN_TYPES.PARAGRAPH: {
        const para = token as Tokens.Paragraph;
        children.push(
          new Paragraph({
            children: para.tokens
              ? parseInlineTokens(para.tokens, options, imageCache)
              : [
                  new TextRun({
                    text: para.text,
                    font: options.fontFamily,
                    size: options.fontSize,
                  }),
                ],
            spacing: { after: SPACING.paragraphAfter },
          }),
        );
        break;
      }

      case TOKEN_TYPES.CODE: {
        const code = token as Tokens.Code;
        for (const line of code.text.split("\n")) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || " ",
                  font: CODE_STYLE.font,
                  size: options.fontSize - CODE_STYLE.fontSizeOffset,
                }),
              ],
              spacing: { after: SPACING.codeLineAfter },
              indent: { left: INDENT_SIZE },
              shading: { fill: CODE_STYLE.bgColor },
            }),
          );
        }
        children.push(
          new Paragraph({ spacing: { after: SPACING.paragraphAfter } }),
        );
        break;
      }

      case TOKEN_TYPES.BLOCKQUOTE: {
        const bq = token as Tokens.Blockquote;
        // Handle paragraph tokens inside blockquote
        for (const bqToken of bq.tokens) {
          if (bqToken.type === TOKEN_TYPES.PARAGRAPH) {
            const bqPara = bqToken as Tokens.Paragraph;
            children.push(
              new Paragraph({
                children: bqPara.tokens
                  ? parseInlineTokens(bqPara.tokens, options, imageCache, {
                      italics: true,
                    })
                  : [
                      new TextRun({
                        text: bqPara.text,
                        italics: true,
                        font: options.fontFamily,
                        size: options.fontSize,
                      }),
                    ],
                indent: { left: INDENT_SIZE },
                border: {
                  left: {
                    style: BorderStyle.SINGLE,
                    size: BLOCKQUOTE_STYLE.borderSize,
                    color: BLOCKQUOTE_STYLE.borderColor,
                  },
                },
                spacing: { after: SPACING.paragraphAfter },
              }),
            );
          }
        }
        break;
      }

      case TOKEN_TYPES.LIST: {
        children.push(...parseList(token as Tokens.List, options, imageCache));
        break;
      }

      case TOKEN_TYPES.TABLE: {
        children.push(parseTable(token as Tokens.Table, options, imageCache));
        children.push(
          new Paragraph({ spacing: { after: SPACING.paragraphAfter } }),
        );
        break;
      }

      case TOKEN_TYPES.HR: {
        children.push(
          new Paragraph({
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: HR_STYLE.size,
                color: HR_STYLE.color,
              },
            },
            spacing: { before: SPACING.hrBefore, after: SPACING.hrAfter },
          }),
        );
        break;
      }

      case TOKEN_TYPES.SPACE: {
        children.push(
          new Paragraph({ spacing: { after: SPACING.spaceAfter } }),
        );
        break;
      }

      default:
        break;
    }
  }

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
