"use client";

import dynamic from "next/dynamic";
import { AppShell } from "@/core/layout/AppShell";

const SettingsFeature = dynamic(() => import("@/features/settings"), {
  ssr: false,
});

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsFeature />
    </AppShell>
  );
}
