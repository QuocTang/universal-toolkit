"use client";

import { ChevronRight } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu as SidebarMenuUI,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarMenuItem } from "./SidebarMenuItem";
import type {
  ToolCategory,
  ToolDefinition,
} from "@/core/registry/tool-registry.types";

interface SidebarToolMenuProps {
  categories: ToolCategory[];
  getToolsByCategory: (categoryId: string) => ToolDefinition[];
  searchQuery?: string;
  searchResults?: ToolDefinition[];
}

export function SidebarToolMenu({
  categories,
  getToolsByCategory,
  searchQuery,
  searchResults,
}: SidebarToolMenuProps) {
  // Nếu đang search, hiển thị kết quả search thay vì categories
  if (searchQuery && searchResults && searchResults.length > 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Kết quả tìm kiếm</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenuUI>
            {searchResults.map((tool) => (
              <SidebarMenuItem key={tool.id} tool={tool} />
            ))}
          </SidebarMenuUI>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (searchQuery && (!searchResults || searchResults.length === 0)) {
    return (
      <SidebarGroup>
        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
          Không tìm thấy tool nào
        </div>
      </SidebarGroup>
    );
  }

  return (
    <>
      {categories.map((category) => {
        const tools = getToolsByCategory(category.id);
        if (tools.length === 0) return null;

        const CategoryIcon = category.icon;

        return (
          <Collapsible
            key={category.id}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent transition-colors">
                  <CategoryIcon className="h-4 w-4 mr-1.5" />
                  {category.label}
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenuUI>
                    {tools.map((tool) => (
                      <SidebarMenuItem key={tool.id} tool={tool} />
                    ))}
                  </SidebarMenuUI>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        );
      })}
    </>
  );
}
