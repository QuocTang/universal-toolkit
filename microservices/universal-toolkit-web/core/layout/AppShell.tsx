"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar/AppSidebar";
import { Header } from "./header/Header";
import { ContentArea } from "./content/ContentArea";
import { Footer } from "./footer/Footer";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <Header />
        <ContentArea>{children}</ContentArea>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
