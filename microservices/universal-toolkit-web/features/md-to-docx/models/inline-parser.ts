// features/md-to-docx/models/inline-parser.ts

/**
 * Parse inline Markdown tokens → DOCX ParagraphChild[]
 * Handles: bold, italic, strikethrough, code, text, link, image, br, paragraph wrapper
 */

import { TextRun, ImageRun, type IRunOptions, type ParagraphChild } from "docx";
import { type Token, type Tokens } from "marked";
import type { DocxOptions } from "../types";
import { TOKEN_TYPES, CODE_STYLE, LINK_STYLE } from "../config";
import { scaleImage, type ImageCache } from "./image-helpers";

export function parseInlineTokens(
  tokens: Token[],
  options: DocxOptions,
  imageCache: ImageCache,
  inheritStyle?: Partial<IRunOptions>,
): ParagraphChild[] {
  const runs: ParagraphChild[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case TOKEN_TYPES.STRONG: {
        const strong = token as Tokens.Strong;
        if (strong.tokens) {
          runs.push(
            ...parseInlineTokens(strong.tokens, options, imageCache, {
              ...inheritStyle,
              bold: true,
            }),
          );
        }
        break;
      }

      case TOKEN_TYPES.EM: {
        const em = token as Tokens.Em;
        if (em.tokens) {
          runs.push(
            ...parseInlineTokens(em.tokens, options, imageCache, {
              ...inheritStyle,
              italics: true,
            }),
          );
        }
        break;
      }

      case TOKEN_TYPES.DEL: {
        const del = token as Tokens.Del;
        if (del.tokens) {
          runs.push(
            ...parseInlineTokens(del.tokens, options, imageCache, {
              ...inheritStyle,
              strike: true,
            }),
          );
        }
        break;
      }

      case TOKEN_TYPES.CODESPAN: {
        const code = token as Tokens.Codespan;
        runs.push(
          new TextRun({
            text: code.text,
            font: CODE_STYLE.font,
            size: options.fontSize,
            ...inheritStyle,
          }),
        );
        break;
      }

      case TOKEN_TYPES.TEXT: {
        const text = token as Tokens.Text;
        if ("tokens" in text && text.tokens) {
          runs.push(
            ...parseInlineTokens(
              text.tokens,
              options,
              imageCache,
              inheritStyle,
            ),
          );
        } else {
          runs.push(
            new TextRun({
              text: text.text,
              font: options.fontFamily,
              size: options.fontSize,
              ...inheritStyle,
            }),
          );
        }
        break;
      }

      case TOKEN_TYPES.LINK: {
        const link = token as Tokens.Link;
        if (link.tokens) {
          runs.push(
            ...parseInlineTokens(link.tokens, options, imageCache, {
              ...inheritStyle,
              color: LINK_STYLE.color,
              underline: {},
            }),
          );
        } else {
          runs.push(
            new TextRun({
              text: link.text,
              font: options.fontFamily,
              size: options.fontSize,
              color: LINK_STYLE.color,
              underline: {},
              ...inheritStyle,
            }),
          );
        }
        break;
      }

      case TOKEN_TYPES.IMAGE: {
        const img = token as Tokens.Image;
        const cached = img.href ? imageCache.get(img.href) : null;

        if (cached) {
          const scaled = scaleImage(cached.width, cached.height);
          runs.push(
            new ImageRun({
              data: cached.data,
              transformation: scaled,
              type: "png",
            }),
          );
        } else {
          const altText = img.text && img.text !== "alt text" ? img.text : "";
          const hrefText = img.href || "";
          const label = altText
            ? `[${altText}] (${hrefText})`
            : `[${hrefText}]`;
          runs.push(
            new TextRun({
              text: label,
              font: options.fontFamily,
              size: options.fontSize,
              italics: true,
              color: LINK_STYLE.color,
              underline: {},
              ...inheritStyle,
            }),
          );
        }
        break;
      }

      case TOKEN_TYPES.BR: {
        runs.push(new TextRun({ break: 1 }));
        break;
      }

      case TOKEN_TYPES.PARAGRAPH: {
        const para = token as Tokens.Paragraph;
        if (para.tokens) {
          runs.push(
            ...parseInlineTokens(
              para.tokens,
              options,
              imageCache,
              inheritStyle,
            ),
          );
        } else {
          runs.push(
            new TextRun({
              text: para.text,
              font: options.fontFamily,
              size: options.fontSize,
              ...inheritStyle,
            }),
          );
        }
        break;
      }

      default: {
        if ("text" in token) {
          runs.push(
            new TextRun({
              text: (token as { text: string }).text,
              font: options.fontFamily,
              size: options.fontSize,
              ...inheritStyle,
            }),
          );
        }
        break;
      }
    }
  }

  return runs;
}
