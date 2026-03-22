# Stack Research

**Domain:** Analytics dashboard — dictionaries page redesign (table + side sheet + inline editing)
**Researched:** 2026-03-21
**Confidence:** HIGH

---

## Key Finding: Zero New Dependencies

Every component needed for this milestone is already installed and shadcn-scaffolded. No `npm install` required. This is a pure composition milestone — wire existing infrastructure together.

---

## Components Already in the Project

### shadcn/ui Components (already scaffolded at `src/components/ui/`)

| Component | File | Status | Use in This Milestone |
|-----------|------|--------|-----------------------|
| `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetFooter` | `sheet.tsx` | Installed | Right-side detail panel for selected product |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `tabs.tsx` | Installed | "General / Target Actions" tabs inside Sheet |
| `Input` | `input.tsx` | Installed | Search field in DataTableToolbar |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` | `form.tsx` | Installed | Inline editing form inside Sheet |
| `DataTable` | `table/data-table.tsx` | Installed | Products table with sorting/filtering |
| `DataTableToolbar` | `table/data-table-toolbar.tsx` | Installed | Search input + filter controls above table |
| `DataTableFacetedFilter` | `table/data-table-faceted-filter.tsx` | Installed | Faceted filter for product status/type |
| `DataTablePagination` | `table/data-table-pagination.tsx` | Installed | Pagination below table |
| `DataTableColumnHeader` | `table/data-table-column-header.tsx` | Installed | Sortable column headers |
| `Textarea` | `textarea.tsx` | Installed | Multi-line text fields in inline edit form |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | `select.tsx` | Installed | Dropdowns in inline edit form |
| `ScrollArea` | `scroll-area.tsx` | Installed | Scrollable Sheet content |
| `Badge` | `badge.tsx` | Installed | Status indicators in table rows |
| `Button` | `button.tsx` | Installed | Save / Cancel in Sheet footer |

### Core Libraries (already in `package.json`)

| Library | Version | Role in This Milestone |
|---------|---------|------------------------|
| `@tanstack/react-table` | `^8.21.2` | Powers `DataTable` — column defs, filtering, sorting, row selection |
| `react-hook-form` | `^7.54.1` | Form state management for inline editing |
| `@hookform/resolvers` | `^5.2.1` | Zod schema validation in edit form |
| `zod` | `^4.1.8` | Schema definition for product edit form |
| `@radix-ui/react-dialog` | `^1.1.6` | Backing primitive for Sheet (via `SheetPrimitive`) |
| `@radix-ui/react-tabs` | `^1.1.3` | Backing primitive for Tabs |
| `lucide-react` | `^0.575.0` | Icons (X close, Search, Edit, etc.) |
| `next-intl` | `^4.8.3` | i18n for all new labels (already in DataTableToolbar via `useTranslations`) |

---

## How to Wire These Together

### Table + Sheet Pattern

The DataTable is controlled by a `useReactTable` hook. Row click sets `selectedProductId` in local state. Sheet `open` prop is derived from `selectedProductId !== null`. Sheet renders product details with Tabs.

```typescript
// Pattern already used in this codebase (see exec/cashback-impact drawer)
const [selectedId, setSelectedId] = useState<string | null>(null);

// Row click handler passed via column def or onRowClick prop
// Sheet open={selectedId !== null}
// SheetContent renders product from PRODUCT_DICTIONARY.find(p => p.id === selectedId)
```

### DataTable Column Definitions for Products

The existing `DataTableToolbar` auto-renders filter controls based on `column.columnDef.meta.variant`. For the products table, define columns with:
- `name` column: `meta: { variant: 'text', placeholder: 'Search products...' }`
- No additional filter libraries needed — `DataTableFacetedFilter` already handles `select`/`multiSelect` variants

### Inline Editing in Sheet

Use `react-hook-form` with `useForm` + `reset(selectedProduct)` when selection changes. On "Save", update local mock state (`useState<ProductDictionaryEntry[]>`). No persistence — fake CRUD via state lift.

```typescript
// Zod schema for the edit form
const productSchema = z.object({
  name: z.string().min(1),
  productSourceDescription: z.string(),
  activeConditions: z.array(z.string()),
  inactiveConditions: z.array(z.string()),
});
```

### i18n Integration

`DataTableToolbar` already calls `useTranslations('dataTable')`. New Sheet/form labels go in the existing `dictionaries` namespace (already present in `messages/en.json` and `messages/uk.json`).

---

## lib/data-table.ts Utilities (already present)

| Utility | Use |
|---------|-----|
| `getCommonPinningStyles` | Sticky columns (if name column is pinned left) |
| `getFilterOperators` | Used by toolbar filter components |
| `getDefaultFilterOperator` | Default operator for text search |

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| shadcn Sheet (right side panel) | Modal Dialog | Project decision: no modals, everything inline (see PROJECT.md Key Decisions) |
| `@tanstack/react-table` via existing `DataTable` | Plain `<Table>` (currently used) | Existing DataTable gives sorting, filtering, pagination for free; plain Table requires reimplementing all of this |
| `react-hook-form` + `zod` | Controlled inputs with `useState` | RHF already installed; consistent with rest of codebase; form validation is free |
| Local `useState` mock CRUD | `zustand` store | Zustand is installed but overkill for single-page mock state; useState is sufficient for fake CRUD scoped to one page |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Any new npm package | Everything needed is already installed | Compose existing shadcn components |
| `react-resizable-panels` (already installed) | Adds complexity; Sheet overlay pattern is simpler and matches UX decision | Sheet with fixed width (`sm:max-w-[480px]`) |
| `nuqs` for URL state | Overkill for mock page with no routing needs | `useState` for selected product ID |
| New icon library | `lucide-react` and `@radix-ui/react-icons` both installed | Use `lucide-react` (consistent with rest of UI) |

---

## Installation

No installation required. All dependencies are present.

```bash
# Nothing to install — all packages already in package.json
```

---

## Version Compatibility

All packages are compatible — they are already coinstalled and working in the project.

| Concern | Status |
|---------|--------|
| `@tanstack/react-table` v8 + React 19 | Working (existing DataTable component proves this) |
| `react-hook-form` v7 + `zod` v4 | Compatible via `@hookform/resolvers/zod` |
| shadcn/ui Sheet + Tailwind v4 | Working (Sheet is already scaffolded and styled) |
| `next-intl` v4 inside Client Components | Working (DataTableToolbar already uses `useTranslations`) |

---

## Sources

- Direct codebase inspection: `src/components/ui/sheet.tsx`, `tabs.tsx`, `form.tsx`, `input.tsx`, `table/data-table*.tsx` — confirmed present and implemented (HIGH confidence)
- `package.json` dependency versions — confirmed installed (HIGH confidence)
- `src/app/dashboard/cashback/dictionaries/page.tsx` — confirmed current page structure and what is being replaced (HIGH confidence)
- `src/lib/data-table.ts` — confirmed utility functions available (HIGH confidence)

---

*Stack research for: Dictionaries page redesign — table + side sheet + inline editing*
*Researched: 2026-03-21*
