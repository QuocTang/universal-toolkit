"use client";

import { useBase64Encoder } from "./hooks/useBase64Encoder";
import { Base64Toolbar } from "./components/Base64Toolbar";
import { Base64Input } from "./components/Base64Input";
import { Base64Output } from "./components/Base64Output";

/**
 * Base64 Encoder — Entry Component
 * Quy tắc: Component chỉ nhận data và render, không chứa business logic
 */
export default function Base64EncoderTool() {
  const {
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
  } = useBase64Encoder();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Base64 Encoder</h2>
        <p className="text-muted-foreground">Encode và decode Base64 strings</p>
      </div>

      <Base64Toolbar
        mode={mode}
        output={output}
        copied={copied}
        onConvert={handleConvert}
        onSwap={handleSwap}
        onCopy={handleCopy}
        onClear={handleClear}
        onModeChange={handleModeChange}
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Base64Input value={input} mode={mode} onChange={setInput} />
        <Base64Output value={output} mode={mode} />
      </div>
    </div>
  );
}
