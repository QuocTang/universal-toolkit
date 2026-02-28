"use client";

import { useJsonFormatter } from "./hooks/useJsonFormatter";
import { JsonInput } from "./components/JsonInput";
import { JsonOutput } from "./components/JsonOutput";
import { JsonToolbar } from "./components/JsonToolbar";

/**
 * JSON Formatter — Entry Component
 * Quy tắc: Component chỉ nhận data và render, không chứa business logic
 */
export default function JsonFormatterTool() {
  const {
    input,
    output,
    error,
    indentSize,
    setInput,
    setIndentSize,
    handleFormat,
    handleMinify,
    handleValidate,
    handleClear,
  } = useJsonFormatter();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">JSON Formatter</h2>
        <p className="text-muted-foreground">
          Format, validate, và minify JSON data
        </p>
      </div>

      <JsonToolbar
        onFormat={handleFormat}
        onMinify={handleMinify}
        onValidate={handleValidate}
        onClear={handleClear}
        indentSize={indentSize}
        onIndentSizeChange={setIndentSize}
        output={output}
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <JsonInput value={input} onChange={setInput} />
        <JsonOutput value={output} />
      </div>
    </div>
  );
}
