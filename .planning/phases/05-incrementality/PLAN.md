# Plan: Phase 5 — Incrementality Block

**Phase Goal**: Інкрементальність та аналіз канібалізації доступні в окремому блоці сторінки.

**Requirements**: INC-01, INC-02, INC-03

**Depends on**: Phase 4 (page has KPI + filters + ROI charts + Conversion funnel)

**Created**: 2026-03-06

---

## Success Criteria (what must be TRUE when done)

1. Користувач бачить before/after chart: оборот і транзакції за 3 місяці до vs 3 місяці після запуску оферу по категоріях
2. Користувач бачить cohort line chart: activated vs control group за 6 місяців (середній оборот на клієнта)
3. Користувач бачить cannibalization chart: сумарні витрати клієнта між категоріями до і після активації кешбеку

---

## Implementation Decisions

- **INC-01**: Grouped BarChart with `layout='vertical'` (horizontal bars — category on Y-axis). Two charts in one Card: (1) оборот до/після, (2) транзакції до/після. Bars side-by-side per category, not stacked. Short category labels on Y-axis.
- **INC-02**: Standard LineChart, two lines: activated (primary color, solid) vs control (neutral, dashed). No ReferenceLine at y=0; focus on divergence. Metric = середній оборот на клієнта (₴/міс).
- **INC-03**: Stacked BarChart — `stackId='a'` for cashbackCats and otherCats. Shows composition and total growth. Key takeaway in CardFooter: «Сумарні витрати зросли — не лише перерозподіл між категоріями».
- **Section header**: «Блок 3: Інкрементальність»

---

## Mock Data Spec

### INC-01: Before/After chart (top 8 categories × before/after)

```typescript
const BEFORE_AFTER_DATA = [
  { category: 'Супермаркети', before: 890, after: 2100, txBefore: 9200, txAfter: 18400 },
  { category: 'Ресторани', before: 620, after: 1840, txBefore: 6800, txAfter: 14200 },
  { category: 'АЗС', before: 510, after: 980, txBefore: 5100, txAfter: 9800 },
  { category: 'Онлайн', before: 780, after: 1420, txBefore: 6200, txAfter: 11300 },
  { category: 'Аптеки', before: 380, after: 620, txBefore: 3800, txAfter: 7200 },
  { category: 'Одяг', before: 560, after: 890, txBefore: 3900, txAfter: 6400 },
  { category: 'Транспорт', before: 220, after: 440, txBefore: 11200, txAfter: 22100 },
  { category: 'Краса', before: 180, after: 340, txBefore: 2600, txAfter: 4800 }
];
// Note: use short category labels for chart readability (already short in data)
```

### INC-02: Cohort line chart (6 months)

```typescript
const COHORT_DATA = [
  { month: 'Вер', activated: 148, control: 96 },
  { month: 'Жов', activated: 162, control: 95 },
  { month: 'Лис', activated: 181, control: 95 },
  { month: 'Гру', activated: 196, control: 94 },
  { month: 'Січ', activated: 214, control: 94 },
  { month: 'Лют', activated: 229, control: 93 }
];
// Metric: avg turnover per client (₴/month). Delta by Feb: +146% vs control group
```

### INC-03: Cannibalization chart

```typescript
const CANNIBALIZATION_DATA = [
  { month: 'Вер', cashbackCats: 892, otherCats: 640, total: 1532 },
  { month: 'Жов', cashbackCats: 1080, otherCats: 618, total: 1698 },
  { month: 'Лис', cashbackCats: 1280, otherCats: 601, total: 1881 },
  { month: 'Гру', cashbackCats: 1440, otherCats: 590, total: 2030 },
  { month: 'Січ', cashbackCats: 1680, otherCats: 578, total: 2258 },
  { month: 'Лют', cashbackCats: 1890, otherCats: 562, total: 2452 }
];
// Key insight: total grew → not just redistribution
// cashbackCats growing + otherCats slightly declining = partial cannibalization but net positive
```

---

## Tooltip Patterns

Custom tooltips following project pattern (`ab-tests/page.tsx`, `exec/page.tsx`):

```tsx
function BeforeAfterTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className='bg-card text-card-foreground min-w-[180px] space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      <p>До: <strong>{row?.before?.toLocaleString('uk-UA')} тис. ₴</strong></p>
      <p>Після: <strong>{row?.after?.toLocaleString('uk-UA')} тис. ₴</strong></p>
      <p className='text-muted-foreground pt-1'>Транзакції: {row?.txBefore?.toLocaleString('uk-UA')} → {row?.txAfter?.toLocaleString('uk-UA')}</p>
    </div>
  );
}

function CohortTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className='bg-card text-card-foreground min-w-[180px] space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.stroke }}>
          {p.name}: <strong>{p.value} ₴</strong>
        </p>
      ))}
    </div>
  );
}

function CannibalizationTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className='bg-card text-card-foreground min-w-[180px] space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      <p>Кешбек-категорії: <strong>{row?.cashbackCats?.toLocaleString('uk-UA')} ₴</strong></p>
      <p>Інші категорії: <strong>{row?.otherCats?.toLocaleString('uk-UA')} ₴</strong></p>
      <p className='pt-1 font-medium'>Всього: {row?.total?.toLocaleString('uk-UA')} ₴</p>
    </div>
  );
}
```

---

## Tasks

### Task 1: Add Incrementality block to cashback-impact page

**File**: `src/app/dashboard/exec/cashback-impact/page.tsx`

