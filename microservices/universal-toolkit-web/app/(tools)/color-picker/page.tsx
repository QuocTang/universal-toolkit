import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/core/layout/content/ToolErrorBoundary";

const ColorPicker = dynamic(() => import("@/features/color-picker"), {
  loading: () => (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      Đang tải Color Picker...
    </div>
  ),
});

export default function ColorPickerPage() {
  return (
    <ToolErrorBoundary toolName="Color Picker">
      <ColorPicker />
    </ToolErrorBoundary>
  );
}
