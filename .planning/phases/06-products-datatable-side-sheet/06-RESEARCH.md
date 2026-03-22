# Phase 6: Products DataTable + Side Sheet — Research

**Researched:** 2026-03-22
**Domain:** Next.js dashboard — TanStack Table + shadcn Sheet, client-side state, fake CRUD foundation
**Confidence:** HIGH (grounded in direct codebase inspection of all relevant files)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DICT-01 | Products as DataTable rows (TanStack Table) — columns: name, target actions count, data source | Column defs pattern in Architecture section; `ProductDictionaryEntry` type confirmed in mock |
| DICT-02 | Text search by product name via DataTableToolbar | `DataTableToolbar` auto-renders `<Input>` for columns with `meta.variant: 'text'`; confirmed in toolbar source |
| DICT-03 | Selected row highlight with `bg-muted` or `data-[state=selected]` while Sheet is open | `TableRow` already has `data-[state=selected]:bg-muted`; use TanStack row selection or `data-state` prop |
| DICT-04 | Hover state on rows (`cursor-pointer hover:bg-muted/50`) | `TableRow` already has `hover:bg-muted/50`; only `cursor-pointer` must be added via `onClick` wrapper |
| DICT-05 | Row click opens Sheet (shadcn) on the right with product details | `MetricInsightDrawer` is the exact pattern to follow; `Sheet open={selectedId !== null}` |
| DICT-06 | Sheet width `sm:max-w-[560px]`, overlay over table | `SheetContent className="sm:max-w-[560px]"` — confirmed in MetricInsightDrawer at `sm:max-w-[520px]` |
| DICT-07 | Sheet Header with product name and close button | `SheetHeader` + `SheetTitle` — confirmed in MetricInsightDrawer; close button built into Radix Dialog |
| DICT-09 | Tab "General" — name, description, source, active/inactive conditions | Phase 6 scope: read-only display only (tabs are Phase 7; General tab display is in scope here per phase goals) |
| DICT-17 | Keep 2 stat cards (Products count, Target Actions count); remove Data Sources card | Current page has 3-card grid at line 89-110; drop third card and its import |
| DICT-18 | Remove Data Sources section from the page | Data Sources table at lines 254-295 in current page.tsx; remove entire Card block |
| DICT-19 | State in `useDictionariesState()` hook, page.tsx as thin shell | Hook pattern fully specified in Architecture section |
| DICT-20 | Feature files in `src/features/cashback/dictionaries/` (components, hooks, columns) | Directory does not exist yet; create per Architecture pattern |
| DICT-22 | Styles consistent with rest of dashboard (Card, Badge, Button sizes, spacing) | Existing `MetricInsightDrawer`, `DataTable` usage confirmed as style reference |
</phase_requirements>

---

## Summary

Phase 6 transforms the dictionaries page from a button-list + static card layout into a DataTable with a side sheet detail panel. The core transformation: replace the `PRODUCT_DICTIONARY.map((product) => <button>)` pattern (lines 121-139 of current `page.tsx`) with a TanStack Table instance, and replace the static product detail `Card` (lines 144-204) with a shadcn `Sheet` overlay triggered by row click.

Every UI primitive needed is already installed and scaffolded in the project. The `MetricInsightDrawer` component in `src/features/exec/cashback-impact/components/` is the exact pattern to replicate for the Sheet. The `DataTable` + `DataTableToolbar` infrastructure in `src/components/ui/table/` is ready to use as-is — the only requirement is defining column defs with `meta.variant: 'text'` on the `name` column to get the toolbar search input for free.

The critical architectural decision is: do NOT use the existing `useDataTable` hook (which hardcodes `manualPagination/Sorting/Filtering: true` for server-side use). Instead, use `useReactTable` directly inside `products-table.tsx` with client-side row models. All state belongs in `useDictionariesState()`. Page 6 ends with a read-only Sheet (no tabs, no edit form) — inline editing is Phase 7 scope.

