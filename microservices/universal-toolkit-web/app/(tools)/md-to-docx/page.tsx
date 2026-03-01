import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/core/layout/content/ToolErrorBoundary";

const MdToDocx = dynamic(() => import("@/features/md-to-docx"), {
  loading: () => (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      Đang tải MD to DOCX Converter...
    </div>
  ),
});

export default function MdToDocxPage() {
  return (
    <ToolErrorBoundary toolName="MD to DOCX">
      <MdToDocx />
    </ToolErrorBoundary>
  );
}
