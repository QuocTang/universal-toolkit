// features/md-to-docx/models/block-handlers.ts

/**
 * Block-level token handlers registry.
 * Each handler converts a single marked Token → DOCX element(s).
 *
 * To add a new block type:
 * 1. Add the token type key in config.ts TOKEN_TYPES
 * 2. Add a handler function here
 * 3. Register it in BLOCK_HANDLERS below
 */

import {
  Paragraph,
  TextRun,
  BorderStyle,
  AlignmentType,
  type IParagraphOptions,
} from "docx";
import { type Token, type Tokens } from "marked";
import type { ConversionContext } from "../types";
import {
  TOKEN_TYPES,
  HEADING_MAP,
  HEADING_SCALE,
  INDENT_SIZE,
  SPACING,
  CODE_STYLE,
  BLOCKQUOTE_STYLE,
  HR_STYLE,
} from "../config";
import { parseInlineTokens } from "./inline-parser";
import { parseTable, parseList } from "./block-parsers";
import { wrapInMathPara, ommlToParagraphChild } from "./math-helpers";

type DocxBlock = Paragraph | import("docx").Table;
type BlockHandler = (token: Token, ctx: ConversionContext) => DocxBlock[];

// ──────────────────────────────────────────────────────────────────────────────

function handleHeading(token: Token, ctx: ConversionContext): DocxBlock[] {
  const heading = token as Tokens.Heading;
  const headingLevel = HEADING_MAP[heading.depth] || HEADING_MAP[1];
  const scale = HEADING_SCALE[heading.depth] || 1;
  const headingFontSize = Math.round(ctx.options.fontSize * scale);
  const headingCtx: ConversionContext = {
    ...ctx,
    options: { ...ctx.options, fontSize: headingFontSize },
  };

  return [
    new Paragraph({
      heading: headingLevel,
      children: heading.tokens
        ? parseInlineTokens(heading.tokens, headingCtx, { bold: true })
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
  ];
}

function handleParagraph(token: Token, ctx: ConversionContext): DocxBlock[] {
  const para = token as Tokens.Paragraph;
  return [
    new Paragraph({
      children: para.tokens
        ? parseInlineTokens(para.tokens, ctx)
        : [
            new TextRun({
              text: para.text,
              font: ctx.options.fontFamily,
              size: ctx.options.fontSize,
            }),
          ],
      spacing: { after: SPACING.paragraphAfter },
    }),
  ];
}

function handleCode(token: Token, ctx: ConversionContext): DocxBlock[] {
  const code = token as Tokens.Code;
  const blocks: DocxBlock[] = code.text.split("\n").map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line || " ",
            font: CODE_STYLE.font,
            size: ctx.options.fontSize - CODE_STYLE.fontSizeOffset,
          }),
        ],
        spacing: { after: SPACING.codeLineAfter },
        indent: { left: INDENT_SIZE },
        shading: { fill: CODE_STYLE.bgColor },
      }),
  );
  blocks.push(new Paragraph({ spacing: { after: SPACING.paragraphAfter } }));
  return blocks;
}

function handleBlockquote(token: Token, ctx: ConversionContext): DocxBlock[] {
  const bq = token as Tokens.Blockquote;
  const blocks: DocxBlock[] = [];

  for (const bqToken of bq.tokens) {
    if (bqToken.type === TOKEN_TYPES.PARAGRAPH) {
      const bqPara = bqToken as Tokens.Paragraph;
      blocks.push(
        new Paragraph({
          children: bqPara.tokens
            ? parseInlineTokens(bqPara.tokens, ctx, { italics: true })
            : [
                new TextRun({
                  text: bqPara.text,
                  italics: true,
                  font: ctx.options.fontFamily,
                  size: ctx.options.fontSize,
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

  return blocks;
}

function handleList(token: Token, ctx: ConversionContext): DocxBlock[] {
  return parseList(token as Tokens.List, ctx);
}

function handleTable(token: Token, ctx: ConversionContext): DocxBlock[] {
  return [
    parseTable(token as Tokens.Table, ctx),
    new Paragraph({ spacing: { after: SPACING.paragraphAfter } }),
  ];
}

function handleHr(): DocxBlock[] {
  return [
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
  ];
}

function handleSpace(): DocxBlock[] {
  return [new Paragraph({ spacing: { after: SPACING.spaceAfter } })];
}

function handleMathBlock(token: Token, ctx: ConversionContext): DocxBlock[] {
  const mathToken = token as unknown as { latex: string };
  const omml = ctx.mathCache.get(mathToken.latex);
  const mathChild = omml ? ommlToParagraphChild(wrapInMathPara(omml)) : null;

  if (mathChild) {
    return [
      new Paragraph({
        children: [mathChild],
        alignment: AlignmentType.CENTER,
        spacing: {
          before: SPACING.headingAfter,
          after: SPACING.headingAfter,
        },
      }),
    ];
  }

  // Fallback: render raw LaTeX as code block
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: `$$${mathToken.latex}$$`,
          font: CODE_STYLE.font,
          size: ctx.options.fontSize,
        }),
      ],
      spacing: { after: SPACING.paragraphAfter },
    }),
  ];
}

// ──────────────────────────────────────────────────────────────────────────────
// Registry: token type → handler
// ──────────────────────────────────────────────────────────────────────────────

export const BLOCK_HANDLERS: Record<string, BlockHandler> = {
  [TOKEN_TYPES.HEADING]: handleHeading,
  [TOKEN_TYPES.PARAGRAPH]: handleParagraph,
  [TOKEN_TYPES.CODE]: handleCode,
  [TOKEN_TYPES.BLOCKQUOTE]: handleBlockquote,
  [TOKEN_TYPES.LIST]: handleList,
  [TOKEN_TYPES.TABLE]: handleTable,
  [TOKEN_TYPES.HR]: handleHr,
  [TOKEN_TYPES.SPACE]: handleSpace,
  [TOKEN_TYPES.MATH_BLOCK]: handleMathBlock,
};
