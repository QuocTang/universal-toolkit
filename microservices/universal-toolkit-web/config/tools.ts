// config/tools.ts — Nơi duy nhất cần sửa khi thêm tool mới

import { jsonFormatterRegistry } from "@/features/json-formatter/registry";
import { base64EncoderRegistry } from "@/features/base64-encoder/registry";
import { colorPickerRegistry } from "@/features/color-picker/registry";
import { mdToDocxRegistry } from "@/features/md-to-docx/registry";
// ➕ Import thêm tool mới ở đây

import type { ToolDefinition } from "@/core/registry/tool-registry.types";
import { toolCategories } from "./navigation";

export { toolCategories };

export const registeredTools: ToolDefinition[] = [
  jsonFormatterRegistry,
  base64EncoderRegistry,
  colorPickerRegistry,
  mdToDocxRegistry,
  // ➕ Thêm tool mới ở đây
];
