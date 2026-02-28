// core/hooks/useActiveRoute.ts

"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useToolRegistry } from "@/core/registry";

/**
 * Hook xác định tool đang active dựa trên pathname
 */
export function useActiveRoute() {
  const pathname = usePathname();
  const { tools, categories } = useToolRegistry();

  const activeTool = useMemo(() => {
    return Array.from(tools.values()).find((t) => pathname === t.path);
  }, [pathname, tools]);

  const activeCategory = useMemo(() => {
    if (!activeTool) return undefined;
    return categories.get(activeTool.category);
  }, [activeTool, categories]);

  return {
    pathname,
    activeTool,
    activeCategory,
  };
}
