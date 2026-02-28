"use client";

import { Input } from "@/components/ui/input";
import { COLOR_PICKER_CONFIG } from "../config";

interface ColorWheelProps {
  color: string;
  hexInput: string;
  onColorChange: (color: string) => void;
  onHexInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ColorWheel({
  color,
  hexInput,
  onColorChange,
  onHexInputChange,
}: ColorWheelProps) {
  return (
    <div className="space-y-4">
      {/* Color Preview + Picker */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Chọn màu</label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
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
          onChange={onHexInputChange}
          placeholder="#000000"
          className="font-mono"
        />
      </div>

      {/* Preset Colors */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Preset Colors</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PICKER_CONFIG.presetColors.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className="w-8 h-8 rounded-md border-2 border-input hover:scale-110 transition-transform shadow-sm"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
