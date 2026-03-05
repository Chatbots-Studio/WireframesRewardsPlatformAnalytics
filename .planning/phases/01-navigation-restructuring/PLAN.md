# Plan: Phase 1 — Navigation Restructuring

**Phase Goal**: «Топ-менеджмент» у sidebar стає collapsible-групою з двома підпунктами: «Загальний ROI» та «Вплив кешбеків». Нова сторінка /dashboard/exec/cashback-impact рендерить skeleton майбутнього дашборду.

**Requirements**: NAV-01

**Created**: 2026-03-05

---

## Success Criteria (what must be TRUE when done)

1. User sees «Топ-менеджмент» as a collapsible group in sidebar
2. User can expand/collapse and see two items: «Загальний ROI» (/dashboard/exec) and «Вплив кешбеків» (/dashboard/exec/cashback-impact)
3. User can click «Вплив кешбеків» and navigate to the new page

---

## Implementation Decisions (already decided)

- Group expanded by default (`isActive: true`)
- Auto-expand when navigating to sub-item (use `usePathname`)
- Sub-items without icons (text only — matches existing «Звіти» pattern)
- New page: render skeleton of future dashboard — title «Вплив кешбеків» + 6 KPI placeholder cards (Skeleton components) for Phase 2 to fill in

---

## Tasks

### Task 1: Update nav-config.ts

**File**: `src/config/nav-config.ts`

**Type**: edit

**Description**: Add two sub-items to «Топ-менеджмент» entry and set `isActive: true` so the group is expanded by default.

**Changes**:

- Change `isActive: false` to `isActive: true` for the «Топ-менеджмент» entry
- Replace `items: []` with:
  ```typescript
  items: [
    { title: 'Загальний ROI', url: '/dashboard/exec' },
    { title: 'Вплив кешбеків', url: '/dashboard/exec/cashback-impact' }
  ]
  ```

---

### Task 2: Update nav-main.tsx

**File**: `src/components/nav-main.tsx`

**Type**: edit

**Description**: Remove debug logging and add pathname-based auto-expand logic so the «Топ-менеджмент» group expands when the user navigates to either sub-item.

**Changes**:

1. **Remove** the debug logging block (`#region agent log` … `#endregion`) — lines 45–70 (the `fetch` to `http://127.0.0.1:7883` and surrounding code)
2. **Add** import: `import { usePathname } from 'next/navigation'`
3. **Add** inside the component body (before the `return`): `const pathname = usePathname()`
4. **Inside the map callback**, compute:
   ```typescript
   const isOpen = item.isActive || (item.items?.some((sub) => pathname === sub.url) ?? false)
   ```
5. **Change** `defaultOpen={item.isActive}` to `defaultOpen={isOpen}` on the `Collapsible` component

---

### Task 3: Create cashback-impact page

**File**: `src/app/dashboard/exec/cashback-impact/page.tsx`

**Type**: create

**Description**: Create a new server component page that renders a skeleton layout for the future «Вплив кешбеків» dashboard — header plus 6 KPI placeholder cards.

**Changes**:

- Create the file as a **server component** (no `'use client'`)
- Use `PageContainer` from `@/components/layout/page-container`
- **Header section**:
  - Page title: «Вплив кешбеків»
  - Subtitle: «Аналіз ефективності кешбек-програми за категоріями»
- **KPI grid**: `grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6`
- **6 Card components**, each containing:
  - `Skeleton` for title: `~w-24 h-3`
  - `Skeleton` for value: `~w-16 h-7`
  - `Skeleton` for trend: `~w-20 h-3`
- Imports: `Card`, `CardContent` from `@/components/ui/card`, `Skeleton` from `@/components/ui/skeleton`

---

## Verification

After all tasks complete, verify:

1. **Sidebar**: «Топ-менеджмент» appears as a collapsible group (with chevron); it is expanded by default and shows «Загальний ROI» and «Вплив кешбеків»
2. **Navigation**: Click «Вплив кешбеків» → navigates to `/dashboard/exec/cashback-impact`; the group stays expanded when on that route
3. **Page**: `/dashboard/exec/cashback-impact` renders the header («Вплив кешбеків» + subtitle) and 6 KPI skeleton cards in a responsive grid
4. **Cleanup**: No debug `fetch` calls to `127.0.0.1:7883` remain in `nav-main.tsx`
