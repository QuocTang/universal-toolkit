# 🛠️ Universal Toolkit Web - Idea & Architecture

> **Mục tiêu**: Xây dựng một nền tảng web tích hợp nhiều tool (utilities) khác nhau, có khả năng mở rộng dễ dàng, UI hiện đại, mỗi tool hoạt động độc lập không ảnh hưởng lẫn nhau.

---

## 📋 Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Yêu cầu kiến trúc](#2-yêu-cầu-kiến-trúc)
3. [Technical Stack](#3-technical-stack)
4. [Kiến trúc tổng thể](#4-kiến-trúc-tổng-thể)
5. [Cấu trúc thư mục](#5-cấu-trúc-thư-mục)
6. [Chi tiết thiết kế](#6-chi-tiết-thiết-kế)
7. [Plugin/Tool Registry System](#7-plugintool-registry-system)
8. [State Management Strategy](#8-state-management-strategy)
9. [UI/UX Design System](#9-uiux-design-system)
10. [Quy trình thêm Tool mới](#10-quy-trình-thêm-tool-mới)
11. [Roadmap phát triển](#11-roadmap-phát-triển)

---

## 1. Tổng quan

**Universal Toolkit Web** là một Single Page Application (SPA) đóng vai trò như một "hộp công cụ" (toolbox) trên nền web. Mỗi tool là một module/feature độc lập, được đăng ký vào hệ thống thông qua một **Tool Registry**, và được render trong một layout chung với **left sidebar menu** hỗ trợ đa cấp (multi-level).

### Đặc điểm chính:

- 🧩 **Modular**: Mỗi tool là một module độc lập, có thể phát triển và deploy riêng lẻ
- 🔌 **Plug-and-play**: Thêm tool mới chỉ cần đăng ký vào registry, không sửa code core
- 🎨 **Modern UI**: Sử dụng Shadcn/ui + TailwindCSS, hỗ trợ Dark/Light mode
- ⚡ **Performance**: Lazy loading per tool, caching thông minh với React Query
- 🏗️ **Scalable**: Kiến trúc cho phép mở rộng không giới hạn số lượng tool

---

## 2. Yêu cầu kiến trúc

| #   | Yêu cầu              | Mô tả                                                                   |
| --- | -------------------- | ----------------------------------------------------------------------- |
| 1   | **Left Menu đa cấp** | Sidebar chứa danh sách tool, hỗ trợ nhóm (group) và tool con (sub-tool) |
| 2   | **Tính độc lập**     | Mỗi tool có state, logic, UI riêng — lỗi ở tool A không crash tool B    |
| 3   | **UI hiện đại**      | Thiết kế responsive, animation mượt, dark/light theme                   |
| 4   | **Dễ mở rộng**       | Thêm tool mới chỉ cần: tạo folder + đăng ký vào registry                |
| 5   | **Performance**      | Code-splitting per tool, chỉ load khi cần                               |
| 6   | **Error Boundary**   | Mỗi tool được wrap trong Error Boundary riêng                           |

---

## 3. Technical Stack

| Công nghệ                        | Vai trò                | Lý do chọn                                             |
| -------------------------------- | ---------------------- | ------------------------------------------------------ |
| **Next.js (App Router)**         | Framework chính        | SSR/SSG, file-based routing, React Server Components   |
| **TailwindCSS**                  | Styling                | Utility-first, dễ customize, performance tốt           |
| **Shadcn/ui**                    | UI Components          | Accessible, customizable, dựa trên Radix UI            |
| **Zustand**                      | Global State           | Nhẹ, đơn giản, không boilerplate, hỗ trợ slice pattern |
| **React Query (TanStack Query)** | Server State & Caching | Cache API data, background refetch, optimistic updates |
| **Axios**                        | HTTP Client            | Interceptors, request/response transform, cancellation |
| **React Hook Form**              | Form Management        | Performance tốt, ít re-render, validation dễ dàng      |
| **Three.js**                     | 3D Visualization       | Cho các tool cần hiển thị 3D (optional per tool)       |
| **usehooks-ts**                  | React Hooks utilities  | Collection hooks hữu ích, TypeScript native            |
| **Lodash**                       | Utilities              | Xử lý data, debounce, throttle, deep clone...          |
| **Zod**                          | Schema Validation      | Type-safe validation, tích hợp tốt với React Hook Form |
| **Framer Motion**                | Animation              | Smooth transitions giữa các tool/page                  |

---

## 4. Kiến trúc tổng thể

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Shell                         │
│  ┌───────────┐  ┌─────────────────────────────────────────────┐ │
│  │           │  │              Content Area                    │ │
│  │   Left    │  │  ┌─────────────────────────────────────────┐│ │
│  │  Sidebar  │  │  │         Toolbar / Breadcrumb            ││ │
│  │           │  │  ├─────────────────────────────────────────┤│ │
│  │  ┌─────┐  │  │  │                                         ││ │
│  │  │Group│  │  │  │     Tool Content (lazy loaded)          ││ │
│  │  │ ┌──┐│  │  │  │                                         ││ │
│  │  │ │T1││  │  │  │   ┌─────────────────────────────────┐  ││ │
│  │  │ ├──┤│  │  │  │   │    Error Boundary Wrapper        │  ││ │
│  │  │ │T2││  │  │  │   │  ┌───────────────────────────┐  │  ││ │
│  │  │ └──┘│  │  │  │   │  │   Tool-Specific Component │  │  ││ │
│  │  └─────┘  │  │  │   │  │   (own state, own logic)  │  │  ││ │
│  │  ┌─────┐  │  │  │   │  └───────────────────────────┘  │  ││ │
│  │  │Group│  │  │  │   └─────────────────────────────────┘  ││ │
│  │  │ ┌──┐│  │  │  │                                         ││ │
│  │  │ │T3││  │  │  └─────────────────────────────────────────┘│ │
│  │  │ └──┘│  │  └─────────────────────────────────────────────┘ │
│  │  └─────┘  │                                                   │
│  └───────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Layer Architecture

```
┌──────────────────────────────────────────────┐
│              Presentation Layer               │
│   (Shadcn/ui + TailwindCSS + Framer Motion)  │
├──────────────────────────────────────────────┤
│              Application Layer                │
│         (Tool Components + Layouts)           │
├──────────────────────────────────────────────┤
│              State Layer                      │
│  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Zustand     │  │   React Query       │   │
│  │ (Client State)│  │  (Server State)     │   │
│  └──────────────┘  └─────────────────────┘   │
├──────────────────────────────────────────────┤
│              Service Layer                    │
│       (Axios instances + API clients)         │
├──────────────────────────────────────────────┤
│              Core / Shared Layer              │
│   (Registry, Types, Utils, Hooks, Config)     │
└──────────────────────────────────────────────┘
```

---

## 5. Cấu trúc thư mục

> 💡 **Path alias**: `@/*` map vào root (`./`), không dùng thư mục `src/`.
> Ví dụ: `import { HttpClient } from "@/core/http/http-client"`

```
universal-toolkit-web/
├── app/                          # 📂 Next.js App Router
│   ├── layout.tsx                # Root layout (Providers + AppShell)
│   ├── page.tsx                  # Dashboard / Home
│   ├── globals.css               # TailwindCSS global styles
│   ├── (tools)/                  # Route group cho tools
│   │   ├── layout.tsx            # Tool layout (breadcrumb, toolbar)
│   │   ├── json-formatter/
│   │   │   └── page.tsx          # lazy import từ features/
│   │   ├── color-picker/
│   │   │   └── page.tsx
│   │   ├── image-converter/
│   │   │   └── page.tsx
│   │   └── [toolSlug]/           # Dynamic route fallback
│   │       └── page.tsx
│   └── settings/
│       └── page.tsx
│
├── core/                         # 🧠 Core system (KHÔNG thay đổi khi thêm tool)
│   ├── environment.ts            # ✅ Đã có — Centralized env với validation
│   ├── http/
│   │   └── http-client.ts        # ✅ Đã có — Axios instance + interceptors
│   ├── providers/
│   │   └── react-query.provider.tsx  # ✅ Đã có — QueryClient + ThemeProvider
│   ├── registry/                 # ⬜ Sẽ tạo
│   │   ├── tool-registry.ts      # Tool Registry (Zustand store)
│   │   ├── tool-registry.types.ts
│   │   └── index.ts
│   ├── layout/                   # ⬜ Sẽ tạo
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarMenu.tsx   # Render menu đa cấp
│   │   │   ├── SidebarMenuItem.tsx
│   │   │   └── SidebarSearch.tsx  # Tìm kiếm tool
│   │   ├── header/
│   │   │   ├── Header.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── content/
│   │   │   ├── ContentArea.tsx
│   │   │   └── ToolErrorBoundary.tsx
│   │   └── AppShell.tsx          # Combine sidebar + header + content
│   └── hooks/
│       ├── useToolRegistry.ts
│       └── useActiveRoute.ts
│
├── features/                     # 🔧 Mỗi tool là 1 feature module
│   ├── json-formatter/           # (Theo template chuẩn)
│   │   ├── components/           # UI components riêng
│   │   ├── hooks/                # Custom hooks + React Query
│   │   ├── models/               # Data transform (DTO → Domain Model)
│   │   ├── services/             # API calls (IO only, không logic)
│   │   ├── types/                # TypeScript types & interfaces
│   │   ├── config.ts             # API endpoints + constants
│   │   ├── query-keys.ts         # React Query keys factory
│   │   ├── index.tsx             # Entry component (default export)
│   │   └── registry.ts          # Tool registration config
│   │
│   ├── color-picker/
│   │   ├── components/
│   │   ├── ...                   # (cùng cấu trúc template)
│   │   └── registry.ts
│   │
│   └── image-converter/
│       ├── components/
│       ├── ...
│       └── registry.ts
│
├── shared/                       # 📦 Shared giữa các tool
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Shadcn/ui components
│   │   ├── CodeEditor.tsx
│   │   ├── FileUploader.tsx
│   │   ├── CopyButton.tsx
│   │   └── OutputPanel.tsx
│   ├── hooks/                    # Shared custom hooks
│   │   ├── useClipboard.ts
│   │   ├── useFileReader.ts
│   │   └── useDebounce.ts
│   ├── types/                    # Shared TypeScript types
│   │   └── common.ts
│   └── utils/                    # Shared utility functions
│       ├── format.ts
│       └── validation.ts
│
├── config/                       # ⚙️ App configuration
│   ├── site.ts                   # Site metadata
│   ├── tools.ts                  # Tool registration (central entry)
│   └── navigation.ts             # Menu structure
│
├── public/
│   └── icons/                    # Tool icons, favicon
│
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json                 # paths: { "@/*": ["./*"] }
├── package.json
├── .env.local
└── eslint.config.mjs
```

### 5.1 Feature Module Template (Chuẩn hóa)

> Xem chi tiết tại: [`docs/technical/nextjs/template.md`](file:///Users/quoctang/workspaces/personal/universal-toolkit/docs/technical/nextjs/template.md)

Mỗi feature/tool tuân theo cấu trúc module chuẩn:

```
features/<tool-name>/
├── components/       # UI Components (chỉ render, không logic)
├── hooks/            # React Hooks & Business Logic
├── models/           # Data Models: transform DTO → Domain Model
├── services/         # API Calls (IO Only — không logic, không transform)
├── types/            # Types & Interfaces
├── config.ts         # API endpoints & constants
├── query-keys.ts     # React Query Keys Factory
├── index.tsx         # Entry component (default export)
└── registry.ts       # Tool registration config (ToolDefinition)
```

**Quy tắc phân tầng:**

| Layer         | File               | Quy tắc                                                 |
| ------------- | ------------------ | ------------------------------------------------------- |
| **Service**   | `services/*.ts`    | Chỉ IO (gọi API), return raw data, không transform      |
| **Model**     | `models/*.ts`      | Transform từ API DTO → Domain Model                     |
| **Hook**      | `hooks/*.ts`       | Business logic, `useQuery`/`useMutation`, map qua Model |
| **Component** | `components/*.tsx` | Chỉ nhận data + render UI, không gọi API trực tiếp      |

---

## 6. Chi tiết thiết kế

### 6.1 Tool Definition (Type System)

```typescript
// core/registry/tool-registry.types.ts

export interface ToolCategory {
  id: string;
  label: string;
  icon: React.ComponentType;
  description?: string;
  order: number;
}

export interface ToolDefinition {
  // Metadata
  id: string; // unique slug: "json-formatter"
  name: string; // display name: "JSON Formatter"
  description: string;
  icon: React.ComponentType; // Lucide icon hoặc custom
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
```

### 6.2 Tool Registration Pattern

```typescript
// features/json-formatter/registry.ts

import { lazy } from "react";
import { Code2 } from "lucide-react";
import type { ToolDefinition } from "@/core/registry/tool-registry.types";

const JsonFormatterTool = lazy(() => import("./index"));

export const jsonFormatterRegistry: ToolDefinition = {
  id: "json-formatter",
  name: "JSON Formatter",
  description: "Format, validate, and minify JSON data",
  icon: Code2,
  category: "developer",
  tags: ["json", "format", "validate", "minify", "developer"],
  order: 1,
  path: "/json-formatter",
  component: JsonFormatterTool,
  badge: "Popular",
};
```

### 6.3 Auto-Discovery Registry

```typescript
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
```

### 6.4 Auto-Registration Entry (Centralized)

```typescript
// config/tools.ts — Nơi duy nhất cần sửa khi thêm tool mới

import { jsonFormatterRegistry } from "@/features/json-formatter/registry";
import { colorPickerRegistry } from "@/features/color-picker/registry";
import { imageConverterRegistry } from "@/features/image-converter/registry";
// ➕ Import thêm tool mới ở đây

import type {
  ToolDefinition,
  ToolCategory,
} from "@/core/registry/tool-registry.types";

export const toolCategories: ToolCategory[] = [
  { id: "developer", label: "Developer Tools", icon: CodeIcon, order: 1 },
  { id: "design", label: "Design Tools", icon: PaletteIcon, order: 2 },
  { id: "converter", label: "Converters", icon: RefreshCwIcon, order: 3 },
  { id: "text", label: "Text Tools", icon: TypeIcon, order: 4 },
  { id: "3d", label: "3D Tools", icon: Box, order: 5 },
  // ➕ Thêm category mới ở đây
];

export const registeredTools: ToolDefinition[] = [
  jsonFormatterRegistry,
  colorPickerRegistry,
  imageConverterRegistry,
  // ➕ Thêm tool mới ở đây
];
```

---

## 7. Plugin/Tool Registry System

### 7.1 Lifecycle của một Tool

```
    ┌──────────────┐
    │  Tool Module  │   1. Developer tạo feature module
    │  (feature/)   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  registry.ts  │   2. Khai báo ToolDefinition
    │  (metadata)   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ config/tools  │   3. Import vào danh sách tools
    │  (central)    │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  App Init     │   4. Registry đăng ký tất cả tools
    │  (providers)  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Sidebar     │   5. Menu render dựa trên registry
    │  (auto-gen)   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Navigation   │   6. Click → lazy load component
    │  (on-demand)  │
    └──────────────┘
```

### 7.2 Error Isolation

> 💡 Sử dụng thư viện [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary) — wrapper functional component cho Error Boundary API.
> Thêm vào dependencies: `npm install react-error-boundary`

```typescript
// core/layout/content/ToolErrorBoundary.tsx

'use client';

import { type ReactNode, useCallback } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ToolErrorBoundaryProps {
  toolName: string;
  children: ReactNode;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <AlertTriangle className="w-12 h-12 text-destructive" />
      <h3 className="text-lg font-semibold">Tool gặp lỗi</h3>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        {error.message}
      </p>
      <Button onClick={resetErrorBoundary} variant="outline" className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Thử lại
      </Button>
    </div>
  );
}

export function ToolErrorBoundary({ toolName, children }: ToolErrorBoundaryProps) {
  const handleError = useCallback((error: Error, info: { componentStack?: string | null }) => {
    console.error(`[Tool Error: ${toolName}]`, error, info);
    // Optional: gửi lên error tracking service (Sentry, LogRocket, ...)
  }, [toolName]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset bất kỳ state nào cần thiết khi user bấm "Thử lại"
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## 8. State Management Strategy

### 8.1 Phân loại State

```
┌───────────────────────────────────────────────────────────────┐
│                      State Architecture                       │
├───────────────────┬───────────────────┬───────────────────────┤
│   Global State    │   Server State    │   Tool-Local State    │
│   (Zustand)       │   (React Query)   │   (useState/Zustand)  │
├───────────────────┼───────────────────┼───────────────────────┤
│ • Theme (dark/    │ • API responses   │ • Form data           │
│   light)          │ • Cached data     │ • Tool-specific UI    │
│ • Sidebar state   │ • Background      │ • Temporary state     │
│   (open/closed)   │   refetching      │ • Editor content      │
│ • User prefs      │ • Pagination      │                       │
│ • Active tool     │ • Mutation state   │                       │
│ • Notifications   │                   │                       │
└───────────────────┴───────────────────┴───────────────────────┘
```

### 8.2 Zustand Store Pattern (Slice Pattern)

```typescript
// Mỗi tool có thể tạo slice riêng nếu cần persistent state

// features/json-formatter/store/json-formatter.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JsonFormatterState {
  indentSize: number;
  sortKeys: boolean;
  setIndentSize: (size: number) => void;
  toggleSortKeys: () => void;
}

export const useJsonFormatterStore = create<JsonFormatterState>()(
  persist(
    (set) => ({
      indentSize: 2,
      sortKeys: false,
      setIndentSize: (size) => set({ indentSize: size }),
      toggleSortKeys: () => set((s) => ({ sortKeys: !s.sortKeys })),
    }),
    { name: "json-formatter-settings" },
  ),
);
```

### 8.3 React Query Usage Pattern

```typescript
// Ví dụ: Tool có cần gọi API

// features/ip-lookup/hooks/useIpLookup.ts
import { useQuery } from "@tanstack/react-query";
import { ipLookupService } from "../services/ip-lookup.service";

export const useIpLookup = (ip: string) => {
  return useQuery({
    queryKey: ["ip-lookup", ip],
    queryFn: () => ipLookupService.lookup(ip),
    enabled: !!ip,
    staleTime: 5 * 60 * 1000, // cache 5 phút
  });
};
```

---

## 9. UI/UX Design System

### 9.1 Layout Concept

```
┌──────────────────────────────────────────────────────────────┐
│  🛠️ Universal Toolkit          🔍 Search...    🌙  👤       │  ← Header
├────────────────┬─────────────────────────────────────────────┤
│                │  Home > Developer > JSON Formatter           │  ← Breadcrumb
│  📁 Developer  │─────────────────────────────────────────────│
│    ├ JSON      │                                              │
│    ├ Base64    │     ┌─────────────────────────────────┐      │
│    └ Regex     │     │                                 │      │
│                │     │      Tool Content Area           │      │
│  📁 Design     │     │                                 │      │
│    ├ Color     │     │   (Rendered từ lazy component)  │      │
│    └ Gradient  │     │                                 │      │
│                │     │                                 │      │
│  📁 Converter  │     └─────────────────────────────────┘      │
│    ├ Image     │                                              │
│    └ Unit      │                                              │
│                │                                              │
│  📁 3D Tools   │                                              │
│    └ Viewer    │                                              │
│                │                                              │
│  ─────────────│                                              │
│  ⚙️ Settings   │                                              │
└────────────────┴─────────────────────────────────────────────┘
```

### 9.2 Design Principles

| Nguyên tắc             | Chi tiết                                                   |
| ---------------------- | ---------------------------------------------------------- |
| **Consistent**         | Tất cả tool sử dụng chung Design System (Shadcn/ui tokens) |
| **Responsive**         | Sidebar collapsible trên mobile, tool content responsive   |
| **Accessible**         | ARIA labels, keyboard navigation, focus management         |
| **Dark Mode First**    | Thiết kế dark mode trước, light mode adapt                 |
| **Micro-interactions** | Framer Motion cho page transitions, hover effects          |

### 9.3 Sidebar Features

- **Collapsible groups**: Click vào group header để mở/đóng
- **Search/Filter**: Thanh tìm kiếm tool ở đầu sidebar
- **Badges**: Hiển thị "New", "Beta", "Updated" trên tool item
- **Favorite/Pin**: Cho phép user pin tool hay dùng lên đầu
- **Collapse mode**: Thu nhỏ sidebar chỉ hiện icon
- **Keyboard shortcut**: `Ctrl + K` mở Command Palette tìm tool nhanh

### 9.4 Shared UI Components cho Tools

| Component            | Mô tả                                                   |
| -------------------- | ------------------------------------------------------- |
| `<CodeEditor />`     | Monaco-based editor cho input/output code               |
| `<FileUploader />`   | Drag & drop file upload                                 |
| `<CopyButton />`     | Copy to clipboard với feedback                          |
| `<OutputPanel />`    | Panel hiển thị output, hỗ trợ nhiều format              |
| `<ToolHeader />`     | Header chuẩn cho mỗi tool (title, description, actions) |
| `<SplitPane />`      | Input/Output split view (horizontal/vertical)           |
| `<SettingsDrawer />` | Drawer cho tool settings                                |

---

## 10. Quy trình thêm Tool mới

### Checklist khi thêm tool:

```bash
# 1. Tạo feature folder (theo template chuẩn)
mkdir -p features/my-new-tool/{components,hooks,models,services,types}

# 2. Tạo các file cần thiết
touch features/my-new-tool/{index.tsx,registry.ts,config.ts,query-keys.ts}

# 3. Tạo route page
mkdir -p app/(tools)/my-new-tool
touch app/(tools)/my-new-tool/page.tsx
```

### File mẫu cần tạo:

**`registry.ts`** — Khai báo tool metadata:

```typescript
import { lazy } from "react";
import { Wrench } from "lucide-react";
import type { ToolDefinition } from "@/core/registry/tool-registry.types";

const MyNewTool = lazy(() => import("./index"));

export const myNewToolRegistry: ToolDefinition = {
  id: "my-new-tool",
  name: "My New Tool",
  description: "Mô tả tool",
  icon: Wrench,
  category: "developer", // chọn category phù hợp
  tags: ["keyword1", "keyword2"],
  order: 10,
  path: "/my-new-tool",
  component: MyNewTool,
};
```

**`index.tsx`** — Entry component:

```tsx
export default function MyNewTool() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My New Tool</h2>
      {/* Tool content */}
    </div>
  );
}
```

**`page.tsx`** — Route page:

```tsx
import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/core/layout/content/ToolErrorBoundary";

const MyNewTool = dynamic(() => import("@/features/my-new-tool"), {
  loading: () => <div>Loading...</div>,
});

export default function MyNewToolPage() {
  return (
    <ToolErrorBoundary toolName="My New Tool">
      <MyNewTool />
    </ToolErrorBoundary>
  );
}
```

**Cuối cùng, đăng ký vào `config/tools.ts`:**

```typescript
import { myNewToolRegistry } from "@/features/my-new-tool/registry";

export const registeredTools: ToolDefinition[] = [
  // ... existing tools
  myNewToolRegistry, // ➕ Thêm dòng này
];
```

> ✅ **Chỉ cần 4 bước: tạo folder → viết component → khai báo registry → import vào config**

---

## 11. Roadmap phát triển

### Phase 1 — Foundation (MVP)

- [ ] Setup Next.js + TailwindCSS + Shadcn/ui
- [ ] Xây dựng App Shell (Sidebar + Content Area + Header)
- [ ] Implement Tool Registry system
- [ ] Implement Error Boundary per tool
- [ ] Dark/Light theme toggle
- [ ] 2-3 tool mẫu: JSON Formatter, Base64 Encoder, Color Picker

### Phase 2 — Core Features

- [ ] Command Palette (Ctrl+K) search tool
- [ ] Tool favorites / pinning
- [ ] Shared components (CodeEditor, FileUploader, CopyButton)
- [ ] Responsive sidebar (collapse on mobile)
- [ ] Settings page (user preferences)

### Phase 3 — Enhancement

- [ ] React Query integration cho tool có API
- [ ] Three.js integration cho 3D tools
- [ ] Tool usage analytics
- [ ] PWA support (offline-capable tools)
- [ ] i18n (đa ngôn ngữ)

### Phase 4 — Advanced

- [ ] Plugin marketplace (community tools)
- [ ] User authentication + saved tool configs
- [ ] Tool sharing (share config via URL)
- [ ] AI-powered tool suggestions
- [ ] CLI companion tool

---

## 📌 Tổng kết

| Aspect            | Quyết định                                            |
| ----------------- | ----------------------------------------------------- |
| **Framework**     | Next.js App Router                                    |
| **Routing**       | File-based + dynamic `[toolSlug]` fallback            |
| **Menu**          | Auto-generated từ Tool Registry, hỗ trợ đa cấp        |
| **Isolation**     | Error Boundary per tool + lazy loading                |
| **State**         | Zustand (global) + React Query (server) + local state |
| **Styling**       | TailwindCSS + Shadcn/ui + Framer Motion               |
| **Extensibility** | Registry pattern — 4 bước thêm tool mới               |

> **"Convention over Configuration"** — Tuân theo cấu trúc folder và naming convention, tool mới sẽ tự động hoạt động với hệ thống.