**Primary recommendation:** Build in dependency order — hook first, then column defs, then table component, then sheet, then wire page.tsx. This gives clean checkpoints with no forward dependencies.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/react-table` | `^8.21.2` | Table instance, row models, column filters | Already installed and proven in project; powers existing `DataTable` component |
| shadcn `Sheet` | n/a (installed) | Right-side overlay panel | Project decision; `MetricInsightDrawer` is the working reference implementation |
| shadcn `DataTable` + `DataTableToolbar` | n/a (installed) | Table renderer + search/filter toolbar | Already scaffolded; toolbar auto-renders Input for `meta.variant: 'text'` columns |
| `next-intl` | `^4.8.3` | i18n for all UI strings | Already used throughout; `dictionaries` namespace already exists in messages |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn `Card` | n/a (installed) | Stat cards container | Keep existing stat cards, remove third one |
| shadcn `Badge` | n/a (installed) | Data source display in table cells | Column cell renderer for `productSourceId` |
| `lucide-react` | `^0.575.0` | Icons (close button already in SheetContent) | Only if additional icons needed in Sheet header |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useReactTable` directly | `useDataTable` hook | `useDataTable` forces `manualX: true` (server-side); breaks client-side filtering on mock data |
| shadcn `Sheet` overlay | Custom flex panel | Sheet overlay matches MetricInsightDrawer pattern already proven; flex panel needs PageContainer layout changes |
| TanStack built-in row selection | Manual `data-state` prop on row | Both work; built-in row selection via `onRowSelectionChange` is cleaner; manual `data-state` also valid since TableRow already has `data-[state=selected]:bg-muted` |

**Installation:** No installation required — all dependencies already in `package.json`.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── features/
│   └── cashback/
│       ├── data/
│       │   └── analytics-dictionaries.mock.ts   # existing — no change
│       └── dictionaries/                         # NEW — create this directory
│           ├── components/
│           │   ├── products-table.tsx             # TanStack Table + DataTableToolbar
│           │   └── product-side-sheet.tsx         # Sheet overlay with product details
│           ├── hooks/
│           │   └── use-dictionaries-state.ts      # all state + handlers
│           └── columns/
│               └── products-columns.tsx           # TanStack column defs
└── app/
    └── dashboard/
        └── cashback/
            └── dictionaries/
                └── page.tsx                       # MODIFY: thin shell
```

Note: `general-tab.tsx` and `target-actions-tab.tsx` are Phase 7 scope. Phase 6 `product-side-sheet.tsx` renders product details directly (no Tabs yet) — just the read-only view of name, description, source, conditions.

### Pattern 1: useDictionariesState Hook

**What:** Single hook owns all feature state — products array (mutable copy of mock), selectedId, sheetOpen flag. Derived values via `useMemo`. Handlers via `useCallback`.
**When to use:** Any page with multiple sibling components sharing state (table + sheet).

```typescript
// Source: .planning/research/ARCHITECTURE.md (verified pattern)
// src/features/cashback/dictionaries/hooks/use-dictionaries-state.ts
'use client';
import { useState, useMemo, useCallback } from 'react';
import {
  PRODUCT_DICTIONARY,
  type ProductDictionaryEntry
} from '@/features/cashback/data/analytics-dictionaries.mock';

