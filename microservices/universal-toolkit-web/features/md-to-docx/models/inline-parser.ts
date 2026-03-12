// features/md-to-docx/models/inline-parser.ts

/**
 * Parse inline Markdown tokens → DOCX ParagraphChild[]
 * Handles: bold, italic, strikethrough, code, text, link, image, br, math inline
 */

import { TextRun, ImageRun, type IRunOptions, type ParagraphChild } from "docx";
import { type Token, type Tokens } from "marked";
import type { ConversionContext } from "../types";
import { TOKEN_TYPES, CODE_STYLE, LINK_STYLE } from "../config";
import { scaleImage } from "./image-helpers";
import { ommlToParagraphChild } from "./math-helpers";

export function parseInlineTokens(
  tokens: Token[],
  ctx: ConversionContext,
  inheritStyle?: Partial<IRunOptions>,
): ParagraphChild[] {
  const runs: ParagraphChild[] = [];
  const { options, imageCache } = ctx;

  for (const token of tokens) {
    switch (token.type) {
      case TOKEN_TYPES.STRONG: {
        const strong = token as Tokens.Strong;
        if (strong.tokens) {
          runs.push(
            ...parseInlineTokens(strong.tokens, ctx, {
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
            ...parseInlineTokens(em.tokens, ctx, {
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
            ...parseInlineTokens(del.tokens, ctx, {
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
            ...parseInlineTokens(text.tokens, ctx, inheritStyle),
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
            ...parseInlineTokens(link.tokens, ctx, {
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
          if (cached.format === "svg") {
            runs.push(
              new ImageRun({
                data: cached.data,
                transformation: scaled,
                type: "svg",
                fallback: { data: cached.data, type: "png" },
              }),
            );
          } else {
            runs.push(
              new ImageRun({
                data: cached.data,
                transformation: scaled,
                type: cached.format as "jpg" | "png" | "gif" | "bmp",
              }),
            );
          }
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

      case TOKEN_TYPES.MATH_INLINE: {
        const mathToken = token as unknown as { latex: string };
        const omml = ctx.mathCache.get(mathToken.latex);
        const mathChild = omml ? ommlToParagraphChild(omml) : null;
        if (mathChild) {
          runs.push(mathChild);
        } else {
          runs.push(
            new TextRun({
              text: `$${mathToken.latex}$`,
              font: CODE_STYLE.font,
              size: options.fontSize,
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
            ...parseInlineTokens(para.tokens, ctx, inheritStyle),
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
