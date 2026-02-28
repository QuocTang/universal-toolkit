"use client";

import { useActiveRoute } from "@/core/hooks/useActiveRoute";
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

export function HeaderBreadcrumb() {
  const { activeTool, activeCategory } = useActiveRoute();

  return (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center gap-1.5">
            <Home className="h-3.5 w-3.5" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        {activeCategory && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-muted-foreground">
                {activeCategory.label}
              </span>
            </BreadcrumbItem>
          </>
        )}

        {activeTool && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{activeTool.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
