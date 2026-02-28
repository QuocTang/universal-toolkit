"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RgbColor, HslColor, ColorValue } from "../types";

interface ColorInfoProps {
  color: string;
  rgb: RgbColor | null;
  hsl: HslColor | null;
  copied: string | null;
  colorValues: ColorValue[];
  onCopy: (text: string, label: string) => void;
}

export function ColorInfo({
  color,
  rgb,
  hsl,
  copied,
  colorValues,
  onCopy,
}: ColorInfoProps) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Color Values</label>

      <div className="space-y-3">
        {colorValues.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <Badge variant="outline" className="w-12 justify-center">
              {label}
            </Badge>
            <code className="flex-1 text-sm font-mono">{value}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onCopy(value, label)}
            >
              {copied === label ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Color Preview Card */}
      <div className="rounded-lg border overflow-hidden">
        <div className="h-32 w-full" style={{ backgroundColor: color }} />
        <div className="p-3 space-y-1">
          <p className="font-semibold text-sm">{color.toUpperCase()}</p>
          <p className="text-xs text-muted-foreground">
            {rgb && `R: ${rgb.r} G: ${rgb.g} B: ${rgb.b}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {hsl && `H: ${hsl.h}° S: ${hsl.s}% L: ${hsl.l}%`}
          </p>
        </div>
      </div>
    </div>
  );
}
