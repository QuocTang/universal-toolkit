"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ArrowRightLeft, Trash2 } from "lucide-react";

type Mode = "encode" | "decode";

export default function Base64EncoderTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
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
        // Encode: text → base64
        const encoded = btoa(
          encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16)),
          ),
        );
        setOutput(encoded);
      } else {
        // Decode: base64 → text
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Base64 Encoder</h2>
        <p className="text-muted-foreground">Encode và decode Base64 strings</p>
      </div>

      {/* Mode Toggle & Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border p-1">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <Badge
              key={m}
              variant={mode === m ? "default" : "outline"}
              className="cursor-pointer capitalize border-0"
              onClick={() => {
                setMode(m);
                setOutput("");
                setError(null);
              }}
            >
              {m}
            </Badge>
          ))}
        </div>

        <Button onClick={handleConvert} size="sm" className="gap-1.5">
          {mode === "encode" ? "Encode" : "Decode"}
        </Button>
        <Button
          onClick={handleSwap}
          variant="secondary"
          size="sm"
          className="gap-1.5"
          disabled={!output}
        >
          <ArrowRightLeft className="h-4 w-4" />
          Swap
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={!output}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button
          onClick={handleClear}
          variant="ghost"
          size="sm"
          className="gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {mode === "encode" ? "Text Input" : "Base64 Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Nhập text cần encode..."
                : "Nhập Base64 cần decode..."
            }
            className="flex min-h-[400px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {mode === "encode" ? "Base64 Output" : "Text Output"}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Kết quả sẽ hiển thị ở đây..."
            className="flex min-h-[400px] w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
