# Architecture

**Analysis Date:** 2026-03-21

## Pattern Overview

**Overall:** Next.js 16+ App Router with feature-based organization and framework-level internationalization

**Key Characteristics:**
- Server-rendered layouts with client-side dashboard pages (`'use client'`)
- Feature-sliced data/components co-located under `src/features/`
- All data is mock/static -- no real API calls, databases, or server actions
- Shared UI component library (shadcn/ui pattern) under `src/components/ui/`
- Multi-language support (English, Ukrainian) via next-intl at framework level
- Cookie-based locale and theme persistence
- Recharts visualizations with Tailwind CSS theming

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
  - `src/features/reports/data/` -- Report mock datasets

**Shared Components:**
- Purpose: Reusable layout shells, navigation, and generic UI primitives
- Location: `src/components/`
- Contains: Layout components (`layout/`), UI primitives (`ui/`), forms (`forms/`), command palette (`kbar/`), theming (`themes/`), modal (`modal/`), locale switcher
- Depends on: Lib utilities, Types, Config
- Used by: App routes and Feature components

**Layout Components:**
- Purpose: Page structure and navigation framework
- Location: `src/components/layout/`
- Contains:
  - `app-sidebar.tsx` (159 lines) - Renders collapsible navigation menu with i18n support
  - `header.tsx` (31 lines) - Top bar with breadcrumbs, search, locale switcher, theme toggle
  - `info-sidebar.tsx` (110 lines) - Right-side contextual information panel
  - `page-container.tsx` - Standard page wrapper
  - `providers.tsx` - Provider wrapper for root layout
- Depends on: Sidebar context, theme providers, i18n
- Used by: Dashboard layout (`src/app/dashboard/layout.tsx`)

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
- Contains: `nav-config.ts` (sidebar navigation items with i18n keys), `data-table.ts` (filter/sort operator definitions), `infoconfig.ts` (info sidebar content)
- Depends on: Types
- Used by: Layout components, Data table utilities

**Hooks:**
- Purpose: Custom React hooks for cross-cutting UI concerns
- Location: `src/hooks/`
- Contains: `use-breadcrumbs.tsx`, `use-media-query.ts`, `use-mobile.tsx`, `use-data-table.ts`, `use-nav.ts`, `use-debounce.tsx`, `use-callback-ref.ts`, `use-controllable-state.tsx`, `use-multistep-form.tsx`, `use-debounced-callback.ts`
- Depends on: React, Types, next-intl
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

**Internationalization (i18n):**
- Purpose: Framework-level multi-language support
- Location: `src/i18n/`
- Contains:
  - `config.ts` - Defines supported locales (['en', 'uk']) and default locale
  - `request.ts` - Cookie-based locale detection and message loading
- Depends on: next-intl library, cookies
- Used by: Root layout, all pages and components via useTranslations() hook

**Theme & Styling:**
- Purpose: Multi-theme support and global styling
- Location: `src/components/themes/`, `src/styles/`
- Contains:
  - `font.config.ts` - Font variable definitions
  - `theme.config.ts` - Theme palette and styling constants
  - `theme-provider.tsx` - Wrapper for next-themes
  - `theme-mode-toggle.tsx` - UI for switching dark/light/system
  - `active-theme.tsx` - Hook to read current theme from cookies
  - `globals.css` - Tailwind CSS with CSS custom properties
- Depends on: next-themes, Tailwind CSS 4
- Used by: Root layout, all components

**Styles:**
- Purpose: Global CSS, theme definitions, and CSS custom property tokens
- Location: `src/styles/`
- Contains: `globals.css`, theme variables, Tailwind config
- Depends on: Tailwind CSS, CSS custom properties
- Used by: Root layout (`src/app/layout.tsx`)

## Data Flow

**Root Application Initialization:**

1. User requests any route
2. `src/app/layout.tsx` (root server component) executes:
   - Reads cookies for theme persistence
   - Calls `getLocale()` and `getMessages()` from next-intl/server
   - Wraps app with NuqsAdapter (URL search param state)
   - Wraps app with NextIntlClientProvider (i18n context)
   - Wraps app with ThemeProvider (dark/light/system mode)
   - Renders Toaster (Sonner) for notifications
   - Sets HTML lang attribute and data-theme

