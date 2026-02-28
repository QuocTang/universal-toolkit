"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar/AppSidebar";
import { Header } from "./header/Header";
import { ContentArea } from "./content/ContentArea";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <ContentArea>{children}</ContentArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
