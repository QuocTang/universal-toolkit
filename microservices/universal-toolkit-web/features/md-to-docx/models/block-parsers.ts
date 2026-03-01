// features/md-to-docx/models/block-parsers.ts

/**
 * Parse block-level Markdown tokens → DOCX elements
 * Handles: table, list (ordered, unordered, task, nested)
 */

import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { type Tokens } from "marked";
import type { DocxOptions } from "../types";
import { TOKEN_TYPES, INDENT_SIZE, SPACING } from "../config";
import type { ImageCache } from "./image-helpers";
import { parseInlineTokens } from "./inline-parser";

/**
 * Parse a table token → Table
 */
export function parseTable(
  token: Tokens.Table,
  options: DocxOptions,
  imageCache: ImageCache,
): Table {
  const allRows: TableRow[] = [];

  const headerCells = token.header.map(
    (cell) =>
      new TableCell({
        children: [
          new Paragraph({
            children: parseInlineTokens(cell.tokens, options, imageCache, {
              bold: true,
            }),
          }),
        ],
        width: {
          size: Math.floor(100 / token.header.length),
          type: WidthType.PERCENTAGE,
        },
      }),
  );
  allRows.push(new TableRow({ children: headerCells }));

  for (const row of token.rows) {
    const cells = row.map(
      (cell) =>
        new TableCell({
          children: [
            new Paragraph({
              children: parseInlineTokens(cell.tokens, options, imageCache),
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
 * Hỗ trợ: ordered, unordered, task lists, nested lists, mixed inline formatting
 */
export function parseList(
  token: Tokens.List,
  options: DocxOptions,
  imageCache: ImageCache,
  depth: number = 0,
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  token.items.forEach((item, index) => {
    let prefix: string;
    if (item.task) {
      prefix = item.checked ? "☑ " : "☐ ";
    } else {
      prefix = token.ordered ? `${index + 1}. ` : "•  ";
    }

    const runs = item.tokens
      ? parseInlineTokens(item.tokens, options, imageCache)
      : [
          new TextRun({
            text: item.text,
            font: options.fontFamily,
            size: options.fontSize,
          }),
        ];

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
        spacing: { after: SPACING.listItemAfter },
        indent: { left: INDENT_SIZE * (depth + 1) },
      }),
    );

    if (item.tokens) {
      for (const subToken of item.tokens) {
        if (subToken.type === TOKEN_TYPES.LIST) {
          paragraphs.push(
            ...parseList(
              subToken as Tokens.List,
              options,
              imageCache,
              depth + 1,
            ),
          );
        }
      }
    }
  });

  return paragraphs;
}