export function useDictionariesState() {
  const [products] = useState<ProductDictionaryEntry[]>(
    () => structuredClone(PRODUCT_DICTIONARY)  // mutable copy — never mutate the import
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectProduct = useCallback((id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  const totalTargetActions = useMemo(
    () => products.reduce((sum, p) => sum + p.targetActions.length, 0),
    [products]
  );

  return {
    products,
    selectedProduct,
    selectedId,
    sheetOpen,
    setSheetOpen,
    selectProduct,
    totalTargetActions,
  };
}
```

Note: Phase 6 hook does NOT need `search`, `setSearch`, or `updateProduct` — those are Phase 7. Keep the hook minimal for Phase 6 scope.

### Pattern 2: Column Definitions with DataTableToolbar Integration

**What:** TanStack column defs with `meta.variant: 'text'` on the `name` column causes `DataTableToolbar` to auto-render a search `<Input>` — no custom toolbar code needed.
**When to use:** Any column that needs text search in the toolbar.

```typescript
// Source: .planning/research/STACK.md + DataTableToolbar source inspection
// src/features/cashback/dictionaries/columns/products-columns.tsx
import type { ColumnDef } from '@tanstack/react-table';
import type { ProductDictionaryEntry } from '@/features/cashback/data/analytics-dictionaries.mock';

export const productColumns: ColumnDef<ProductDictionaryEntry>[] = [
  {
    accessorKey: 'name',
    header: 'Product',
    meta: {
      variant: 'text',
      placeholder: 'Search products...',  // use t('searchPlaceholder') in production
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    id: 'targetActionsCount',
    header: 'Target Actions',
    enableColumnFilter: false,
    cell: ({ row }) => row.original.targetActions.length,
  },
  {
    id: 'dataSource',
    header: 'Data Source',
    enableColumnFilter: false,
    cell: ({ row }) => row.original.productSourceId ?? '—',
  },
];
```

### Pattern 3: ProductsTable with useReactTable (NOT useDataTable)

**What:** `useReactTable` directly inside `products-table.tsx` with `getCoreRowModel`, `getFilteredRowModel`, `getSortedRowModel`. Row click triggers `onRowClick` prop. Selected row visual state via TanStack row selection state keyed to `selectedId`.

```typescript
// Source: .planning/research/ARCHITECTURE.md Pattern 5
// src/features/cashback/dictionaries/components/products-table.tsx
'use client';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, type RowSelectionState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { productColumns } from '../columns/products-columns';
import type { ProductDictionaryEntry } from '@/features/cashback/data/analytics-dictionaries.mock';

interface ProductsTableProps {
  data: ProductDictionaryEntry[];
  selectedId: string | null;
  onRowClick: (id: string) => void;
}

export function ProductsTable({ data, selectedId, onRowClick }: ProductsTableProps) {
  // Sync TanStack row selection with selectedId from parent
  const rowSelection: RowSelectionState = useMemo(
    () => (selectedId ? { [selectedId]: true } : {}),
    [selectedId]
  );

  const table = useReactTable({
    data,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,         // use product id as row id
    state: { rowSelection },
    onRowSelectionChange: () => {},     // controlled externally via onRowClick
    enableMultiRowSelection: false,
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
```

Row click handling: since `DataTable` renders `TableRow` with `data-state={row.getIsSelected() && 'selected'}`, the `data-[state=selected]:bg-muted` CSS fires automatically when `rowSelection` has the matching id. To make rows clickable, either extend `DataTable` with an `onRowClick` prop (preferred, keeps DataTable reusable), or wrap rows inside `ProductsTable` directly.

**Simpler alternative for Phase 6:** Pass `onRowClick` to `DataTable` as an `actionBar`-style slot, or render the table body manually in `ProductsTable` without using the `DataTable` wrapper. Given `DataTable` doesn't expose `onRowClick` natively, the cleanest approach is to not use `DataTable` wrapper — render the TanStack table directly in `ProductsTable` using the same JSX pattern as `DataTable` but with `onClick` on `TableRow`.

### Pattern 4: ProductSideSheet (MetricInsightDrawer pattern)

**What:** shadcn `Sheet` with `side="right"` and `sm:max-w-[560px]`, controlled via `open`/`onOpenChange` props. Renders product details read-only. Uses `SheetHeader`, `SheetTitle` for product name, auto-close button from Radix Dialog.

```typescript
// Source: MetricInsightDrawer in src/features/exec/cashback-impact/components/metric-insight-drawer.tsx
// src/features/cashback/dictionaries/components/product-side-sheet.tsx
'use client';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import type { ProductDictionaryEntry } from '@/features/cashback/data/analytics-dictionaries.mock';

interface ProductSideSheetProps {
  product: ProductDictionaryEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductSideSheet({ product, open, onOpenChange }: ProductSideSheetProps) {
  if (!product) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[560px]">
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>{product.productSourceDescription}</SheetDescription>
        </SheetHeader>
        {/* Read-only product details: source, activeConditions, inactiveConditions */}
      </SheetContent>
    </Sheet>
  );
}
```

The close button (`X`) is rendered automatically by `SheetContent` (it includes a `SheetClose` button). No manual close button needed (DICT-07 is satisfied by SheetHeader + built-in close).

### Pattern 5: page.tsx as Thin Shell

**What:** page.tsx becomes a composition-only file. All state from hook, all UI from feature components. No business logic inline.

```typescript
// src/app/dashboard/cashback/dictionaries/page.tsx (after Phase 6)
'use client';
import { useTranslations } from 'next-intl';
import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDictionariesState } from '@/features/cashback/dictionaries/hooks/use-dictionaries-state';
import { ProductsTable } from '@/features/cashback/dictionaries/components/products-table';
import { ProductSideSheet } from '@/features/cashback/dictionaries/components/product-side-sheet';

export default function CashbackDictionariesPage() {
  const t = useTranslations('dictionaries');
  const state = useDictionariesState();

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-6">
        {/* Page heading — reuse existing markup */}
        {/* 2 stat cards: products count + total target actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>...</Card>  {/* products count */}
          <Card>...</Card>  {/* target actions count */}
        </div>
        <ProductsTable
          data={state.products}
          selectedId={state.selectedId}
          onRowClick={state.selectProduct}
        />
        <ProductSideSheet
          product={state.selectedProduct}
          open={state.sheetOpen}
          onOpenChange={state.setSheetOpen}
        />
      </div>
    </PageContainer>
  );
}
```

### Anti-Patterns to Avoid

- **Using `useDataTable` hook:** It forces `manualPagination/Sorting/Filtering: true` which disables all client-side row models. All rows pass through unfiltered. Use `useReactTable` directly.
- **Mutating `PRODUCT_DICTIONARY` directly:** It is an exported `const`. Any array push/map on it mutates the module-level constant. Always `structuredClone()` into `useState` on mount.
- **Calling `ANALYTICS_DATA_SOURCES` in page.tsx after refactor:** Once the Data Sources section is removed (DICT-18), also remove the `ANALYTICS_DATA_SOURCES` import and `dataSourceById` useMemo — dead code.
- **Removing all 3 stat cards:** Keep Products count and Target Actions count (DICT-17). Only the Data Sources card is removed.
- **Using Sheet as layout split:** `SheetContent` is `position: fixed` via Portal — it cannot be a flex sibling. Accept it as an overlay (matches MetricInsightDrawer behavior and project decision).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text search filter in table | Custom filtered array + Input wired manually | `meta.variant: 'text'` on column def + existing `DataTableToolbar` | Toolbar auto-renders `<Input>` and calls `column.setFilterValue()` — zero custom code |
| "No results" empty state | Custom empty component | Existing `DataTable` already renders "No results." cell when `table.getRowModel().rows.length === 0` | Already implemented at line 77-84 of `data-table.tsx` |
| Row highlight when selected | Custom CSS class logic | TanStack `rowSelection` state + `getRowId` + `data-[state=selected]:bg-muted` in `table.tsx` | TableRow already has `data-[state=selected]:bg-muted` at line 60 of `table.tsx` |
| Reset filter button | Custom reset logic | `DataTableToolbar` auto-shows "Reset" button when `isFiltered === true` | Already in toolbar lines 51-63 |
| Sheet close button | `<Button onClick={onOpenChange(false)}>` | Radix Dialog (Sheet backing) renders close button in `SheetContent` automatically | `SheetContent` includes `SheetClose` with `X` icon by default |

**Key insight:** Every "table + side sheet" feature primitive is already built and working in this codebase. Phase 6 is pure composition — wire existing infrastructure together.

---

## Common Pitfalls

### Pitfall 1: DataTable wrapper does not expose onRowClick

**What goes wrong:** `DataTable` component in `src/components/ui/table/data-table.tsx` renders `TableRow` directly with no `onClick` prop. Developers try to pass `onRowClick` to `DataTable` but it doesn't exist in the interface — TypeScript silently ignores it or throws.

**Why it happens:** `DataTable` was built for bulk-selection pattern (checkboxes), not master-detail row click.

**How to avoid:** Two valid options:
1. Render the table body directly inside `ProductsTable` (reuse the same JSX as `DataTable` but add `onClick={() => onRowClick(row.original.id)}` to each `TableRow`). This is ~30 lines of JSX, no abstraction needed.
2. Extend `DataTable` to accept an optional `onRowClick` prop — but this modifies shared infrastructure; risky.

**Recommended:** Option 1 — render table body inline in `ProductsTable`. Use `DataTableToolbar` as a standalone component passed as children if needed, or just use the `<DataTable table={table}>` wrapper and add onClick by patching `TableRow` via row's `onClick` in a column def cell — but this is hacky.

**Simplest working solution:**
```typescript
// In ProductsTable, instead of <DataTable>, render table manually:
<div className="flex flex-1 flex-col space-y-4">
  <DataTableToolbar table={table} />
  <div className="relative flex flex-1">
    <div className="absolute inset-0 flex overflow-hidden rounded-lg border">
      <ScrollArea className="h-full w-full">
        <Table>
          <TableHeader>...</TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                onClick={() => onRowClick(row.original.id)}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  </div>
  <DataTablePagination table={table} />
</div>
```

**Warning signs:** If you see `DataTable` used for the products table but no visible row click working, this is the issue.

### Pitfall 2: structuredClone not called — mock data mutated

**What goes wrong:** `PRODUCT_DICTIONARY` is imported as `const`. Any future Phase 7 fake CRUD that calls `setProducts(prev => prev.map(...))` will silently work, but the initial `useState(PRODUCT_DICTIONARY)` references the module-level array. If any code accidentally mutates the array entries directly (e.g., `product.name = '...'`), the mutation persists across component unmounts because the module is cached.

**How to avoid:** Initialize hook with `() => structuredClone(PRODUCT_DICTIONARY)`. The lazy initializer runs only once on mount.

**Warning signs:** Product name changes persist after closing and reopening the sheet.

### Pitfall 3: DataSources import left in page.tsx after cleanup

**What goes wrong:** After removing the Data Sources section (DICT-18) and stat card (DICT-17), the imports `ANALYTICS_DATA_SOURCES`, `dataSourceById` useMemo, `SOURCE_TYPE_LABEL`, `SOURCE_STATUS_KEY`, `SOURCE_STATUS_VARIANT` constants, and their TypeScript types remain — TypeScript may warn or ESLint will flag unused imports.

**How to avoid:** Remove all three sections together: the imports at lines 25-28 (DataSourceStatus, DataSourceType, ANALYTICS_DATA_SOURCES), the constants at lines 31-48, the `dataSourceById` useMemo at lines 56-58, the Data Sources stat card (lines 103-109), and the Data Sources table card (lines 254-295).

**Warning signs:** Build warnings about unused variables. TypeScript errors on removed types.

### Pitfall 4: i18n keys missing for new UI strings

**What goes wrong:** New DataTable integration adds strings: search placeholder, "no results", and any new sheet display labels. Missing keys in `uk.json` show the key name literally in Ukrainian locale.

**How to avoid:** The `dictionaries` namespace in `messages/en.json` already has ~30 keys (lines 330-364). New keys needed for Phase 6:
- `searchByName` — placeholder for the search input (used in column `meta.placeholder` via `t()`)
- `noResults` — empty state message (currently hardcoded "No results." in `DataTable` — should be i18n'd)
- Sheet display labels for source, conditions sections (if different from existing keys)

Check existing keys before adding: `productInfoSource`, `activityConditions`, `inactivityConditions`, `source`, `notSet` — these already exist and can be reused in the sheet.

**Warning signs:** UK locale shows raw key strings like `"searchByName"`.

### Pitfall 5: Stat card grid uses md:grid-cols-3 after removing third card

**What goes wrong:** Current page has `grid grid-cols-1 gap-4 md:grid-cols-3` for 3 cards. After removing Data Sources card, only 2 cards remain in a 3-column grid — the two cards each take 1/3 width with an empty third slot.

**How to avoid:** Change grid to `md:grid-cols-2` when removing the Data Sources card.

**Warning signs:** Two cards each take 33% width on desktop with a blank third column.

---

## Code Examples

Verified patterns from in-project source inspection:

### Row Selection State Sync (DICT-03)

```typescript
// Sync selectedId from parent state with TanStack row selection
// Source: .planning/research/ARCHITECTURE.md Pattern 5
const rowSelection: RowSelectionState = useMemo(
  () => (selectedId ? { [selectedId]: true } : {}),
  [selectedId]
);
// TableRow will render with data-state="selected" → triggers data-[state=selected]:bg-muted
```

### Removing Data Sources section — diff summary

```typescript
// REMOVE from page.tsx:
// Line 25-28: ANALYTICS_DATA_SOURCES import + DataSourceStatus/Type types
// Line 31-48: SOURCE_TYPE_LABEL, SOURCE_STATUS_KEY, SOURCE_STATUS_VARIANT constants
// Line 56-58: dataSourceById useMemo
// Line 103-109: Data Sources stat card (3rd Card in the 3-card grid)
// Line 254-295: entire Data Sources Card block
// CHANGE: grid from md:grid-cols-3 to md:grid-cols-2 (line 89)
```

### MetricInsightDrawer — reference for Sheet width

```typescript
// Source: src/features/exec/cashback-impact/components/metric-insight-drawer.tsx line 49-51
<SheetContent
  side='right'
  className='w-full overflow-y-auto sm:max-w-[520px]'
>
// Phase 6 uses sm:max-w-[560px] per DICT-06
```

### DataTableToolbar auto-renders search input

```typescript
// Source: src/components/ui/table/data-table-toolbar.tsx line 83-94
// When column.columnDef.meta.variant === 'text', toolbar renders:
<Input
  placeholder={columnMeta.placeholder ?? columnMeta.label}
  value={(column.getFilterValue() as string) ?? ''}
  onChange={(event) => column.setFilterValue(event.target.value)}
  className='h-8 w-40 lg:w-56'
/>
// No custom toolbar needed — just set meta.variant: 'text' in column def
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Button list for product selection | DataTable rows with click-to-open | Phase 6 (now) | Table scales to N products; enables search, sort, filter |
| Static detail card (3-col layout) | Side sheet overlay | Phase 6 (now) | Full page width for table; standard master-detail pattern |
| Data Sources on dictionaries page | Removed (future separate page) | Phase 6 (now) | Cleaner page focus; DICT-18 explicitly required |
| 3 stat cards | 2 stat cards | Phase 6 (now) | Removes data source count which is no longer surfaced |

**Deprecated/outdated in page.tsx after Phase 6:**
- `ANALYTICS_DATA_SOURCES` import: removed (no longer rendered on this page)
- `SOURCE_TYPE_LABEL`, `SOURCE_STATUS_KEY`, `SOURCE_STATUS_VARIANT` constants: removed
- `dataSourceById` useMemo: removed
- Button list pattern for products: replaced by DataTable

---

## Open Questions

1. **Should `ProductsTable` re-use the `DataTable` wrapper or render its own table body?**
   - What we know: `DataTable` does not expose `onRowClick`; adding it would modify shared infrastructure
   - What's unclear: Whether to extend `DataTable` (shared) or render table body inline in `ProductsTable` (isolated)
   - Recommendation: Render table body inline in `ProductsTable`. Use `DataTableToolbar` as a standalone child. This avoids modifying shared `DataTable` for a single-use case. ~30 lines of JSX, no abstraction cost.

2. **Should the Sheet show product details directly (Phase 6) or wait for Tabs (Phase 7)?**
   - What we know: DICT-09 (Tab "General" with details) is in Phase 6 scope per requirements; DICT-08 (Tabs) is Phase 7
   - What's unclear: Phase 6 success criteria says "product details (name, description, source, conditions)" without explicitly requiring Tabs
   - Recommendation: Phase 6 sheet is a flat read-only view (no Tabs). Show: SheetHeader with product name, then description, source info, active/inactive conditions — reusing the same display pattern from the current static card. Tabs added in Phase 7. This keeps Phase 6 independently shippable.

3. **Should `DataTablePagination` be shown for 3 products?**
   - What we know: `DataTablePagination` always renders; for 3 rows and default 10 rows/page, it shows "1 of 1" which looks noisy
   - What's unclear: Whether to hide or keep it
   - Recommendation: Keep it — don't add conditional hide logic. The pagination component handles small datasets gracefully (shows disabled navigation buttons). Hiding it requires prop drilling or a wrapper check. Keep for consistency with other DataTable usages.

---

## Sources

### Primary (HIGH confidence)
- `src/app/dashboard/cashback/dictionaries/page.tsx` — confirmed current structure, all state/imports to be changed (direct inspection)
- `src/features/cashback/data/analytics-dictionaries.mock.ts` — confirmed `ProductDictionaryEntry` type, 3 products, `PRODUCT_DICTIONARY` is exported `const`
- `src/components/ui/table/data-table.tsx` — confirmed `DataTable` interface, row rendering with `data-state`, no `onRowClick` prop
- `src/components/ui/table/data-table-toolbar.tsx` — confirmed `meta.variant: 'text'` auto-renders `<Input>` with `column.setFilterValue`
- `src/components/ui/table.tsx` line 60 — confirmed `TableRow` has `data-[state=selected]:bg-muted hover:bg-muted/50`
- `src/features/exec/cashback-impact/components/metric-insight-drawer.tsx` — confirmed Sheet pattern with `sm:max-w-[520px]`, `overflow-y-auto`, SheetHeader/SheetTitle usage
- `messages/en.json` lines 330-364 — confirmed `dictionaries` namespace with existing keys (25+ keys already present)
- `.planning/research/ARCHITECTURE.md` — confirmed hook pattern, build order, anti-patterns (HIGH confidence from prior codebase analysis)
- `.planning/research/STACK.md` — confirmed zero new dependencies needed
- `src/hooks/use-data-table.ts` lines 1-30 — confirmed `nuqs` dependency and `manualX: true` pattern (server-side only)

### Secondary (MEDIUM confidence)
- `.planning/research/PITFALLS.md` — domain expertise + codebase inspection (pitfalls 1-7)
- `.planning/research/SUMMARY.md` — synthesized findings from prior research session

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages inspected directly in `package.json` and source files
- Architecture: HIGH — existing `MetricInsightDrawer`, `DataTable`, `DataTableToolbar` implementations inspected; hook pattern is a direct copy of research/ARCHITECTURE.md
- Pitfalls: HIGH — all pitfalls grounded in direct source inspection, not conjecture

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable libraries; patterns won't change)
