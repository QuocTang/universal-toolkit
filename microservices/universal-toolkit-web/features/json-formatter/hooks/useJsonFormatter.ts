// features/json-formatter/hooks/useJsonFormatter.ts

"use client";

import { useState, useCallback } from "react";
import { JSON_FORMATTER_CONFIG } from "../config";

/**
 * Hook chứa business logic cho JSON Formatter
 * Quy tắc: Business logic nằm trong hooks, không nằm trong component
 */
export function useJsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(
    JSON_FORMATTER_CONFIG.defaultIndentSize,
  );

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

  return {
    // State
    input,
    output,
    error,
    indentSize,

    // Setters
    setInput,
    setIndentSize,

    // Actions
    handleFormat,
    handleMinify,
    handleValidate,
    handleClear,
  };
}
