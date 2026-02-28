"use client";

import { type ReactNode, useCallback } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolErrorBoundaryProps {
  toolName: string;
  children: ReactNode;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">Tool gặp lỗi</h3>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        {error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi không xác định"}
      </p>
      <Button onClick={resetErrorBoundary} variant="outline" className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Thử lại
      </Button>
    </div>
  );
}

export function ToolErrorBoundary({
  toolName,
  children,
}: ToolErrorBoundaryProps) {
  const handleError = useCallback(
    (error: unknown, info: { componentStack?: string | null }) => {
      console.error(`[Tool Error: ${toolName}]`, error, info);
    },
    [toolName],
  );

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset bất kỳ state nào cần thiết khi user bấm "Thử lại"
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
