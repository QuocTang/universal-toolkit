"use client";

import { useState, useCallback } from "react";
import { JsonInput } from "./components/JsonInput";
import { JsonOutput } from "./components/JsonOutput";
import { JsonToolbar } from "./components/JsonToolbar";

export default function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(2);

  const handleFormat = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput("");
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indentSize));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input, indentSize]);

  const handleMinify = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput("");
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    try {
      if (!input.trim()) {
        setError(null);
        return;
      }
      JSON.parse(input);
      setError(null);
      setOutput("✅ JSON hợp lệ!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

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
