# Research Summary — v1.1 Dictionaries Redesign

**Synthesized:** 2026-03-22
**Sources:** STACK.md, FEATURES.md, PITFALLS.md, ARCHITECTURE.md

---

## Key Findings

### 1. Zero new dependencies
Every component needed is already installed: `Sheet`, `Tabs`, `DataTable` + `DataTableToolbar`, `Form`, `Input`, `Textarea`, `Select`, `Badge`, `Button`, `Sonner` toasts. No `npm install` required.

### 2. Sheet overlay is the correct pattern
The shadcn `Sheet` component is a portal overlay (backdrop dims table). This matches the existing `MetricInsightDrawer` pattern and the PROJECT.md decision "side sheet замiсть модалок". Use `Sheet` with `side="right"` and `className="sm:max-w-[560px]"`.

### 3. Do NOT reuse `useDataTable` hook
The existing `useDataTable` hook forces `manualPagination/Sorting/Filtering: true` (server-side). For mock data, use `useReactTable` directly with client-side row models, or filter in the state hook and pass pre-filtered data.

### 4. State belongs in a dedicated hook
Extract all state to `useDictionariesState()` — products array, selectedId, sheetOpen, search, filter, CRUD handlers. Page becomes a thin composition shell. This prevents re-render storms and keeps concerns separated.

### 5. Mock data must be copied on mount
`PRODUCT_DICTIONARY` is an exported `const`. Fake CRUD must `structuredClone()` into `useState` at mount. Never mutate the import directly.

### 6. i18n requires key parity
Every new string needs keys in both `messages/en.json` and `messages/uk.json`. Missing UK keys silently show key names. Write keys before implementing UI.

### 7. Feature scope (P1 for v1.1)
- Products as DataTable rows (replace button list)
- Row click opens Sheet side panel
- Tabs: General / Target Actions
- Text search over product name
- Inline edit in General tab (fake CRUD)
- Save/Cancel + toast
- Remove Data Sources section
- Selected row highlight
- Keep 2 stat cards (Products, Target Actions), remove Data Sources card

### 8. Deferred (P2/P3)
- Add/remove target actions from Tab 2
- Badge column for action count
- Tag-chip editing for conditions
- URL state for selected product

---

## Architecture Decision

```
page.tsx (thin shell)
  ├── useDictionariesState() — all state + CRUD
  ├── ProductsTable — DataTable + toolbar
  ├── ProductSideSheet — Sheet overlay
  │   ├── GeneralTab — view/edit form
  │   └── TargetActionsTab — read-only sub-table
  └── Stat cards (Products count, Target Actions count)
```

Feature files go in `src/features/cashback/dictionaries/` following existing convention.

---

## Critical Pitfalls to Address

| Pitfall | Phase | Mitigation |
|---------|-------|------------|
| Mock data mutation | Phase 6 | `structuredClone()` on mount |
| `useDataTable` is server-only | Phase 6 | Use `useReactTable` directly |
| i18n key parity | All phases | Write both locale keys before UI |
| Table columns overflow at 1280px | Phase 6 | `truncate` + `max-w` on text cells |
| Tabs scroll position | Phase 7 | Reset scroll on tab change |
| Save feedback for demos | Phase 7 | Toast with "demo mode" disclaimer |

---

## Phase Structure Recommendation

- **Phase 6:** Products DataTable + Search/Filter + Sheet (read-only General tab)
- **Phase 7:** Sheet Tabs + Inline Edit + Fake CRUD + Toast + i18n + Cleanup

Two phases — each independently shippable. Phase 6 delivers the table UX transformation. Phase 7 adds interactivity.
