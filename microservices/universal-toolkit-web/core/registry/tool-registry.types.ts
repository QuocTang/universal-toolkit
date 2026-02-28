// core/registry/tool-registry.types.ts

export interface ToolCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  order: number;
}

export interface ToolDefinition {
  // Metadata
  id: string; // unique slug: "json-formatter"
  name: string; // display name: "JSON Formatter"
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string; // category id
  tags: string[]; // cho search/filter
  order: number; // thứ tự trong menu

  // Routing
  path: string; // "/json-formatter"

  // Component (lazy loaded)
  component: React.LazyExoticComponent<React.ComponentType>;

  // Optional
  badge?: string; // "New", "Beta", "Pro"
  isDisabled?: boolean;
  requiredPermissions?: string[];

  // Sub-tools (hỗ trợ đa cấp)
  children?: ToolDefinition[];
}

export interface ToolRegistryState {
  tools: Map<string, ToolDefinition>;
  categories: Map<string, ToolCategory>;
  register: (tool: ToolDefinition) => void;
  registerCategory: (category: ToolCategory) => void;
  getToolsByCategory: (categoryId: string) => ToolDefinition[];
  searchTools: (query: string) => ToolDefinition[];
  getToolByPath: (path: string) => ToolDefinition | undefined;
}
