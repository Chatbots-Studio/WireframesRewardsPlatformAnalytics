# Feature Research

**Domain:** Product dictionary management UI — admin dashboard master-detail table with side sheet editing
**Researched:** 2026-03-21
**Confidence:** HIGH (codebase fully examined, existing patterns verified)

---

## Context: What Already Exists

The current `/dashboard/cashback/dictionaries` page has:
- Stat cards (products count, target actions count, data sources count)
- Product selector as a vertical button list (not a table)
- Target actions table for the selected product (shadcn Table, read-only)
- Data sources table (to be removed in this milestone)
- i18n (EN/UK via next-intl)
- `PageContainer` layout wrapper

**Available in-repo, not yet used on this page:**
- `DataTable` + `DataTableToolbar` (TanStack Table, text/select/multiSelect filters, pagination, view options)
- `Sheet` / `SheetContent` / `SheetHeader` / `SheetTitle` (already used in `metric-insight-drawer.tsx`)
- `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` (shadcn/ui)
- Form primitives: `Input`, `Textarea`, `Select`, `Switch`, `Label`, `form.tsx` (react-hook-form wrapper)
- `DataTableFacetedFilter` — popover multi-select, already i18n-aware
- `Sonner` — toast notifications (already in providers)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features a product manager expects in any admin dictionary tool. Missing any = UI feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Products as table rows (not buttons) | Industry standard for list management; buttons don't scale beyond 5–7 items | LOW | Replace button list with shadcn `Table` rows; row click opens side sheet. Already have `TableRow` interactive pattern. |
| Click-to-select row opens detail panel | Standard master-detail UX (Notion, Linear, Airtable, Retool) | LOW | `useState<string \| null>` for selected ID; Sheet controlled by `open={!!selectedId}`. Existing `metric-insight-drawer.tsx` is the exact pattern. |
| Side sheet closes without losing table state | Users expect panel to be dismissible without page reload | LOW | Sheet `onOpenChange` already handles this via Radix Dialog. |
| Tabs inside side sheet (General / Target Actions) | Product has two distinct data groups; tabs prevent long scroll in narrow panel | LOW | shadcn `Tabs` component already present. Tab 1: product meta + conditions. Tab 2: target actions table. |
| Text search over product list | Users need to find specific products by name | LOW | `DataTableToolbar` already has `variant: 'text'` Input filter. Wire to `name` column. |
| Empty state when no search results | Standard table UX; absence feels broken | LOW | `DataTable` already renders "No results." cell — just needs i18n string. |
| Reset filters button | Users need to clear search quickly | LOW | `DataTableToolbar` already renders "Reset" when `isFiltered`. |
| Inline editing in side sheet (fake CRUD) | PM needs to feel ownership over dictionary data | MEDIUM | `useState` for edit mode toggle; edit fields replace display values on same sheet. No backend — `useState` updates mock data in component state. |
| Save / Cancel actions in sheet footer | Users expect explicit save intent before changes apply | LOW | `SheetFooter` pattern + two buttons. No persistence needed (mock). |
| Toast confirmation after save | Feedback that action completed | LOW | `sonner` already in providers. One `toast.success()` call. |
| Stat cards preserved (updated counts) | Dashboard convention; page already has them | LOW | Keep existing 3 stat cards. Remove Data Sources card or replace with target actions total. |

### Differentiators (Competitive Advantage)

