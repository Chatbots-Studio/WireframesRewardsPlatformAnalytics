# Codebase Structure

**Analysis Date:** 2026-03-21

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
├── messages/                   # i18n translation files (en, uk)
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
│   │   ├── terms-of-service/   # /terms-of-service
│   │   ├── global-error.tsx    # Error boundary
│   │   ├── layout.tsx          # Root layout (i18n, theme, providers)
│   │   ├── not-found.tsx       # 404 page
│   │   └── page.tsx            # Root redirect to /dashboard/exec
│   ├── components/             # Shared React components
│   │   ├── breadcrumbs.tsx     # Breadcrumb navigation
│   │   ├── file-uploader.tsx   # File upload UI
│   │   ├── icons.tsx           # Icon registry (Tabler icons)
│   │   ├── locale-switcher.tsx # Language switcher (EN/UK)
│   │   ├── nav-main.tsx        # Main navigation items
│   │   ├── nav-projects.tsx    # Project navigation items
│   │   ├── nav-user.tsx        # User navigation items
│   │   ├── search-input.tsx    # Search input component
│   │   ├── user-avatar-profile.tsx # User profile avatar
│   │   ├── forms/              # Form field components (react-hook-form)
│   │   │   ├── demo-form.tsx
│   │   │   ├── form-checkbox.tsx
│   │   │   ├── form-checkbox-group.tsx
│   │   │   ├── form-date-picker.tsx
│   │   │   ├── form-file-upload.tsx
│   │   │   ├── form-input.tsx
│   │   │   ├── form-radio-group.tsx
│   │   │   ├── form-select.tsx
│   │   │   ├── form-slider.tsx
│   │   │   ├── form-switch.tsx
│   │   │   └── form-textarea.tsx
│   │   ├── kbar/               # Cmd+K command palette
│   │   │   ├── index.tsx       # KBar provider
│   │   │   ├── render-result.tsx
│   │   │   ├── result-item.tsx
│   │   │   └── use-theme-switching.tsx
│   │   ├── layout/             # App shell: sidebar, header, providers
│   │   │   ├── app-sidebar.tsx (159 lines) - Navigation sidebar with i18n
│   │   │   ├── cta-github.tsx
│   │   │   ├── header.tsx      - Top bar with breadcrumbs, search, locale switch
│   │   │   ├── info-sidebar.tsx (110 lines) - Right info panel
│   │   │   ├── page-container.tsx - Standard page wrapper
│   │   │   ├── providers.tsx   - Client-side provider wrapper
│   │   │   └── user-nav.tsx
│   │   ├── modal/              # Modal dialogs
│   │   ├── themes/             # Theme provider, config, toggle
│   │   │   ├── active-theme.tsx
│   │   │   ├── font.config.ts
│   │   │   ├── theme-config.ts
│   │   │   ├── theme-mode-toggle.tsx
│   │   │   └── theme-provider.tsx
│   │   └── ui/                 # shadcn/ui primitives (~50 components)
│   │       ├── accordion.tsx
│   │       ├── alert.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── infobar.tsx    - Info sidebar primitives
│   │       ├── input.tsx
│   │       ├── input-otp.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── modal.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx    - Sidebar primitives (with SidebarProvider)
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx     - Toast notification wrapper
│   │       ├── switch.tsx
│   │       ├── table.tsx      - Basic table elements
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle.tsx
│   │       ├── toggle-group.tsx
│   │       ├── tooltip.tsx
│   │       └── table/         - Advanced data table sub-components
│   ├── config/                 # App configuration
│   │   ├── data-table.ts      - Filter/sort operator definitions
│   │   ├── infoconfig.ts      - Info sidebar content config
│   │   └── nav-config.ts      - Navigation items with i18n keys
│   ├── constants/              # Static data and mock API
│   │   ├── data.ts            - Product types and sample data
│   │   └── mock-api.ts        - Mock product CRUD functions
│   ├── features/               # Feature-sliced domain logic
│   │   ├── cashback/           # Cashback analytics feature
│   │   │   └── data/           # Mock data for dictionaries
│   │   │       └── analytics-dictionaries.mock.ts
│   │   ├── exec/               # Executive dashboard feature
│   │   │   └── cashback-impact/ # Cashback impact sub-feature
│   │   │       ├── components/
│   │   │       │   ├── kpi-metric-card.tsx
│   │   │       │   ├── metric-info-trigger.tsx
│   │   │       │   └── metric-insight-drawer.tsx
│   │   │       └── data/
│   │   │           └── metric-catalog.ts
│   │   └── reports/            # Reports feature
│   │       └── data/           # Mock data for reports
│   │           └── quick-cashback-refund.mock.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-breadcrumbs.tsx
│   │   ├── use-callback-ref.ts / .tsx
│   │   ├── use-controllable-state.tsx
│   │   ├── use-data-table.ts
│   │   ├── use-debounce.tsx
│   │   ├── use-debounced-callback.ts
│   │   ├── use-media-query.ts
│   │   ├── use-mobile.tsx
│   │   ├── use-multistep-form.tsx
│   │   └── use-nav.ts
│   ├── i18n/                   # Internationalization configuration
│   │   ├── config.ts           - Locale definitions (en, uk)
│   │   └── request.ts          - Locale detection and message loading
│   ├── lib/                    # Utility functions and helpers
│   │   ├── chart-theme.ts      - Chart palette CSS variables
│   │   ├── data-table.ts       - Data table utilities
│   │   ├── format.ts           - Date/string formatting
│   │   ├── parsers.ts          - URL search param parsing with Zod
│   │   ├── searchparams.ts     - Search param cache/utilities
│   │   └── utils.ts            - cn() merge, formatBytes()
│   ├── styles/                 # CSS files
│   │   ├── globals.css         - Tailwind imports, global styles
│   │   ├── theme.css           - Base CSS custom properties
│   │   └── themes/             # Per-theme CSS variable overrides
│   │       └── 42flows.css
│   ├── types/                  # Shared TypeScript type definitions
│   │   ├── base-form.ts        - Form field type definitions
│   │   ├── data-table.ts       - Table filter/sort types with TanStack augmentation
│   │   └── index.ts            - Navigation and utility types
│   ├── instrumentation.ts      # Sentry server-side initialization
│   ├── instrumentation-client.ts # Sentry client-side initialization
│   └── proxy.ts                # Middleware placeholder
├── components.json             # shadcn/ui config
├── Dockerfile                  # Docker build
├── docker-compose.yml          # Docker Compose
├── eslint.config.mjs           # ESLint config
├── next.config.ts              # Next.js config (Sentry + next-intl plugins)
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS config
├── tsconfig.json               # TypeScript config
└── env.example.txt             # Environment variable template
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router file-system routes with i18n support
- Contains: `page.tsx` (route handlers), `layout.tsx` (nested layouts), `not-found.tsx`, `global-error.tsx`
- Key files:
  - `src/app/layout.tsx` -- Root HTML shell, i18n setup, global providers
  - `src/app/page.tsx` -- Root redirect to `/dashboard/exec`
  - `src/app/dashboard/layout.tsx` -- Dashboard shell (sidebar, header, kbar, i18n)
  - `src/app/dashboard/exec/page.tsx` -- Executive ROI dashboard (default landing)
  - `src/app/dashboard/exec/cashback-impact/page.tsx` -- Cashback impact analysis
  - `src/app/dashboard/cashback/page.tsx` -- Product manager funnel dashboard
  - `src/app/dashboard/cashback/dictionaries/page.tsx` -- Analytics dictionaries
  - `src/app/dashboard/communications/page.tsx` -- Communications analytics
  - `src/app/dashboard/ab-tests/page.tsx` -- A/B test analytics
  - `src/app/dashboard/reports/quick-cashback-refund/page.tsx` -- Report analytics

