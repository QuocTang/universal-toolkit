// features/md-to-docx/models/index.ts

/**
 * MD to DOCX Conversion Model
 * Transform: Markdown string → docx Document
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
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
  1: 2.0, // H1 = 2x body
  2: 1.5, // H2 = 1.5x body
  3: 1.25, // H3 = 1.25x body
  4: 1.1, // H4 = 1.1x body
  5: 1.0, // H5 = 1x body
  6: 1.0, // H6 = 1x body
};

/**
 * Parse inline tokens (bold, italic, code, text) → TextRun[]
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
        // Handle text that might contain nested tokens
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
 */
function parseList(token: Tokens.List, options: DocxOptions): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  token.items.forEach((item, index) => {
    const bullet = token.ordered ? `${index + 1}. ` : "•  ";
    const runs = item.tokens
      ? parseInlineTokens(item.tokens, options)
      : [
          new TextRun({
            text: item.text,
            font: options.fontFamily,
            size: options.fontSize,
          }),
        ];

    // Prepend bullet/number
    runs.unshift(
      new TextRun({
        text: bullet,
        font: options.fontFamily,
        size: options.fontSize,
      }),
    );

    paragraphs.push(
      new Paragraph({
        children: runs,
        spacing: { after: 60 },
        indent: { left: 360 },
      }),
    );
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
        // Tạo options riêng cho heading với fontSize đã scale
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
        // Add spacing after code block
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
                  ? parseInlineTokens(bqPara.tokens, options, { italics: true })
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
                  left: { style: BorderStyle.SINGLE, size: 6, color: "999999" },
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
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
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
