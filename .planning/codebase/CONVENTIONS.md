# Coding Conventions

**Analysis Date:** 2026-03-10

## Naming Patterns

**Files:**
- Use **kebab-case** for all file names: `metric-info-trigger.tsx`, `use-debounced-callback.ts`, `chart-theme.ts`
- React component files use `.tsx` extension; pure logic/data files use `.ts`
- Page components: always `page.tsx` (Next.js App Router convention)
- Layout components: always `layout.tsx`
- Mock data files: `*.mock.ts` suffix (e.g., `analytics-dictionaries.mock.ts`, `quick-cashback-refund.mock.ts`)
- Config files: `*.config.ts` suffix (e.g., `nav-config.ts`, `font.config.ts`, `theme.config.ts`)
- Hook files: `use-*.ts` or `use-*.tsx` prefix (e.g., `use-debounce.tsx`, `use-data-table.ts`)

**Functions/Components:**
- React components: **PascalCase** (e.g., `KpiMetricCard`, `MetricInsightDrawer`, `PageContainer`)
- Custom hooks: **camelCase** with `use` prefix (e.g., `useDataTable`, `useIsMobile`, `useDebouncedCallback`)
- Utility functions: **camelCase** (e.g., `formatDate`, `formatBytes`, `getMetricById`, `chartGradientId`)
- Page components: default export with `PascalCase` name matching the route purpose (e.g., `CashbackImpactPage`, `QuickCashbackRefundReportPage`, `CashbackDictionariesPage`)
- Local helper functions: **camelCase**, defined before the component that uses them (e.g., `getHeatColor`, `formatMoney`)

**Variables/Constants:**
- Regular variables: **camelCase** (e.g., `selectedMetricId`, `chartPalette`)
- Module-level constants: **UPPER_SNAKE_CASE** (e.g., `MOBILE_BREAKPOINT`, `CHART_TOOLTIP_CLASS`, `CATEGORIES`, `KPI_CARDS`, `FUNNEL_DATA`)
- Inline configuration objects as `const`: **UPPER_SNAKE_CASE** (e.g., `META_THEME_COLORS`, `INFOBAR_COOKIE_NAME`)

**Types/Interfaces:**
- Use **PascalCase** for types and interfaces (e.g., `NavItem`, `KpiMetricCardProps`, `MetricCatalogItem`)
- Props interfaces: suffix with `Props` (e.g., `KpiMetricCardProps`, `MetricInfoTriggerProps`, `MetricInsightDrawerProps`)
- Prefer `interface` for object shapes; use `type` for unions, aliases, and mapped types
- Export types alongside their data: `type DataSourceType = 'api' | 'dwh' | 'event_stream' | 'file_upload'`
- TanStack React Table module augmentation uses `declare module` pattern in `src/types/data-table.ts`

## Code Style

**Formatting:**
- Prettier with `prettier-plugin-tailwindcss` for class sorting
- 2-space indentation (tabWidth: 2, useTabs: false)
- Single quotes for strings (`singleQuote: true`)
- JSX single quotes (`jsxSingleQuote: true`)
- No trailing commas (`trailingComma: "none"`)
- Semicolons required (`semi: true`)
- Always use arrow parens (`arrowParens: "always"`)
- Bracket spacing enabled
- LF line endings

**Linting:**
- ESLint 9 flat config at `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals`
- TypeScript parser via `@typescript-eslint/parser`
- Key rules:
  - `@typescript-eslint/no-unused-vars`: warn
  - `no-console`: warn
  - `react-hooks/exhaustive-deps`: warn
  - `import/no-unresolved`: off (handled by TypeScript)
  - `import/named`: off

**Pre-commit:**
- Husky pre-commit hook runs `npx lint-staged`
- lint-staged runs Prettier on `**/*.{js,jsx,tsx,ts,css,less,scss,sass}`

## TypeScript Strictness

**Config:** `tsconfig.json` with `"strict": true`
- Target: ES5
- Module: ESNext with Node module resolution
- Strict mode enabled
- Force consistent casing in file names
- Isolated modules

## Import Organization

**Order:**
1. External library imports (React, Next.js, third-party packages)
2. Internal alias imports (`@/components/*`, `@/lib/*`, `@/hooks/*`, `@/features/*`, `@/types/*`, `@/config/*`)
3. Relative imports (sibling/child files like `'./metric-info-trigger'`, `'../icons'`)
4. CSS/style imports last (`'../styles/globals.css'`)

**Path Aliases:**
- `@/*` maps to `./src/*` -- use for all src-relative imports
- `~/*` maps to `./public/*` -- use for public assets
- Always use `@/` alias over relative paths when crossing directory boundaries
- Use relative imports only for sibling or immediate child files within the same feature

