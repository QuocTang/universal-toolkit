// features/base64-encoder/hooks/useBase64Encoder.ts

"use client";

import { useState, useCallback } from "react";
import type { Base64Mode } from "../types";
import { BASE64_CONFIG } from "../config";

/**
 * Hook chứa business logic cho Base64 Encoder
 */
export function useBase64Encoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Base64Mode>(BASE64_CONFIG.defaultMode);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput("");
        setError(null);
        return;
      }

      if (mode === "encode") {
        const encoded = btoa(
          encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16)),
          ),
        );
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(
          Array.prototype.map
            .call(atob(input), (c: string) => {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );
        setOutput(decoded);
      }
      setError(null);
    } catch (e) {
      setError(
        mode === "decode"
          ? "Invalid Base64 string"
          : e instanceof Error
            ? e.message
            : "Conversion error",
      );
      setOutput("");
    }
  }, [input, mode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Copy failed");
    }
  }, [output]);

  const handleSwap = useCallback(() => {
    setInput(output);
    setOutput("");
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setError(null);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const handleModeChange = useCallback((newMode: Base64Mode) => {
    setMode(newMode);
    setOutput("");
    setError(null);
  }, []);

  return {
    input,
    output,
    mode,
    error,
    copied,
    setInput,
    handleConvert,
    handleCopy,
    handleSwap,
    handleClear,
    handleModeChange,
  };
}
