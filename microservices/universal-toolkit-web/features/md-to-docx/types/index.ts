// features/md-to-docx/types/index.ts

export interface MdToDocxState {
  markdown: string;
  fileName: string;
  isConverting: boolean;
  error: string | null;
  lastConvertedAt: Date | null;
}

export interface DocxOptions {
  fontSize: number;
  fontFamily: string;
  title: string;
}
