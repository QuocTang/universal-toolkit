// features/settings/components/ThemeSelector.tsx

"use client";

import { Sun } from "lucide-react";
import type { ThemeMode } from "../types";
import { THEME_OPTIONS } from "../config";
import { SettingCard } from "./SettingCard";
import { OptionButton } from "./OptionButton";

interface ThemeSelectorProps {
  value: ThemeMode;
  onChange: (theme: ThemeMode) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <SettingCard
      icon={<Sun className="w-5 h-5" />}
      title="Giao diện"
      description="Chọn chế độ sáng, tối hoặc theo hệ thống."
    >
      <div className="flex flex-wrap gap-2">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <OptionButton
              key={option.value}
              active={value === option.value}
              onClick={() => onChange(option.value)}
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </OptionButton>
          );
        })}
      </div>
    </SettingCard>
  );
}
