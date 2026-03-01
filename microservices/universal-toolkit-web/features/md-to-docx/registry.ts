// features/md-to-docx/registry.ts

import { lazy } from "react";
import { FileOutput } from "lucide-react";
import type { ToolDefinition } from "@/core/registry/tool-registry.types";

const MdToDocxTool = lazy(() => import("./index"));

export const mdToDocxRegistry: ToolDefinition = {
  id: "md-to-docx",
  name: "MD to DOCX",
  description: "Chuyển đổi Markdown sang file Word (.docx)",
  icon: FileOutput,
  category: "converter",
  tags: ["markdown", "docx", "word", "convert", "export", "document"],
  order: 1,
  path: "/md-to-docx",
  component: MdToDocxTool,
  badge: "New",
};
