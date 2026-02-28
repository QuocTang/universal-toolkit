"use client";

import type { Base64Mode } from "../types";

interface Base64ToolbarProps {
  mode: Base64Mode;
  output: string;
  copied: boolean;
  onConvert: () => void;
  onSwap: () => void;
  onCopy: () => void;
  onClear: () => void;
  onModeChange: (mode: Base64Mode) => void;
}

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ArrowRightLeft, Trash2 } from "lucide-react";
import { BASE64_CONFIG } from "../config";

export function Base64Toolbar({
  mode,
  output,
  copied,
  onConvert,
  onSwap,
  onCopy,
  onClear,
  onModeChange,
}: Base64ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border p-1">
        {BASE64_CONFIG.modes.map((m) => (
          <Badge
            key={m}
            variant={mode === m ? "default" : "outline"}
            className="cursor-pointer capitalize border-0"
            onClick={() => onModeChange(m)}
          >
            {m}
          </Badge>
        ))}
      </div>

      <Button onClick={onConvert} size="sm" className="gap-1.5">
        {mode === "encode" ? "Encode" : "Decode"}
      </Button>
      <Button
        onClick={onSwap}
        variant="secondary"
        size="sm"
        className="gap-1.5"
        disabled={!output}
      >
        <ArrowRightLeft className="h-4 w-4" />
        Swap
      </Button>
      <Button
        onClick={onCopy}
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
      <Button onClick={onClear} variant="ghost" size="sm" className="gap-1.5">
        <Trash2 className="h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}
