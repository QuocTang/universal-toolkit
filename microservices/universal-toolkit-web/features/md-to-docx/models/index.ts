// features/md-to-docx/models/index.ts

/**
 * MD to DOCX Conversion Model
 * Transform: Markdown string → docx Document
 *
 * Supported Markdown features (theo markdownguide.org/cheat-sheet):
 * ✅ Headings (#, ##, ### ...)
 * ✅ Bold (**text**)
 * ✅ Italic (*text*)
 * ✅ Bold + Italic (***text***)
 * ✅ Blockquote (> text)
 * ✅ Ordered List (1. 2. 3.)
 * ✅ Unordered List (- item)
 * ✅ Mixed inline in lists (- **bold** và normal)
 * ✅ Inline Code (`code`)
 * ✅ Fenced Code Block (```)
 * ✅ Horizontal Rule (---)
 * ✅ Link ([text](url))
 * ✅ Table
 * ✅ Strikethrough (~~text~~)
 * ✅ Task List (- [x] / - [ ])
 * ⚠️ Image → rendered as text "[Image: alt]"
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  type IParagraphOptions,
  type IRunOptions,
} from "docx";
import { marked, type Token, type Tokens } from "marked";
import type { DocxOptions } from "../types";

// Heading map
const HEADING_MAP: Record<
  number,
  (typeof HeadingLevel)[keyof typeof HeadingLevel]
> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

// Heading font size scale (relative to body fontSize)
const HEADING_SCALE: Record<number, number> = {
  1: 2.0,
  2: 1.5,
  3: 1.25,
  4: 1.1,
  5: 1.0,
  6: 1.0,
};

/**
 * Parse inline tokens (bold, italic, code, strikethrough, link, image, text) → TextRun[]
 */
