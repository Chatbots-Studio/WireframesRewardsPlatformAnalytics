# Roadmap: Дашборд «Вплив кешбеків»

## Overview

Від навігаційної реструктуризації до повноцінної сторінки аналітики впливу кешбеків: KPI-картки, ROI-чарти, конверсійна воронка та інкрементальність. Milestone v1.1 — редизайн сторінки довідників продуктів.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

### v1.0 — Cashback Impact Dashboard (COMPLETED)
- [x] **Phase 1: Navigation Restructuring** - «Топ-менеджмент» стає collapsible-групою з двома підпунктами
- [x] **Phase 2: Page Scaffold + KPI + Filters** - Сторінка з 6 KPI-картками, фільтрами та блоком нульової конверсії
- [x] **Phase 3: ROI Charts** - Bar chart, scatter plot, line chart по ROI
- [x] **Phase 4: Conversion Funnel Block** - Funnel-діаграма та теплова карта
- [x] **Phase 5: Incrementality Block** - Before/after, cohort, canibalization
- [x] **Phase 6: Portfolio Analysis** - 2×2 Conversion vs ROI matrix, top categories for invest/review
- [x] **Phase 7: Retention & Efficiency** - Stickiness Factor, Redemption Rate

### v1.1 — Dictionaries Redesign (ACTIVE)
- [ ] **Phase 8: Products DataTable + Side Sheet** - Міграція на DataTable, пошук, Sheet з read-only General tab, стат-картки, видалення Data Sources
- [ ] **Phase 9: Sheet Tabs + Inline Edit + Fake CRUD** - Таби General/Target Actions, inline edit form, Save/Cancel, toast, i18n

## Phase Details

### Phase 1: Navigation Restructuring
**Goal**: Користувач може перейти до «Вплив кешбеків» як підпункту «Топ-менеджмент»
**Depends on**: Nothing (first phase)
**Requirements**: NAV-01
**Success Criteria** (what must be TRUE):
  1. User sees «Топ-менеджмент» as a collapsible group in sidebar
  2. User can expand/collapse and see two items: «Загальний ROI» (/dashboard/exec) and «Вплив кешбеків» (/dashboard/exec/cashback-impact)
  3. User can click «Вплив кешбеків» and navigate to the new page
**Plans**: `.planning/phases/01-navigation-restructuring/PLAN.md` (3 tasks)

### Phase 2: Page Scaffold + KPI + Filters
**Goal**: Сторінка існує з KPI summary, фільтрами та блоком категорій з нульовою конверсією
**Depends on**: Phase 1
**Requirements**: KPI-01, KPI-02, KPI-03, KPI-04, KPI-05, KPI-06, UX-01, UX-02, UX-03, CONV-03
**Success Criteria** (what must be TRUE):
  1. User lands on /dashboard/exec/cashback-impact and sees page with 6 KPI cards row
  2. User can filter by category (Select) and period (6m / 3m / YTD) in header
  3. User sees all 6 KPI metrics with realistic mock values (~17 categories)
  4. User sees zero-conversion categories block with explanation of possible causes
**Plans**: `.planning/phases/02-page-scaffold-kpi-filters/PLAN.md` (1 task)

### Phase 3: ROI Charts
**Goal**: ROI-аналіз доступний через три візуалізації
**Depends on**: Phase 2
**Requirements**: ROI-01, ROI-02, ROI-03
**Success Criteria** (what must be TRUE):
  1. User sees horizontal bar chart of categories sorted by ROI with color zones (red <50x, yellow 50-200x, green >200x)
  2. User sees scatter plot «Оборот vs Кешбек» with bubble size = transaction count; anomalies highlighted in tooltip
  3. User sees line chart of ROI dynamics for top-5 categories over 6 months
**Plans**: `.planning/phases/03-roi-charts/PLAN.md` (1 task)

### Phase 4: Conversion Funnel Block
**Goal**: Конверсійна воронка та теплова карта доступні
**Depends on**: Phase 3
**Requirements**: CONV-01, CONV-02
**Success Criteria** (what must be TRUE):
  1. User sees funnel diagram with steps: Transactions -> Saw offer -> Chose category -> Activated (with % conversion per step)
  2. User can switch funnel between categories when category filter is applied
  3. User sees heatmap «Конверсія vs Середній чек» — categories as rows, check ranges as columns, color = % conversion
**Plans**: `.planning/phases/04-conversion-funnel/PLAN.md` (1 task)

### Phase 5: Incrementality Block
**Goal**: Інкрементальність та canibalization доступні
**Depends on**: Phase 4
**Requirements**: INC-01, INC-02, INC-03
**Success Criteria** (what must be TRUE):
  1. User sees before/after chart: turnover and transactions 3 months before vs 3 months after offer launch per category
  2. User sees cohort line chart: activated vs control group over 6 months (avg turnover per client)
  3. User sees cannibalization chart: whether spending grew or just redistributed between categories
