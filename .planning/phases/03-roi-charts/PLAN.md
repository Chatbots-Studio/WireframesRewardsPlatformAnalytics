# Plan: Phase 3 — ROI Charts

**Phase Goal**: ROI-аналіз по категоріях доступний через три візуалізації: горизонтальний bar chart, scatter plot, line chart динаміки.

**Requirements**: ROI-01, ROI-02, ROI-03

**Depends on**: Phase 2 (page exists with KPI cards + filters + CONV-03 block)

**Created**: 2026-03-06

---

## Success Criteria (what must be TRUE when done)

1. Користувач бачить горизонтальний bar chart категорій відсортованих за ROI з кольоровими фон-зонами (червона <50x, жовта 50–200x, зелена >200x)
2. Користувач бачить scatter plot де кожна категорія = бульбашка, розмір = кількість транзакцій; аномальні мають tooltip з поясненням
3. Користувач бачить line chart ROI динаміки для топ-5 категорій за 6 місяців

---

## Implementation Decisions

- **ROI x-values (ROI-01 bar chart)**: Horizontal bars via `layout='vertical'` on BarChart — YAxis shows category names, XAxis shows ROI values
- **Background color zones (ROI-01)**: Use `<ReferenceArea>` from Recharts with `x1`/`x2` for value ranges; red zone 0–50, yellow 50–200, green 200–max. Bar fill via `<Cell>` based on ROI value
- **Bar color mapping**: ROI < 50x → `chartPalette.danger` (red zone); ROI 50–200x → `chartPalette.warning` (yellow zone); ROI > 200x → `chartPalette.primary` (green zone)
- **Scatter anomaly detection**: Hardcode `isAnomaly: true` flag in data; tooltip shows special message for anomalies (Подорожі, Будматеріали, Медицина)
- **Line chart colors**: Use `chartPalette.primary`, `chartPalette.chart2`, `chartPalette.chart3`, `chartPalette.chart4`, `chartPalette.chart5` for 5 lines
- **Section title**: «Блок 1: ROI по категоріях»

---

## Mock Data Spec

### ROI bar chart + scatter data (17 categories, sorted by ROI descending)

```typescript
const ROI_CATEGORIES = [
  { name: 'Супермаркети', roi: 340, turnover: 2100, cashback: 62, transactions: 18400, isAnomaly: false },
  { name: 'Ресторани', roi: 280, turnover: 1840, cashback: 66, transactions: 14200, isAnomaly: false },
  { name: 'АЗС', roi: 245, turnover: 980, cashback: 40, transactions: 9800, isAnomaly: false },
  { name: 'Аптеки', roi: 210, turnover: 620, cashback: 30, transactions: 7200, isAnomaly: false },
  { name: 'Транспорт', roi: 185, turnover: 440, cashback: 24, transactions: 22100, isAnomaly: false },
  { name: 'Онлайн-покупки', roi: 162, turnover: 1420, cashback: 88, transactions: 11300, isAnomaly: false },
  { name: 'Одяг та взуття', roi: 130, turnover: 890, cashback: 68, transactions: 6400, isAnomaly: false },
  { name: 'Краса та догляд', roi: 98, turnover: 340, cashback: 35, transactions: 4800, isAnomaly: false },
  { name: 'Спорт та фітнес', roi: 87, turnover: 280, cashback: 32, transactions: 3200, isAnomaly: false },
  { name: 'Електроніка', roi: 74, turnover: 1680, cashback: 227, transactions: 2100, isAnomaly: false },
  { name: 'Розваги', roi: 62, turnover: 190, cashback: 31, transactions: 4100, isAnomaly: false },
  { name: 'Дитячі товари', roi: 55, turnover: 420, cashback: 76, transactions: 3800, isAnomaly: false },
  { name: 'Подорожі', roi: 48, turnover: 2800, cashback: 583, transactions: 1200, isAnomaly: true },   // великий оборот + великий кешбек, малий ROI
  { name: 'Книги та освіта', roi: 41, turnover: 120, cashback: 29, transactions: 2200, isAnomaly: false },
  { name: 'Зоотовари', roi: 38, turnover: 180, cashback: 47, transactions: 2900, isAnomaly: false },
  { name: 'Будматеріали', roi: 22, turnover: 560, cashback: 255, transactions: 890, isAnomaly: true },  // середній оборот, непропорційно великий кешбек
  { name: 'Медицина', roi: 15, turnover: 240, cashback: 160, transactions: 1400, isAnomaly: true }      // малий ROI відносно кешбеку
];
```

