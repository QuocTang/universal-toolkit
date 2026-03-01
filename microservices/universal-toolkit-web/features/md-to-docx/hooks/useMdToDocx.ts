// features/md-to-docx/hooks/useMdToDocx.ts

"use client";

import { useState, useCallback } from "react";
import { Packer } from "docx";
import { saveAs } from "file-saver";
import { markdownToDocx } from "../models";
import { MD_TO_DOCX_CONFIG } from "../config";
import type { DocxOptions } from "../types";

/**
 * Hook chứa business logic cho MD to DOCX Converter
 */
export function useMdToDocx() {
  const [markdown, setMarkdown] = useState("");
  const [fileName, setFileName] = useState(MD_TO_DOCX_CONFIG.defaultFileName);
  const [fontSize, setFontSize] = useState(MD_TO_DOCX_CONFIG.defaultFontSize);
  const [fontFamily, setFontFamily] = useState(
    MD_TO_DOCX_CONFIG.defaultFontFamily,
  );
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastConvertedAt, setLastConvertedAt] = useState<Date | null>(null);

  const handleConvert = useCallback(async () => {
    if (!markdown.trim()) {
      setError("Vui lòng nhập nội dung Markdown");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const options: DocxOptions = {
        fontSize,
        fontFamily,
        title: fileName,
      };

      const doc = markdownToDocx(markdown, options);
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileName || "document"}.docx`);
      setLastConvertedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi khi chuyển đổi");
    } finally {
      setIsConverting(false);
    }
  }, [markdown, fileName, fontSize, fontFamily]);

  const handleLoadSample = useCallback(() => {
    setMarkdown(MD_TO_DOCX_CONFIG.sampleMarkdown);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setMarkdown("");
    setError(null);
    setLastConvertedAt(null);
  }, []);

  return {
    // State
    markdown,
    fileName,
    fontSize,
    fontFamily,
    isConverting,
    error,
    lastConvertedAt,

    // Setters
    setMarkdown,
    setFileName,
    setFontSize,
    setFontFamily,

    // Actions
    handleConvert,
    handleLoadSample,
    handleClear,
  };
}
