// features/settings/config.ts

/**
 * Constants & Config cho Settings feature
 * Storage key: dùng LOCAL_STORAGE_KEY từ core/app-storage (trong ThemeProvider)
 */

import { Moon, Sun, Monitor, type LucideIcon } from "lucide-react";
import type { ThemeMode } from "./types";

// ==============================
// Theme options
// ==============================

export interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: LucideIcon;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Hệ thống", icon: Monitor },
];

// ==============================
// App info
// ==============================

export const APP_INFO = {
  version: "v0.1.0",
  framework: "Next.js 16",
  uiLibrary: "shadcn/ui",
  author: "QuocTang",
  description: "Universal Toolkit — Nền tảng web tích hợp nhiều tool tiện ích.",
} as const;
