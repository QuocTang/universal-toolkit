# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Universal Toolkit is a monorepo containing a modular web application that provides developer/designer utility tools. The primary application lives in `microservices/universal-toolkit-web/` — a Next.js 16 app using App Router, React 19, TypeScript, Tailwind CSS v4, and Shadcn UI.

## Commands

All commands run from `microservices/universal-toolkit-web/`:

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

Prerequisites: Node.js v20+, pnpm v9+.

## Architecture

### Tool Registry Pattern

The app uses a **Zustand-based Tool Registry** (`core/registry/tool-registry.ts`) that dynamically manages all tools. Each tool registers itself with metadata (id, name, path, category, lazy-loaded component) via its own `registry.ts` file. The `ToolInitializer` provider (`core/providers/tool-initializer.tsx`) registers all tools on app mount.

### Feature Module Structure

Each tool is a self-contained feature module in `features/[tool-name]/`:

```
features/[tool-name]/
├── index.tsx        # Main component (lazy loaded)
├── registry.ts      # Tool metadata & registration
├── config.ts        # Constants
├── types/           # TypeScript interfaces
├── hooks/           # Custom hooks
├── components/      # Feature-specific UI
├── models/          # Business logic
└── actions/         # Server actions (if needed)
```

Current tools: json-formatter, base64-encoder, color-picker, md-to-docx, settings.

### Routing

Next.js App Router with route groups:
- `app/(tools)/[tool-name]/page.tsx` — tool pages
- `app/settings/page.tsx` — settings
- `app/api/` — API routes (e.g., server-side LaTeX-to-OMML conversion)

### Category System

Tool categories use `CATEGORY_IDS` enum in `config/navigation.ts` (DEVELOPER, DESIGN, CONVERTER, TEXT, THREE_D).

### Layout

`AppShell` (`core/layout/AppShell.tsx`) wraps the app with Shadcn SidebarProvider: Sidebar + Header + Content + Footer.

## Key Conventions

- **Path alias**: `@/*` maps to the web app root (`microservices/universal-toolkit-web/`)
- **Styling**: Tailwind CSS v4 with CSS-first config in `app/globals.css` using `@theme` inline and OKLch colors. Shadcn uses new-york style with zinc base color.
- **State**: Zustand for global state (tool registry), React Query for server state (60s stale, 5min cache), React Hook Form + Zod for forms
- **HTTP**: Axios-based client in `core/http/http-client.ts`
- **Storage keys**: Centralized in `core/app-storage/local-storage.ts`
- **Server-only packages**: Configured in `next.config.ts` via `serverExternalPackages` (e.g., `latex-to-omml`, `mathjax-node`)

## Adding a New Tool

1. Create feature module in `features/[tool-name]/` following the structure above
2. Create `registry.ts` with tool metadata (id, name, path, category, icon, lazy component)
3. Add route page in `app/(tools)/[tool-name]/page.tsx`
4. Register the tool in `core/providers/tool-initializer.tsx`

## Agent Skills

The `agent/` and `agent-toolbox/skills/` directories contain AI agent skills for automating tasks like scaffolding new tools (`add-toolkit-tool`), generating READMEs (`awesome-readme`), and creating feature modules (`nextjs-feature-module`).
