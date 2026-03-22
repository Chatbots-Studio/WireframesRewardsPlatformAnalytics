# Pitfalls Research

**Domain:** Next.js dashboard — table + side sheet + inline editing + fake CRUD
**Researched:** 2026-03-21
**Confidence:** HIGH (grounded in actual codebase inspection + domain expertise)

---

## Critical Pitfalls

### Pitfall 1: Using shadcn/ui `<Sheet>` as-is — it behaves like a modal, not a side panel

**What goes wrong:**
The existing `src/components/ui/sheet.tsx` renders via `SheetPortal` + `SheetOverlay` — a `fixed inset-0 z-50 bg-black/50` overlay that blocks the table behind it. This IS a modal. Using it raw violates the "no modals" constraint and forces users to close the panel to interact with the table again.

**Why it happens:**
shadcn/ui's `Sheet` is built on Radix `Dialog`. The overlay and portal are included by default. Developers assume "Sheet = side panel" without reading that it still blocks the background.

**How to avoid:**
Build an **inline side panel** — not a Sheet. Use a flex layout: `<div className="flex gap-0">` with the table in a container that narrows (`flex-1 min-w-0`) and the detail panel as a fixed-width sibling (`w-[380px] shrink-0`). Animate with CSS transitions on `width` or `opacity`. No portal, no overlay, no z-50 blocking. If shadcn Sheet is still desired for mobile, strip the `SheetOverlay` and use `SheetContent` without portal on desktop breakpoints — or just build a custom panel.

**Warning signs:**
- You see `SheetPortal` in the component tree
- The table is no longer clickable/scrollable when the panel is open
- ESC key closes the panel (Radix Dialog behavior)
- Background content dims when panel opens

**Phase to address:**
Phase that introduces the table + side panel layout. Must be decided before writing a single line of panel code.

---

### Pitfall 2: Fake CRUD state lives in the page component — causes full re-renders and lost selection

**What goes wrong:**
Putting `useState<ProductDictionaryEntry[]>` directly in the page component means every edit, filter keystroke, or panel open/close triggers a full page re-render. With the existing pattern (`'use client'` on the entire page), this also means the selected row loses its highlight on any state update because the component re-evaluates `selectedProductId` comparisons on every render. In practice: user edits a field, the list re-renders, and if the update logic has any edge case the selected item appears to "flash" or deselect.

**Why it happens:**
`useState` at the top level is the path of least resistance for fake CRUD. Developers underestimate how many state slices interact: `products`, `selectedId`, `editingField`, `filterQuery`, `activeTab` — all in one component.

**How to avoid:**
Split state by concern from the start:
- `useProductsStore` (or a custom hook `useProductsCrud`) — owns the products array and edit/delete operations
- `useTableSelection` — owns `selectedId`
- `useTableFilter` — owns search query
Panel and table read from the same store; changes in one don't cascade into the other. Even for pure fake CRUD, a dedicated hook is worth it.

**Warning signs:**
- Page component has 5+ `useState` declarations
- Editing a field causes the table row highlight to flicker
- Opening/closing the panel resets the search filter

**Phase to address:**
Phase that implements fake CRUD editing. Define the state shape and hook before building any form inputs.

---

### Pitfall 3: Table narrows incorrectly when side panel opens — layout breaks on mid-range widths

**What goes wrong:**
The table has many columns (id, name, definition, identificationMethod, dataSource in the existing code). When the side panel appears and the table container narrows, columns overflow or compress to illegible widths. On 1280px wide screens (common laptop), a 380px panel leaves only ~860px for the table — not enough for 5 columns without wrapping.

**Why it happens:**
Column widths are not set. shadcn Table's `<TableCell>` has no explicit `w-*` or `min-w-*`. Browser distributes space evenly, so narrow containers cause compressed columns.

**How to avoid:**
- Decide which columns to show when panel is open vs closed. Common pattern: hide secondary columns (`definition`, `identificationMethod`) when panel is open via a conditional class `hidden` toggled by panel state.
- Set `min-w-[Xpx]` on critical columns so the table gets a horizontal scrollbar before columns become unreadable.
- Use `truncate` on text cells with `max-w-[200px]` so long content doesn't break layout.

**Warning signs:**
- Table looks fine at 1920px but broken at 1280px when panel is open
- Text in cells wraps to 3 lines