**Type**: edit (add new final section after Phase 4 blocks)

**Description**: Add «Блок 3: Інкрементальність» section with three charts: before/after grouped bar, cohort line, cannibalization stacked bar.

**Recharts components needed**:
```tsx
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine
} from 'recharts';
import { chartPalette } from '@/lib/chart-theme';
```

**Changes**:

1. **Add `'use client'`** at top of file if not already present (required for Recharts and client interactivity).

2. **Add imports**:
   - `CardFooter` to existing Card imports
   - Recharts: `BarChart`, `Bar`, `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `Legend`
   - `chartPalette` from `@/lib/chart-theme`

3. **Add mock data constants** at top of file (after KPI_LABELS or existing constants):
   - `BEFORE_AFTER_DATA` — 8 rows as in Mock Data Spec
   - `COHORT_DATA` — 6 months as in Mock Data Spec
   - `CANNIBALIZATION_DATA` — 6 months as in Mock Data Spec

4. **Add three tooltip components** (before the main component):
   - `BeforeAfterTooltip` — shows category, before/after turnover, tx before→after
   - `CohortTooltip` — shows month, activated/control values with stroke color
   - `CannibalizationTooltip` — shows month, cashbackCats, otherCats, total

5. **Add section «Блок 3: Інкрементальність»** as the final section inside the main `space-y-6` div (after KPI cards, filters, ROI block, Conversion funnel block):

   **Section header**:
   ```tsx
   <div>
     <h3 className='text-lg font-semibold tracking-tight'>Блок 3: Інкрементальність</h3>
     <p className='text-muted-foreground text-sm'>
       Before/after, cohort activated vs control, аналіз канібалізації
     </p>
   </div>
   ```

6. **INC-01 Card — Before/After**:
   - Card with `CardHeader` (title: «Оборот і транзакції: до vs після запуску оферу», description: «3 місяці до vs 3 місяці після по топ-8 категоріях»)
   - **Chart 1 — Оборот**: `BarChart` with `layout='vertical'`, `data={BEFORE_AFTER_DATA}`, `YAxis dataKey='category'`, `XAxis`. Two `<Bar>`: `dataKey='before'` name «До», `dataKey='after'` name «Після». Use `chartPalette.neutral` for before, `chartPalette.primary` for after. `barCategoryGap='25%'`, `barGap={4}`. `Tooltip content={<BeforeAfterTooltip />}`. `ResponsiveContainer height={280}`.
   - **Chart 2 — Транзакції**: Same structure, `dataKey='txBefore'` and `dataKey='txAfter'`. Same colors. `tickFormatter` on XAxis for compact numbers (e.g. `(v) => v >= 1000 ? `${v/1000}k` : v`).
   - Place both charts in `space-y-6` inside CardContent.

7. **INC-02 Card — Cohort**:
   - Card with `CardHeader` (title: «Cohort: активовані vs контрольна група», description: «Середній оборот на клієнта (₴/міс) за 6 місяців»)
   - `LineChart` with `data={COHORT_DATA}`. `XAxis dataKey='month'`. Two `<Line>`: `dataKey='activated'` name «Активовані кешбек», `stroke={chartPalette.primary}`, solid; `dataKey='control'` name «Контрольна група», `stroke={chartPalette.neutral}`, `strokeDasharray='5 5'`. `Tooltip content={<CohortTooltip />}`. `Legend`. `ResponsiveContainer height={260}`.
   - `CardFooter`: «Лютий: +146% активовані vs контрольна група»

8. **INC-03 Card — Cannibalization**:
   - Card with `CardHeader` (title: «Канібалізація: кешбек-категорії vs інші», description: «Сумарні витрати клієнта до і після активації кешбеку»)
   - `BarChart` with `data={CANNIBALIZATION_DATA}`. Stacked bars: `<Bar dataKey='cashbackCats' name='Кешбек-категорії' stackId='a' fill={chartPalette.primary} />`, `<Bar dataKey='otherCats' name='Інші категорії' stackId='a' fill={chartPalette.neutral} />`. `XAxis dataKey='month'`. `Tooltip content={<CannibalizationTooltip />}`. `Legend`. `ResponsiveContainer height={260}`.
   - `CardFooter`: «Сумарні витрати зросли — не лише перерозподіл між категоріями. Кешбек-категорії +112%, інші −12% за період.»

9. **Layout**: Place all three Cards in `space-y-6` within the «Блок 3» section.

10. **CartesianGrid**: Use consistent styling on all charts:
    ```tsx
    <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' xAxisId={0} yAxisId={0} />
    ```

11. **Axis styling**: `tick={{ fontSize: 12 }}` on XAxis and YAxis for consistency with exec/page.tsx and ab-tests/page.tsx.

---

## Verification

1. **Visual**: Navigate to `/dashboard/exec/cashback-impact` — «Блок 3: Інкрементальність» section renders as final block
2. **INC-01**: Two grouped bar charts visible — оборот (before/after) and транзакції (txBefore/txAfter); 8 categories on Y-axis; bars side-by-side; tooltip shows all four values
3. **INC-02**: Line chart with two lines — activated (solid primary) and control (dashed neutral); 6 months on X-axis; values ~93–229 (activated) and ~93–96 (control); tooltip shows both
4. **INC-03**: Stacked bar chart — cashbackCats (primary) and otherCats (neutral) stacked; 6 months; total grows from 1532 to 2452; CardFooter shows key takeaway
5. **Build**: `bun run build` succeeds
6. **Lint**: `bun run lint` passes