**Dashboard Page Rendering:**

1. User navigates to `/dashboard/exec` or similar route
2. Next.js App Router matches `src/app/dashboard/[feature]/page.tsx`
3. `src/app/dashboard/layout.tsx` wraps page with:
   - KBar (command palette with keyboard shortcuts)
   - SidebarProvider (manages sidebar open/close state via cookie)
   - InfobarProvider (context for right info sidebar)
   - AppSidebar component (navigation)
   - Header component (top bar)
   - InfoSidebar component (right panel)
4. Feature page component renders with mock data imported from `src/features/*/data/`
5. Client-side hooks manage filtering, sorting, pagination
6. Recharts visualizations render client-side using `chartPalette` CSS variables

**Navigation & Localization Flow:**

1. `src/config/nav-config.ts` defines `navItems` array with:
   - `title`: English fallback
   - `titleKey`: i18n translation key (resolved via `useTranslations('nav')`)
   - `url`: Route path
   - `icon`: Icon key from Icons registry
   - `items`: Optional nested items
2. `src/components/layout/app-sidebar.tsx` renders navigation:
   - Calls `useTranslations('nav')` to get translation function
   - Renders collapsible menu with localized titles
   - Uses `usePathname()` to highlight active route
   - Calls `useFilteredNavItems()` hook for role-based filtering (placeholder)
3. `src/components/kbar/` registers same navItems for Cmd+K command palette
4. Breadcrumbs derived from pathname via `use-breadcrumbs` hook

**Locale Switching:**

1. User clicks locale switcher button in header (`src/components/locale-switcher.tsx`)
2. Component calls `window.location.reload()` with new locale query param
3. Next.js routing handles locale switch
4. Cookie updated with new locale preference
5. Messages re-fetched for new locale
6. Page re-renders with translated strings

**Theme Persistence:**

1. Root layout reads `active_theme` cookie value
2. Applies `data-theme` attribute to HTML element
3. ThemeProvider manages class-based dark mode via next-themes
4. Script in head sets meta theme-color based on localStorage
5. User toggles theme via ThemeModeToggle component
6. Cookie updated; page re-renders with new theme

**Feature Data Display (Metric Insight Example):**

1. `src/app/dashboard/exec/page.tsx` renders
2. Page imports feature components from `src/features/exec/cashback-impact/components/`
3. KpiMetricCard components display KPI values with metricId references
4. User clicks card or info icon
5. Card calls `onInfoOpen(metricId)` callback
6. MetricInsightDrawer opens (Sheet component)
7. Drawer imports metric definition from `src/features/exec/cashback-impact/data/metric-catalog.ts`
8. Displays formula, drivers, actions, thresholds from catalog
9. useInfobar() hook populates right sidebar with related context

**State Management Flows:**

- **URL state**: nuqs library for search/filter/sort params serialized to URL query strings
- **Local component state**: useState for page-level UI state
- **Theme state**: Cookie-based via next-themes + custom themes
- **Sidebar state**: Cookie-based open/close persistence
- **Locale state**: Cookie-based via next-intl
- **Info sidebar content**: Managed via InfobarProvider context

## Key Abstractions

**NavItem Interface:**
- Purpose: Represents a navigation menu entry with i18n support
- Location: `src/types/index.ts`
- Properties: title, titleKey (i18n key), url, icon, isActive, items (nested), shortcut, disabled, external
- Pattern: Recursive structure enables nested menu hierarchies; titleKey enables translation without duplication

**PageContainer:**
- Purpose: Standard page wrapper providing scroll area, loading skeleton, access control, optional page header
- Location: `src/components/layout/page-container.tsx`
- Pattern: Every dashboard page wraps content in `<PageContainer>` -- can use `pageTitle`/`pageDescription` props or render custom header inside

