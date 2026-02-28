import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/core/layout/content/ToolErrorBoundary";

const Base64Encoder = dynamic(() => import("@/features/base64-encoder"), {
  loading: () => (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      Đang tải Base64 Encoder...
    </div>
  ),
});

export default function Base64EncoderPage() {
  return (
    <ToolErrorBoundary toolName="Base64 Encoder">
      <Base64Encoder />
    </ToolErrorBoundary>
  );
}
