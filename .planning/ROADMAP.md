# Roadmap: Дашборд «Вплив кешбеків»

## Overview

Від навігаційної реструктуризації до повноцінної сторінки аналітики впливу кешбеків: KPI-картки, ROI-чарти, конверсійна воронка та інкрементальність. П'ять фаз, кожна доставляє перевірюваний результат.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Navigation Restructuring** - «Топ-менеджмент» стає collapsible-групою з двома підпунктами
- [ ] **Phase 2: Page Scaffold + KPI + Filters** - Сторінка з 6 KPI-картками, фільтрами та блоком нульової конверсії
- [ ] **Phase 3: ROI Charts** - Bar chart, scatter plot, line chart по ROI
- [ ] **Phase 4: Conversion Funnel Block** - Funnel-діаграма та теплова карта
- [ ] **Phase 5: Incrementality Block** - Before/after, cohort, canibalization

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
**Plans**: TBD

### Phase 3: ROI Charts
**Goal**: ROI-аналіз доступний через три візуалізації
**Depends on**: Phase 2
**Requirements**: ROI-01, ROI-02, ROI-03
**Success Criteria** (what must be TRUE):
  1. User sees horizontal bar chart of categories sorted by ROI with color zones (red <50x, yellow 50–200x, green >200x)
  2. User sees scatter plot «Оборот vs Кешбек» with bubble size = transaction count; anomalies highlighted in tooltip
  3. User sees line chart of ROI dynamics for top-5 categories over 6 months
**Plans**: TBD

### Phase 4: Conversion Funnel Block
**Goal**: Конверсійна воронка та теплова карта доступні
**Depends on**: Phase 3
**Requirements**: CONV-01, CONV-02
**Success Criteria** (what must be TRUE):
  1. User sees funnel diagram with steps: Transactions → Saw offer → Chose category → Activated (with % conversion per step)
  2. User can switch funnel between categories when category filter is applied
  3. User sees heatmap «Конверсія vs Середній чек» — categories as rows, check ranges as columns, color = % conversion
**Plans**: TBD

### Phase 5: Incrementality Block
**Goal**: Інкрементальність та canibalization доступні
**Depends on**: Phase 4
**Requirements**: INC-01, INC-02, INC-03
**Success Criteria** (what must be TRUE):
  1. User sees before/after chart: turnover and transactions 3 months before vs 3 months after offer launch per category
  2. User sees cohort line chart: activated vs control group over 6 months (avg turnover per client)
  3. User sees cannibalization chart: whether spending grew or just redistributed between categories
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Navigation Restructuring | 3/3 | Done | 2026-03-05 |
| 2. Page Scaffold + KPI + Filters | 0/0 | Not started | - |
| 3. ROI Charts | 0/0 | Not started | - |
| 4. Conversion Funnel Block | 0/0 | Not started | - |
| 5. Incrementality Block | 0/0 | Not started | - |