function parseInlineTokens(
  tokens: Token[],
  options: DocxOptions,
  inheritStyle?: Partial<IRunOptions>,
): TextRun[] {
  const runs: TextRun[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "strong": {
        const strong = token as Tokens.Strong;
        if (strong.tokens) {
          runs.push(
            ...parseInlineTokens(strong.tokens, options, {
              ...inheritStyle,
              bold: true,
            }),
          );
        }
        break;
      }

      case "em": {
        const em = token as Tokens.Em;
        if (em.tokens) {
          runs.push(
            ...parseInlineTokens(em.tokens, options, {
              ...inheritStyle,
              italics: true,
            }),
          );
        }
        break;
      }

      case "del": {
        // Strikethrough: ~~text~~
        const del = token as Tokens.Del;
        if (del.tokens) {
          runs.push(
            ...parseInlineTokens(del.tokens, options, {
              ...inheritStyle,
              strike: true,
            }),
          );
        }
        break;
      }

      case "codespan": {
        const code = token as Tokens.Codespan;
        runs.push(
          new TextRun({
            text: code.text,
            font: "Courier New",
            size: options.fontSize,
            ...inheritStyle,
          }),
        );
        break;
      }

      case "text": {
        const text = token as Tokens.Text;
        if ("tokens" in text && text.tokens) {
          runs.push(...parseInlineTokens(text.tokens, options, inheritStyle));
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

      case "link": {
        const link = token as Tokens.Link;
        // Render link text with underline + blue color
        if (link.tokens) {
          runs.push(
            ...parseInlineTokens(link.tokens, options, {
              ...inheritStyle,
              color: "0563C1",
              underline: {},
            }),
          );
        } else {
          runs.push(
            new TextRun({
              text: link.text,
              font: options.fontFamily,
              size: options.fontSize,
              color: "0563C1",
              underline: {},
              ...inheritStyle,
            }),
          );
        }
        break;
      }

      case "image": {
        // DOCX image embedding phức tạp (cần fetch binary), render as placeholder text
        const img = token as Tokens.Image;
        runs.push(
          new TextRun({
            text: `[Image: ${img.text || img.href}]`,
            font: options.fontFamily,
            size: options.fontSize,
            italics: true,
            color: "999999",
            ...inheritStyle,
          }),
        );
        break;
      }

      case "br": {
        runs.push(new TextRun({ break: 1 }));
        break;
      }

      // Handle paragraph tokens that appear inside list items
      case "paragraph": {
        const para = token as Tokens.Paragraph;
        if (para.tokens) {
          runs.push(...parseInlineTokens(para.tokens, options, inheritStyle));
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

/**
 * Parse a table token → Table
 */
function parseTable(token: Tokens.Table, options: DocxOptions): Table {
  const allRows: TableRow[] = [];

  // Header row
  const headerCells = token.header.map(
    (cell) =>
      new TableCell({
        children: [
          new Paragraph({
            children: parseInlineTokens(cell.tokens, options, { bold: true }),
          }),
        ],
        width: {
          size: Math.floor(100 / token.header.length),
          type: WidthType.PERCENTAGE,
        },
      }),
  );
  allRows.push(new TableRow({ children: headerCells }));

  // Data rows
  for (const row of token.rows) {
    const cells = row.map(
      (cell) =>
        new TableCell({
          children: [
            new Paragraph({
              children: parseInlineTokens(cell.tokens, options),
            }),
          ],
          width: {
            size: Math.floor(100 / token.header.length),
            type: WidthType.PERCENTAGE,
          },
        }),
    );
    allRows.push(new TableRow({ children: cells }));
  }

  return new Table({
    rows: allRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

/**
 * Parse list items → Paragraph[]
 * Hỗ trợ: mixed inline formatting, nested lists, task lists
 */
function parseList(
  token: Tokens.List,
  options: DocxOptions,
  depth: number = 0,
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  token.items.forEach((item, index) => {
    // Task list checkbox
    let prefix: string;
    if (item.task) {
      prefix = item.checked ? "☑ " : "☐ ";
    } else {
      prefix = token.ordered ? `${index + 1}. ` : "•  ";
    }

    // Extract inline tokens from list item
    // item.tokens thường chứa [paragraph, ...] wrapper, cần unwrap
    const runs = item.tokens
      ? parseInlineTokens(item.tokens, options)
      : [
          new TextRun({
            text: item.text,
            font: options.fontFamily,
            size: options.fontSize,
          }),
        ];

    // Prepend bullet/number/checkbox
    runs.unshift(
      new TextRun({
        text: prefix,
        font: options.fontFamily,
        size: options.fontSize,
      }),
    );

    paragraphs.push(
      new Paragraph({
        children: runs,
        spacing: { after: 60 },
        indent: { left: 360 * (depth + 1) },
      }),
    );

    // Handle nested lists inside this item
    if (item.tokens) {
      for (const subToken of item.tokens) {
        if (subToken.type === "list") {
          paragraphs.push(
            ...parseList(subToken as Tokens.List, options, depth + 1),
          );
        }
      }
    }
  });

  return paragraphs;
}

/**
 * Main conversion: Markdown → Document
 */
export function markdownToDocx(
  markdown: string,
  options: DocxOptions,
): Document {
  const tokens = marked.lexer(markdown);
  const children: (Paragraph | Table)[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const heading = token as Tokens.Heading;
        const headingLevel =
          HEADING_MAP[heading.depth] || HeadingLevel.HEADING_1;
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
              ? parseInlineTokens(heading.tokens, headingOptions, {
                  bold: true,
                })
              : [
                  new TextRun({
                    text: heading.text,
                    bold: true,
                    size: headingFontSize,
                  }),
                ],
            spacing: { before: 240, after: 120 },
          } as IParagraphOptions),
        );
        break;
      }

      case "paragraph": {
        const para = token as Tokens.Paragraph;
        children.push(
          new Paragraph({
            children: para.tokens
              ? parseInlineTokens(para.tokens, options)
              : [
                  new TextRun({
                    text: para.text,
                    font: options.fontFamily,
                    size: options.fontSize,
                  }),
                ],
            spacing: { after: 120 },
          }),
        );
        break;
      }

      case "code": {
        const code = token as Tokens.Code;
        const lines = code.text.split("\n");
        for (const line of lines) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || " ",
                  font: "Courier New",
                  size: options.fontSize - 2,
                }),
              ],
              spacing: { after: 0 },
              indent: { left: 360 },
              shading: { fill: "f0f0f0" },
            }),
          );
        }
        children.push(new Paragraph({ spacing: { after: 120 } }));
        break;
      }

      case "blockquote": {
        const bq = token as Tokens.Blockquote;
        for (const bqToken of bq.tokens) {
          if (bqToken.type === "paragraph") {
            const bqPara = bqToken as Tokens.Paragraph;
            children.push(
              new Paragraph({
                children: bqPara.tokens
                  ? parseInlineTokens(bqPara.tokens, options, {
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
                indent: { left: 360 },
                border: {
                  left: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: "999999",
                  },
                },
                spacing: { after: 120 },
              }),
            );
          }
        }
        break;
      }

      case "list": {
        const list = token as Tokens.List;
        children.push(...parseList(list, options));
        break;
      }

      case "table": {
        const table = token as Tokens.Table;
        children.push(parseTable(table, options));
        children.push(new Paragraph({ spacing: { after: 120 } }));
        break;
      }

      case "hr": {
        children.push(
          new Paragraph({
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "cccccc",
              },
            },
            spacing: { before: 120, after: 120 },
          }),
        );
        break;
      }

      case "space": {
        children.push(new Paragraph({ spacing: { after: 60 } }));
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
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });
}