**`src/components/`:**
- Purpose: Shared components used across multiple pages
- Contains: Layout shells, UI primitives, form fields, command palette, theming, locale switcher
- Key files:
  - `src/components/layout/app-sidebar.tsx` -- Main navigation sidebar with i18n
  - `src/components/layout/header.tsx` -- Top header bar with breadcrumbs, search, locale switcher, theme toggle
  - `src/components/layout/page-container.tsx` -- Standard page wrapper with scroll, loading, access control
  - `src/components/layout/info-sidebar.tsx` -- Right info sidebar panel
  - `src/components/locale-switcher.tsx` -- Language switcher (EN/UK toggle)
  - `src/components/icons.tsx` -- Named icon registry (Tabler icons)
  - `src/components/breadcrumbs.tsx` -- Breadcrumb navigation
  - `src/components/search-input.tsx` -- Search input component

**`src/components/ui/`:**
- Purpose: Low-level UI primitives (shadcn/ui pattern)
- Contains: ~50 component files, each wrapping Radix UI with Tailwind styling
- Key files:
  - `src/components/ui/card.tsx` -- Card container
  - `src/components/ui/button.tsx` -- Button variants
  - `src/components/ui/sidebar.tsx` -- Sidebar primitives (SidebarProvider, SidebarContent, etc.)
  - `src/components/ui/infobar.tsx` -- Info sidebar primitives (InfobarProvider, InfobarContent)
  - `src/components/ui/table.tsx` -- Basic table elements
  - `src/components/ui/table/` -- Advanced data table sub-components

**`src/components/forms/`:**
- Purpose: Pre-built form field components wrapping react-hook-form
- Contains: Input, Select, Checkbox, Radio, DatePicker, FileUpload, Slider, Switch, Textarea components
- Key files: `src/components/forms/form-*.tsx` (11 form components)

