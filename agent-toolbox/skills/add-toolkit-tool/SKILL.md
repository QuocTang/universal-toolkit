---
name: add-toolkit-tool
description: Hướng dẫn tích hợp một tool mới vào Universal Toolkit Web
---

# Skill: Thêm Tool mới vào Universal Toolkit Web

> Skill này hướng dẫn từng bước tạo và tích hợp một tool/feature mới vào Universal Toolkit Web. Mọi thao tác tuân thủ conventions trong `docs/technical/nextjs/template.md`.

## Thông tin cần thu thập từ user

Trước khi bắt đầu, xác nhận với user các thông tin:

| Thông tin                  | Ví dụ                                                    | Bắt buộc |
| -------------------------- | -------------------------------------------------------- | -------- |
| **Tool name** (kebab-case) | `hash-generator`                                         | ✅       |
| **Display name**           | `Hash Generator`                                         | ✅       |
| **Description**            | `Generate MD5, SHA-1, SHA-256 hashes`                    | ✅       |
| **Category**               | `developer` \| `design` \| `converter` \| `text` \| `3d` | ✅       |
| **Icon** (Lucide)          | `Hash`                                                   | ✅       |
| **Badge** (optional)       | `New`, `Popular`, `Beta`                                 | ❌       |
| **Có gọi API không?**      | `có` / `không`                                           | ✅       |

> **Categories hiện có** (xem `config/navigation.ts`):
> `developer`, `design`, `converter`, `text`, `3d`
> Nếu cần category mới → thêm vào `config/navigation.ts`

## Đường dẫn gốc

```
ROOT = /Users/quoctang/workspaces/personal/universal-toolkit/microservices/universal-toolkit-web
```

Tất cả đường dẫn bên dưới đều tương đối từ `ROOT`.

---

## Bước 1: Tạo cấu trúc thư mục feature

```bash
mkdir -p features/<tool-name>/{components,hooks,types}
```

Nếu tool cần gọi API, thêm:

```bash
mkdir -p features/<tool-name>/{services,models}
```

### Cấu trúc đầy đủ:

```
features/<tool-name>/
├── components/       # UI Components (chỉ render, KHÔNG logic)
├── hooks/            # React Hooks & Business Logic
├── types/            # Types & Interfaces
├── models/           # (nếu cần) Data transform
├── services/         # (nếu cần) API calls — chỉ IO
├── config.ts         # Constants & config
├── query-keys.ts     # (nếu cần) React Query keys
├── registry.ts       # Tool registration (ToolDefinition)
└── index.tsx         # Entry component (default export)
```

---

## Bước 2: Tạo `types/index.ts`

Định nghĩa tất cả types/interfaces cho tool.

```typescript
// features/<tool-name>/types/index.ts

export interface <ToolName>State {
  // Khai báo state
}

// Thêm các types khác tùy theo tool
```

---

## Bước 3: Tạo `config.ts`

```typescript
// features/<tool-name>/config.ts

/**
 * Constants & Config cho <Tool Display Name>
 */

// Nếu tool KHÔNG cần API:
export const <TOOL_NAME>_CONFIG = {
  // constants
} as const;

// Nếu tool CÓ API:
import { environment } from "@/core/environment";

export const <TOOL_NAME>_APIS = {
  query: `${environment.API_BASE_URL}/api/v1/<tool-name>/list`,
  detail: `${environment.API_BASE_URL}/api/v1/<tool-name>/detail`,
};

export const <TOOL_NAME>_QUERY_KEYS = {
  list: (filter: unknown) => ["<tool-name>", "list", filter] as const,
  detail: (id: string) => ["<tool-name>", "detail", id] as const,
};
```

> ⚠️ **Lưu ý**: Nếu dùng `as const` trên object, giá trị primitive bên trong sẽ thành literal type. Nếu giá trị đó cần là `number` hoặc `string` chung, hãy cast rõ: `2 as number` hoặc `"#fff" as string`.

---

## Bước 4: Tạo `hooks/use<ToolName>.ts`

**Quy tắc quan trọng**: Tất cả business logic nằm ở đây, KHÔNG nằm trong component.

```typescript
// features/<tool-name>/hooks/use<ToolName>.ts

"use client";

import { useState, useCallback } from "react";
import { <TOOL_NAME>_CONFIG } from "../config";

export function use<ToolName>() {
  // State
  // Logic (handleXxx callbacks)
  // Return { state, actions }
}
```

Nếu tool có API, dùng React Query:

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetch<ToolName>List } from "../services/<tool-name>.service";
import { <TOOL_NAME>_QUERY_KEYS } from "../config";
import { <ToolName>Model } from "../models";

export const useGet<ToolName>List = (criteria: SearchCriteria) =>
  useQuery({
    queryKey: <TOOL_NAME>_QUERY_KEYS.list(criteria),
    queryFn: async () => {
      const response = await fetch<ToolName>List(criteria);
      return {
        items: (response.list || []).map(<ToolName>Model.fromAPI),
        total: response.total || 0,
      };
    },
  });
```

---

## Bước 5: Tạo `services/` (chỉ khi có API)

**Quy tắc**: Chỉ IO, không logic, không transform.

```typescript
// features/<tool-name>/services/<tool-name>.service.ts

import { HttpClient } from "@/core/http/http-client";
import { <TOOL_NAME>_APIS } from "../config";