### Scatter plot data shape

- X axis: `turnover` (оборот, тис. ₴)
- Y axis: `cashback` (кешбек, тис. ₴)
- Z axis (bubble size): `transactions` — use `range={[40, 400]}` on ZAxis

### Line chart data (top-5 categories, 6 months: Вер–Лют)

```typescript
const ROI_DYNAMICS_MONTHS = ['Вер', 'Жов', 'Лис', 'Гру', 'Січ', 'Лют'];

const ROI_DYNAMICS = [
  { month: 'Вер', Супермаркети: 290, Ресторани: 240, АЗС: 210, 'Онлайн-покупки': 135, Аптеки: 185 },
  { month: 'Жов', Супермаркети: 305, Ресторани: 252, АЗС: 218, 'Онлайн-покупки': 142, Аптеки: 190 },
  { month: 'Лис', Супермаркети: 318, Ресторани: 261, АЗС: 226, 'Онлайн-покупки': 149, Аптеки: 196 },
  { month: 'Гру', Супермаркети: 326, Ресторани: 270, АЗС: 233, 'Онлайн-покупки': 154, Аптеки: 201 },
  { month: 'Січ', Супермаркети: 334, Ресторани: 276, АЗС: 240, 'Онлайн-покупки': 158, Аптеки: 207 },
  { month: 'Лют', Супермаркети: 340, Ресторани: 280, АЗС: 245, 'Онлайн-покупки': 162, Аптеки: 210 }
];
```

---

## Tasks

### Task 1: Add ROI charts section to the cashback-impact page

**File**: `src/app/dashboard/exec/cashback-impact/page.tsx`

**Type**: edit (add new section after CONV-03 block from Phase 2)

**Description**: Add «Блок 1: ROI по категоріях» section with three charts: horizontal bar chart (ROI-01), scatter plot (ROI-02), multi-line chart top-5 (ROI-03).

**Recharts components needed**:
- `BarChart`, `Bar`, `Cell`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `ReferenceArea`
- `ScatterChart`, `Scatter`, `ZAxis`
- `LineChart`, `Line`, `Legend`

**Changes**:

1. **Add Recharts imports** (if not already present):
   ```tsx
   import {
     BarChart, Bar, ScatterChart, Scatter, LineChart, Line,
     XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
     Legend, Cell, ZAxis, ReferenceArea
   } from 'recharts';
   import { chartPalette, chartGradientId } from '@/lib/chart-theme';
   ```

2. **Add mock data constants** at top of file (after existing constants):
   - `ROI_CATEGORIES` — 17 items as in Mock Data Spec above (sorted by ROI descending)
   - `ROI_DYNAMICS` — 6 rows for months Вер–Лют with 5 category columns
   - `ROI_DYNAMICS_MONTHS` — `['Вер', 'Жов', 'Лис', 'Гру', 'Січ', 'Лют']`

3. **Add tooltip components** (before main component):
   - `ROIBarTooltip({ active, payload, label })` — shows category name + ROI value (e.g. «340x»). Use pattern: `bg-card text-card-foreground min-w-[200px] rounded-lg border px-3 py-2 text-xs shadow-md`
   - `ROIScatterTooltip({ active, payload })` — shows category, оборот, кешбек, транзакції. If `payload?.[0]?.payload?.isAnomaly`, add line: «⚠️ Аномалія: [пояснення]» — Подорожі: «Великий оборот і кешбек при низькому ROI»; Будматеріали: «Непропорційно великий кешбек відносно обороту»; Медицина: «Малий ROI при високому кешбеку»
   - `ROILineTooltip({ active, payload, label })` — shows month + all 5 category ROI values

4. **Add section «Блок 1: ROI по категоріях»** after CONV-03 block (inside `space-y-6` div):
   ```tsx
   <div>
     <h3 className='text-lg font-semibold tracking-tight'>Блок 1: ROI по категоріях</h3>
     <p className='text-muted-foreground text-sm'>ROI-аналіз за категоріями: bar chart, scatter оборот/кешбек, динаміка топ-5</p>
   </div>
   ```