Features that elevate the UX beyond generic CRUD tables. Align with the project's "fast access" principle for PMs.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Table narrows when sheet opens (split view) | Keeps context visible while editing — user sees which row is selected | MEDIUM | Two-column flex layout: table col shrinks, sheet col appears. Alternative: use Sheet overlay with `sm:max-w-[480px]` (simpler, matches existing `metric-insight-drawer`). Overlay approach is lower complexity and already proven in this project. |
| Selected row highlight stays while sheet open | Maintains spatial orientation — user knows what they are editing | LOW | `data-[state=selected]` or manual `cn` class on row when `id === selectedId`. Already done with product buttons. |
| Target actions sub-table inside sheet (Tab 2) | PMs need to see all actions for a product without leaving context | LOW | Reuse existing `Table` inside SheetContent. Scrollable via `overflow-y-auto` on SheetContent. |
| Add / remove target actions from sheet | Extends fake CRUD to nested data — realistic demo | MEDIUM | Append to `targetActions[]` in local state. Delete button per row. No separate modal — inline form at bottom of Tab 2. |
| Badge indicators on table rows (action count) | Scannable summary without opening the sheet | LOW | `<Badge variant="secondary">{product.targetActions.length}</Badge>` as a column. |
| Editable active/inactive conditions as tag list | Conditions feel like tags, not a textarea blob | MEDIUM | Array of strings rendered as removable chips + add-new input. More realistic than plain textarea. Defer if scope is tight. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Modal dialog for editing | Familiar pattern from older admin tools | Obscures table context; project explicitly decided against modals (see PROJECT.md Key Decisions) | Side sheet is the project-mandated replacement |
| Inline cell editing in table (click cell to edit) | Feels faster for power users | Ambiguous interaction: is a click for select-row or edit-cell? Breaks master-detail mental model. High complexity with TanStack Table. | Side sheet edit form — explicit, unambiguous |
| Pagination for 3–5 products | Technically supported by `DataTablePagination` | Over-engineering for the current data size; adds visual noise | Keep pagination component but set `pageSize` large enough that it never shows, or hide when `totalRows < pageSize` |
| Confirmation modal for delete | "Are you sure?" dialogs feel professional | Adds an extra step for a fake-CRUD demo; no real data loss risk | Toast with undo action (Sonner supports it) — or just delete immediately in mock state |
| Separate page navigation per product | URL per product (`/dictionaries/[id]`) | Over-complex for a reference dictionary; adds routing boilerplate; unnecessary for mock data | Side sheet stays on same URL; keep it simple |
| Full TanStack Table for the target actions sub-table | Consistent with main table | Target actions list per product is 2–5 rows max; full DataTable machinery is overkill inside a sheet | Plain shadcn `Table` inside SheetContent, same as current implementation |
| Real-time auto-save | Progressive feel | Unclear save state; accidental edits persist; requires complex dirty-tracking | Explicit Save button with toast — intentional, clear |

---

## Feature Dependencies

```
[Products Table with Row Selection]
    └──requires──> [selectedProductId state]
                       └──requires──> [Side Sheet open/close control]
                                          └──requires──> [Tab layout inside sheet]
                                                             ├──requires──> [General tab: product meta display + edit]
                                                             └──requires──> [Target Actions tab: sub-table + add/remove]

[Text Search Filter]
    └──requires──> [Products Table] (must be TanStack Table for column filters)

[Fake CRUD Save]
    └──requires──> [Edit mode state inside sheet]
    └──enhances──> [Toast notification (Sonner)]

[Stat Cards]
    └──enhances──> [Products Table] (total count drives card value)

[Remove Data Sources section]
    └──conflicts──> [Data Sources stat card] (remove or repurpose)
```

### Dependency Notes

- **Products Table requires selectedProductId state:** The sheet cannot open without a selection model; build table + selection before sheet.
- **Text Search requires TanStack Table:** The existing plain `<Table>` on the dictionaries page has no filter API. Must migrate to `DataTable` + `useReactTable` with `columnFilters` state to use `DataTableToolbar`.
- **Fake CRUD requires edit mode state:** A boolean `isEditing` per sheet open session; toggled by Edit/Cancel button. Save merges edited values into component state (no backend).
- **Remove Data Sources conflicts with Data Sources stat card:** Either repurpose the third stat card (e.g., show active conditions count) or remove it.

---

## MVP Definition

### Launch With (v1.1 — this milestone)

- [ ] Products as table rows with click-to-open side sheet — core UX transformation
- [ ] Side sheet with Tabs: General (meta + conditions) / Target Actions (sub-table) — organizes existing data
- [ ] Text search/filter over product name column — table stakes filter
- [ ] Inline editing in side sheet (General tab) — fake CRUD for product name, description, conditions
- [ ] Save (updates local state) + Cancel (discards) + Sonner toast on save — complete edit flow
- [ ] Selected row highlight while sheet is open — orientation affordance
- [ ] Remove Data Sources section from page — per project scope decision
- [ ] i18n for all new strings — existing pattern, required for consistency

### Add After Validation (v1.x)

