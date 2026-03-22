# Architecture Research

**Domain:** Next.js App Router dashboard — table + side sheet + inline CRUD
**Researched:** 2026-03-21
**Confidence:** HIGH (analysis of actual codebase, all patterns observed from existing code)

---

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│  app/dashboard/cashback/dictionaries/page.tsx  (Route Entry)        │
│  'use client' — owns all feature state, passes down as props        │
├────────────────────────────────────────────────────────────────────┤
│  PageContainer  (layout shell — scrollable, heading, page actions)  │
├───────────────────────────────┬────────────────────────────────────┤
│  DictionariesToolbar          │  ProductSideSheet                   │
│  (search input + filters)     │  (Sheet from shadcn/ui)             │
├───────────────────────────────┤  ┌─────────────────────────────┐   │
│  ProductsTable                │  │  Tabs: General / Target Actn │   │
│  (TanStack Table via          │  ├─────────────────────────────┤   │
│   useDataTable hook —         │  │  GeneralTab (read + edit)   │   │
│   client-side filter/sort)    │  ├─────────────────────────────┤   │
│                               │  │  TargetActionsTab (table)   │   │
│  row click → setSelectedId    │  └─────────────────────────────┘   │
│  row click → setSheetOpen     │                                     │
└───────────────────────────────┴────────────────────────────────────┘
                        │
          ┌─────────────▼──────────────┐
          │  useDictionariesState()     │
          │  (custom hook in feature)   │
          │                             │
          │  products: state (array)    │
          │  selectedId: string | null  │
          │  sheetOpen: boolean         │
          │  editMode: boolean          │
          │  handlers: CRUD fns         │
          └─────────────────────────────┘
                        │
          ┌─────────────▼──────────────┐
          │  analytics-dictionaries     │
          │  .mock.ts  (source of truth) │
          │  PRODUCT_DICTIONARY[]       │
          │  (initial data, immutable)  │
          └─────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Status |
|-----------|----------------|--------|
| `page.tsx` | Route entry, provides `PageContainer`, renders layout split | MODIFY |
| `useDictionariesState` | All feature state (list, selected row, sheet open, edit mode, fake CRUD handlers) | CREATE |
| `DictionariesToolbar` | Search `<Input>` + optional faceted filter for source type; passes filter state to table | CREATE |
| `ProductsTable` | TanStack Table instance using existing `DataTable` + `DataTableToolbar`; row click handler | CREATE |
| `ProductSideSheet` | `Sheet` wrapper (right side); receives `product \| null`, `open`, `onOpenChange`, `onSave`, `onDelete` | CREATE |
| `GeneralTab` | Read/edit form for top-level product fields; toggles between view and edit mode | CREATE |
| `TargetActionsTab` | Read-only or editable sub-table of `targetActions[]` within the selected product | CREATE |
| `analytics-dictionaries.mock.ts` | Type definitions + seed data; stays immutable (state is copied at runtime) | NO CHANGE |

---

## Recommended Project Structure

```
src/
├── features/
│   └── cashback/
│       ├── data/
│       │   └── analytics-dictionaries.mock.ts   # existing — no change
│       └── dictionaries/                         # NEW feature folder
│           ├── components/
│           │   ├── dictionaries-toolbar.tsx      # search + filter bar
│           │   ├── products-table.tsx             # TanStack Table wrapper
│           │   ├── product-side-sheet.tsx         # Sheet container with tabs
│           │   ├── general-tab.tsx                # view/edit product fields
│           │   └── target-actions-tab.tsx         # target actions sub-table
│           ├── hooks/
│           │   └── use-dictionaries-state.ts      # all state + fake CRUD
│           └── columns/
│               └── products-columns.tsx           # TanStack column defs
└── app/
    └── dashboard/
        └── cashback/
            └── dictionaries/
                └── page.tsx                       # MODIFY: thin shell
```

### Structure Rationale