**`src/components/kbar/`:**
- Purpose: Cmd+K command palette (search and navigate)
- Contains: `index.tsx` (provider), `render-result.tsx`, `result-item.tsx`, `use-theme-switching.tsx`
- Registered nav items resolve i18n titles

**`src/components/themes/`:**
- Purpose: Theme management (dark/light mode, custom themes)
- Contains: `active-theme.tsx` (context), `font.config.ts`, `theme-mode-toggle.tsx`, `theme-provider.tsx`, `theme.config.ts`

**`src/features/`:**
- Purpose: Domain-specific code organized by business feature
- Contains: Data files (mock/catalog), feature-specific components
- Key files:
  - `src/features/exec/cashback-impact/data/metric-catalog.ts` -- KPI metric definitions (MetricCatalogItem types)
  - `src/features/exec/cashback-impact/components/kpi-metric-card.tsx` -- KPI display card
  - `src/features/exec/cashback-impact/components/metric-insight-drawer.tsx` -- Metric detail Sheet
  - `src/features/cashback/data/analytics-dictionaries.mock.ts` -- Product & data source catalogs
  - `src/features/reports/data/quick-cashback-refund.mock.ts` -- Report mock data

**`src/config/`:**
- Purpose: App-level configuration constants
- Contains: Navigation with i18n keys, data table operators, info panel content
- Key files:
  - `src/config/nav-config.ts` -- Sidebar navigation items with `titleKey` for i18n
  - `src/config/data-table.ts` -- Filter operators by type (text, numeric, date, select)
  - `src/config/infoconfig.ts` -- Info sidebar content configuration

**`src/i18n/`:**
- Purpose: Internationalization configuration and request handling
- Contains: Locale definitions, message loading
- Key files:
  - `src/i18n/config.ts` -- Defines supported locales ['en', 'uk'] and defaultLocale
  - `src/i18n/request.ts` -- Locale detection from cookies/headers, message loading for current locale

**`src/hooks/`:**
- Purpose: Custom React hooks
- Contains: Media query, breadcrumbs, data table, debounce, mobile detection, navigation hooks
- Key files:
  - `src/hooks/use-data-table.ts` -- Data table state management hook
  - `src/hooks/use-media-query.ts` -- Responsive breakpoint detection
  - `src/hooks/use-nav.ts` -- Navigation item filtering (currently pass-through, ready for role-based logic)
  - `src/hooks/use-breadcrumbs.tsx` -- Breadcrumb generation from pathname

**`src/lib/`:**
- Purpose: Shared utility functions
- Contains: Class name merging, formatting, URL parsers, data table helpers, chart theming
- Key files:
  - `src/lib/utils.ts` -- `cn()` class merge function, `formatBytes()`
  - `src/lib/format.ts` -- `formatDate()` via Intl.DateTimeFormat
  - `src/lib/chart-theme.ts` -- `chartPalette` CSS variable references for Recharts
  - `src/lib/parsers.ts` -- `getSortingStateParser()`, `getFiltersStateParser()` for nuqs URL state
  - `src/lib/data-table.ts` -- Data table helper functions

**`src/types/`:**
- Purpose: Shared TypeScript interfaces and type definitions
- Contains: Navigation types with i18n, data table types with TanStack augmentation, form field types
- Key files:
  - `src/types/index.ts` -- `NavItem` (with titleKey property), `NavItemWithChildren`, `FooterItem`
  - `src/types/data-table.ts` -- Table filter/sort types with TanStack module augmentation
  - `src/types/base-form.ts` -- Form field configuration types

**`src/constants/`:**
- Purpose: Static data (legacy from starter template)
- Contains: Product type definitions, sample sales data, mock product API
- Key files:
  - `src/constants/data.ts` -- `Product` type, `recentSalesData`
  - `src/constants/mock-api.ts` -- `fakeProducts` mock CRUD store

**`src/styles/`:**
- Purpose: Global CSS and theme variable definitions
- Contains: Tailwind globals, base theme tokens, per-theme overrides
- Key files:
  - `src/styles/globals.css` -- Tailwind imports, global styles
  - `src/styles/theme.css` -- Base `:root` CSS custom property tokens
  - `src/styles/themes/42flows.css` -- Custom brand theme overrides

**`messages/`:**
- Purpose: Translation files for next-intl i18n
- Contains: JSON files with translation keys/values per locale
- Structure: `messages/{locale}.json` (e.g., `messages/en.json`, `messages/uk.json`)
- Namespaces: `nav`, `sidebar`, `infoSidebar` and feature-specific namespaces

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout (i18n, theme setup, global providers)
- `src/app/dashboard/layout.tsx`: Dashboard shell (sidebar, header, KBar)
- `src/app/page.tsx`: Root redirect to `/dashboard/exec`
- `src/instrumentation.ts`: Sentry initialization (server)
- `src/instrumentation-client.ts`: Sentry initialization (client)