export const fetch<ToolName>List = async (criteria: SearchCriteria) => {
  const response = await HttpClient.get(<TOOL_NAME>_APIS.query, { params: criteria });
  return response.data; // Return RAW
};
```

---

## Bước 6: Tạo `models/` (chỉ khi cần transform data)

**Quy tắc**: Transform từ API DTO → Domain Model, hoặc chứa utility functions.

```typescript
// features/<tool-name>/models/index.ts

import type { <ToolName>Dto } from "../types";

export class <ToolName>Model {
  // Transform logic
  static fromAPI(data: unknown): <ToolName>Model { ... }
}
```

---

## Bước 7: Tạo `components/`

**Quy tắc**: Component chỉ nhận data + render. KHÔNG chứa business logic.

Tách UI thành nhiều component nhỏ:

```typescript
// features/<tool-name>/components/<ComponentName>.tsx

"use client";

interface <ComponentName>Props {
  // Props — nhận data từ parent/hook
}

export function <ComponentName>({ ... }: <ComponentName>Props) {
  return (
    // Render UI
  );
}
```

---

## Bước 8: Tạo `index.tsx` (Entry Component)

**Quy tắc**: Entry chỉ compose hooks + components. KHÔNG chứa logic.

```tsx
// features/<tool-name>/index.tsx

"use client";

import { use<ToolName> } from "./hooks/use<ToolName>";
import { <Component1> } from "./components/<Component1>";
import { <Component2> } from "./components/<Component2>";

export default function <ToolName>Tool() {
  const { /* state, actions */ } = use<ToolName>();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight"><Tool Display Name></h2>
        <p className="text-muted-foreground"><Description></p>
      </div>
      {/* Compose components with hook data */}
    </div>
  );
}
```

---

## Bước 9: Tạo `registry.ts`

```typescript
// features/<tool-name>/registry.ts

import { lazy } from "react";
import { <IconName> } from "lucide-react";
import type { ToolDefinition } from "@/core/registry/tool-registry.types";

const <ToolName>Tool = lazy(() => import("./index"));

export const <toolName>Registry: ToolDefinition = {
  id: "<tool-name>",
  name: "<Tool Display Name>",
  description: "<Description>",
  icon: <IconName>,
  category: "<category-id>",
  tags: ["<tag1>", "<tag2>"],
  order: <number>,
  path: "/<tool-name>",
  component: <ToolName>Tool,
  // badge: "New",  // optional
};
```

---

## Bước 10: Tạo route page

```tsx
// app/(tools)/<tool-name>/page.tsx

import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/core/layout/content/ToolErrorBoundary";

const <ToolName> = dynamic(
  () => import("@/features/<tool-name>"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Đang tải <Tool Display Name>...
      </div>
    ),
  },
);

export default function <ToolName>Page() {
  return (
    <ToolErrorBoundary toolName="<Tool Display Name>">
      <<ToolName> />
    </ToolErrorBoundary>
  );
}
```

---

## Bước 11: Đăng ký vào `config/tools.ts`

Thêm 2 dòng:

```typescript
// config/tools.ts

import { <toolName>Registry } from "@/features/<tool-name>/registry";
// ➕ Thêm import ở đây

export const registeredTools: ToolDefinition[] = [
  // ... existing tools
  <toolName>Registry, // ➕ Thêm vào mảng
];
```

> ⚠️ **Nếu cần category mới**: thêm vào `config/navigation.ts` trước.

---

## Bước 12: Verify

```bash
# Build check
npm run build

# Hoặc dev server
npm run dev
# Kiểm tra: http://localhost:3000/<tool-name>
```

**Checklist verify:**

- [ ] Tool hiển thị trong sidebar đúng category
- [ ] Click vào tool → navigate + lazy load
- [ ] Tool hoạt động đúng chức năng
- [ ] Error boundary bao đúng
- [ ] Breadcrumb hiển thị: Home > Category > Tool Name

---

## Tóm tắt files cần tạo

| #   | File                                                   | Bắt buộc              |
| --- | ------------------------------------------------------ | --------------------- |
| 1   | `features/<tool-name>/types/index.ts`                  | ✅                    |
| 2   | `features/<tool-name>/config.ts`                       | ✅                    |
| 3   | `features/<tool-name>/hooks/use<ToolName>.ts`          | ✅                    |
| 4   | `features/<tool-name>/services/<tool-name>.service.ts` | Chỉ khi có API        |
| 5   | `features/<tool-name>/models/index.ts`                 | Chỉ khi cần transform |
| 6   | `features/<tool-name>/components/*.tsx`                | ✅                    |
| 7   | `features/<tool-name>/index.tsx`                       | ✅                    |
| 8   | `features/<tool-name>/registry.ts`                     | ✅                    |
| 9   | `app/(tools)/<tool-name>/page.tsx`                     | ✅                    |
| 10  | `config/tools.ts` (sửa)                                | ✅                    |

## Quy tắc phân tầng (QUAN TRỌNG)

| Layer         | File               | Quy tắc                                         |
| ------------- | ------------------ | ----------------------------------------------- |
| **Service**   | `services/*.ts`    | Chỉ IO (gọi API), return raw, không transform   |
| **Model**     | `models/*.ts`      | Transform từ DTO → Domain Model                 |
| **Hook**      | `hooks/*.ts`       | Business logic, useQuery/useMutation, state     |
| **Component** | `components/*.tsx` | Chỉ nhận data + render, không gọi API trực tiếp |
| **Entry**     | `index.tsx`        | Compose hooks + components, không logic         |
