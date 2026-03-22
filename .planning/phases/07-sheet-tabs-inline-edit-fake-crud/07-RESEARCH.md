# Phase 7: Sheet Tabs + Inline Edit + Fake CRUD — Research

**Researched:** 2026-03-22
**Domain:** shadcn Tabs inside Sheet + inline edit form + fake CRUD state extension
**Confidence:** HIGH (grounded in direct codebase inspection of all relevant files + Phase 6 research)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DICT-08 | shadcn Tabs inside Sheet: "Загальне" / "Цільові дії" | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` confirmed installed in `src/components/ui/tabs.tsx` — Radix `@radix-ui/react-tabs` backing |
| DICT-10 | Tab "Цільові дії" — read-only table of `targetActions` for selected product | `ProductTargetAction[]` type confirmed in mock; plain shadcn `Table` (not DataTable) is correct here — 2-5 rows per product |
| DICT-11 | Scroll position of panel resets when switching tabs | Requires `useRef` on SheetContent scroll container + `scrollTo({ top: 0 })` on `onValueChange` — Pitfall 7 from PITFALLS.md |
| DICT-12 | "Edit" button in General tab switches to edit mode | Local `editing: boolean` state inside `GeneralTab` component; `useEffect` resets on `product.id` change |
| DICT-13 | Editable fields: name, description, active/inactive conditions (textarea) | `Input` for name, `Textarea` for description and conditions — both confirmed installed in `src/components/ui/` |
| DICT-14 | Save / Cancel buttons in SheetFooter; Save updates `useDictionariesState` | `SheetFooter` confirmed with `mt-auto flex flex-col gap-2 p-4` layout; `updateProduct` handler already planned in hook |
| DICT-15 | Toast (Sonner) after Save with "demo mode" disclaimer | `toast` from `sonner` already used in project (`communications/page.tsx`); `Toaster` already in root `layout.tsx` |
| DICT-16 | Mock data initialized via `structuredClone()` in `useState` | Phase 6 hook already seeds with `structuredClone(PRODUCT_DICTIONARY)` — this req is satisfied when Phase 6 hook is used |
| DICT-21 | All new UI strings have i18n keys in `en.json` and `uk.json` | `dictionaries` namespace exists with ~25 keys; new keys needed: tabs labels, edit/save/cancel buttons, toast messages, field labels |
</phase_requirements>

---

## Summary

Phase 7 adds two features on top of Phase 6's `ProductSideSheet`: (1) Tabs with "Загальне" and "Цільові дії", and (2) inline edit form in the General tab with Save/Cancel and Sonner toast feedback.

Every library needed is already installed. The shadcn `Tabs` component (`src/components/ui/tabs.tsx`) is backed by `@radix-ui/react-tabs` and uses a simple `value`/`onValueChange` API. The Sonner `toast` function is already used in `src/app/dashboard/communications/page.tsx` and the `<Toaster>` is mounted in the root layout — zero setup needed. The edit form requires only `Input` and `Textarea` (both installed), plus local `useState` inside `GeneralTab`. No form library is needed for 3-4 fields.

The critical Phase 7-specific decisions: the General tab must own a `formState` copy in local state (not in `useDictionariesState`), reset it via `useEffect` on `product.id` change, and lift the save result up via `onSave(updatedProduct)`. The `SheetFooter` Save/Cancel buttons must only be visible in edit mode; DICT-14 specifies they live in the footer, not inline in the form. The scroll reset on tab switch (DICT-11) requires a `ref` on the scrollable container with an explicit `scrollTo` call — this is non-obvious and must be in the task instructions.

**Primary recommendation:** Modify `ProductSideSheet` to add Tabs, create `GeneralTab` and `TargetActionsTab` as child components, extend `useDictionariesState` with `updateProduct` handler, then wire Save to `toast`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@radix-ui/react-tabs` | installed via shadcn | Tab switching state, keyboard navigation, ARIA roles | Already installed; `src/components/ui/tabs.tsx` wraps it |
| `sonner` | `^2.0.7` | Toast notification after Save | Already used in project; `Toaster` already mounted in root layout |
| shadcn `Input` | installed | Edit field for product name | Confirmed at `src/components/ui/input.tsx` |
| shadcn `Textarea` | installed | Edit field for description and conditions | Confirmed at `src/components/ui/textarea.tsx` |
| `next-intl` | `^4.8.3` | All UI strings (tabs labels, button labels, toast text) | Already used throughout; `dictionaries` namespace already in messages |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn `Button` | installed | Edit / Save / Cancel buttons | Already used on the page; `variant="outline"` for Cancel, default for Save |
| shadcn `Table` | installed | Target actions read-only sub-table in Tab 2 | Plain `<Table>` (not DataTable) — 2-5 rows, no filter/sort needed |
| `lucide-react` | `^0.575.0` | Pencil icon for "Edit" button (optional) | Only if icon-labeled button is desired; text-only is fine |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Local `useState` in `GeneralTab` for form | `react-hook-form` | RHF adds validation, dirty tracking; overkill for 3-4 fields without backend validation |
| `toast` from `sonner` directly | Custom inline save-state indicator | Toast is already proven in the project; no extra UI state needed |
| Resetting scroll via `ref.scrollTo` | CSS `scroll-behavior: smooth; scroll-margin` | `scrollTo` is explicit and reliable; CSS approach may not work on SheetContent's custom scroll container |