**Configuration:**
- `next.config.ts`: Next.js config with Sentry + next-intl plugins
- `tsconfig.json`: TypeScript config with `@/*` and `~/*` path aliases
- `src/i18n/config.ts`: Locale configuration (supported locales, default)
- `src/i18n/request.ts`: Locale detection and message loading
- `components.json`: shadcn/ui config (New York style, RSC enabled)
- `eslint.config.mjs`: ESLint config
- `.prettierrc`: Prettier config
- `env.example.txt`: Environment variable template

**Core Logic:**
- `src/config/nav-config.ts`: Navigation routes with i18n keys
- `src/lib/chart-theme.ts`: Chart color system using CSS variables
- `src/features/exec/cashback-impact/data/metric-catalog.ts`: KPI metric definitions
- `src/features/cashback/data/analytics-dictionaries.mock.ts`: Product & data source catalogs
- `src/components/locale-switcher.tsx`: Language switcher component

**Testing:**
- No test files exist in the codebase. No test framework is configured.

## Naming Conventions

**Files:**
- `kebab-case.tsx` for all component and page files: `page-container.tsx`, `kpi-metric-card.tsx`, `locale-switcher.tsx`
- `kebab-case.ts` for all non-component TypeScript files: `nav-config.ts`, `chart-theme.ts`, `use-data-table.ts`
- `*.mock.ts` suffix for mock data files: `analytics-dictionaries.mock.ts`, `quick-cashback-refund.mock.ts`
- `use-*.ts` / `use-*.tsx` prefix for custom hooks: `use-media-query.ts`, `use-breadcrumbs.tsx`

**Directories:**
- `kebab-case` for all directories: `cashback-impact`, `quick-cashback-refund`, `locale-switcher`
- Feature directories mirror URL segments: `src/app/dashboard/exec/cashback-impact/` maps to `src/features/exec/cashback-impact/`

**Components:**
- `PascalCase` for component function names: `PageContainer`, `KpiMetricCard`, `LocaleSwitcher`
- Default exports for page components and layout components
- Named exports for feature components: `export function KpiMetricCard(...)`

**Types:**
- `PascalCase` for interfaces and types: `NavItem`, `MetricCatalogItem`, `Locale`
- Interface preferred over type for object shapes
- `type` keyword for union types and utility types: `type FilterOperator = ...`, `type Locale = (typeof locales)[number]`

**i18n Keys:**
- Namespace prefix format: `t('key')` from `useTranslations('namespace')`
- Navigation keys: Stored in `src/config/nav-config.ts` as `titleKey` property
- Example: `titleKey: 'topManagement'` resolved via `useTranslations('nav')('topManagement')`

## Where to Add New Code

**New Dashboard Page:**
1. Create route directory: `src/app/dashboard/{page-name}/page.tsx`
2. Mark as `'use client'` (all dashboard pages are client components)
3. Wrap content in `<PageContainer>` from `src/components/layout/page-container.tsx`
4. Add navigation entry in `src/config/nav-config.ts` with:
   - `title`: English fallback
   - `titleKey`: i18n key (resolved via `useTranslations('nav')`)
   - `icon`: Key from `src/components/icons.tsx`
5. If page has complex mock data, create `src/features/{feature-name}/data/{name}.mock.ts`
6. If page has reusable feature components, create `src/features/{feature-name}/components/{name}.tsx`
7. Add i18n translations to `messages/en.json` and `messages/uk.json` under `nav` namespace

**New Dashboard Sub-page:**
1. Create nested route: `src/app/dashboard/{parent}/{sub-page}/page.tsx`
2. Add as nested `items` array entry in the parent's `navItems` entry in `src/config/nav-config.ts`
3. Add i18n keys and translations

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
- Use `*.mock.ts` suffix to distinguish from real data sources

**New Hook:**
- Place in `src/hooks/use-{name}.ts` or `use-{name}.tsx`
- Prefix with `use` per React conventions
- Mark `'use client'` if it uses browser APIs or hooks

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

**New Translation:**
- Add keys to `messages/en.json` (English translation)
- Add keys to `messages/uk.json` (Ukrainian translation)
- Use namespace: `messages/{locale}.json` with structure `{ "namespace": { "key": "value" } }`
- In components: `useTranslations('namespace')('key')`

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

**`messages/`:**
- Purpose: i18n translation files
- Generated: No
- Committed: Yes
- Structure: `messages/{locale}.json` with translation key-value pairs

**`public/`:**
- Purpose: Static files served at root URL path
- Generated: No
- Committed: Yes

**`design_system/`:**
- Purpose: Design system reference materials
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

*Structure analysis: 2026-03-21*
