// core/registry/tool-registry.ts

import { create } from "zustand";
import type {
  ToolRegistryState,
  ToolDefinition,
  ToolCategory,
} from "./tool-registry.types";

export const useToolRegistry = create<ToolRegistryState>((set, get) => ({
  tools: new Map(),
  categories: new Map(),

  register: (tool: ToolDefinition) => {
    set((state) => {
      const newTools = new Map(state.tools);
      newTools.set(tool.id, tool);
      return { tools: newTools };
    });
  },

  registerCategory: (category: ToolCategory) => {
    set((state) => {
      const newCategories = new Map(state.categories);
      newCategories.set(category.id, category);
      return { categories: newCategories };
    });
  },

  getToolsByCategory: (categoryId: string) => {
    const tools = Array.from(get().tools.values());
    return tools
      .filter((t) => t.category === categoryId)
      .sort((a, b) => a.order - b.order);
  },

  searchTools: (query: string) => {
    const q = query.toLowerCase();
    return Array.from(get().tools.values()).filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q)),
    );
  },

  getToolByPath: (path: string) => {
    return Array.from(get().tools.values()).find((t) => t.path === path);
  },
}));
