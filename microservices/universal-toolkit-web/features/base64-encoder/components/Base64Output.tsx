"use client";

import type { Base64Mode } from "../types";

interface Base64OutputProps {
  value: string;
  mode: Base64Mode;
}

export function Base64Output({ value, mode }: Base64OutputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {mode === "encode" ? "Base64 Output" : "Text Output"}
      </label>
      <textarea
        value={value}
        readOnly
        placeholder="Kết quả sẽ hiển thị ở đây..."
        className="flex min-h-[400px] w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
        spellCheck={false}
      />
    </div>
  );
}
