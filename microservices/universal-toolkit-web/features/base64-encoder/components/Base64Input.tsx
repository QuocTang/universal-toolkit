"use client";

import type { Base64Mode } from "../types";

interface Base64InputProps {
  value: string;
  mode: Base64Mode;
  onChange: (value: string) => void;
}

export function Base64Input({ value, mode, onChange }: Base64InputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {mode === "encode" ? "Text Input" : "Base64 Input"}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          mode === "encode"
            ? "Nhập text cần encode..."
            : "Nhập Base64 cần decode..."
        }
        className="flex min-h-[400px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
        spellCheck={false}
      />
    </div>
  );
}
