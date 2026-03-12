// features/md-to-docx/config.ts

/**
 * Constants & Config cho MD to DOCX Converter
 * Tập trung tất cả constant, magic number, và config tại đây.
 * Tool này hoạt động offline — không cần API.
 */

import { HeadingLevel } from "docx";

// ==============================
// Markdown token types (marked không export enum)
// ==============================

export const TOKEN_TYPES = {
  // Block-level
  HEADING: "heading",
  PARAGRAPH: "paragraph",
  CODE: "code",
  BLOCKQUOTE: "blockquote",
  LIST: "list",
  TABLE: "table",
  HR: "hr",
  SPACE: "space",
  MATH_BLOCK: "mathBlock",

  // Inline-level
  STRONG: "strong",
  EM: "em",
  DEL: "del",
  CODESPAN: "codespan",
  TEXT: "text",
  LINK: "link",
  IMAGE: "image",
  BR: "br",
  MATH_INLINE: "mathInline",
} as const;

// ==============================
// User-facing options
// ==============================

export const MD_TO_DOCX_CONFIG = {
  defaultFileName: "document" as string,
  defaultFontSize: 24 as number, // half-points (24 = 12pt)
  defaultFontFamily: "Times New Roman" as string,
  fontSizeOptions: [20, 22, 24, 26, 28, 32] as number[],
  fontFamilyOptions: [
    "Times New Roman",
    "Arial",
    "Calibri",
    "Helvetica",
    "Georgia",
  ],
  sampleMarkdown: `# Tiêu đề chính

## Mục 1: Giới thiệu

Đây là một đoạn văn bản mẫu. **In đậm** và *in nghiêng* cùng \`inline code\`.

### Danh sách

- Mục 1
- Mục 2
- Mục 3

### Bảng

| Cột 1 | Cột 2 | Cột 3 |
|-------|-------|-------|
| A     | B     | C     |
| D     | E     | F     |

### Code block

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

> Đây là một blockquote

1. Mục có thứ tự 1
2. Mục có thứ tự 2
3. Mục có thứ tự 3

![Image](https://placehold.co/600x400?text=Hello+World)
`,
} as const;

// ==============================
// Heading config
// ==============================

export const HEADING_MAP: Record<
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

export const HEADING_SCALE: Record<number, number> = {
  1: 2.0,
  2: 1.5,
  3: 1.25,
  4: 1.1,
  5: 1.0,
  6: 1.0,
};

// ==============================
// DOCX styling constants
// ==============================

/** Max image width in px (~6 inches at 96dpi) */
export const MAX_IMAGE_WIDTH = 576;

/** Indent size in twips (360 twips = 0.25 inch) */
export const INDENT_SIZE = 360;

/** Page margin in twips (1440 twips = 1 inch) */
export const PAGE_MARGIN = 1440;

/** Spacing values in twips */
export const SPACING = {
  headingBefore: 240,
  headingAfter: 120,
  paragraphAfter: 120,
  listItemAfter: 60,
  codeLineAfter: 0,
  spaceAfter: 60,
  hrBefore: 120,
  hrAfter: 120,
} as const;

/** Code block styling */
export const CODE_STYLE = {
  font: "Courier New",
  /** fontSizeOffset: trừ bao nhiêu so với body fontSize */
  fontSizeOffset: 2,
  bgColor: "f0f0f0",
} as const;

/** Blockquote styling */
export const BLOCKQUOTE_STYLE = {
  borderColor: "999999",
  borderSize: 6,
} as const;

/** Link styling */
export const LINK_STYLE = {
  color: "0563C1",
} as const;

/** Horizontal rule styling */
export const HR_STYLE = {
  color: "cccccc",
  size: 1,
} as const;

/** Image fallback dimensions (khi không lấy được size thật) */
export const IMAGE_FALLBACK = {
  width: 400,
  height: 300,
} as const;

/**
 * Supported image formats trong DOCX
 * Map: Content-Type → docx ImageRun type
 * Thư viện docx hỗ trợ: "jpg" | "png" | "gif" | "bmp" | "svg"
 */
export const SUPPORTED_IMAGE_FORMATS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/svg+xml": "svg",
};