**Installation:** No installation required — all dependencies already in `package.json`.

---

## Architecture Patterns

### Recommended Project Structure (Phase 7 additions)

```
src/
├── features/
│   └── cashback/
│       └── dictionaries/
│           ├── components/
│           │   ├── products-table.tsx              # Phase 6 — no change
│           │   ├── product-side-sheet.tsx          # MODIFY: add Tabs + pass edit handlers
│           │   ├── general-tab.tsx                 # NEW: view/edit toggle for product fields
│           │   └── target-actions-tab.tsx          # NEW: read-only target actions table
│           ├── hooks/
│           │   └── use-dictionaries-state.ts       # MODIFY: add editMode, updateProduct
│           └── columns/
│               └── products-columns.tsx            # Phase 6 — no change
└── messages/
    ├── en.json                                     # MODIFY: add ~10 new dictionaries keys
    └── uk.json                                     # MODIFY: matching keys in Ukrainian
```

### Pattern 1: useDictionariesState Extended with updateProduct

**What:** Add `updateProduct` handler (and optionally `editMode` flag) to the Phase 6 hook. Keep `editMode` local in `GeneralTab` — only the products array update needs to live in the hook.
**When to use:** Any time local component edit state needs to persist back to the shared source of truth.

```typescript
// Source: .planning/research/ARCHITECTURE.md Pattern 2
// MODIFY: src/features/cashback/dictionaries/hooks/use-dictionaries-state.ts
export function useDictionariesState() {
  const [products, setProducts] = useState<ProductDictionaryEntry[]>(
    () => structuredClone(PRODUCT_DICTIONARY)  // DICT-16 — already in Phase 6 hook
  );
  // ... all Phase 6 state (selectedId, sheetOpen, selectProduct, selectedProduct, totalTargetActions)

  // NEW for Phase 7:
  const updateProduct = useCallback((updated: ProductDictionaryEntry) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }, []);

  return {
    // ...Phase 6 returns
    updateProduct,  // NEW
  };
}
```

### Pattern 2: ProductSideSheet with Tabs + Scroll Reset

**What:** Replace flat SheetContent body with `Tabs`. Track active tab with local state. Reset scroll on tab change via `ref` on the scrollable div inside `SheetContent`.
**When to use:** Any Sheet with multiple content sections that may have varying heights.

