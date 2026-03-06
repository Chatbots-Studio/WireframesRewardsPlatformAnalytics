# Plan: Phase 4 — Conversion Funnel Block

**Phase Goal**: Конверсійна воронка та теплова карта «Конверсія vs Середній чек» доступні в окремому блоці сторінки.

**Requirements**: CONV-01, CONV-02

**Depends on**: Phase 3 (page has KPI + filters + ROI charts)

**Created**: 2026-03-06

---

## Success Criteria (what must be TRUE when done)

1. Користувач бачить funnel-діаграму зі 4 кроками і % конверсії між ними
2. Користувач може перемикати категорію у funnel (через Select або tabs)
3. Користувач бачить теплову карту де рядки = категорії, колонки = діапазони чеків, колір = % конверсії

---

## Implementation Decisions (already decided in PROJECT.md)

- **Funnel**: Recharts не має built-in funnel → реалізувати через custom BarChart або custom SVG bars (горизонтальні bars різної ширини зліва до права). Простіший варіант: кожен крок = рядок з `w-full` div, ширина пропорційна % від першого кроку.
- **Heatmap**: CSS grid з color interpolation через Tailwind — не Recharts. Комірки colored за допомогою inline style або tailwind opacity варіантів.
- **Funnel switcher**: `useState` для вибраної категорії → Select або simple button group
- **Page**: Already has `'use client'` from Phase 2; add `useState` import if not present

---

## Mock Data Spec

### Funnel data per selected category (CONV-01)

**Default view (aggregate all)** — key `'all'`:

| Step | Label | Value | % of first |
|------|-------|-------|------------|
| 1 | Всього транзакцій | 186 400 | 100% |
| 2 | Побачили офер | 142 300 | 76.3% |
| 3 | Обрали категорію | 98 700 | 52.9% |
| 4 | Активували кешбек | 61 400 | 32.9% |

**Per category** (4 sample categories for switcher):

| Category | Step 1 | Step 2 | Step 3 | Step 4 |
|----------|--------|--------|--------|--------|
| Супермаркети | 42 100 | 38 900 (92.4%) | 31 200 (74.1%) | 26 800 (63.7%) |
| Ресторани | 14 200 | 11 400 (80.3%) | 8 700 (61.3%) | 6 100 (43.0%) |
| АЗС | 9 800 | 7 200 (73.5%) | 5 100 (52.0%) | 3 400 (34.7%) |
| Онлайн | 11 300 | 8 400 (74.3%) | 5 800 (51.3%) | 3 200 (28.3%) |

**Data shape**:
```typescript
interface FunnelStep {
  label: string;
  value: number;
  pct: number;  // % of first step (100, 76.3, 52.9, 32.9)
}

const FUNNEL_DATA: Record<string, FunnelStep[]> = {
  all: [
    { label: 'Всього транзакцій', value: 186400, pct: 100 },
    { label: 'Побачили офер', value: 142300, pct: 76.3 },
    { label: 'Обрали категорію', value: 98700, pct: 52.9 },
    { label: 'Активували кешбек', value: 61400, pct: 32.9 }
  ],
  'Супермаркети': [
    { label: 'Всього транзакцій', value: 42100, pct: 100 },
    { label: 'Побачили офер', value: 38900, pct: 92.4 },
    { label: 'Обрали категорію', value: 31200, pct: 74.1 },
    { label: 'Активували кешбек', value: 26800, pct: 63.7 }
  ],
  'Ресторани': [
    { label: 'Всього транзакцій', value: 14200, pct: 100 },
    { label: 'Побачили офер', value: 11400, pct: 80.3 },
    { label: 'Обрали категорію', value: 8700, pct: 61.3 },
    { label: 'Активували кешбек', value: 6100, pct: 43.0 }
  ],
  'АЗС': [
    { label: 'Всього транзакцій', value: 9800, pct: 100 },
    { label: 'Побачили офер', value: 7200, pct: 73.5 },
    { label: 'Обрали категорію', value: 5100, pct: 52.0 },
    { label: 'Активували кешбек', value: 3400, pct: 34.7 }
  ],
  'Онлайн': [
    { label: 'Всього транзакцій', value: 11300, pct: 100 },
    { label: 'Побачили офер', value: 8400, pct: 74.3 },
    { label: 'Обрали категорію', value: 5800, pct: 51.3 },
    { label: 'Активували кешбек', value: 3200, pct: 28.3 }
  ]
};

const FUNNEL_CATEGORIES = ['all', 'Супермаркети', 'Ресторани', 'АЗС', 'Онлайн'];
```