- **`features/cashback/dictionaries/`** follows the existing feature convention (`features/exec/cashback-impact/`) — co-locates components, hooks, and columns for this page slice.
- **`columns/` subfolder** separates column definitions (which include cell renderers) from layout components — same pattern used in other shadcn/TanStack Table setups.
- **`hooks/use-dictionaries-state.ts`** extracts all non-trivial state so `page.tsx` stays a thin composition shell.
- Mock data stays in `data/analytics-dictionaries.mock.ts` — state hook seeds from it on mount but operates on a local copy.

---

## Architectural Patterns

### Pattern 1: Page as thin composition shell

**What:** `page.tsx` declares `'use client'`, instantiates the state hook, and composes layout. No business logic inline.
**When to use:** Any page where multiple sibling components share state (table + sheet, toolbar + table).
**Trade-offs:** Adds one indirection layer; eliminates prop drilling chains that would form if state lived inside `ProductsTable`.

```typescript
// app/dashboard/cashback/dictionaries/page.tsx
'use client';
export default function CashbackDictionariesPage() {
  const state = useDictionariesState();
  return (
    <PageContainer pageTitle={t('title')} pageDescription={t('description')}>
      <DictionariesToolbar
        searchValue={state.search}
        onSearchChange={state.setSearch}
        sourceFilter={state.sourceFilter}
        onSourceFilterChange={state.setSourceFilter}
      />
      <ProductsTable
        data={state.filteredProducts}
        selectedId={state.selectedId}
        onRowClick={state.selectProduct}
      />
      <ProductSideSheet
        product={state.selectedProduct}
        open={state.sheetOpen}
        onOpenChange={state.setSheetOpen}
        onSave={state.updateProduct}
        onDelete={state.deleteProduct}
      />
    </PageContainer>
  );
}
```

### Pattern 2: Client-side filter state in the hook (not URL params)

**What:** Search text and facet filters live in `useState` inside `useDictionariesState`. Filtering is computed with `useMemo` over the local products array.
**When to use:** This page is mock-only with no server fetching. The existing `useDataTable` hook (which uses `nuqs` for URL state) is designed for server-side pagination/filtering with a real API. Using it here would add URL pollution with no benefit.
**Trade-offs:** Filter state is lost on navigation (acceptable for a reference dictionary page). Avoids `nuqs` and `searchParamsCache` complexity for a client-only feature.

```typescript
// hooks/use-dictionaries-state.ts
export function useDictionariesState() {
  const [products, setProducts] = useState<ProductDictionaryEntry[]>(
    () => structuredClone(PRODUCT_DICTIONARY)   // mutable copy from mock
  );
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase());
      const matchesSource =
        sourceFilter === null || p.productSourceId === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [products, search, sourceFilter]);

  const selectProduct = useCallback((id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  }, []);

  const updateProduct = useCallback((updated: ProductDictionaryEntry) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSheetOpen(false);
    setSelectedId(null);
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  return {
    products,
    filteredProducts,
    selectedProduct,
    selectedId,
    sheetOpen,
    setSheetOpen,
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    selectProduct,
    updateProduct,
    deleteProduct,
  };
}
```

### Pattern 3: Inline edit with controlled form state in the tab

**What:** `GeneralTab` receives `product` as prop. Internally it holds a `formState` copy in `useState`. The Save button calls `onSave(formState)` which propagates to the hook above. No form library needed for this complexity level.
**When to use:** Simple flat objects with 2–5 fields. A single submit boundary per tab.
**Trade-offs:** Reset on prop change must be handled explicitly (`useEffect` watching `product.id`). For more complex nested structures, consider react-hook-form, but that is overkill here.

```typescript
// components/general-tab.tsx
export function GeneralTab({ product, onSave }: GeneralTabProps) {
  const [form, setForm] = useState(product);
  const [editing, setEditing] = useState(false);

  // Reset form when a different product is selected
  useEffect(() => {
    setForm(product);
    setEditing(false);
  }, [product.id]);

  return editing ? (
    <EditForm form={form} onChange={setForm}
      onSave={() => { onSave(form); setEditing(false); }}
      onCancel={() => { setForm(product); setEditing(false); }}
    />
  ) : (
    <ReadView product={product} onEdit={() => setEditing(true)} />
  );
}
```