```typescript
// Source: PITFALLS.md Pitfall 7 + tabs.tsx source inspection
// MODIFY: src/features/cashback/dictionaries/components/product-side-sheet.tsx
'use client';
import { useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GeneralTab } from './general-tab';
import { TargetActionsTab } from './target-actions-tab';
import type { ProductDictionaryEntry } from '@/features/cashback/data/analytics-dictionaries.mock';

interface ProductSideSheetProps {
  product: ProductDictionaryEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: ProductDictionaryEntry) => void;
}

export function ProductSideSheet({ product, open, onOpenChange, onSave }: ProductSideSheetProps) {
  const [activeTab, setActiveTab] = useState('general');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (value: string) => {
    scrollContainerRef.current?.scrollTo({ top: 0 });  // DICT-11
    setActiveTab(value);
  };

  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle>{product.name}</SheetTitle>
        </SheetHeader>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 w-fit">
            <TabsTrigger value="general">{t('tabGeneral')}</TabsTrigger>
            <TabsTrigger value="targetActions">{t('tabTargetActions')}</TabsTrigger>
          </TabsList>
          {/* Scrollable area — ref here for DICT-11 scroll reset */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-3">
            <TabsContent value="general">
              <GeneralTab product={product} onSave={onSave} />
            </TabsContent>
            <TabsContent value="targetActions">
              <TargetActionsTab targetActions={product.targetActions} />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
```

Key detail: `SheetContent` default CSS is `flex flex-col gap-4` — override with `gap-0 p-0 overflow-hidden` so the scroll div fills exactly the available height. The scrollable `<div ref={scrollContainerRef}>` sits inside the Sheet, not using `SheetContent`'s own `overflow-y-auto` class.

### Pattern 3: GeneralTab — View/Edit Toggle with Local Form State

**What:** `GeneralTab` maintains its own `form` copy and `editing` boolean. Save fires `onSave(form)` to parent, Cancel restores from prop. `useEffect` on `product.id` resets both states when a different product is selected.
**When to use:** Single-record inline edit with explicit Save/Cancel — no backend, no validation library needed.

```typescript
// Source: .planning/research/ARCHITECTURE.md Pattern 3
// NEW: src/features/cashback/dictionaries/components/general-tab.tsx
'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ProductDictionaryEntry } from '@/features/cashback/data/analytics-dictionaries.mock';

interface GeneralTabProps {
  product: ProductDictionaryEntry;
  onSave: (updated: ProductDictionaryEntry) => void;
}

export function GeneralTab({ product, onSave }: GeneralTabProps) {
  const t = useTranslations('dictionaries');
  const [form, setForm] = useState(product);
  const [editing, setEditing] = useState(false);

  // Reset when a different product is selected (DICT-12)
  useEffect(() => {
    setForm(product);
    setEditing(false);
  }, [product.id]);  // product.id, NOT product (object ref changes on every render)

  const handleSave = () => {
    onSave(form);
    setEditing(false);
    toast.success(t('saveSuccess'), {
      description: t('demoModeNotice'),  // DICT-15 — "demo mode — changes not persisted"
    });
  };

  const handleCancel = () => {
    setForm(product);  // discard local changes (DICT-12)
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">{t('fieldName')}</label>
          <Input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('fieldDescription')}</label>
          <Textarea
            value={form.productSourceDescription}
            onChange={(e) => setForm((prev) => ({ ...prev, productSourceDescription: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('activityConditions')}</label>
          <Textarea
            value={form.activeConditions.join('\n')}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                activeConditions: e.target.value.split('\n').filter(Boolean),
              }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('inactivityConditions')}</label>
          <Textarea
            value={form.inactiveConditions.join('\n')}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                inactiveConditions: e.target.value.split('\n').filter(Boolean),
              }))
            }
          />
        </div>
        {/* Save/Cancel in SheetFooter — see Pattern 4 */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Read-only display — same fields, displayed as text */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          {t('editButton')}  {/* DICT-12 */}
        </Button>
      </div>
      {/* ... read-only field display */}
    </div>
  );
}
```

Important: `activeConditions` is `string[]` in the type. Editing as newline-joined textarea is the simplest approach (DICT-13 says "textarea") — split on save, join for display.

### Pattern 4: Save/Cancel in SheetFooter

