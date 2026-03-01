"use client";

import { useMdToDocx } from "./hooks/useMdToDocx";
import { MdToolbar } from "./components/MdToolbar";
import { MdEditor } from "./components/MdEditor";

/**
 * MD to DOCX Converter — Entry Component
 * Quy tắc: Component chỉ compose hooks + components, không chứa business logic
 */
export default function MdToDocxTool() {
  const {
    markdown,
    fileName,
    fontSize,
    fontFamily,
    isConverting,
    error,
    lastConvertedAt,
    setMarkdown,
    setFileName,
    setFontSize,
    setFontFamily,
    handleConvert,
    handleLoadSample,
    handleClear,
    handleFileUpload,
  } = useMdToDocx();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          MD to DOCX Converter
        </h2>
        <p className="text-muted-foreground">
          Chuyển đổi Markdown sang file Word (.docx) — hoạt động offline
        </p>
      </div>

      <MdToolbar
        fileName={fileName}
        fontSize={fontSize}
        fontFamily={fontFamily}
        isConverting={isConverting}
        lastConvertedAt={lastConvertedAt}
        onFileNameChange={setFileName}
        onFontSizeChange={setFontSize}
        onFontFamilyChange={setFontFamily}
        onConvert={handleConvert}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          ❌ {error}
        </div>
      )}

      <MdEditor
        value={markdown}
        onChange={setMarkdown}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
}