### Heatmap data (CONV-02)

**Check ranges** (columns): `<200₴`, `200–500₴`, `500–1000₴`, `1000–3000₴`, `>3000₴`

**10 categories × 5 check ranges** (% conversion per cell):

| Категорія | <200₴ | 200–500₴ | 500–1000₴ | 1000–3000₴ | >3000₴ |
|-----------|-------|----------|-----------|------------|--------|
| Супермаркети | 72 | 68 | 61 | 44 | 28 |
| Ресторани | 58 | 52 | 48 | 38 | 22 |
| АЗС | 45 | 42 | 38 | 31 | 18 |
| Аптеки | 61 | 57 | 51 | 40 | 24 |
| Транспорт | 82 | 74 | 63 | 41 | 19 |
| Онлайн-покупки | 34 | 41 | 48 | 52 | 46 |
| Одяг та взуття | 28 | 35 | 44 | 55 | 48 |
| Електроніка | 12 | 18 | 28 | 42 | 58 |
| Подорожі | 8 | 14 | 22 | 38 | 61 |
| Краса та догляд | 51 | 48 | 42 | 31 | 18 |

**Data shape**:
```typescript
const HEATMAP_CHECK_RANGES = ['<200₴', '200–500₴', '500–1000₴', '1000–3000₴', '>3000₴'];

const HEATMAP_DATA: { category: string; values: number[] }[] = [
  { category: 'Супермаркети', values: [72, 68, 61, 44, 28] },
  { category: 'Ресторани', values: [58, 52, 48, 38, 22] },
  { category: 'АЗС', values: [45, 42, 38, 31, 18] },
  { category: 'Аптеки', values: [61, 57, 51, 40, 24] },
  { category: 'Транспорт', values: [82, 74, 63, 41, 19] },
  { category: 'Онлайн-покупки', values: [34, 41, 48, 52, 46] },
  { category: 'Одяг та взуття', values: [28, 35, 44, 55, 48] },
  { category: 'Електроніка', values: [12, 18, 28, 42, 58] },
  { category: 'Подорожі', values: [8, 14, 22, 38, 61] },
  { category: 'Краса та догляд', values: [51, 48, 42, 31, 18] }
];
```

**Key insight for caption**: «Транспорт і Супермаркети показують найвищу конверсію при низькому чеку — найдешевша лояльність»

### Heatmap color helper

```typescript
function getHeatColor(pct: number): string {
  if (pct < 20) return 'bg-red-100 dark:bg-red-950/30';
  if (pct < 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
  if (pct < 60) return 'bg-green-100 dark:bg-green-900/30';
  if (pct < 80) return 'bg-green-200 dark:bg-green-800/40';
  return 'bg-green-300 dark:bg-green-700/50';
}
```

---

## Tasks

### Task 1: Add Conversion Funnel block to cashback-impact page

**File**: `src/app/dashboard/exec/cashback-impact/page.tsx`

**Type**: edit (add new section after ROI charts section from Phase 3)

**Description**: Add «Блок 2: Конверсійна воронка» section with funnel visualization, category switcher, and heatmap «Конверсія vs Середній чек».

**Changes**:

1. **Add `useState` import** (if not already present):
   ```tsx
   import { useState } from 'react';
   ```

2. **Add mock data constants** at top of file (after existing constants):
   - `FUNNEL_DATA` — Record<string, FunnelStep[]> as in Mock Data Spec above
   - `FUNNEL_CATEGORIES` — `['all', 'Супермаркети', 'Ресторани', 'АЗС', 'Онлайн']`
   - `HEATMAP_DATA` — array of `{ category, values }` (10 rows)
   - `HEATMAP_CHECK_RANGES` — `['<200₴', '200–500₴', '500–1000₴', '1000–3000₴', '>3000₴']`

3. **Add `getHeatColor` helper function** (before component or inside file):
   ```tsx
   function getHeatColor(pct: number): string {
     if (pct < 20) return 'bg-red-100 dark:bg-red-950/30';
     if (pct < 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
     if (pct < 60) return 'bg-green-100 dark:bg-green-900/30';
     if (pct < 80) return 'bg-green-200 dark:bg-green-800/40';
     return 'bg-green-300 dark:bg-green-700/50';
   }
   ```

4. **Add `selectedCategory` state** inside component:
   ```tsx
   const [selectedFunnelCategory, setSelectedFunnelCategory] = useState<string>('all');
   ```