**Plans**: `.planning/phases/05-incrementality/PLAN.md` (1 task)

### Phase 6: Portfolio Analysis
**Goal**: Портфельний аналіз категорій через матрицю Конверсія vs ROI та топ-3 рекомендації
**Depends on**: Phase 5
**Requirements**: PORT-01, PORT-02
**Success Criteria** (what must be TRUE):
  1. User sees 2×2 scatter matrix with 4 labeled quadrants: Stars (high conv + high ROI), Potential (low conv + high ROI), Efficient (high conv + low ROI), Review (low conv + low ROI)
  2. User sees action recommendation for each quadrant
  3. User sees top-3 categories recommended for investment with ROI and conversion metrics
  4. User sees top-3 categories recommended for review/restructuring with action items

### Phase 7: Retention & Efficiency
**Goal**: Аналіз утримання через Stickiness Factor та ефективності через Redemption Rate
**Depends on**: Phase 6
**Requirements**: RET-01, RET-02
**Success Criteria** (what must be TRUE):
  1. User sees horizontal bar chart of stickiness factor per category (% clients choosing same category 3 months in a row), sorted high to low
  2. User sees color-coded bars: green ≥50%, yellow 30–49%, gray <30%
  3. User sees grouped bar chart of accrued vs redeemed cashback per category
  4. User sees table with redemption rate per category, color-coded (green ≥70%, amber 50–69%, red <50%)

### Phase 8: Products DataTable + Side Sheet
**Goal**: Сторінка довідників трансформована — продукти в DataTable з пошуком, клік по рядку відкриває Sheet з деталями продукту (read-only)
**Depends on**: Phase 7 (v1.0 complete)
**Requirements**: DICT-01, DICT-02, DICT-03, DICT-04, DICT-05, DICT-06, DICT-07, DICT-09, DICT-17, DICT-18, DICT-19, DICT-20, DICT-22
**Success Criteria** (what must be TRUE):
  1. User sees products as table rows with columns: Product name, Target Actions count, Data Source
  2. User can search products by name via toolbar input
  3. User clicks a row — Sheet opens on the right with product details (name, description, source, conditions)
  4. Selected row has visual highlight while Sheet is open
  5. Data Sources section is removed from the page
  6. Stat cards show Products count and Target Actions count (Data Sources card removed)
  7. Feature code lives in `src/features/cashback/dictionaries/`
  8. State is in `useDictionariesState()` hook, page.tsx is a thin shell
**Plans:** 2 plans
Plans:
- [ ] 06-01-PLAN.md — Feature scaffold: hook, column defs, ProductsTable component
- [ ] 06-02-PLAN.md — ProductSideSheet, page.tsx rewrite, i18n, Data Sources removal

### Phase 9: Sheet Tabs + Inline Edit + Fake CRUD
**Goal**: Sheet має таби General/Target Actions, inline-редагування в General tab з Save/Cancel та toast feedback
**Depends on**: Phase 8
**Requirements**: DICT-08, DICT-10, DICT-11, DICT-12, DICT-13, DICT-14, DICT-15, DICT-16, DICT-21
**Success Criteria** (what must be TRUE):
  1. User sees two tabs in Sheet: "Загальне" and "Цільові дії"
  2. User switches to "Цільові дії" — sees read-only table of target actions for selected product
  3. Scroll position resets when switching tabs
  4. User clicks "Edit" in General tab — fields become editable (name, description, conditions)
  5. User clicks "Save" — local state updates, toast shows "demo mode" disclaimer
  6. User clicks "Cancel" — changes discarded, returns to read mode
  7. Mock data initialized via `structuredClone()`, not mutated directly
  8. All new UI strings have i18n keys in both en.json and uk.json
**Plans:** 1 plan
Plans:
- [ ] 07-01-PLAN.md — Tabs, GeneralTab (view/edit), TargetActionsTab, updateProduct, toast, i18n

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Navigation Restructuring | 3/3 | Done | 2026-03-05 |
| 2. Page Scaffold + KPI + Filters | 1/1 | Done | 2026-03-05 |
| 3. ROI Charts | 1/1 | Done | 2026-03-05 |
| 4. Conversion Funnel Block | 1/1 | Done | 2026-03-05 |
| 5. Incrementality Block | 1/1 | Done | 2026-03-05 |
| 6. Portfolio Analysis | 1/1 | Done | 2026-03-22 |
| 7. Retention & Efficiency | 1/1 | Done | 2026-03-22 |
| 8. Products DataTable + Side Sheet | 0/2 | Planning complete | — |
| 9. Sheet Tabs + Inline Edit + Fake CRUD | 0/1 | Planning complete | — |
