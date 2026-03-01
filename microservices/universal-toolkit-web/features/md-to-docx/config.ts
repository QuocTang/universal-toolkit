// features/md-to-docx/config.ts

/**
 * Constants & Config cho MD to DOCX Converter
 * Tool này hoạt động offline — không cần API.
 */

export const MD_TO_DOCX_CONFIG = {
  defaultFileName: "document" as string,
  defaultFontSize: 24 as number, // half-points (24 = 12pt)
  defaultFontFamily: "Times New Roman" as string,
  fontSizeOptions: [20, 22, 24, 26, 28, 32] as number[], // half-points
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

![Image](https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/39ca1be49ef666fcb0b28ceec7f62316?_a=AQAEuop)
`,
} as const;