**What:** DICT-14 says buttons are in "SheetFooter". `SheetFooter` has `mt-auto` which pushes it to the bottom of the flex column. Buttons must only render in edit mode — in read mode, footer is empty (or hidden).
**When to use:** Any time Save/Cancel must be persistently visible at the bottom of a scrollable sheet.

```typescript
// Source: src/components/ui/sheet.tsx — SheetFooter is `mt-auto flex flex-col gap-2 p-4`
// Inside ProductSideSheet, after the Tabs block:
{activeTab === 'general' && editing && (
  <SheetFooter className="border-t px-4 py-3">
    <Button variant="outline" onClick={handleCancel}>{t('cancelButton')}</Button>
    <Button onClick={handleSave}>{t('saveButton')}</Button>
  </SheetFooter>
)}
```

The challenge: `editing` state lives inside `GeneralTab`, but `SheetFooter` needs to be outside the Tabs scroll area. Two options:
1. **Lift `editing` state up to `ProductSideSheet`** — cleaner, recommended. Pass `editing`, `setEditing`, `form`, `setForm` down to `GeneralTab` as props, or split into render-prop pattern.
2. **Keep footer inside `GeneralTab`** — but then it scrolls with content (fails "sticky footer" expectation).

**Recommendation:** Lift `editing` and `form` state to `ProductSideSheet`. `GeneralTab` becomes a controlled component receiving `form`, `setForm`, `editing` as props. This makes the footer sticky and independent of tab scroll.

```typescript
// ProductSideSheet owns:
const [editing, setEditing] = useState(false);
const [form, setForm] = useState<ProductDictionaryEntry>(product);

// Reset on product change:
useEffect(() => {
  setForm(product);
  setEditing(false);
}, [product.id]);

const handleSave = () => {
  onSave(form);
  setEditing(false);
  toast.success(t('saveSuccess'), { description: t('demoModeNotice') });
};

const handleCancel = () => {
  setForm(product);
  setEditing(false);
};
```

### Pattern 5: TargetActionsTab — Read-only Table

**What:** Plain shadcn `Table` rendering `ProductTargetAction[]`. No TanStack, no filters, no sorting. Columns: name, definition, identificationMethod.
**When to use:** 2-5 rows, read-only, inside a constrained-width Sheet — full DataTable machinery is overkill.

