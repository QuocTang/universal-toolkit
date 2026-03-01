// features/md-to-docx/models/index.ts

/**
 * MD to DOCX Conversion Model
 * Transform: Markdown string → docx Document
 *
 * Supported Markdown features (theo markdownguide.org/cheat-sheet):
 * ✅ Headings (#, ##, ### ...)
 * ✅ Bold (**text**) / Italic (*text*) / Bold+Italic (***text***)
 * ✅ Blockquote (> text)
 * ✅ Ordered/Unordered List (mixed inline)
 * ✅ Inline Code / Fenced Code Block
 * ✅ Horizontal Rule (---)
 * ✅ Link ([text](url))
 * ✅ Table
 * ✅ Strikethrough (~~text~~)
 * ✅ Task List (- [x] / - [ ])
 * ✅ Image ![alt](url) — fetch + embed thật
 */

import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  type IParagraphOptions,
  type IRunOptions,
  type ParagraphChild,
} from "docx";
import { marked, type Token, type Tokens } from "marked";
import type { DocxOptions } from "../types";

// ==============================
// Types
// ==============================

interface FetchedImage {
  data: ArrayBuffer;
  width: number;
  height: number;
}

type ImageCache = Map<string, FetchedImage>;

// ==============================
// Constants
// ==============================

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

const HEADING_SCALE: Record<number, number> = {
  1: 2.0,
  2: 1.5,
  3: 1.25,
  4: 1.1,
  5: 1.0,
  6: 1.0,
};

// Max image width in DOCX (in px, ~6 inches at 96dpi = 576px)
const MAX_IMAGE_WIDTH = 576;

// ==============================
// Image helpers
// ==============================

/**
 * Fetch image và lấy dimensions
 */
async function fetchImage(url: string): Promise<FetchedImage | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Lấy dimensions bằng cách load vào Image element
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
 * Lấy width/height thực tế của image
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
      resolve({ width: 400, height: 300 }); // fallback
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Scale image để fit max width, giữ tỷ lệ
 */
function scaleImage(
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
    if (token.type === "image") {
      const img = token as Tokens.Image;
      if (img.href) urls.push(img.href);
    }

    // Recursive vào children tokens
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

  return [...new Set(urls)]; // deduplicate
}

/**
 * Fetch tất cả images song song
 */
async function prefetchImages(tokens: Token[]): Promise<ImageCache> {
  const urls = collectImageUrls(tokens);
  const cache: ImageCache = new Map();

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const img = await fetchImage(url);
      if (img) cache.set(url, img);
    }),
  );

  return cache;
}

// ==============================
// Inline token parser
// ==============================

/**
 * Parse inline tokens → ParagraphChild[] (TextRun + ImageRun)
 */
function parseInlineTokens(
  tokens: Token[],
  options: DocxOptions,
  imageCache: ImageCache,
  inheritStyle?: Partial<IRunOptions>,
): ParagraphChild[] {
  const runs: ParagraphChild[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "strong": {
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

      case "em": {
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

      case "del": {
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

      case "link": {
        const link = token as Tokens.Link;
        if (link.tokens) {
          runs.push(
            ...parseInlineTokens(link.tokens, options, imageCache, {
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
        const img = token as Tokens.Image;
        const cached = img.href ? imageCache.get(img.href) : null;

        if (cached) {
          // Embed ảnh thật
          const scaled = scaleImage(cached.width, cached.height);
          runs.push(
            new ImageRun({
              data: cached.data,
              transformation: scaled,
              type: "png",
            }),
          );
        } else {
          // Fallback: text placeholder nếu fetch fail
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
              color: "0563C1",
              underline: {},
              ...inheritStyle,
            }),
          );
        }
        break;
      }

      case "br": {
        runs.push(new TextRun({ break: 1 }));
        break;
      }

      case "paragraph": {
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

// ==============================
// Block parsers
// ==============================

function parseTable(
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

function parseList(
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
        spacing: { after: 60 },
        indent: { left: 360 * (depth + 1) },
      }),
    );

    if (item.tokens) {
      for (const subToken of item.tokens) {
        if (subToken.type === "list") {
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

// ==============================
// Main conversion (ASYNC — vì cần fetch images)
// ==============================

export async function markdownToDocx(
  markdown: string,
  options: DocxOptions,
): Promise<Document> {
  const tokens = marked.lexer(markdown);

  // Pre-fetch tất cả images song song
  const imageCache = await prefetchImages(tokens);

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
              ? parseInlineTokens(para.tokens, options, imageCache)
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
        children.push(...parseList(list, options, imageCache));
        break;
      }

      case "table": {
        const table = token as Tokens.Table;
        children.push(parseTable(table, options, imageCache));
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