5. **Chart 1 — Horizontal bar chart (ROI-01)**:
   - Card with `CardHeader` (title: «ROI по категоріях», description: «Відсортовано за ROI від найвищого до найнижчого. Зони: червона &lt;50x, жовта 50–200x, зелена &gt;200x»)
   - `BarChart` with `data={ROI_CATEGORIES}`, `layout='vertical'`, `margin={{ top: 8, right: 16, left: 8, bottom: 8 }}`
   - `XAxis type='number'` (ROI values), `YAxis dataKey='name' type='category' width={120}` (category names)
   - `ReferenceArea` x1={0} x2={50} fill={chartPalette.danger} fillOpacity={0.15} (red zone)
   - `ReferenceArea` x1={50} x2={200} fill={chartPalette.warning} fillOpacity={0.15} (yellow zone)
   - `ReferenceArea` x1={200} x2={400} fill={chartPalette.primary} fillOpacity={0.1} (green zone)
   - `Bar dataKey='roi'` with `Bar` + `{ROI_CATEGORIES.map((entry, i) => <Cell key={i} fill={entry.roi < 50 ? chartPalette.danger : entry.roi <= 200 ? chartPalette.warning : chartPalette.primary} />)}`
   - `Tooltip content={<ROIBarTooltip />}`
   - XAxis tickFormatter: `(v) => \`${v}x\``
   - `ResponsiveContainer width='100%' height={380}` (tall enough for 17 bars)

6. **Chart 2 — Scatter plot (ROI-02)**:
   - Card with title «Оборот vs Кешбек», description «Кожна категорія = бульбашка. Розмір = кількість транзакцій. Аномальні категорії підсвічені в tooltip»
   - `ScatterChart` with `data={ROI_CATEGORIES}`, `margin={{ top: 16, right: 16, left: 16, bottom: 16 }}`
   - `XAxis dataKey='turnover'` name='Оборот (тис. ₴)'
   - `YAxis dataKey='cashback'` name='Кешбек (тис. ₴)'
   - `ZAxis dataKey='transactions' type='number' range={[40, 400]} name='Транзакцій'`
   - `Scatter data={ROI_CATEGORIES}` — use `fill` from chartPalette.primary; for anomalies optionally use `chartPalette.warning` via `Cell` if needed
   - `Tooltip content={<ROIScatterTooltip />}`
   - `ResponsiveContainer width='100%' height={300}`

7. **Chart 3 — Line chart (ROI-03)**:
   - Card with title «Динаміка ROI топ-5 категорій», description «Останні 6 місяців (Вер–Лют)»
   - `LineChart` with `data={ROI_DYNAMICS}`, `margin={{ top: 8, right: 16, left: 8, bottom: 8 }}`
   - `XAxis dataKey='month'`
   - `YAxis` with tickFormatter `(v) => \`${v}x\``
   - 5× `Line` components: dataKey='Супермаркети', 'Ресторани', 'АЗС', 'Онлайн-покупки', 'Аптеки'; stroke from `[chartPalette.primary, chartPalette.chart2, chartPalette.chart3, chartPalette.chart4, chartPalette.chart5]`
   - `Tooltip content={<ROILineTooltip />}`
   - `Legend`
   - `ResponsiveContainer width='100%' height={300}`

8. **Layout**: Place all 3 charts in a `space-y-6` div. Each chart in its own `Card` following the Card section pattern from existing code.

---

## Verification

1. **Visual**: Navigate to `/dashboard/exec/cashback-impact` — «Блок 1: ROI по категоріях» section renders below CONV-03 block (or below KPI row if Phase 2 not yet executed)
2. **ROI-01**: Horizontal bar chart shows 17 categories sorted by ROI (Супермаркети top, Медицина bottom); background zones visible (red 0–50, yellow 50–200, green 200+); bars colored by zone (red/yellow/green)
3. **ROI-02**: Scatter plot shows bubbles; X = turnover, Y = cashback; bubble size varies by transactions; hovering Подорожі/Будматеріали/Медицина shows anomaly message in tooltip
4. **ROI-03**: Line chart shows 5 lines (Супермаркети, Ресторани, АЗС, Онлайн-покупки, Аптеки) over 6 months; values match mock data
5. **Build**: `bun run build` succeeds
6. **Lint**: `bun run lint` passes
