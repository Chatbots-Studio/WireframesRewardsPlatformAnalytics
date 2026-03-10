# Architecture

**Analysis Date:** 2026-03-10

## Pattern Overview

**Overall:** Next.js App Router with feature-based organization

**Key Characteristics:**
- Server-rendered shell (layouts) with client-side dashboard pages (`'use client'`)
- Feature-sliced data/components co-located under `src/features/`
- All data is mock/static -- no real API calls, databases, or server actions
- Shared UI component library (shadcn/ui pattern) under `src/components/ui/`
- Ukrainian-language domain content (banking cashback analytics platform)

## Layers

**App Routes (Pages & Layouts):**
- Purpose: Define URL routes and render page-level React components
- Location: `src/app/`
- Contains: `page.tsx` (route pages), `layout.tsx` (nested layouts), `not-found.tsx`, `global-error.tsx`
- Depends on: Components layer, Features layer, Lib utilities
- Used by: Next.js router (automatic file-system routing)

**Features:**
- Purpose: Domain-specific logic, data catalogs, and specialized components for each analytics section
- Location: `src/features/`
- Contains: Mock data files (`data/*.mock.ts`, `data/*.ts`), feature-specific components (`components/*.tsx`)
- Depends on: UI components, Lib utilities
- Used by: App route pages
- Sub-features:
  - `src/features/exec/cashback-impact/` -- KPI metric catalog, cards, drawers for executive dashboard
  - `src/features/cashback/data/` -- Analytics dictionaries mock data
  - `src/features/reports/data/` -- Fraud report mock data

**Shared Components:**
- Purpose: Reusable layout shells, navigation, and generic UI primitives
- Location: `src/components/`
- Contains: Layout components (`layout/`), UI primitives (`ui/`), forms (`forms/`), command palette (`kbar/`), theming (`themes/`), modal (`modal/`)
- Depends on: Lib utilities, Types, Config
- Used by: App routes and Feature components

**UI Primitives (shadcn/ui):**
- Purpose: Low-level, design-system-aligned UI components (buttons, cards, tables, dialogs, etc.)
- Location: `src/components/ui/`
- Contains: ~50 component files following shadcn/ui conventions
- Depends on: Radix UI primitives, `@/lib/utils` (cn function)
- Used by: All other layers

**Library / Utilities:**
- Purpose: Shared helper functions, parsers, data-table utilities, chart theming
- Location: `src/lib/`
- Contains: `utils.ts` (cn, formatBytes), `format.ts` (date formatting), `chart-theme.ts` (CSS-variable chart palette), `parsers.ts` (nuqs URL parsers), `searchparams.ts` (search param cache), `data-table.ts` (TanStack table helpers)
- Depends on: Config, Types
- Used by: Components, Features, Pages

**Configuration:**
- Purpose: Centralized app config for navigation, data tables, and info panels
- Location: `src/config/`
- Contains: `nav-config.ts` (sidebar navigation items), `data-table.ts` (filter/sort operator definitions), `infoconfig.ts` (info sidebar content)
- Depends on: Types
- Used by: Layout components, Data table utilities

**Hooks:**
- Purpose: Custom React hooks for cross-cutting UI concerns
- Location: `src/hooks/`
- Contains: `use-breadcrumbs.tsx`, `use-media-query.ts`, `use-mobile.tsx`, `use-data-table.ts`, `use-nav.ts`, `use-debounce.tsx`, `use-callback-ref.ts`, `use-controllable-state.tsx`, `use-multistep-form.tsx`, `use-debounced-callback.ts`
- Depends on: React, Types
- Used by: Components, Pages

**Types:**
- Purpose: Shared TypeScript type definitions
- Location: `src/types/`
- Contains: `index.ts` (NavItem types), `data-table.ts` (table filter/sort types with TanStack module augmentation), `base-form.ts` (form field types)
- Depends on: External type packages
- Used by: Config, Components, Hooks, Lib

