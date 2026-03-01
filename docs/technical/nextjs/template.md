# Boilerplate cho Module Chuẩn

Đây là template code để khi tạo một module tính năng mới. Cấu trúc này đảm bảo tách biệt IO, Logic, và UI.

## 1. Cấu trúc Thư mục

```
features/new-module/
├── components/     # UI Components
├── hooks/          # React Hooks & Business Logic
├── models/         # Data Models & View Models
├── services/       # API Calls (IO Only)
├── types/          # Types & Interfaces
├── config.ts       # Constants & Config
├── query-keys.ts   # React Query Keys Factory
└── index.ts        # Public API
```

---

## 2. config.ts

Nơi định nghĩa API endpoints và các hằng số.

```typescript
import { environment } from "@/core/environment";

export const MODULE_NAME_APIS = {
  query: `${environment.API_BASE_URL}/api/v1/module-name/list`,
  detail: `${environment.API_BASE_URL}/api/v1/module-name/detail`,
  create: `${environment.API_BASE_URL}/api/v1/module-name`,
  update: `${environment.API_BASE_URL}/api/v1/module-name`,
  delete: `${environment.API_BASE_URL}/api/v1/module-name`,
};

export const MODULE_NAME_QUERY_KEYS = {
  list: (filter: unknown) => ["module-name", "list", filter] as const,
  detail: (id: string) => ["module-name", "detail", id] as const,
};
```

---

## 3. types/index.ts

Định nghĩa các Interface và Enum.

```typescript
export interface ModuleNameSearchCriteria {
  page: number;
  perPage: number;
  keyword?: string;
  // Add other filters here
}

export interface ModuleNameDto {
  id: string;
  name: string;
  created_at: string;
  // Raw API types
}
```

---

## 4. services/module-name.service.ts

**Quy tắc**: Chỉ IO, không Logic, không Transform.

```typescript
import { HttpClient } from "@/core/http/http-client";
import { MODULE_NAME_APIS } from "../config";
import type { ModuleNameSearchCriteria } from "../types";

export const fetchModuleNameList = async (
  criteria: ModuleNameSearchCriteria,
) => {
  const response = await HttpClient.get(MODULE_NAME_APIS.query, {
    params: criteria,
  });
  return response.data; // Return RAW data
};

export const fetchModuleNameDetail = async (id: string) => {
  const response = await HttpClient.get(`${MODULE_NAME_APIS.detail}/${id}`);
  return response.data;
};
```

---

## 5. models/index.ts

**Quy tắc**: Transform từ API Raw -> Domain Model.

```typescript
import type { ModuleNameDto } from "../types";

export class ModuleNameModel {
  id: string;
  name: string;
  createdAt: Date;

  constructor(data: ModuleNameDto) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = new Date(data.created_at);
  }

  // Static Factory Method
  static fromAPI(data: unknown): ModuleNameModel {
    const dto = data as ModuleNameDto;
    return new ModuleNameModel(dto);
  }
}
```

---

## 6. hooks/use-get-list.ts

**Quy tắc**: Sử dụng `useQuery` để fetch data và map sang Model.

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchModuleNameList } from "../services/module-name.service";
import { MODULE_NAME_QUERY_KEYS } from "../config";
import { ModuleNameModel } from "../models";
import type { ModuleNameSearchCriteria } from "../types";

export const useGetModuleNameList = (criteria: ModuleNameSearchCriteria) =>
  useQuery({
    queryKey: MODULE_NAME_QUERY_KEYS.list(criteria),
    queryFn: async () => {
      const response = await fetchModuleNameList(criteria);
      return {
        items: (response.list || []).map(ModuleNameModel.fromAPI),
        total: response.total || 0,
      };
    },
  });
```

---

## 7. hooks/use-url-state.ts

**Quy tắc**: Quản lý state filter trên URL.

```typescript
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo, useCallback } from "react";

