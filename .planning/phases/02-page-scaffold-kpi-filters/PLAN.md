# Plan: Phase 2 — Page Scaffold + KPI + Filters

**Phase Goal**: Сторінка `/dashboard/exec/cashback-impact` отримує реальний контент: 6 KPI-карток, фільтри (категорія + період) та блок категорій з нульовою конверсією.

**Requirements**: KPI-01, KPI-02, KPI-03, KPI-04, KPI-05, KPI-06, UX-01, UX-02, UX-03, CONV-03

**Depends on**: Phase 1 (done — page exists as skeleton at `src/app/dashboard/exec/cashback-impact/page.tsx`)

**Created**: 2026-03-05

---

## Success Criteria (what must be TRUE when done)

1. Користувач бачить 6 KPI-карток у рядку з реалістичними числами
2. Користувач може фільтрувати по категорії (Select) та по периоду (6m / 3m / YTD) у header
3. Користувач бачить усі 6 метрик (~17 категорій у даних)
4. Користувач бачить блок категорій з нульовою конверсією з поясненням можливих причин

---

## Implementation Decisions (already decided)

- Page becomes `'use client'` (needed for Select component state)
- Mock data as top-level constants in the page file (same as exec/page.tsx)
- Filters are visual-only in Phase 2 (no data filtering logic — that's for Phase 3+)
- KPI cards in `grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6`
- CONV-03 block: Card with a table/list of low-conversion categories
- Zero-conversion categories highlighted with muted alert styling (Tailwind only — no external color library)
- KPI card pattern: inline in page (no separate component), use `CardTitle` with `text-muted-foreground text-xs font-medium tracking-wide uppercase` for label
- Trend line format: `+3.1pp vs попередній місяць` (or similar for each KPI)

---

## Mock Data Spec

### KPI aggregate values (overall across ~17 categories)

| KPI | Value | Trend (MoM) |
|-----|-------|-------------|
| KPI-01 Конверсія активації | 61.4% | +3.1pp |
| KPI-02 Час до 1-ї транзакції | 2.3 дн | −0.2 дн |
| KPI-03 Reactivation Rate | 18.7% | +1.2pp |
| KPI-04 Транзакційність | 4.2 vs 2.1 | (with vs without) |
| KPI-05 Зміна середнього чека | +23.4% | +2.1pp |
| KPI-06 Credit Utilization | 34.8% | −1.5pp |

**KPI-04 display**: Show as `4.2` with subtitle `vs 2.1 без кешбеку` (or similar). Trend: `+2.1 транз./міс vs попередній місяць`.

### 17 categories (for category filter Select)

```typescript
const CATEGORIES = [
  'Усі категорії',
  'Продукти',
  'АЗС',
  'Ресторани',
  'Онлайн-шопінг',
  'Аптеки',
  'Подорожі',
  'Розваги',
  'Одяг та взуття',
  'Електроніка',
  'Дім та сад',
  'Спорт',
  'Краса та здоровʼя',
  'Освіта',
  'Страхування',
  'Комунальні послуги',
  'Таксі та доставка',
  'Інше'
];
```

### Zero-conversion categories (CONV-03 block) — 3 items

| Категорія | Конверсія | Причина |
|-----------|-----------|---------|
| Страхування | 0% | Проблема оферу |
| Комунальні послуги | 1.2% | Проблема комунікації |
| Освіта | 2.1% | Проблема оферу |

**Display**: Table or list inside a Card. Each row: category name, conversion %, cause label. Use muted/alert styling (e.g. `bg-muted/50`, `text-muted-foreground`) for the block. Include a short explanation paragraph: «Категорії з конверсією <5% потребують перегляду оферу або комунікації.»

### Period filter options

- `6m` → «Останні 6 місяців»
- `3m` → «Останні 3 місяці»
- `ytd` → «З початку року»

---

## Tasks

### Task 1: Replace skeleton page with full Phase 2 content

**File**: `src/app/dashboard/exec/cashback-impact/page.tsx`

**Type**: rewrite

**Description**: Replace the skeleton content with full Phase 2 implementation: header with filters, 6 KPI cards with real values, and CONV-03 zero-conversion block.

**Changes**:

1. **Add `'use client'`** at top of file (required for Select)

2. **Imports**:
   ```tsx
   import PageContainer from '@/components/layout/page-container';
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
   ```

3. **Mock data constants** (top-level, before component):
   - `CATEGORIES` — array of 17 strings (see Mock Data Spec above)
   - `ZERO_CONVERSION_CATEGORIES` — array of `{ name: string; conversion: number; cause: string }` (3 items: Страхування/0/Проблема оферу, Комунальні послуги/1.2/Проблема комунікації, Освіта/2.1/Проблема оферу)
   - KPI values as constants or inline in JSX (61.4%, 2.3 дн, 18.7%, 4.2 vs 2.1, +23.4%, 34.8%)
   - KPI trends: +3.1pp, −0.2 дн, +1.2pp, +2.1 транз./міс, +2.1pp, −1.5pp

4. **Header section** (match exec page pattern):
   ```tsx
   <div className='flex items-start justify-between gap-4'>
     <div>
       <p className='text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase'>
         Топ-менеджмент · Кешбек-програма · Лютий 2025
       </p>
       <h2 className='text-2xl font-bold tracking-tight'>Вплив кешбеків</h2>
       <p className='text-muted-foreground mt-0.5 text-sm'>
         Аналіз ефективності кешбек-програми за категоріями
       </p>
     </div>
     <div className='flex items-center gap-2'>
       <Select defaultValue='all'>
         <SelectTrigger className='w-[180px] shrink-0'>
           <SelectValue placeholder='Категорія' />
         </SelectTrigger>
         <SelectContent>
           {CATEGORIES.map((c) => (
             <SelectItem key={c} value={c === 'Усі категорії' ? 'all' : c}>{c}</SelectItem>
           ))}
         </SelectContent>
       </Select>
       <Select defaultValue='6m'>
         <SelectTrigger className='w-[160px] shrink-0'>
           <SelectValue />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value='6m'>Останні 6 місяців</SelectItem>
           <SelectItem value='3m'>Останні 3 місяці</SelectItem>
           <SelectItem value='ytd'>З початку року</SelectItem>
         </SelectContent>
       </Select>
     </div>
   </div>
   ```
   Note: Category Select uses `defaultValue='all'`; period Select uses `defaultValue='6m'`. Filters are visual-only (no onChange handlers in Phase 2).

5. **KPI row** — 6 cards in grid:
   ```tsx
   <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
     {/* Card 1: Конверсія активації */}
     <Card>
       <CardHeader className='pb-2'>
         <CardTitle className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
           Конверсія активації кешбеку
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className='text-2xl font-bold'>61.4%</div>
         <p className='text-muted-foreground mt-1 text-xs'>+3.1pp vs попередній місяць</p>
       </CardContent>
     </Card>
     {/* Card 2: Час до 1-ї транзакції */}
     <Card>
       <CardHeader className='pb-2'>
         <CardTitle className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
           Час до першої транзакції
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className='text-2xl font-bold'>2.3 дн</div>
         <p className='text-muted-foreground mt-1 text-xs'>−0.2 дн vs попередній місяць</p>
       </CardContent>
     </Card>
     {/* Card 3: Reactivation Rate */}
     <Card>
       <CardHeader className='pb-2'>
         <CardTitle className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
           Reactivation Rate
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className='text-2xl font-bold'>18.7%</div>
         <p className='text-muted-foreground mt-1 text-xs'>+1.2pp vs попередній місяць</p>
       </CardContent>
     </Card>
     {/* Card 4: Транзакційність */}
     <Card>
       <CardHeader className='pb-2'>
         <CardTitle className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
           Транзакційність
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className='text-2xl font-bold'>4.2</div>
         <p className='text-muted-foreground mt-1 text-xs'>vs 2.1 без кешбеку · +2.1 транз./міс</p>
       </CardContent>
     </Card>
     {/* Card 5: Зміна середнього чека */}
     <Card>
       <CardHeader className='pb-2'>
         <CardTitle className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
           Зміна середнього чека
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className='text-2xl font-bold'>+23.4%</div>
         <p className='text-muted-foreground mt-1 text-xs'>+2.1pp vs попередній місяць</p>
       </CardContent>
     </Card>
     {/* Card 6: Credit Utilization */}
     <Card>
       <CardHeader className='pb-2'>
         <CardTitle className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
           Credit Utilization
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className='text-2xl font-bold'>34.8%</div>
         <p className='text-muted-foreground mt-1 text-xs'>−1.5pp vs попередній місяць</p>
       </CardContent>
     </Card>
   </div>
   ```

6. **CONV-03 block** — Card with zero-conversion categories:
   ```tsx
   <Card className='border-muted-foreground/20 bg-muted/30'>
     <CardHeader className='pb-2'>
       <CardTitle className='text-muted-foreground text-sm font-semibold tracking-wide uppercase'>
         Категорії з низькою конверсією (&lt;5%)
       </CardTitle>
       <p className='text-muted-foreground mt-1 text-xs'>
         Категорії з конверсією &lt;5% потребують перегляду оферу або комунікації.
       </p>
     </CardHeader>
     <CardContent>
       <div className='space-y-2'>
         {ZERO_CONVERSION_CATEGORIES.map((item) => (
           <div
             key={item.name}
             className='flex items-center justify-between rounded-md border border-muted-foreground/10 bg-background/50 px-3 py-2 text-sm'
           >
             <span className='font-medium'>{item.name}</span>
             <span className='text-muted-foreground tabular-nums'>{item.conversion}%</span>
             <span className='text-muted-foreground text-xs'>{item.cause}</span>
           </div>
         ))}
       </div>
     </CardContent>
   </Card>
   ```

7. **Layout structure**:
   ```tsx
   <PageContainer>
     <div className='flex flex-1 flex-col space-y-6'>
       {/* Header with filters */}
       {/* KPI row */}
       {/* CONV-03 block */}
     </div>
   </PageContainer>
   ```

8. **Remove**: Skeleton imports and KPI_LABELS constant. Remove any placeholder/skeleton JSX.

---

## Verification

1. **Visual**: Navigate to `/dashboard/exec/cashback-impact` — page renders without errors
2. **KPI cards**: All 6 cards show correct values (61.4%, 2.3 дн, 18.7%, 4.2, +23.4%, 34.8%) and trend lines
3. **Filters**: Category Select shows 17 options (Усі категорії + 16 categories); Period Select shows 3 options (6m, 3m, ytd). Both render and can be opened/selected (no filtering logic required)
4. **CONV-03 block**: Card displays 3 rows: Страхування (0%), Комунальні послуги (1.2%), Освіта (2.1%) with cause labels
5. **Build**: `bun run build` succeeds
6. **Lint**: `bun run lint` passes