**Constants:**
- Purpose: Static data and mock API for legacy product listing feature
- Location: `src/constants/`
- Contains: `data.ts` (Product type, sample sales data), `mock-api.ts` (fake product CRUD with faker.js)
- Depends on: `@faker-js/faker`, `match-sorter`
- Used by: Possibly legacy pages (not actively used by current dashboard routes)

**Styles:**
- Purpose: Global CSS, theme definitions, and CSS custom property tokens
- Location: `src/styles/`
- Contains: `globals.css`, `theme.css`, `themes/42flows.css`
- Depends on: Tailwind CSS
- Used by: Root layout (`src/app/layout.tsx`)

## Data Flow

**Dashboard Page Rendering:**

1. User navigates to a URL (e.g., `/dashboard/exec`)
2. Next.js App Router matches `src/app/dashboard/exec/page.tsx`
3. Root layout (`src/app/layout.tsx`) wraps with providers: NuqsAdapter, ThemeProvider, ActiveThemeProvider, Toaster
4. Dashboard layout (`src/app/dashboard/layout.tsx`) wraps with KBar, SidebarProvider, InfobarProvider, AppSidebar, Header
5. Page component renders with hardcoded mock data inline or imported from `src/features/*/data/`
6. Recharts renders visualizations client-side using `chartPalette` CSS variables

**Navigation:**

1. `src/config/nav-config.ts` defines `navItems` array with titles, URLs, icons, keyboard shortcuts
2. `src/components/layout/app-sidebar.tsx` reads `navItems`, renders sidebar with collapsible sub-items
3. `src/components/kbar/index.tsx` registers same `navItems` for Cmd+K command palette
4. `src/components/breadcrumbs.tsx` derives breadcrumbs from current pathname

**Feature Data (Metric Insight Drill-down):**

1. Page renders KPI cards from `KPI_CARDS` array with `metricId` references
2. `getMetricById()` from `src/features/exec/cashback-impact/data/metric-catalog.ts` resolves full metric definition
3. User clicks card or info icon -- `KpiMetricCard` calls `onInfoOpen(metricId)`
4. `MetricInsightDrawer` (Sheet component) opens with formula, drivers, actions, thresholds from catalog

**State Management:**
- **URL state**: `nuqs` library for search/filter/sort params serialized to URL query strings (`src/lib/parsers.ts`, `src/lib/searchparams.ts`)
- **Local component state**: `useState` for page-level UI state (selected category, drawer open/close, filters)
- **Global state**: `zustand` is listed as a dependency but not actively used in current codebase
- **Theme state**: Cookie-based theme persistence via `cookies()` server function + `ActiveThemeProvider` context
- **Sidebar state**: Cookie-based open/close persistence

## Key Abstractions

**PageContainer:**
- Purpose: Standard page wrapper providing scroll area, loading skeleton, access control, optional page header with title/description/info
- Examples: `src/components/layout/page-container.tsx`
- Pattern: Every dashboard page wraps content in `<PageContainer>` -- some use the `pageTitle`/`pageDescription` props, others render their own header inside

**Chart Palette:**
- Purpose: Theme-aware color system for all Recharts visualizations using CSS custom properties
- Examples: `src/lib/chart-theme.ts`
- Pattern: Import `chartPalette` object, use `chartPalette.primary` etc. as `fill`/`stroke` values. Tokens resolve from `--chart-primary` etc. CSS variables defined per theme in `src/styles/themes/`

**Navigation Config:**
- Purpose: Single source of truth for all sidebar items, Cmd+K shortcuts, and breadcrumbs
- Examples: `src/config/nav-config.ts`
- Pattern: Array of `NavItem` objects with `title`, `url`, `icon`, `shortcut`, optional nested `items`

**Metric Catalog:**
- Purpose: Structured knowledge base for KPI metrics with formulas, drivers, actions, thresholds, and caveats
- Examples: `src/features/exec/cashback-impact/data/metric-catalog.ts`
- Pattern: `MetricCatalogItem[]` array with `getMetricById()` lookup. Each metric has `id`, `title`, `shortDefinition`, `quickFormula`, `formula`, `drivers`, `actions`, `thresholds`, `caveats`

