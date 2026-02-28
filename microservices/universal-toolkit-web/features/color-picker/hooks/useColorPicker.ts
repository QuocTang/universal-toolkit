// features/color-picker/hooks/useColorPicker.ts

"use client";

import { useState, useCallback, useMemo } from "react";
import { COLOR_PICKER_CONFIG } from "../config";
import { hexToRgb, rgbToHsl, formatRgb, formatHsl } from "../models";
import type { ColorValue } from "../types";

/**
 * Hook chứa business logic cho Color Picker
 */
export function useColorPicker() {
  const [color, setColor] = useState(COLOR_PICKER_CONFIG.defaultColor);
  const [hexInput, setHexInput] = useState(COLOR_PICKER_CONFIG.defaultColor);
  const [copied, setCopied] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(color), [color]);
  const hsl = useMemo(
    () => (rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null),
    [rgb],
  );

  const colorValues: ColorValue[] = useMemo(
    () => [
      { label: "HEX", value: color.toUpperCase() },
      { label: "RGB", value: rgb ? formatRgb(rgb) : "" },
      { label: "HSL", value: hsl ? formatHsl(hsl) : "" },
    ],
    [color, rgb, hsl],
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

  return {
    color,
    hexInput,
    rgb,
    hsl,
    copied,
    colorValues,
    handleColorChange,
    handleHexInputChange,
    handleCopy,
  };
}