**Chart Palette:**
- Purpose: Theme-aware color system for all Recharts visualizations using CSS custom properties
- Location: `src/lib/chart-theme.ts`
- Pattern: Import `chartPalette` object, use `chartPalette.primary` etc. as fill/stroke values. Tokens resolve from `--chart-primary` CSS variables defined per theme

**Metric Catalog:**
- Purpose: Structured knowledge base for KPI metrics with formulas, drivers, actions, thresholds, and caveats
- Location: `src/features/exec/cashback-impact/data/metric-catalog.ts`
- Types:
  - `MetricCatalogItem`: id, title, shortDefinition, quickFormula, formula, drivers, actions, thresholds, caveats
  - `MetricThreshold`: level (good|watch|risk), label, condition, interpretation
  - `MetricAction`: role (Product|CRM|Risk|Finance), action, expectedImpact
- Pattern: Array with `getMetricById()` lookup function

**Data Table Config:**
- Purpose: Centralized filter/sort operator definitions for TanStack React Table
- Location: `src/config/data-table.ts`, `src/lib/data-table.ts`, `src/types/data-table.ts`
- Pattern: `dataTableConfig` defines operators by type (text, numeric, date, select). URL serialization via `src/lib/parsers.ts`

**Icons Registry:**
- Purpose: Named icon map used by nav config and components
- Location: `src/components/icons.tsx`
- Pattern: `Icons` object maps string keys to Tabler icon components. Nav items reference icons by key

**Internationalization Context:**
- Purpose: Provide translation function throughout app
- Pattern: Root layout wraps with NextIntlClientProvider. Components call `useTranslations('namespace')` to get `t()` function. All user-facing text use keys: `t('key')`

## Entry Points

**Root Layout (`src/app/layout.tsx`):**
- Triggers: Every page load (Next.js root layout)
- Responsibilities: HTML shell, font config, meta theme color, i18n setup, providers (NuqsAdapter, ThemeProvider, NextIntlClientProvider, Toaster, TopLoader)

**Dashboard Layout (`src/app/dashboard/layout.tsx`):**
- Triggers: All `/dashboard/*` routes
- Responsibilities: KBar, SidebarProvider with cookie-persisted state, InfobarProvider, AppSidebar, Header, InfoSidebar

**Root Page (`src/app/page.tsx`):**
- Triggers: Visiting `/`
- Responsibilities: Redirects to `/dashboard/exec`

**Dashboard Index (`src/app/dashboard/page.tsx`):**
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

## Error Handling

**Strategy:** Error boundaries with Sentry integration and graceful fallbacks

**Patterns:**
- Global error boundary (`src/app/global-error.tsx`) captures to Sentry and renders fallback UI
- 404 handler (`src/app/not-found.tsx`) renders custom "go back" UI
- URL parser functions in `src/lib/parsers.ts` use `try/catch` with `safeParse()` returning `null` on failure
- Mock data functions are infallible (no external I/O)
- Toast notifications via Sonner for user feedback
- Sentry client-side error capturing via @sentry/nextjs wrapper

## Cross-Cutting Concerns

**Logging:** Sentry for production error tracking; development mode uses Spotlight. No custom logging framework.

**Validation:** Zod schemas in `src/lib/parsers.ts` for URL search param parsing. React Hook Form + @hookform/resolvers available for form components. No server-side validation (no API routes).

**Authentication:** None implemented. All pages accessible. Sidebar shows placeholder text for sign-in.

**Authorization:** Navigation filtering stub via `useFilteredNavItems()` hook in `src/hooks/use-nav.ts`. Ready for role-based logic.

**Theming:** Multi-theme support via next-themes + custom themes. Themes defined as CSS custom properties in `src/styles/`. Cookie-persisted active theme. Chart colors use CSS variables for automatic theme adaptation.

**Internationalization:** next-intl framework-level support. Locales: ['en', 'uk']. Locale stored in cookie, detected on request. All user text uses i18n keys with namespaces: `t('key')` from `useTranslations('namespace')`.

**Monitoring:** Sentry with source maps, custom domain tunnel (/monitoring), widenClientFileUpload enabled, Spotlight in development.

---

*Architecture analysis: 2026-03-21*