### Pattern 4: Side sheet as overlay, not layout split

**What:** Use existing shadcn `Sheet` with `side="right"` as an overlay panel. The table stays full-width underneath. Sheet is opened/closed via `open` / `onOpenChange` props controlled by the page.
**When to use:** The design calls for "no modals — everything inline in side sheet." The existing `MetricInsightDrawer` in `features/exec/cashback-impact/` uses exactly this pattern.
**Trade-offs:** Sheet is a portal overlay (backdrop dims the table). If the design requires both table and panel visible simultaneously without a backdrop, a CSS grid split would be needed instead — but the PROJECT.md decision is clear: side sheet.

The `SheetContent` in `src/components/ui/sheet.tsx` supports `sm:max-w-sm` by default. Override with `className="sm:max-w-[560px]"` for wider content (target actions table inside sheet needs more room).

### Pattern 5: TanStack Table for product list with client-side data

**What:** Use the existing `DataTable` + `DataTableToolbar` components from `src/components/ui/table/`. Pass `data={filteredProducts}` directly (already filtered by the hook). Table instance uses `getCoreRowModel`, `getSortedRowModel`, client-side only — do NOT use `manualPagination: true` / `manualSorting: true` (those are for server-side fetches).
**When to use:** Small mock dataset (3 products initially, expandable to ~20). No server fetch means client-side models are correct.
**Trade-offs:** The existing `useDataTable` hook forces `manualPagination/Sorting/Filtering: true` — it is designed for server fetch. For this page, build a simpler local `useReactTable` call directly inside `products-table.tsx` or create a leaner hook variant. Do not reuse `useDataTable` as-is.

```typescript
// columns/products-columns.tsx
export const productColumns: ColumnDef<ProductDictionaryEntry>[] = [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    id: 'targetActionsCount',
    header: 'Target Actions',
    cell: ({ row }) => row.original.targetActions.length,
  },
  {
    id: 'productSourceId',
    header: 'Data Source',
    cell: ({ row }) => row.original.productSourceId ?? '—',
  },
];
```

---

## Data Flow

### Request Flow (fake CRUD — no server)

```
User clicks row in ProductsTable
    ↓
onRowClick(product.id) → state.selectProduct(id)
    ↓
selectedId = id, sheetOpen = true
    ↓
ProductSideSheet opens with selectedProduct from state
    ↓
User edits in GeneralTab, clicks Save
    ↓
onSave(updatedProduct) → state.updateProduct(updatedProduct)
    ↓
setProducts(prev => prev.map(...))
    ↓
filteredProducts recomputed via useMemo
    ↓
Table re-renders with updated row
    ↓
Sheet still open — selectedProduct also updated (found by id)
```

### State Management

```
useDictionariesState (source of truth)
    │
    ├─ products[]          ← mutable copy of PRODUCT_DICTIONARY mock
    ├─ search              ← controlled by DictionariesToolbar
    ├─ sourceFilter        ← controlled by DictionariesToolbar
    ├─ selectedId          ← controlled by ProductsTable row click
    ├─ sheetOpen           ← controlled by row click + sheet close
    │
    ├─ filteredProducts[]  ← derived (useMemo)
    └─ selectedProduct     ← derived (useMemo)

DictionariesToolbar ←→ (search, sourceFilter, setters)
ProductsTable       ←→ (filteredProducts, selectedId, onRowClick)
ProductSideSheet    ←→ (selectedProduct, sheetOpen, handlers)
  └─ GeneralTab     ←→ (product, onSave) + local editForm state
  └─ TargetActionsTab ← (product.targetActions) — read display only
```

### Key Data Flows

1. **Search filter:** User types in toolbar input → `setSearch(value)` (debounced optional) → `filteredProducts` recomputed → `ProductsTable` receives new `data` prop → TanStack re-renders rows.
2. **Source filter:** User picks from facet dropdown → `setSourceFilter(id)` → same recompute path as search.
3. **Edit + Save:** Sheet tab holds local form copy → on Save, propagates up to hook → products array updated in place → sheet remains open, selected product reflects changes.
4. **Delete:** Sheet footer button → `state.deleteProduct(id)` → products array updated, sheet closes, selectedId cleared.
5. **Sheet close without saving:** `onOpenChange(false)` → sheet closes, `selectedId` is NOT cleared — so reopening the same row preserves position.

