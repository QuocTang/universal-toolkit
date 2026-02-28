"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenuButton,
  SidebarMenuItem as SidebarMenuItemUI,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import type { ToolDefinition } from "@/core/registry/tool-registry.types";

interface SidebarMenuItemProps {
  tool: ToolDefinition;
}

export function SidebarMenuItem({ tool }: SidebarMenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname === tool.path;
  const Icon = tool.icon;

  return (
    <SidebarMenuItemUI>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={tool.name}
        className="transition-colors"
      >
        <Link href={tool.path}>
          <Icon className="h-4 w-4" />
          <span>{tool.name}</span>
        </Link>
      </SidebarMenuButton>
      {tool.badge && (
        <SidebarMenuBadge className="text-[10px] bg-primary/10 text-primary border-0 px-1.5">
          {tool.badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItemUI>
  );
}
