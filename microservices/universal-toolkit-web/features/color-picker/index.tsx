"use client";

import { useState, useCallback, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Color conversion utils
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#14b8a6",
  "#84cc16",
  "#a855f7",
  "#f59e0b",
  "#10b981",
  "#0ea5e9",
  "#d946ef",
  "#64748b",
  "#171717",
  "#ffffff",
];

export default function ColorPickerTool() {
  const [color, setColor] = useState("#3b82f6");
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [copied, setCopied] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(color), [color]);
  const hsl = useMemo(
    () => (rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null),
    [rgb],
  );

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    setHexInput(newColor);
  }, []);

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setHexInput(value);
      if (/^#[0-9a-fA-F]{6}$/.test(value)) {
        setColor(value);
      }
    },
    [],
  );

  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      console.error("Copy failed");
    }
  }, []);

  const colorValues = useMemo(
    () => [
      { label: "HEX", value: color.toUpperCase() },
      {
        label: "RGB",
        value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "",
      },
      {
        label: "HSL",
        value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "",
      },
    ],
    [color, rgb, hsl],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Color Picker</h2>
        <p className="text-muted-foreground">
          Chọn màu và chuyển đổi giữa HEX, RGB, HSL
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Color Picker */}
        <div className="space-y-4">
          {/* Color Preview + Picker */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Chọn màu</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-20 h-20 cursor-pointer rounded-lg border-2 border-input p-1 bg-transparent"
                />
              </div>
              <div
                className="flex-1 h-20 rounded-lg border-2 border-input shadow-inner"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>

          {/* HEX Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">HEX</label>
            <Input
              value={hexInput}
              onChange={handleHexInputChange}
              placeholder="#000000"
              className="font-mono"
            />
          </div>

          {/* Preset Colors */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preset Colors</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  className="w-8 h-8 rounded-md border-2 border-input hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Color Info */}
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
                  onClick={() => handleCopy(value, label)}
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
      </div>
    </div>
  );
}