---

## Integration Points

### Existing Infrastructure Used (no modification needed)

| Asset | Location | How Used |
|-------|----------|----------|
| `Sheet`, `SheetContent`, `SheetHeader`, etc. | `src/components/ui/sheet.tsx` | Side panel container |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `src/components/ui/tabs.tsx` | General / Target Actions tabs |
| `DataTable` | `src/components/ui/table/data-table.tsx` | Table renderer |
| `DataTableToolbar` | `src/components/ui/table/data-table-toolbar.tsx` | Toolbar with filter reset button |
| `DataTableFacetedFilter` | `src/components/ui/table/data-table-faceted-filter.tsx` | Source type dropdown filter |
| `Input` | `src/components/ui/input.tsx` | Search text input in toolbar |
| `PageContainer` | `src/components/layout/page-container.tsx` | Page shell — use `pageTitle`/`pageDescription` props instead of inline heading |
| `Badge`, `Button`, `Card` | `src/components/ui/` | Display elements |
| `useTranslations` (next-intl) | — | All user-facing strings |

### What Changes in page.tsx

| Before | After |
|--------|-------|
| Monolithic 300-line page component | Thin shell — imports and composes 3 feature components |
| All state inline (`useState` at top of page) | State delegated to `useDictionariesState` hook |
| Data Sources table rendered inline | Removed (out of scope for v1.1) |
| Product list as button grid | Replaced by `ProductsTable` |
| Product detail as static Card | Replaced by `ProductSideSheet` |
| Custom inline heading markup | Use `PageContainer` `pageTitle`/`pageDescription` props |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| page ↔ useDictionariesState | Destructured hook return | Hook is the only state source; page never calls `setProducts` directly |
| ProductsTable ↔ page | Props: `data`, `selectedId`, `onRowClick` | Table is fully controlled — no internal row selection state |
| ProductSideSheet ↔ page | Props: `product`, `open`, `onOpenChange`, `onSave`, `onDelete` | Sheet is controlled open/close from parent |
| GeneralTab ↔ ProductSideSheet | Props: `product`, `onSave` | Tab owns its own local edit form copy |
| TargetActionsTab ↔ ProductSideSheet | Props: `targetActions` | Read-display only for v1.1; future: add `onUpdateAction` handler |
| DataTable ↔ ProductsTable | TanStack Table instance passed as `table` prop | Column defs imported from `columns/products-columns.tsx` |

---

## Build Order (dependency-aware)

This is the correct implementation sequence — each step has no forward dependencies:

1. **`hooks/use-dictionaries-state.ts`** — no UI deps; defines all state shape and CRUD handlers. Build and test in isolation with console logs before wiring UI.

2. **`columns/products-columns.tsx`** — only depends on `ProductDictionaryEntry` type from mock. Define column defs including cell renderers.

3. **`components/dictionaries-toolbar.tsx`** — only deps: shadcn `Input`, `DataTableFacetedFilter`. Accepts `searchValue` / `onSearchChange` / filter props.

4. **`components/products-table.tsx`** — deps: `DataTable`, `DataTableToolbar`, column defs from step 2. Uses local `useReactTable` (NOT `useDataTable` hook — see Pattern 5). Accepts `data`, `selectedId`, `onRowClick`.

5. **`components/general-tab.tsx`** — deps: `Input`, `Textarea`, `Button`. Accepts `product`, `onSave`. Contains local edit form state.

6. **`components/target-actions-tab.tsx`** — deps: shadcn `Table`. Accepts `targetActions[]`, read-only display.

7. **`components/product-side-sheet.tsx`** — deps: `Sheet`, `Tabs`, steps 5+6. Composes tabs, header, footer with Delete button.

8. **`page.tsx` (modify)** — wire everything together. Replace current content with thin composition using `useDictionariesState` + 3 feature components.

---

## Anti-Patterns

