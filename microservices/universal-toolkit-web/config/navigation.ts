// config/navigation.ts

import type { ToolCategory } from "@/core/registry/tool-registry.types";
import { Code2, Palette, RefreshCw, Type, Box } from "lucide-react";

export const toolCategories: ToolCategory[] = [
  {
    id: "developer",
    label: "Developer Tools",
    icon: Code2,
    description: "Các công cụ dành cho lập trình viên",
    order: 1,
  },
  {
    id: "design",
    label: "Design Tools",
    icon: Palette,
    description: "Công cụ thiết kế và màu sắc",
    order: 2,
  },
  {
    id: "converter",
    label: "Converters",
    icon: RefreshCw,
    description: "Chuyển đổi dữ liệu, định dạng",
    order: 3,
  },
  {
    id: "text",
    label: "Text Tools",
    icon: Type,
    description: "Công cụ xử lý văn bản",
    order: 4,
  },
  {
    id: "3d",
    label: "3D Tools",
    icon: Box,
    description: "Công cụ 3D và hiển thị",
    order: 5,
  },
];