```typescript
// Source: .planning/research/FEATURES.md Anti-Features section
// NEW: src/features/cashback/dictionaries/components/target-actions-tab.tsx
'use client';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import type { ProductTargetAction } from '@/features/cashback/data/analytics-dictionaries.mock';

interface TargetActionsTabProps {
  targetActions: ProductTargetAction[];
}

export function TargetActionsTab({ targetActions }: TargetActionsTabProps) {
  const t = useTranslations('dictionaries');
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('tableName')}</TableHead>       {/* existing key */}
          <TableHead>{t('tableDefinition')}</TableHead>  {/* existing key */}
          <TableHead>{t('tableIdentification')}</TableHead>  {/* existing key */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {targetActions.map((action) => (
          <TableRow key={action.id}>
            <TableCell className="font-medium">{action.name}</TableCell>
            <TableCell className="text-muted-foreground">{action.definition}</TableCell>
            <TableCell className="text-muted-foreground">{action.identificationMethod}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Anti-Patterns to Avoid

- **Keeping `editing` state in `GeneralTab` when Save/Cancel must be in `SheetFooter`:** This forces the footer inside the scroll area or requires an event emitter pattern. Lift `editing` to `ProductSideSheet` from the start.
- **Watching `product` (object) in `useEffect` dependency array:** Object reference changes every render if `selectedProduct` is recomputed via `useMemo`. Watch `product.id` (primitive string) instead.
- **Using `TabsContent` `forceMount` prop to prevent remount:** The default lazy mount is fine here. The form resets via `useEffect` anyway. `forceMount` would keep DOM nodes alive but doesn't prevent state reset.
- **Hardcoding "demo mode" toast text in English:** Use `t('demoModeNotice')` — both locales must have this key.
- **Rendering Save/Cancel buttons in `TabsContent` of General tab:** They render inside the scroll area and scroll away, leaving no way to save without scrolling back up. Footer must be outside the scroll container.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab switching UI | Custom toggle buttons with `className` switching | shadcn `Tabs` + `TabsList` + `TabsTrigger` | ARIA roles, keyboard navigation (Arrow keys), `data-[state=active]` styling — all built in |
| Toast notification | Custom `<div>` overlay with animation | `toast.success()` from `sonner` | Already installed, already wired to root `Toaster`, handles stacking/dismissal |
| Conditions textarea ↔ array conversion | Custom serializer | `split('\n')` / `join('\n')` inline | `string[]` → textarea is a one-liner; the requirement is textarea, not a chip editor |
| Scroll reset on tab change | CSS `scroll-behavior` hacks | `ref.scrollTo({ top: 0 })` | Direct DOM call is the only reliable approach for a non-window scroll container |

**Key insight:** Phase 7 is pure composition of already-installed primitives. No new npm packages, no complex custom components.

---

## Common Pitfalls

### Pitfall 1: Editing state in wrong component causes no-sticky-footer

**What goes wrong:** Developer puts `editing` boolean and form state inside `GeneralTab`. The `<SheetFooter>` with Save/Cancel buttons must then also live inside `GeneralTab`, which is inside the scrollable `TabsContent`. On long product descriptions, the footer scrolls away — user cannot save without scrolling back down.

**Why it happens:** The natural instinct is "the form owns its own state." True for isolated forms, but wrong when footer must be outside the scroll container.

**How to avoid:** Lift `editing` and `form` state to `ProductSideSheet`. Footer renders conditionally outside the scroll div, at the bottom of the sheet flex column.

**Warning signs:** Save/Cancel buttons disappear when scrolling the General tab content.

---

### Pitfall 2: `useEffect` dependency on `product` object instead of `product.id`

**What goes wrong:** `useEffect(() => { setForm(product); setEditing(false); }, [product])` — `product` is `selectedProduct` from `useMemo` in the hook. `useMemo` returns a new object reference when `products` array updates (e.g., after Save). This makes `useEffect` fire after every save, immediately resetting the form — a form-save infinite loop.

**Why it happens:** `product` looks like a stable prop but is actually a derived value that changes reference on every `setProducts` call.

**How to avoid:** Use `product.id` as the dependency: `[product.id]`. This fires only when a different product is selected, not when the same product's data updates.

**Warning signs:** After clicking Save, form immediately resets to pre-save values; toast fires but form re-renders to old data.

---

### Pitfall 3: SheetContent scroll container conflict with Tabs

**What goes wrong:** `SheetContent` has `overflow-y-auto` on the content element by default (via MetricInsightDrawer pattern: `className="w-full overflow-y-auto sm:max-w-[560px]"`). If `Tabs` is placed inside this overflow container and the tab content also has scroll, there are two stacked scroll containers. The inner scroll never activates because the outer scroll catches all scroll events first.

**Why it happens:** Phase 6 set up the Sheet with `overflow-y-auto` at the `SheetContent` level for the flat read-only view. Phase 7 adds Tabs with a potentially long `TargetActionsTab` table — the scroll container needs to be just the tab content area, not the whole sheet.

**How to avoid:** Override `SheetContent` to `overflow-hidden` (remove `overflow-y-auto`). Add a controlled scroll container (`ref={scrollContainerRef}`, `overflow-y-auto`) that wraps only the `TabsContent` bodies. This gives independent scroll per tab and enables the scroll reset.

```typescript
// SheetContent:  className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]"
// Scroll div:    className="flex-1 overflow-y-auto px-4 py-3" ref={scrollContainerRef}
```

**Warning signs:** Tab content never scrolls despite long content; or entire sheet scrolls when you intend only the tab content to scroll.

---

### Pitfall 4: i18n keys missing for Phase 7 UI

**What goes wrong:** New UI strings needed that don't exist in either locale. Missing keys render as the raw key string in Ukrainian mode.

**Why it happens:** Phase 6 may have added `searchByName` etc. but the tab-specific keys are new to Phase 7.

**How to avoid:** Add all new keys to both `messages/en.json` and `messages/uk.json` as the first task of Phase 7 (before implementing components). Keys needed that do NOT already exist in the `dictionaries` namespace:

| Key | English | Ukrainian |
|-----|---------|-----------|
| `tabGeneral` | "General" | "Загальне" |
| `tabTargetActions` | "Target Actions" | "Цільові дії" |
| `editButton` | "Edit" | "Редагувати" |
| `saveButton` | "Save" | "Зберегти" |
| `cancelButton` | "Cancel" | "Скасувати" |
| `saveSuccess` | "Changes saved" | "Зміни збережено" |
| `demoModeNotice` | "Demo mode — changes are not persisted" | "Демо-режим — зміни не зберігаються" |
| `fieldName` | "Name" | "Назва" |
| `fieldDescription` | "Description" | "Опис" |

Keys that already exist and can be reused: `activityConditions`, `inactivityConditions`, `tableName`, `tableDefinition`, `tableIdentification`, `source`, `notSet`.

**Warning signs:** Ukrainian locale shows `"tabGeneral"` or `"saveSuccess"` as literal text.

---

### Pitfall 5: Tab scroll position not reset because ref attached to wrong element

**What goes wrong:** Developer attaches `scrollContainerRef` to the outer `<SheetContent>` or `<Tabs>` component instead of the actual scrollable div. `scrollContainerRef.current?.scrollTo({ top: 0 })` silently does nothing because those elements don't scroll — only the inner div with `overflow-y-auto` does.

**Why it happens:** The scroll container is not visually obvious; multiple nested divs inside SheetContent.

**How to avoid:** Verify the ref target is the element with `overflow-y-auto` on it. Quick test: add a `console.log(scrollContainerRef.current?.scrollHeight)` on tab change — if it reads 0 or equals `clientHeight`, the ref is on the wrong element.

**Warning signs:** Switching tabs doesn't reset scroll position despite the `scrollTo` call being present.

---

## Code Examples

Verified patterns from official sources and in-project inspection:

### Sonner toast with description (DICT-15)

```typescript
// Source: src/app/dashboard/communications/page.tsx — confirmed usage pattern
// sonner ^2.0.7 — toast.success with title + description
import { toast } from 'sonner';