### Anti-Pattern 1: Reusing `useDataTable` for mock data

**What people do:** Reach for the existing `useDataTable` hook because it's already there.
**Why it's wrong:** `useDataTable` sets `manualPagination: true`, `manualSorting: true`, `manualFiltering: true` — these tell TanStack Table "the data is already paginated/filtered by the server, don't do it client-side." With a static array, all rows will pass through unfiltered and unsorted. It also serializes filter state to URL via `nuqs`, which is unnecessary overhead for a mock dictionary.
**Do this instead:** Use `useReactTable` directly inside `products-table.tsx` with `getFilteredRowModel`, `getSortedRowModel` and `manualX: false` (the defaults). Or filter outside the table entirely in the hook and just pass `data={filteredProducts}`.

### Anti-Pattern 2: State split between sheet and parent

**What people do:** Let `ProductSideSheet` own its own copy of the product state for editing, and sync back to parent on save via an event.
**Why it's wrong:** Creates two sources of truth. If the parent products array updates (e.g., user edits in the table toolbar somehow), the sheet's copy goes stale. Leads to subtle bugs especially with derived state like `filteredProducts`.
**Do this instead:** Sheet owns only the transient _edit form copy_ (the `formState` inside `GeneralTab`). The authoritative product data lives in `useDictionariesState`. The sheet reads `selectedProduct` which is derived from the authoritative list.

### Anti-Pattern 3: Using shadcn Sheet as a layout split

**What people do:** Attempt to make the Sheet panel visible alongside the table without overlay/backdrop, creating a side-by-side layout.
**Why it's wrong:** `SheetContent` uses `position: fixed` and a Portal — it's always an overlay. Forcing it into a layout role requires fighting the component's CSS fundamentals and creates z-index conflicts with the existing `InfoSidebar` (right side) and app sidebar.
**Do this instead:** Accept the overlay behavior — it matches the design decision in PROJECT.md ("side sheet not modal"). If a persistent split panel is ever needed, build a CSS grid layout (`grid-cols-[1fr_400px]`) instead of adapting Sheet.

### Anti-Pattern 4: Removing the KPI summary cards

**What people do:** In the redesign sweep, delete the existing KPI summary grid (products count, target actions count, data sources count) thinking it belongs to the old design.
**Why it's wrong:** The metrics cards reuse the same `Card` + `CardHeader` pattern as the rest of the dashboard — they are already consistent. Removing them loses information density that helps the PM quickly scan status.
**Do this instead:** Keep the 2-card summary (Products, Target Actions). Remove the Data Sources card (since the Data Sources section is being removed in v1.1). The third slot can be left empty or used for a future "Active Sources" count.

---

## Scaling Considerations

This is a mock dashboard with no backend. Scaling is not a concern. However, if real data is introduced later:

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Mock data (now) | Client-side filter in hook, no server calls |
| Real API, <1k products | Switch `useDataTable` hook for URL-synced server-side filter; move filter params to `searchParamsCache` in `searchparams.ts` |
| Real API, >1k products | Add server-side pagination (`pageCount` from API response); debounce search before firing requests |

---

## Sources

- Codebase analysis: `src/features/cashback/data/analytics-dictionaries.mock.ts`
- Codebase analysis: `src/app/dashboard/cashback/dictionaries/page.tsx` (current implementation)
- Codebase analysis: `src/hooks/use-data-table.ts` (existing hook — designed for server-side)
- Codebase analysis: `src/components/ui/table/data-table.tsx` and related table primitives
- Codebase analysis: `src/components/ui/sheet.tsx` (Sheet primitive)
- Codebase analysis: `src/features/exec/cashback-impact/components/metric-insight-drawer.tsx` (existing Sheet usage pattern)
- Codebase analysis: `src/components/layout/page-container.tsx` (layout shell)
- Codebase analysis: `src/app/dashboard/layout.tsx` (dashboard layout with InfoSidebar)
- Project context: `.planning/PROJECT.md` — decision: side sheet over modals, fake CRUD

---
*Architecture research for: Dictionaries page redesign (v1.1)*
*Researched: 2026-03-21*
