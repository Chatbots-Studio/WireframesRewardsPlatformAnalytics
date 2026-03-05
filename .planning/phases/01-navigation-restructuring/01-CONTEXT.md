# Phase 1: Navigation Restructuring - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

«Топ-менеджмент» у sidebar стає collapsible-групою з двома підпунктами: «Загальний ROI» та «Вплив кешбеків». Нова сторінка /dashboard/exec/cashback-impact рендерить skeleton майбутнього дашборду. Це вся область Phase 1 — ніяких нових capabilities поза навігацією та скаффолдингом сторінки.

</domain>

<decisions>
## Implementation Decisions

### Expand/Collapse поведінка
- **Claude's Discretion** — користувач сказав «зроби як краще»
- Рекомендація: група розгорнута за замовчуванням (expanded), оскільки це основний розділ
- Авто-розгортання при навігації на підпункт (стандартний UX-патерн для sidebar)

### Active-стан
- **Claude's Discretion** — користувач сказав «зроби як краще»
- Рекомендація: батьківська група «Топ-менеджмент» підсвічується (active-styled), коли активний будь-який її підпункт — дає візуальний контекст

### Назва нового підпункту
- «Вплив кешбеків» — саме таке формулювання у sidebar

### Іконки підпунктів
- Без іконок — тільки текст (стандартний патерн для sub-items у shadcn sidebar)

### Нова сторінка /dashboard/exec/cashback-impact
- Рендерити скелет майбутньої сторінки: заголовок «Вплив кешбеків» + KPI-плейсхолдери (6 карток у loading/placeholder стані) щоб Phase 2 могла одразу їх наповнювати

### Claude's Discretion
- Спосіб зберігання стану expand/collapse (localStorage vs sessionStorage vs in-memory)
- Точні стилі chevron-індикатора (розмір, анімація)
- Структура компонента сторінки (server component vs client component)

</decisions>

<specifics>
## Specific Ideas

- Поточний пункт nav-config.ts: `{ title: 'Топ-менеджмент', url: '/dashboard/exec', icon: 'exec', items: [] }` — `items: []` треба наповнити двома підпунктами
- Sub-items без власних іконок (відповідно до патерну існуючого «Звіти» з підпунктами в nav-config.ts)
- Скелет сторінки: 6 карток у вигляді Skeleton-компонентів або placeholder-блоків для майбутніх KPI Phase 2

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-navigation-restructuring*
*Context gathered: 2026-03-05*