**Data Table Config:**
- Purpose: Centralized filter/sort operator definitions for TanStack React Table integration
- Examples: `src/config/data-table.ts`, `src/lib/data-table.ts`, `src/types/data-table.ts`
- Pattern: `dataTableConfig` defines all operators, variants, and join operators. `getFiltersStateParser()`/`getSortingStateParser()` from `src/lib/parsers.ts` serialize table state to URL

**Icons Registry:**
- Purpose: Named icon map used by nav config and components
- Examples: `src/components/icons.tsx`
- Pattern: `Icons` object maps string keys to Tabler icon components. Nav items reference icons by key name

## Entry Points

**Root Layout (`src/app/layout.tsx`):**
- Location: `src/app/layout.tsx`
- Triggers: Every page load (Next.js root layout)
- Responsibilities: HTML shell, font config, meta theme color, providers (NuqsAdapter, ThemeProvider, ActiveThemeProvider), Toaster, NextTopLoader

**Dashboard Layout (`src/app/dashboard/layout.tsx`):**
- Location: `src/app/dashboard/layout.tsx`
- Triggers: All `/dashboard/*` routes
- Responsibilities: KBar command palette, SidebarProvider with cookie-persisted state, InfobarProvider, AppSidebar, Header, InfoSidebar

**Root Page (`src/app/page.tsx`):**
- Location: `src/app/page.tsx`
- Triggers: Visiting `/`
- Responsibilities: Redirects to `/dashboard/exec`

**Dashboard Index (`src/app/dashboard/page.tsx`):**
- Location: `src/app/dashboard/page.tsx`
- Triggers: Visiting `/dashboard`
- Responsibilities: Redirects to `/dashboard/exec`

**Sentry Instrumentation:**
- Location: `src/instrumentation.ts`, `src/instrumentation-client.ts`
- Triggers: Application startup (Node.js and Edge runtimes)
- Responsibilities: Initialize Sentry error tracking (conditionally via `NEXT_PUBLIC_SENTRY_DISABLED`)

**Global Error Boundary:**
- Location: `src/app/global-error.tsx`
- Triggers: Unhandled errors in any route
- Responsibilities: Captures exception to Sentry, renders fallback error page

**Proxy / Middleware:**
- Location: `src/proxy.ts`
- Triggers: All matched requests via path matcher
- Responsibilities: Currently a pass-through (`NextResponse.next()`) -- placeholder for future middleware

## Error Handling

**Strategy:** Minimal -- relies on Next.js error boundaries and Sentry

**Patterns:**
- Global error boundary (`src/app/global-error.tsx`) captures to Sentry and renders `NextError`
- 404 handler (`src/app/not-found.tsx`) renders custom "go back" / "back to home" UI
- URL parser functions in `src/lib/parsers.ts` use `try/catch` with `safeParse()` returning `null` on failure
- Mock data functions are infallible (no external I/O)
- No explicit error boundaries at page or component level
- No toast-based error notifications (Sonner toaster exists but used for success actions only)

## Cross-Cutting Concerns

**Logging:** No structured logging framework. Sentry captures runtime exceptions. No console.log patterns observed in production code.

**Validation:** Zod schemas in `src/lib/parsers.ts` for URL search param parsing. `react-hook-form` + `@hookform/resolvers` available for form validation (form components exist in `src/components/forms/`). No server-side validation (no API routes or server actions).

**Authentication:** None implemented. No auth provider, no session management, no protected routes. Sidebar shows placeholder "Sign in to manage your account" text.

**Theming:** Multi-theme support via `next-themes` + custom `ActiveThemeProvider`. Themes defined as CSS custom properties in `src/styles/themes/`. Cookie-persisted active theme. Chart colors use CSS variable references for automatic theme adaptation.

**Internationalization:** Not implemented. UI text is hardcoded in Ukrainian for dashboard content. Some boilerplate text remains in English (404 page, metadata descriptions).

---

*Architecture analysis: 2026-03-10*