**Import Style:**
- Named imports preferred: `import { cn } from '@/lib/utils'`
- Type-only imports when only types are needed: `import type { Metadata } from 'next'`
- Namespace imports for React: `import * as React from 'react'` (used in hooks and UI components)
- Destructured imports from React also acceptable: `import { useState, useMemo } from 'react'` (used in page components)

## Component Patterns

**UI Primitives (shadcn/ui pattern):**
- Use function declarations (not arrow functions): `function Button({ ... }: Props) { ... }`
- Extend native HTML props: `React.ComponentProps<'div'>` or `React.ComponentProps<'button'>`
- Spread remaining props onto root element: `{...props}`
- Use `cn()` utility for merging classNames: `className={cn('base-classes', className)}`
- Use `data-slot` attribute for component identification: `data-slot='button'`
- Use `cva` (class-variance-authority) for variant-based styling
- Export named components and variant utilities: `export { Button, buttonVariants }`
- Use `Slot` from `@radix-ui/react-slot` for `asChild` prop pattern

**Feature Components:**
- Named exports with `export function ComponentName()`: `export function KpiMetricCard({ ... })`
- Props interface defined immediately above component
- Component-local types defined in same file

**Page Components:**
- Default export: `export default function PageName()`
- Mark client components with `'use client'` directive at top of file
- Wrap content in `<PageContainer>` component
- Page-level state managed with `useState`/`useMemo`
- Inline mock data constants defined at module level above the component

**Context Pattern:**
- Create context with `React.createContext<ContextType | null>(null)`
- Custom hook that throws if used outside provider: `useInfobar()` throws `'useInfobar must be used within a InfobarProvider.'`
- Provider wraps children and memoizes context value with `React.useMemo`

## Error Handling

**Patterns:**
- Silent catch with empty return: `try { ... } catch (_err) { return ''; }` in `src/lib/format.ts`
- Global error boundary via `src/app/global-error.tsx` reports to Sentry: `Sentry.captureException(error)`
- Nullish coalescing for safe fallbacks: `match ?? metricCatalogItems[0]`, `selectedProduct ?? PRODUCT_DICTIONARY[0]`
- Optional chaining throughout: `cookieStore.get('active_theme')?.value`
- Zod `safeParse` for runtime validation in `src/lib/parsers.ts`: returns `null` on failure, never throws

## Logging

**Framework:** Sentry (`@sentry/nextjs`)
- Global error capture in `src/app/global-error.tsx`
- Sentry configuration conditionally applied in `next.config.ts` via `NEXT_PUBLIC_SENTRY_DISABLED` env var
- Instrumentation files: `src/instrumentation.ts`, `src/instrumentation-client.ts`
- Console logging discouraged (`no-console: warn` ESLint rule)

## Comments

**When to Comment:**
- Sparingly -- most code is self-documenting
- Comments used for explaining non-obvious behavior: `// zero-based index -> one-based index`
- Section markers in layouts: `{/* page main content */}`
- JSDoc used only for utility modules like `src/lib/chart-theme.ts` to explain usage patterns

**JSDoc/TSDoc:**
- JSDoc with `/** */` for exported utility functions and configuration objects
- Not required for React components -- props interfaces serve as documentation

## Function Design

**Size:** Page components can be large (1000+ lines in `src/app/dashboard/exec/cashback-impact/page.tsx`). UI primitives are small (under 60 lines).

**Parameters:**
- Destructure props in function signature: `function Component({ prop1, prop2 }: Props)`
- Use inline type annotations for simple page components: `({ children }: { children: React.ReactNode })`
- Use explicit interface for reusable components: `interface KpiMetricCardProps { ... }`

**Return Values:**
- Components return JSX
- Hooks return objects or tuples: `return { table, shallow, debounceMs, throttleMs }`
- Utility functions return primitives or null

## Module Design

**Exports:**
- UI components: named exports grouped at bottom of file: `export { Button, buttonVariants }`
- Page components: single default export
- Data/mock files: named exports for both types and data: `export const ANALYTICS_DATA_SOURCES`, `export type DataSourceType`
- Config files: named exports of config objects and types

**Barrel Files:**
- `src/types/index.ts` re-exports shared types
- No barrel files for components -- import directly from component file

## Styling Conventions

**Approach:** Tailwind CSS v4 with CSS variables for theming
- Use `cn()` from `@/lib/utils` to merge Tailwind classes
- Use semantic color tokens: `text-muted-foreground`, `bg-primary`, `text-card-foreground`
- Chart colors via CSS variables: `var(--chart-primary)`, `var(--chart-warning)` etc. centralized in `src/lib/chart-theme.ts`
- Responsive design via Tailwind breakpoint prefixes: `md:`, `xl:`, `sm:`
- Numeric data styled with `tabular-nums` class for alignment
- Dark mode via `next-themes` with CSS class strategy

---

*Convention analysis: 2026-03-10*
