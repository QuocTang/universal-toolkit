"use client";

import { useState, useEffect } from "react";
import { Wrench, Settings } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarToolMenu } from "./SidebarMenu";
import { useToolRegistryHelper } from "@/core/hooks/useToolRegistry";
import type { ToolDefinition } from "@/core/registry/tool-registry.types";

export function AppSidebar() {
  const { allCategories, getToolsByCategory, searchTools } =
    useToolRegistryHelper();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ToolDefinition[]>([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchTools(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchTools]);

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Wrench className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Universal Toolkit</span>
                  <span className="text-xs text-muted-foreground">v0.1.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Search */}
        <SidebarSearch onSearchResults={setSearchQuery} />
      </SidebarHeader>

      <SidebarSeparator />

      {/* Content - Tool Menu */}
      <SidebarContent>
        <SidebarToolMenu
          categories={allCategories}
          getToolsByCategory={getToolsByCategory}
          searchQuery={searchQuery}
          searchResults={searchResults}
        />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
