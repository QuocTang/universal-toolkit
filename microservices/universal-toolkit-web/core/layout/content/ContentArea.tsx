"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface ContentAreaProps {
  children: React.ReactNode;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}

export function ContentArea({ children }: ContentAreaProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
      </div>
    </div>
  );
}
