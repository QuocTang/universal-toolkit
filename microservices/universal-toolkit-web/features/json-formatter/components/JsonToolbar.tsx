"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Braces,
  Minimize2,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { useState, useCallback } from "react";

interface JsonToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onValidate: () => void;
  onClear: () => void;
  indentSize: number;
  onIndentSizeChange: (size: number) => void;
  output: string;
}

export function JsonToolbar({
  onFormat,
  onMinify,
  onValidate,
  onClear,
  indentSize,
  onIndentSizeChange,
  output,
}: JsonToolbarProps) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={onFormat} size="sm" className="gap-1.5">
        <Braces className="h-4 w-4" />
        Format
      </Button>
      <Button
        onClick={onMinify}
        variant="secondary"
        size="sm"
        className="gap-1.5"
      >
        <Minimize2 className="h-4 w-4" />
        Minify
      </Button>
      <Button
        onClick={onValidate}
        variant="secondary"
        size="sm"
        className="gap-1.5"
      >
        <CheckCircle className="h-4 w-4" />
        Validate
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
      <Button onClick={onClear} variant="ghost" size="sm" className="gap-1.5">
        <Trash2 className="h-4 w-4" />
        Clear
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Indent:</span>
        {[2, 4].map((size) => (
          <Badge
            key={size}
            variant={indentSize === size ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => onIndentSizeChange(size)}
          >
            {size}
          </Badge>
        ))}
      </div>
    </div>
  );
}
