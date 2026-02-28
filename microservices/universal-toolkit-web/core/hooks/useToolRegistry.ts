// core/hooks/useToolRegistry.ts

"use client";

import { useToolRegistry as useRegistry } from "@/core/registry";

/**
 * Hook wrapper cho Tool Registry store
 * Cung cấp các helper methods cho components
 */
export function useToolRegistryHelper() {
  const { tools, categories, getToolsByCategory, searchTools, getToolByPath } =
    useRegistry();

  const allTools = Array.from(tools.values()).sort((a, b) => a.order - b.order);

  const allCategories = Array.from(categories.values()).sort(
    (a, b) => a.order - b.order,
  );

  const toolCount = tools.size;

  return {
    allTools,
    allCategories,
    toolCount,
    getToolsByCategory,
    searchTools,
    getToolByPath,
  };
}
