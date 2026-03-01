// config/navigation.ts

import type { ToolCategory } from "@/core/registry/tool-registry.types";
import { Code2, Palette, RefreshCw, Type, Box } from "lucide-react";

/**
 * Category IDs tập trung — dùng ở đây và trong feature registry files
 */
export enum CATEGORY_IDS {
  DEVELOPER = "developer",
  DESIGN = "design",
  CONVERTER = "converter",
  TEXT = "text",
  THREE_D = "3d",
}

export const toolCategories: ToolCategory[] = [
  {
    id: CATEGORY_IDS.DEVELOPER,
    label: "Developer Tools",
    icon: Code2,
    description: "Các công cụ dành cho lập trình viên",
    order: 1,
  },
  {
    id: CATEGORY_IDS.DESIGN,
    label: "Design Tools",
    icon: Palette,
    description: "Công cụ thiết kế và màu sắc",
    order: 2,
  },
  {
    id: CATEGORY_IDS.CONVERTER,
    label: "Converters",
    icon: RefreshCw,
    description: "Chuyển đổi dữ liệu, định dạng",
    order: 3,
  },
  {
    id: CATEGORY_IDS.TEXT,
    label: "Text Tools",
    icon: Type,
    description: "Công cụ xử lý văn bản",
    order: 4,
  },
  {
    id: CATEGORY_IDS.THREE_D,
    label: "3D Tools",
    icon: Box,
    description: "Công cụ 3D và hiển thị",
    order: 5,
  },
];