- [ ] Add / remove target actions from Tab 2 inside sheet — extends fake CRUD to nested data; defer if tab implementation takes longer than expected
- [ ] Badge column for target action count — visual enhancement; add once table structure is stable

### Future Consideration (v2+)

- [ ] Editable conditions as removable tag chips — nice UX but higher complexity; text input works for MVP
- [ ] Data Sources page (separate route) — explicitly out of scope for v1.1 per PROJECT.md
- [ ] URL state for selected product (`?product=PRD-RADA-CARD`) — makes sheet state shareable; not needed for mock demo

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Products table (replace button list) | HIGH | LOW | P1 |
| Row click opens side sheet | HIGH | LOW | P1 |
| Tabs inside sheet (General / Target Actions) | HIGH | LOW | P1 |
| Text search on product name | HIGH | LOW | P1 |
| Inline edit form in sheet (General tab) | HIGH | MEDIUM | P1 |
| Save/Cancel + toast | HIGH | LOW | P1 |
| Selected row highlight | MEDIUM | LOW | P1 |
| Remove Data Sources section | MEDIUM | LOW | P1 |
| i18n for new strings | MEDIUM | LOW | P1 |
| Badge column (action count) | LOW | LOW | P2 |
| Add/remove target actions (Tab 2 CRUD) | MEDIUM | MEDIUM | P2 |
| Tag-chip editing for conditions | LOW | HIGH | P3 |

---

## Implementation Notes for Roadmap

### Sheet approach: overlay (not split-view)
Use the existing `Sheet` component with `side="right"` and `sm:max-w-[480px]`. This matches `metric-insight-drawer.tsx` exactly and avoids a split-grid layout. The table does not need to shrink — the overlay Sheet has `bg-black/50` overlay which is acceptable for a detail panel.

**Rationale:** The project already has this pattern proven and working. Split-view (table narrows) would require restructuring `PageContainer` layout and managing two flex columns — higher complexity, not required for v1.1 scope.

### TanStack Table migration
The current `<Table>` is a plain HTML table with no filter state. To use `DataTableToolbar` + text search, the page must adopt `useReactTable` with `getCoreRowModel` + `getFilteredRowModel` + `columnFilters` state. The existing `DataTable` wrapper component in `src/components/ui/table/data-table.tsx` is ready to use.

**Migration path:** Define columns array for `ProductDictionaryEntry` → wire `useReactTable` → replace static `<Table>` with `<DataTable>` + `<DataTableToolbar>` children.

### Fake CRUD state management
No backend, no `useReducer` needed. Pattern:
1. `useState<ProductDictionaryEntry[]>` initialized from mock constant
2. `useState<string | null>` for `selectedProductId`
3. `useState<boolean>` for `isEditing`
4. On Save: `setProducts(prev => prev.map(p => p.id === id ? edited : p))`

This is standard React state — no context or Zustand needed for a single-page mock.

### i18n additions required
New keys needed in `messages/en.json` and `messages/uk.json`:
- Sheet header: product details title/description
- Tab labels: "General", "Target Actions"
- Edit/Save/Cancel button labels
- Edit field labels (name, description, active conditions, inactive conditions)
- Toast messages: "Changes saved", "Changes discarded"
- Empty state: "No products found"
- Badge tooltip or aria-label for action count

---

## Sources

- Codebase examination: `src/app/dashboard/cashback/dictionaries/page.tsx` (existing page)
- Codebase examination: `src/features/exec/cashback-impact/components/metric-insight-drawer.tsx` (existing Sheet pattern)
- Codebase examination: `src/components/ui/table/data-table*.tsx` (existing DataTable infrastructure)
- Codebase examination: `src/components/ui/sheet.tsx`, `tabs.tsx` (available UI primitives)
- Codebase examination: `src/features/cashback/data/analytics-dictionaries.mock.ts` (data shape)
- Project context: `.planning/PROJECT.md` (milestone goals, key decisions, out-of-scope)
- Pattern reference: shadcn/ui Sheet + TanStack Table master-detail — standard admin dashboard pattern (HIGH confidence, confirmed by in-repo implementation)

---
*Feature research for: product dictionary management UI (admin dashboard, master-detail + side sheet)*
*Researched: 2026-03-21*
