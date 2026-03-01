// features/settings/index.tsx

/**
 * Settings Feature - Entry Component
 * Compose hook + UI components
 */

"use client";

import { useSettings } from "./hooks/useSettings";
import { ThemeSelector } from "./components/ThemeSelector";
import { AppInfoCard } from "./components/AppInfoCard";

export default function SettingsFeature() {
  const { theme, setTheme } = useSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground text-sm">
          Tùy chỉnh giao diện và cấu hình ứng dụng.
        </p>
      </div>

      {/* Theme */}
      <ThemeSelector value={theme} onChange={setTheme} />

      {/* App Info */}
      <AppInfoCard />

      {/* Roadmap note */}
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">
          ⚙️ Các tính năng cài đặt đang được phát triển thêm.
        </p>
      </div>
    </div>
  );
}