5. **Add section «Блок 2: Конверсійна воронка»** after ROI charts block (inside `space-y-6` div):

   **Section header**:
   ```tsx
   <div>
     <h3 className='text-lg font-semibold tracking-tight'>Блок 2: Конверсійна воронка</h3>
     <p className='text-muted-foreground text-sm'>
       Воронка конверсії та теплова карта «Конверсія vs Середній чек»
     </p>
   </div>
   ```

6. **Funnel Card** — CONV-01:
   - Card with `CardHeader` (title: «Конверсійна воронка», description: «4 кроки: транзакції → офер → категорія → активація»)
   - **Category switcher**: Select with `value={selectedFunnelCategory}` and `onValueChange={setSelectedFunnelCategory}`. Options: `FUNNEL_CATEGORIES` — display label «Усі категорії» for `all`, otherwise category name
   - **Funnel visualization**: Get `steps = FUNNEL_DATA[selectedFunnelCategory]` (fallback to `FUNNEL_DATA.all`). For each step:
     ```tsx
     <div key={step.label} className='space-y-1'>
       <div className='flex items-center justify-between text-sm'>
         <span className='font-medium'>{step.label}</span>
         <span className='text-muted-foreground tabular-nums'>
           {step.value.toLocaleString('uk-UA')} {step.pct < 100 ? `(${step.pct}%)` : ''}
         </span>
       </div>
       <div className='h-8 w-full overflow-hidden rounded-md bg-muted'>
         <div
           className='h-full rounded-md bg-primary/80 transition-all'
           style={{ width: `${step.pct}%` }}
         />
       </div>
     </div>
     ```
   - Wrap steps in `space-y-4` div. First step shows value only (no %); steps 2–4 show value + % in parentheses

7. **Heatmap Card** — CONV-02:
   - Card with `CardHeader` (title: «Конверсія vs Середній чек», description: «Рядки = категорії, колонки = діапазони чеків. Колір = % конверсії. Транспорт і Супермаркети показують найвищу конверсію при низькому чеку — найдешевша лояльність.»)
   - **Grid structure**:
     ```tsx
     <div className='overflow-x-auto'>
       <div className='min-w-[500px]'>
         {/* Header row: empty cell + check ranges */}
         <div className='mb-2 grid grid-cols-6 gap-1 text-center text-xs'>
           <div className='font-medium' /> {/* empty corner */}
           {HEATMAP_CHECK_RANGES.map((range) => (
             <div key={range} className='text-muted-foreground font-medium'>
               {range}
             </div>
           ))}
         </div>
         {/* Data rows */}
         {HEATMAP_DATA.map((row) => (
           <div key={row.category} className='mb-1 grid grid-cols-6 gap-1'>
             <div className='flex items-center text-sm font-medium'>{row.category}</div>
             {row.values.map((pct, i) => (
               <div
                 key={i}
                 className={cn(
                   'flex min-h-[36px] items-center justify-center rounded-md text-sm font-medium tabular-nums',
                   getHeatColor(pct)
                 )}
                 title={`${row.category}: ${HEATMAP_CHECK_RANGES[i]} — ${pct}%`}
               >
                 {pct}%
               </div>
             ))}
           </div>
         ))}
       </div>
     </div>
     ```
   - Use `grid-cols-6` (1 label column + 5 value columns). Each cell shows `{pct}%` with `getHeatColor(pct)` for background

8. **Layout**: Place funnel Card and heatmap Card in `space-y-6`. Both inside the same «Блок 2» section.

9. **Select import**: Ensure `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` are imported (from Phase 2). Funnel switcher uses same pattern as category filter.

10. **cn() utility**: Use `cn()` for heatmap cell className merging (import from `@/lib/utils`).

---

## Verification

1. **Visual**: Navigate to `/dashboard/exec/cashback-impact` — «Блок 2: Конверсійна воронка» section renders after ROI charts block
2. **CONV-01 Funnel**: 4 steps visible (Всього транзакцій, Побачили офер, Обрали категорію, Активували кешбек); bar widths proportional to % (100%, 76.3%, 52.9%, 32.9% for default); values displayed correctly
3. **CONV-01 Switcher**: Select allows switching between «Усі категорії», Супермаркети, Ресторани, АЗС, Онлайн; funnel data updates (e.g. Супермаркети shows 100%, 92.4%, 74.1%, 63.7%)
4. **CONV-02 Heatmap**: 10 rows × 5 columns; row labels = category names; column headers = check ranges; cells show % and have color by conversion (red low, yellow mid, green high)
5. **Heatmap caption**: Description mentions «Транспорт і Супермаркети» and «найдешевша лояльність»
6. **Build**: `bun run build` succeeds
7. **Lint**: `bun run lint` passes
