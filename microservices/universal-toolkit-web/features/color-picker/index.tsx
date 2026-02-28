"use client";

import { useColorPicker } from "./hooks/useColorPicker";
import { ColorWheel } from "./components/ColorWheel";
import { ColorInfo } from "./components/ColorInfo";

/**
 * Color Picker — Entry Component
 * Quy tắc: Component chỉ nhận data và render, không chứa business logic
 */
export default function ColorPickerTool() {
  const {
    color,
    hexInput,
    rgb,
    hsl,
    copied,
    colorValues,
    handleColorChange,
    handleHexInputChange,
    handleCopy,
  } = useColorPicker();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Color Picker</h2>
        <p className="text-muted-foreground">
          Chọn màu và chuyển đổi giữa HEX, RGB, HSL
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ColorWheel
          color={color}
          hexInput={hexInput}
          onColorChange={handleColorChange}
          onHexInputChange={handleHexInputChange}
        />
        <ColorInfo
          color={color}
          rgb={rgb}
          hsl={hsl}
          copied={copied}
          colorValues={colorValues}
          onCopy={handleCopy}
        />
      </div>
    </div>
  );
}