export function useModuleNameUrlState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const criteria = useMemo(
    () => ({
      page: Number(searchParams.get("page")) || 1,
      perPage: Number(searchParams.get("perPage")) || 10,
      keyword: searchParams.get("keyword") || "",
    }),
    [searchParams],
  );

  const setCriteria = useCallback(
    (updates: Partial<typeof criteria>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, String(value));
        else params.delete(key);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  return { criteria, setCriteria };
}
```

---

## 8. components/ModuleNameList.tsx

**Quy tắc**: UI Component chỉ nhận data và render.

```typescript
import { useGetModuleNameList } from '../hooks/use-get-list';
import { useModuleNameUrlState } from '../hooks/use-url-state';

export function ModuleNameList() {
  const { criteria, setCriteria } = useModuleNameUrlState();
  const { data, isLoading } = useGetModuleNameList(criteria);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Filter Component */}
      <input
        value={criteria.keyword}
        onChange={(e) => setCriteria({ keyword: e.target.value, page: 1 })}
      />

      {/* List Component */}
      {data?.items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## 9. index.ts

Public API cho module khác sử dụng.

```typescript
export * from "./components/ModuleNameList";
export * from "./hooks/use-get-list";
export * from "./models";
export * from "./types";
```

---

## 10. App Router Integration (app/)

Tích hợp vào Next.js App Router.

```typescript
import { Metadata } from 'next';
import { ModuleName } from '@/features/module-name'; // Import từ feature index

export const metadata: Metadata = {
  title: 'Module Name',
  description: 'Mô tả module...',
};

export default function ModuleNamePage() {
  return (
    <ModuleName />
  );
}
```

---

## 11. App Storage Keys (core/app-storage/)

**Quy tắc**: Tất cả storage keys phải được khai báo tập trung, **KHÔNG** hardcode key strings rải rác trong code.

### Cấu trúc

```
core/app-storage/
├── local-storage.ts      # localStorage keys
├── cookie-storage.ts     # Cookie keys
└── session-storage.ts    # sessionStorage keys
```

### Quy ước đặt tên key

Mỗi file storage có 2 nhóm:

- **GLOBAL** — Keys dùng chung toàn app (theme, auth token, user preferences...)
- **FEATURE** — Keys dành riêng cho từng feature module

```typescript
// core/app-storage/local-storage.ts

export const LOCAL_STORAGE_KEY = {
  GLOBAL: {
    THEME: "global.theme",
    // Thêm global keys tại đây
  },
  FEATURE: {
    // Khi feature cần localStorage, khai báo tại đây
    // MD_TO_DOCX_DRAFT: "feature.md-to-docx.draft",
  },
} as const;
```

### Cách sử dụng trong feature module

```typescript
// features/settings/hooks/useSettings.ts
import { LOCAL_STORAGE_KEY } from "@/core/app-storage/local-storage";

// ❌ SAI: hardcode key
localStorage.getItem("theme");

// ✅ ĐÚNG: dùng key từ app-storage
localStorage.getItem(LOCAL_STORAGE_KEY.GLOBAL.THEME);
```

### Khi nào dùng loại storage nào?

| Storage            | Khi nào dùng                             | Ví dụ                                  |
| ------------------ | ---------------------------------------- | -------------------------------------- |
| **localStorage**   | Persist qua sessions, client-only        | Theme, user preferences, draft content |
| **sessionStorage** | Chỉ trong tab hiện tại, mất khi đóng tab | Form state tạm, scroll position        |
| **Cookie**         | Cần gửi lên server (SSR, API auth)       | Auth token, locale (nếu cần SSR)       |

---

## 12. Quy tắc chung

1. **Không hardcode magic strings** — Sử dụng constants từ `config.ts` hoặc `core/app-storage/`.
2. **Tách IO, Logic, UI** — Services chỉ IO, Hooks chứa logic, Components chỉ render.
3. **Feature module tự chứa** — Mỗi feature có types, config, hooks, components, index riêng.
4. **Public API qua index.ts** — Module khác chỉ import từ feature index, không import trực tiếp file con.