**Phase to address:**
Same phase as table layout build. Column visibility strategy must be decided at design time, not retrofitted.

---

### Pitfall 4: PageContainer's `ScrollArea` conflicts with a sticky/fixed side panel

**What goes wrong:**
`PageContainer` with `scrollable=true` wraps content in `<ScrollArea className='h-[calc(100dvh-52px)]'>`. If the side panel is positioned inside this scroll area (as a flex sibling of the table), scrolling the table also scrolls the panel content — or worse, the panel content is clipped by the scroll area's overflow. If the panel needs its own independent scroll (long target actions list), nesting `ScrollArea` inside `ScrollArea` can produce no-scroll or double-scroll bugs.

**Why it happens:**
The `ScrollArea` from Radix uses `overflow: hidden` on the viewport. Inner scroll areas need explicit heights. Developers forget the panel content needs `h-full overflow-y-auto` (or its own `ScrollArea` with a fixed height).

**How to avoid:**
Use `scrollable={false}` on the PageContainer for the dictionaries page when the side panel is active. Manage scroll at the flex-row level: give the table container `overflow-y-auto h-[calc(100dvh-Xpx)]` and the panel `overflow-y-auto h-[calc(100dvh-Xpx)]` as independent scrolling columns. Test by populating a product with 10+ target actions to verify panel scrolls independently.

**Warning signs:**
- Panel content is cut off at the bottom
- Scrolling table jumps the panel's scroll position
- ScrollArea has no visible scrollbar in the panel

**Phase to address:**
Phase that introduces the split layout. Test with a product that has many target actions immediately.

---

### Pitfall 5: i18n keys missing for all new UI strings — TypeScript doesn't catch it until runtime

**What goes wrong:**
The project uses `next-intl` with `useTranslations('dictionaries')`. Adding new UI elements (search placeholder, "no results" state, tab labels "Загальне / Цільові дії", edit/save/cancel buttons, delete confirmation text, filter chip labels) requires new i18n keys in both `messages/en.json` and `messages/uk.json`. Missing keys silently render as the key string (e.g., `"editButton"` shows literally) or throw in strict mode.

**Why it happens:**
Developers write the component first, hardcode strings, then forget to extract them. Or they add keys to `en.json` but forget `uk.json`. The existing page has ~20 translation keys — a full redesign will add another 20-30.

**How to avoid:**
Before implementing any phase, write ALL translation keys for that phase into both JSON files first. Use placeholder values like `"Search products..."` and `"Пошук продуктів..."`. Then reference them in code. Never hardcode display strings in components.

**Warning signs:**
- Any literal English string in JSX that isn't wrapped in `t()`
- `uk.json` and `en.json` have different key counts
- The locale switcher shows key names instead of translated text in UK mode

**Phase to address:**
Every phase. Establish the habit in Phase 1; enforce by running a key-count diff between the two locale files.

---

### Pitfall 6: Inline editing "Save" resets to mock data on page refresh — confuses stakeholders

**What goes wrong:**
Fake CRUD with `useState` does not persist. A stakeholder demonstrates the feature, edits a product name, then refreshes — the change is gone. If this is not explicitly communicated, it creates "is this a bug?" confusion in demos.

**Why it happens:**
This is inherent to the mock approach, but the failure is not communicating it in the UI. Users expect saves to persist if there's a "Save" button with no disclaimer.

**How to avoid:**
One of:
1. Show a persistent toast: "Changes saved (demo only — resets on refresh)" with a distinct color like amber.
2. Add a small inline disclaimer in the panel footer: `text-muted-foreground text-xs` saying "Demo mode — changes are not persisted."
3. Use `sessionStorage` to persist mock edits within the tab session (not full persistence, but survives soft navigation).

Option 1 is cheapest. Option 3 is best for stakeholder demos.

**Warning signs:**
- There is a "Save" button with no visual indication of mock behavior
- A PM asks "why did my changes disappear?"

**Phase to address:**
Phase that adds inline editing. Decide the strategy before building Save/Cancel buttons.

---

### Pitfall 7: Tabs inside the side panel accumulate scroll position — tab switch jumps viewport

