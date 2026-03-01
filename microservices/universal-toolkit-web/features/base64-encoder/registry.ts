// features/base64-encoder/registry.ts

import { lazy } from "react";
import { FileCode } from "lucide-react";
import type { ToolDefinition } from "@/core/registry/tool-registry.types";
import { CATEGORY_IDS } from "@/config/navigation";

const Base64EncoderTool = lazy(() => import("./index"));

export const base64EncoderRegistry: ToolDefinition = {
  id: "base64-encoder",
  name: "Base64 Encoder",
  description: "Encode and decode Base64 strings",
  icon: FileCode,
  category: CATEGORY_IDS.DEVELOPER,
  tags: ["base64", "encode", "decode", "developer", "converter"],
  order: 2,
  path: "/base64-encoder",
  component: Base64EncoderTool,
};
