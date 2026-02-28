import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/core/layout/content/ToolErrorBoundary";

const JsonFormatter = dynamic(() => import("@/features/json-formatter"), {
  loading: () => (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      Đang tải JSON Formatter...
    </div>
  ),
});

export default function JsonFormatterPage() {
  return (
    <ToolErrorBoundary toolName="JSON Formatter">
      <JsonFormatter />
    </ToolErrorBoundary>
  );
}
