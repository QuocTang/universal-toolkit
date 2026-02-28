import { AppShell } from "@/core/layout/AppShell";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
