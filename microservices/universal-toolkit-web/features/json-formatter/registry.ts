// features/json-formatter/registry.ts

import { lazy } from "react";
import { Code2 } from "lucide-react";
import type { ToolDefinition } from "@/core/registry/tool-registry.types";
import { CATEGORY_IDS } from "@/config/navigation";

const JsonFormatterTool = lazy(() => import("./index"));

export const jsonFormatterRegistry: ToolDefinition = {
  id: "json-formatter",
  name: "JSON Formatter",
  description: "Format, validate, and minify JSON data",
  icon: Code2,
  category: CATEGORY_IDS.DEVELOPER,
  tags: ["json", "format", "validate", "minify", "developer"],
  order: 1,
  path: "/json-formatter",
  component: JsonFormatterTool,
  badge: "Popular",
};
