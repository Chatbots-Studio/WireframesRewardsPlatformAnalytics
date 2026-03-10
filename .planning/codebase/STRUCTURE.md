# Codebase Structure

**Analysis Date:** 2026-03-10

## Directory Layout

```
[project-root]/
├── .claude/                    # Claude Code configuration
├── .cursor/                    # Cursor editor configuration
├── .github/                    # GitHub workflows/config
├── .husky/                     # Git hooks (pre-commit formatting)
├── .planning/                  # GSD planning documents
│   ├── codebase/               # Codebase analysis (this doc)
│   └── phases/                 # Implementation phase plans
├── .vscode/                    # VSCode settings
├── design_system/              # Design system reference assets
├── docs/                       # Documentation and plans
│   └── plans/                  # Feature planning docs
├── public/                     # Static assets
│   └── assets/                 # Images, SVGs, etc.
├── src/                        # Application source code
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── about/              # /about page
│   │   ├── dashboard/          # /dashboard/* (main app area)
│   │   │   ├── ab-tests/       # /dashboard/ab-tests
│   │   │   ├── cashback/       # /dashboard/cashback
│   │   │   │   └── dictionaries/ # /dashboard/cashback/dictionaries
│   │   │   ├── communications/ # /dashboard/communications
│   │   │   ├── exec/           # /dashboard/exec (default landing)
│   │   │   │   └── cashback-impact/ # /dashboard/exec/cashback-impact
│   │   │   └── reports/        # /dashboard/reports
│   │   │       └── quick-cashback-refund/
│   │   ├── privacy-policy/     # /privacy-policy
│   │   └── terms-of-service/   # /terms-of-service
│   ├── components/             # Shared React components
│   │   ├── forms/              # Form field components (react-hook-form)
│   │   ├── kbar/               # Cmd+K command palette
│   │   ├── layout/             # App shell: sidebar, header, providers
│   │   ├── modal/              # Modal dialogs
│   │   ├── themes/             # Theme provider, config, toggle
│   │   └── ui/                 # shadcn/ui primitives (~50 components)
│   │       └── table/          # Advanced table sub-components
│   ├── config/                 # App configuration
│   ├── constants/              # Static data and mock API
│   ├── features/               # Feature-sliced domain logic
│   │   ├── cashback/           # Cashback analytics feature
│   │   │   └── data/           # Mock data for dictionaries
│   │   ├── exec/               # Executive dashboard feature
│   │   │   └── cashback-impact/ # Cashback impact sub-feature
│   │   │       ├── components/ # KPI cards, drawers, info triggers
│   │   │       └── data/       # Metric catalog
│   │   └── reports/            # Reports feature
│   │       └── data/           # Mock data for fraud reports
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions and helpers
│   ├── styles/                 # CSS files
│   │   └── themes/             # Per-theme CSS variable overrides
│   └── types/                  # Shared TypeScript type definitions
├── components.json             # shadcn/ui config
├── Dockerfile                  # Docker build
├── docker-compose.yml          # Docker Compose
├── eslint.config.mjs           # ESLint config
├── next.config.ts              # Next.js config (Sentry plugin)
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS config
├── tsconfig.json               # TypeScript config
└── project-description.md      # Project description document
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router file-system routes
- Contains: `page.tsx` (route handlers), `layout.tsx` (nested layouts), `not-found.tsx`, `global-error.tsx`
- Key files:
  - `src/app/layout.tsx` -- Root HTML shell, global providers
  - `src/app/page.tsx` -- Root redirect to `/dashboard/exec`
  - `src/app/dashboard/layout.tsx` -- Dashboard shell (sidebar, header, kbar)
  - `src/app/dashboard/exec/page.tsx` -- Executive ROI dashboard (default landing)
  - `src/app/dashboard/exec/cashback-impact/page.tsx` -- Cashback impact analysis (~1250 lines)
  - `src/app/dashboard/cashback/page.tsx` -- Product manager funnel dashboard
  - `src/app/dashboard/cashback/dictionaries/page.tsx` -- Analytics dictionaries
  - `src/app/dashboard/communications/page.tsx` -- Communications analytics
  - `src/app/dashboard/ab-tests/page.tsx` -- A/B test analytics
  - `src/app/dashboard/reports/quick-cashback-refund/page.tsx` -- Fraud detection report

**`src/components/`:**
- Purpose: Shared components used across multiple pages
- Contains: Layout shells, UI primitives, form fields, modal, command palette, theming
- Key files:
  - `src/components/layout/app-sidebar.tsx` -- Main navigation sidebar
  - `src/components/layout/header.tsx` -- Top header bar with breadcrumbs, search, theme toggle
  - `src/components/layout/page-container.tsx` -- Standard page wrapper with scroll, loading, access control
  - `src/components/layout/providers.tsx` -- Client-side provider composition
  - `src/components/layout/info-sidebar.tsx` -- Right info sidebar panel
  - `src/components/icons.tsx` -- Named icon registry (Tabler icons)
  - `src/components/breadcrumbs.tsx` -- Breadcrumb navigation
  - `src/components/search-input.tsx` -- Search input component
  - `src/components/nav-main.tsx` -- Main navigation items
  - `src/components/nav-projects.tsx` -- Project navigation items
  - `src/components/nav-user.tsx` -- User navigation items

**`src/components/ui/`:**
- Purpose: Low-level UI primitives (shadcn/ui pattern)
- Contains: ~50 component files, each wrapping Radix UI with Tailwind styling
- Key files:
  - `src/components/ui/card.tsx` -- Card container
  - `src/components/ui/button.tsx` -- Button variants
  - `src/components/ui/sidebar.tsx` -- Sidebar primitives (SidebarProvider, SidebarContent, etc.)
  - `src/components/ui/infobar.tsx` -- Info sidebar primitives (InfobarProvider, InfobarContent type)
  - `src/components/ui/table.tsx` -- Basic table elements
  - `src/components/ui/table/` -- Advanced data table sub-components (directory)
  - `src/components/ui/chart.tsx` -- Chart wrapper
  - `src/components/ui/frame.tsx` -- Frame component
  - `src/components/ui/heading.tsx` -- Page heading with optional info button
  - `src/components/ui/modal.tsx` -- Modal dialog wrapper
  - `src/components/ui/form.tsx` -- Form primitives (react-hook-form integration)

**`src/components/forms/`:**
- Purpose: Pre-built form field components wrapping react-hook-form
- Contains: Input, Select, Checkbox, Radio, DatePicker, FileUpload, Slider, Switch, Textarea components
- Key files: `src/components/forms/form-input.tsx`, `src/components/forms/form-select.tsx`, etc.

**`src/components/kbar/`:**
- Purpose: Cmd+K command palette (search and navigate)
- Contains: `index.tsx` (provider), `render-result.tsx`, `result-item.tsx`, `use-theme-switching.tsx`

**`src/components/themes/`:**
- Purpose: Theme management (dark/light mode, custom themes)
- Contains: `active-theme.tsx` (context), `font.config.ts`, `theme-mode-toggle.tsx`, `theme-provider.tsx`, `theme.config.ts`

**`src/features/`:**
- Purpose: Domain-specific code organized by business feature
- Contains: Data files (mock/catalog), feature-specific components
- Key files:
  - `src/features/exec/cashback-impact/data/metric-catalog.ts` -- KPI metric definitions (6 metrics with formulas, thresholds, actions)
  - `src/features/exec/cashback-impact/components/kpi-metric-card.tsx` -- KPI display card
  - `src/features/exec/cashback-impact/components/metric-insight-drawer.tsx` -- Metric detail Sheet
  - `src/features/exec/cashback-impact/components/metric-info-trigger.tsx` -- Info tooltip trigger
  - `src/features/cashback/data/analytics-dictionaries.mock.ts` -- Product dictionary and data sources
  - `src/features/reports/data/quick-cashback-refund.mock.ts` -- Fraud report mock data

**`src/config/`:**
- Purpose: App-level configuration constants
- Contains: Navigation, data table operators, info panel content
- Key files:
  - `src/config/nav-config.ts` -- Sidebar navigation items and keyboard shortcuts
  - `src/config/data-table.ts` -- Filter operators, sort orders, filter variants
  - `src/config/infoconfig.ts` -- Info sidebar content for product management

**`src/hooks/`:**
- Purpose: Custom React hooks
- Contains: Media query, breadcrumbs, data table, debounce, mobile detection, navigation, form, callback ref hooks
- Key files:
  - `src/hooks/use-data-table.ts` -- Data table state management hook
  - `src/hooks/use-media-query.ts` -- Responsive breakpoint detection
  - `src/hooks/use-nav.ts` -- Navigation item filtering (currently pass-through)
  - `src/hooks/use-breadcrumbs.tsx` -- Breadcrumb generation from pathname
  - `src/hooks/use-mobile.tsx` -- Mobile device detection

**`src/lib/`:**
- Purpose: Shared utility functions
- Contains: Class name merging, formatting, URL parsers, data table helpers, chart theming
- Key files:
  - `src/lib/utils.ts` -- `cn()` class merge function, `formatBytes()`
  - `src/lib/format.ts` -- `formatDate()` via Intl.DateTimeFormat
  - `src/lib/chart-theme.ts` -- `chartPalette` CSS variable references, `chartGradientId()`
  - `src/lib/parsers.ts` -- `getSortingStateParser()`, `getFiltersStateParser()` for nuqs URL state
  - `src/lib/searchparams.ts` -- `searchParamsCache`, `serialize` for URL query params
  - `src/lib/data-table.ts` -- `getCommonPinningStyles()`, `getFilterOperators()`, `getValidFilters()`

**`src/types/`:**
- Purpose: Shared TypeScript interfaces and type definitions
- Contains: Navigation types, data table types (with TanStack module augmentation), form field types
- Key files:
  - `src/types/index.ts` -- `NavItem`, `NavItemWithChildren`, `FooterItem`, `MainNavItem`, `SidebarNavItem`
  - `src/types/data-table.ts` -- `Option`, `FilterOperator`, `FilterVariant`, `ExtendedColumnSort`, `ExtendedColumnFilter`, `DataTableRowAction`
  - `src/types/base-form.ts` -- `BaseFormFieldProps`, `FormOption`, `FileUploadConfig`, `DatePickerConfig`, `SliderConfig`

**`src/constants/`:**
- Purpose: Static data (legacy from starter template)
- Contains: Product type definitions, sample sales data, mock product API with faker
- Key files:
  - `src/constants/data.ts` -- `Product` type, `recentSalesData`
  - `src/constants/mock-api.ts` -- `fakeProducts` store with initialize/getAll/getProducts/getProductById

**`src/styles/`:**
- Purpose: Global CSS and theme variable definitions
- Contains: Tailwind globals, base theme tokens, per-theme overrides
- Key files:
  - `src/styles/globals.css` -- Tailwind imports, global styles
  - `src/styles/theme.css` -- Base `:root` CSS custom property tokens
  - `src/styles/themes/42flows.css` -- Custom brand theme overrides

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout (HTML shell, global providers)
- `src/app/dashboard/layout.tsx`: Dashboard shell (sidebar, header, command palette)
- `src/app/page.tsx`: Root redirect to `/dashboard/exec`
- `src/instrumentation.ts`: Sentry initialization (server)
- `src/instrumentation-client.ts`: Sentry initialization (client)
- `src/proxy.ts`: Middleware placeholder (currently pass-through)

**Configuration:**
- `next.config.ts`: Next.js config with Sentry plugin, standalone output
- `tsconfig.json`: TypeScript config with `@/*` and `~/*` path aliases
- `components.json`: shadcn/ui config (New York style, RSC enabled)
- `eslint.config.mjs`: ESLint config
- `.prettierrc`: Prettier config
- `postcss.config.js`: PostCSS with Tailwind
- `Dockerfile`: Docker build config (standalone output)
- `env.example.txt`: Environment variable template (note: `.txt` extension, not `.env.example`)

**Core Logic:**
- `src/config/nav-config.ts`: All navigation routes and structure
- `src/lib/chart-theme.ts`: Chart color system
- `src/features/exec/cashback-impact/data/metric-catalog.ts`: KPI metric definitions
- `src/features/cashback/data/analytics-dictionaries.mock.ts`: Product & data source catalogs

**Testing:**
- No test files exist in the codebase. No test framework is configured.

## Naming Conventions

**Files:**
- `kebab-case.tsx` for all component and page files: `page-container.tsx`, `kpi-metric-card.tsx`
- `kebab-case.ts` for all non-component TypeScript files: `nav-config.ts`, `chart-theme.ts`
- `*.mock.ts` suffix for mock data files: `analytics-dictionaries.mock.ts`, `quick-cashback-refund.mock.ts`
- `use-*.ts` / `use-*.tsx` prefix for custom hooks: `use-media-query.ts`, `use-data-table.ts`

**Directories:**
- `kebab-case` for all directories: `cashback-impact`, `quick-cashback-refund`
- Feature directories mirror URL segments: `src/app/dashboard/exec/cashback-impact/` maps to `src/features/exec/cashback-impact/`

**Components:**
- `PascalCase` for component function names: `PageContainer`, `KpiMetricCard`, `MetricInsightDrawer`
- Default exports for page components and layout components
- Named exports for feature components: `export function KpiMetricCard(...)`

**Types:**
- `PascalCase` for interfaces and types: `NavItem`, `MetricCatalogItem`, `QuickCashbackRefundEvent`
- Interface preferred over type for object shapes
- `type` keyword for union types and utility types: `type FilterOperator = ...`

## Where to Add New Code

**New Dashboard Page:**
1. Create route directory: `src/app/dashboard/{page-name}/page.tsx`
2. Mark as `'use client'` (all dashboard pages are client components)
3. Wrap content in `<PageContainer>` from `src/components/layout/page-container.tsx`
4. Add navigation entry in `src/config/nav-config.ts` with icon key from `src/components/icons.tsx`
5. If page has complex mock data, create `src/features/{feature-name}/data/{name}.mock.ts`
6. If page has reusable feature components, create `src/features/{feature-name}/components/{name}.tsx`

**New Dashboard Sub-page:**
1. Create nested route: `src/app/dashboard/{parent}/{sub-page}/page.tsx`
2. Add as nested `items` array entry in the parent's `navItems` entry in `src/config/nav-config.ts`

**New UI Component (shadcn/ui style):**
- Place in `src/components/ui/{component-name}.tsx`
- Use `cn()` from `@/lib/utils` for class merging
- Follow Radix UI + Tailwind pattern matching existing components
- Use `cva` (class-variance-authority) for variant definitions

**New Feature Component:**
- Place in `src/features/{feature-name}/components/{component-name}.tsx`
- Use named export
- Import shared UI from `@/components/ui/`

**New Mock Data:**
- Place in `src/features/{feature-name}/data/{name}.mock.ts`
- Export typed constants and optionally helper functions for filtering/transforming
- Use `*.mock.ts` suffix to distinguish from real data sources (future)

**New Hook:**
- Place in `src/hooks/use-{name}.ts` or `use-{name}.tsx`
- Prefix with `use` per React conventions
- Mark `'use client'` if it uses browser APIs

**New Utility Function:**
- Place in `src/lib/{name}.ts`
- Export as named function
- Keep focused -- one concern per file

**New Chart:**
- Use `recharts` library components (BarChart, LineChart, AreaChart, etc.)
- Import `chartPalette` from `@/lib/chart-theme` for colors
- Use `chartGradientId()` for SVG gradient IDs
- Create custom Tooltip components inline or in feature components directory

**New Config:**
- Place in `src/config/{name}.ts`
- Export as named constant

**New Type:**
- Place in `src/types/{name}.ts`
- For TanStack React Table extensions, use module augmentation in `src/types/data-table.ts`
- For form-related types, extend patterns in `src/types/base-form.ts`

## Special Directories

**`.planning/`:**
- Purpose: GSD planning and codebase analysis documents
- Generated: By GSD commands
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes (by `next dev` / `next build`)
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: npm package dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)

**`public/`:**
- Purpose: Static files served at root URL path
- Generated: No
- Committed: Yes

**`design_system/`:**
- Purpose: Design system reference materials (external assets)
- Generated: No
- Committed: Yes

**`docs/`:**
- Purpose: Project documentation and feature planning
- Generated: No
- Committed: Yes

## Path Aliases

Use these import aliases (defined in `tsconfig.json`):

| Alias | Maps to | Example |
|-------|---------|---------|
| `@/*` | `./src/*` | `import { cn } from '@/lib/utils'` |
| `~/*` | `./public/*` | `import logo from '~/assets/logo.svg'` |

All imports within `src/` should use the `@/` alias. Never use relative paths that traverse above the current file's directory.

---

*Structure analysis: 2026-03-10*