toast.success(t('saveSuccess'), {
  description: t('demoModeNotice'),
});
// Renders: primary text "Changes saved" + subtitle "Demo mode — changes are not persisted"
```

### shadcn Tabs — confirmed API from source

```typescript
// Source: src/components/ui/tabs.tsx — Radix TabsPrimitive.Root wrapping
// Controlled usage:
<Tabs value={activeTab} onValueChange={handleTabChange}>
  <TabsList>
    <TabsTrigger value="general">Загальне</TabsTrigger>
    <TabsTrigger value="targetActions">Цільові дії</TabsTrigger>
  </TabsList>
  <TabsContent value="general">...</TabsContent>
  <TabsContent value="targetActions">...</TabsContent>
</Tabs>
// Default: uncontrolled with defaultValue="general"
// Controlled: value + onValueChange (needed for scroll reset side effect)
```

### SheetFooter layout

```typescript
// Source: src/components/ui/sheet.tsx lines 67-74
// SheetFooter = <div className="mt-auto flex flex-col gap-2 p-4">
// mt-auto pushes footer to bottom of flex-col parent
// For horizontal button layout, override:
<SheetFooter className="mt-auto flex-row justify-end gap-2 border-t px-4 py-3">
  <Button variant="outline" onClick={handleCancel}>{t('cancelButton')}</Button>
  <Button onClick={handleSave}>{t('saveButton')}</Button>
</SheetFooter>
```

### conditions array ↔ Textarea (DICT-13)

```typescript
// Editing array as newline-separated textarea:
<Textarea
  value={form.activeConditions.join('\n')}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      activeConditions: e.target.value.split('\n').filter(Boolean),
    }))
  }
  rows={4}
