"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToolRegistryHelper } from "@/core/hooks/useToolRegistry";

interface SidebarSearchProps {
  onSearchResults?: (query: string) => void;
}

export function SidebarSearch({ onSearchResults }: SidebarSearchProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearchResults?.(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Tìm kiếm tool..."
        value={query}
        onChange={handleChange}
        className="pl-8 h-8 text-sm"
      />
    </div>
  );
}
