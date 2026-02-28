// features/color-picker/registry.ts

import { lazy } from "react";
import { Palette } from "lucide-react";
import type { ToolDefinition } from "@/core/registry/tool-registry.types";

const ColorPickerTool = lazy(() => import("./index"));

export const colorPickerRegistry: ToolDefinition = {
  id: "color-picker",
  name: "Color Picker",
  description: "Pick colors and convert between HEX, RGB, HSL formats",
  icon: Palette,
  category: "design",
  tags: ["color", "picker", "hex", "rgb", "hsl", "design"],
  order: 1,
  path: "/color-picker",
  component: ColorPickerTool,
  badge: "New",
};