/>
// On save: form.activeConditions is already string[] — no extra transform needed
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat read-only SheetContent (Phase 6) | Tabbed SheetContent with Tabs | Phase 7 | Separates product meta from target actions; less scrolling |
| No editing in Sheet | Inline edit toggle (Edit/Save/Cancel) | Phase 7 | PM can update product data in demo |
| No save feedback | Sonner toast with demo mode notice | Phase 7 | Prevents stakeholder confusion about data persistence |

**Not changing in Phase 7:**
- `products-columns.tsx` — no change needed
- `products-table.tsx` — no change needed
- `useDictionariesState` mock data seeding — already `structuredClone` from Phase 6 (DICT-16 satisfied)
- Sheet width `sm:max-w-[560px]` — no change

---

## Open Questions

1. **Where exactly do Save/Cancel buttons live — inside `GeneralTab` or in `SheetFooter` outside the scroll area?**
   - What we know: DICT-14 says "Кнопки Save / Cancel у footer Sheet" — explicitly in the footer
   - What's unclear: Whether that means they scroll with content or are sticky at the bottom
   - Recommendation: Sticky at the bottom — lift `editing` state to `ProductSideSheet`, render `SheetFooter` outside the scroll div. This matches DICT-14 literally and is better UX.

2. **Should the `editing` flag reset when the Sheet closes and reopens?**
   - What we know: The `useEffect` on `product.id` resets on product change; Sheet close does not change `product.id`
   - What's unclear: If user opens product A, clicks Edit, then closes without saving, reopens product A — should edit mode persist?
   - Recommendation: Reset on close — add `useEffect` on `open` prop: when `open` goes `false → true`, reset `editing = false` and `form = product`. Safer for demo.

3. **`activeConditions` editing — textarea newlines vs separate inputs?**
   - What we know: DICT-13 says "textarea" explicitly; `string[]` is the data type
   - What's unclear: Whether the planner should add guidance about empty-line filtering
   - Recommendation: Textarea with newline join/split (shown in Code Examples). Filter empty lines on split with `.filter(Boolean)`. Simple, sufficient, matches DICT-13 spec.

---

## Sources

### Primary (HIGH confidence)

- `src/components/ui/tabs.tsx` — confirmed `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` API; Radix backing
- `src/components/ui/sheet.tsx` — confirmed `SheetFooter` has `mt-auto flex flex-col gap-2 p-4`; confirmed SheetContent flex column structure
- `src/components/ui/textarea.tsx` — confirmed component exists
- `src/components/ui/input.tsx` — confirmed component exists
- `src/app/dashboard/communications/page.tsx` — confirmed `toast.success(t(...), { description: t(...) })` usage pattern
- `src/app/layout.tsx` line 74 — confirmed `<Toaster>` mounted in root layout
- `messages/en.json` + `messages/uk.json` — confirmed existing `dictionaries` keys; identified missing Phase 7 keys
- `src/features/cashback/data/analytics-dictionaries.mock.ts` — confirmed `ProductDictionaryEntry` with `activeConditions: string[]`, `inactiveConditions: string[]`
- `.planning/phases/06-products-datatable-side-sheet/06-RESEARCH.md` — Phase 6 hook and sheet patterns (confirmed)
- `.planning/research/ARCHITECTURE.md` — Pattern 3 (GeneralTab inline edit), Pattern 2 (hook state)
- `.planning/research/PITFALLS.md` — Pitfall 7 (tabs scroll reset), Pitfall 6 (save feedback), Pitfall 5 (i18n)

### Secondary (MEDIUM confidence)

- `.planning/research/FEATURES.md` — TargetActionsTab plain Table recommendation (confirmed by data size: 2-5 rows per product)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages inspected directly; no new installs needed
- Architecture: HIGH — all patterns derived from direct source inspection + prior research; no speculation
- Pitfalls: HIGH — all grounded in source code structure (SheetContent layout, useEffect dependency, scroll containers)

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable libraries; patterns won't change in 30 days)
