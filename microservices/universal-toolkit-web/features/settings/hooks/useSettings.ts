// features/settings/hooks/useSettings.ts

/**
 * Hook quản lý Settings state
 * Theme: delegate cho next-themes (useTheme) — đã có ThemeProvider ở root
 * Storage key: dùng LOCAL_STORAGE_KEY từ core/app-storage
 */

"use client";

import { useTheme } from "next-themes";
import type { ThemeMode } from "../types";

export function useSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return {
    // Theme state (from next-themes)
    theme: (theme as ThemeMode) || "system",
    resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
    setTheme: (value: ThemeMode) => setTheme(value),
  };
}