**What goes wrong:**
When using shadcn `<Tabs>` inside the panel with "Загальне" and "Цільові дії" tabs, if the user scrolls down on "Загальне" and then switches to "Цільові дії", the scroll position is retained (or jumps unpredictably). On "Цільові дії" where the target actions table can be long, the panel appears to start mid-page.

**Why it happens:**
`TabsContent` by default renders all tabs in the DOM (not lazy). Scroll position is on the panel container, not per-tab. Switching tabs doesn't reset scroll.

**How to avoid:**
Reset the panel container's scroll position to 0 on tab change via a `ref`:
```tsx
const panelRef = useRef<HTMLDivElement>(null);
const handleTabChange = (value: string) => {
  panelRef.current?.scrollTo({ top: 0 });
  setActiveTab(value);
};
```
Attach `ref={panelRef}` to the panel's scroll container.

**Warning signs:**
- Switching tabs mid-scroll lands at a non-zero scroll position
- Panel appears "broken" on tab switch for short content tabs

**Phase to address:**
Phase that adds tabs to the side panel.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| All state in page component | Fast to prototype | Re-render storms, hard to test, messy when feature count grows | Never — extract to a hook from day one even for mocks |
| Hardcoded column widths in px | Looks right on one screen | Breaks on different viewports when panel opens | Never for a responsive layout |
| Skip `aria-label` on icon-only buttons (edit/delete) | Faster to write | Screen reader inaccessible; fails audit | Only in early prototype, must be added before any stakeholder review |
| Single mock file for all CRUD data | Simple structure | Edit/delete logic mixed with data definitions | Acceptable for mock CRUD; split if logic grows beyond 50 lines |
| Tailwind inline styles (`style={{ width: X }}`) for panel width | Quick control | Not responsive, can't use Tailwind breakpoints | Never — use Tailwind `w-[380px]` class instead |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| shadcn `Sheet` | Used for inline side panel — has modal overlay by default | Build a custom inline panel with flex layout; Sheet is for drawers over content, not beside it |
| `next-intl` | Add new keys to `en.json` but forget `uk.json`, or use `t()` with dynamic key strings that TS can't check | Keep key lists in sync; prefer static key strings; run key count diff after each feature |
| `PageContainer` ScrollArea | Place the side panel inside the scroll area — panel gets clipped | Use `scrollable={false}` and manage scroll at flex-row level with two independent scroll containers |
| shadcn `Tabs` in panel | Let scroll position persist across tab switches | Reset panel scroll on `onValueChange` handler |
| shadcn `Input` inside `TableCell` | Input renders but `onChange` mutates immutable mock constant | Always copy mock constants into `useState` array at component mount; never mutate imported constants |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Filtering products with every keystroke, re-rendering entire table | Noticeable lag on each character typed in search | `useMemo` for filtered list, `useDebounce` (300ms) on search input | At ~50+ products with complex filter logic |
| Rendering all tab content at once in side panel | Slow initial open; unnecessary DOM nodes | Lazy render: only mount active tab content; or `hidden` class instead of conditional render to avoid re-mount flash | Immediately visible on low-end hardware |
| Importing full mock data file into client component without memoization | Recomputes `dataSourceById` lookup map on every render | The existing `useMemo` for `dataSourceById` is correct — keep it; do same for filtered/sorted list | At 20+ products |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Side panel opens on first render (pre-selected row) with no visual affordance that a row is selected | User doesn't understand table is interactive | Start with no selection; show empty-state panel with "Select a product to view details" |
| Edit mode activates entire panel at once — user accidentally edits | All fields become inputs, user changes something unintentionally | Field-level edit: pencil icon per field, or "Edit" button that toggles only that section |
| Delete action has no confirmation — single click deletes | Accidental deletion in demo confuses stakeholders | Use a `DropdownMenu` with a destructive item that requires a second confirmation click, or an `AlertDialog` (acceptable since it's triggered by user intent, not modal-on-load) |
| Search/filter with no "clear" button | User can't reset filter without manually deleting text | Always include a clear (X) icon inside the search input that appears when value is non-empty |
| Panel animation is jarring — instantaneous open/close | Feels broken | Use CSS `transition-all duration-200` on the panel width; or `animate-in slide-in-from-right` utility |
| Table row has no hover state indicating it's clickable | Users don't know rows are interactive | Add `cursor-pointer hover:bg-muted/50` to `TableRow` |

---

## "Looks Done But Isn't" Checklist

- [ ] **Side panel:** Verify it does NOT use `SheetPortal` or `SheetOverlay` — confirm table is still interactive when panel is open
- [ ] **Fake CRUD:** Verify imported constants are COPIED into `useState` at mount, not mutated directly — `PRODUCT_DICTIONARY` is imported as `const`
- [ ] **i18n:** Run `cat messages/en.json | jq 'keys | length'` vs `cat messages/uk.json | jq 'keys | length'` — counts should match
- [ ] **Scroll isolation:** Open a product with many target actions, scroll panel to bottom, switch tab — verify scroll resets
- [ ] **Table narrowing:** Open panel at 1280px viewport width — verify no column text overflow or table horizontal scroll at unexpected points
- [ ] **Filter + selection:** Filter table to 1 result, select it, clear filter — verify selection persists and panel stays open
- [ ] **Delete from list:** Delete selected product — verify panel closes or switches to next product, not left showing deleted item
- [ ] **Empty state:** Filter to 0 results — verify "no results" message appears, not an empty table body
- [ ] **Save feedback:** Click Save in edit mode — verify some form of user feedback (toast or inline) that confirms the action
- [ ] **Keyboard:** Tab through panel form fields — verify logical order; Escape does not close panel (it would if Sheet is used)

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Sheet-as-modal discovered after panel is built | MEDIUM | Replace SheetPortal+Overlay with a custom `<div>` flex sibling; most internal panel JSX can be reused |
| State in page component grows unmanageable | MEDIUM | Extract to a custom hook; no component API changes required |
| i18n keys missing in UK locale | LOW | Add missing keys to `uk.json`; verify with locale switcher |
| PageContainer scroll conflict | LOW | Switch to `scrollable={false}` and add scroll containers to flex children |
| Mock data mutated directly | LOW | Add spread copy on init: `useState([...PRODUCT_DICTIONARY])` |
| Tabs scroll position issue | LOW | Add `panelRef.current?.scrollTo(0, 0)` on tab change handler |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Sheet-as-modal vs inline panel | Phase 1: Layout structure | Interact with table while panel is open; confirm no overlay |
| State shape — all in page | Phase 1: Layout + state foundation | Count `useState` in page file; should be ≤ 2 (selectedId, open state) |
| Table column narrowing | Phase 1: Table layout | Open panel at 1280px; check no overflow |
| PageContainer scroll conflict | Phase 1: Layout structure | Scroll panel independently from table |
| i18n key parity | Every phase | Key count diff between en.json and uk.json |
| Fake CRUD mutation of constants | Phase 2: Fake CRUD implementation | Edit a product name; verify `PRODUCT_DICTIONARY` import is unchanged |
| Save feedback for demo mode | Phase 2: Fake CRUD implementation | Show disclaimer or toast; verify stakeholder understanding |
| Tabs scroll reset | Phase 3: Tabs in panel | Switch tabs after scrolling; confirm position reset |
| Delete without confirmation | Phase 2: Fake CRUD | Delete action requires two interactions |
| Missing empty state | Phase 1 or 2 | Filter to 0 results; non-empty fallback renders |

---

## Sources

- Codebase inspection: `src/components/ui/sheet.tsx` — confirmed SheetPortal + SheetOverlay (modal pattern)
- Codebase inspection: `src/components/layout/page-container.tsx` — confirmed ScrollArea wrapper, `h-[calc(100dvh-52px)]`
- Codebase inspection: `src/app/dashboard/cashback/dictionaries/page.tsx` — identified existing state pattern, column structure, data shape
- Codebase inspection: `src/features/cashback/data/analytics-dictionaries.mock.ts` — identified data as exported `const` (mutation risk)
- Domain expertise: Next.js `'use client'` re-render behavior with multiple `useState`
- Domain expertise: Radix UI Dialog/Sheet portal and overlay behavior
- Domain expertise: next-intl key resolution behavior (silent fallback vs hard error)
- Confidence note: WebSearch unavailable; all findings based on direct codebase inspection and HIGH-confidence domain knowledge

---

*Pitfalls research for: Next.js dashboard — dictionaries page redesign with table + side sheet + inline editing + fake CRUD*
*Researched: 2026-03-21*
