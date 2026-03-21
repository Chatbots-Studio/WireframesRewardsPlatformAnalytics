# Project: Дашборд «Вплив кешбеків»

## What This Is

Дашборд Wareframes Statistic — аналітична платформа для банку. Містить сторінки для топ-менеджменту (ROI, вплив кешбеків), продакт-менеджера (кешбек-аналітика), комунікацій та довідників. Реалізується на мокових даних з Next.js 16 + shadcn/ui.

## Core Value

Відповісти на одне питання: *«Де кожна наступна гривня кешбеку дасть найбільший приріст обороту, якого б не було без програми?»* — і підказати, де забрати гроші від тих, хто і так купує.

## Current Milestone: v1.1 Редизайн довідника продуктів

**Goal:** Повний редизайн сторінки `/dashboard/cashback/dictionaries` — покращення UX, додавання пошуку/фільтрів, table + side sheet layout з табами, фейковий CRUD на моках.

**Target features:**
- Table-based layout з side sheet panel для деталей продукту
- Tabs всередині панелі: Загальне / Цільові дії
- Пошук і фільтри по таблиці продуктів
- Inline-редагування в side sheet (фейковий CRUD на моках)
- Видалення секції Data Sources (буде окрема сторінка пізніше)
- Узгодження стилів, розмірів та UX з рештою дашборду

## Context

- **Репо**: Next.js 16 + Recharts + shadcn/ui + Tailwind v4
- **Існуючі сторінки**: `/dashboard/exec`, `/dashboard/exec/cashback-impact`, `/dashboard/cashback/dictionaries`
- **Поточна сторінка довідників**: все на одній сторінці, забагато скролу, немає фільтрів, поганий UX при багатьох продуктах
- **Принципи**: без модалок — все inline в side sheet; Data Sources → окрема сторінка (не в цьому milestone)

## Target User

Продакт-менеджер кешбек-програми — працює з довідниками продуктів, налаштовує цільові дії, потребує швидкого доступу до інформації.

## Requirements

### Validated

- ✓ Next.js 16 + TypeScript — v1.0
- ✓ Recharts для чартів — v1.0
- ✓ shadcn/ui Card, Select, Separator, Table, Badge — v1.0
- ✓ `PageContainer` layout — v1.0
- ✓ Nav config з підтримкою `items[]` — v1.0
- ✓ Cashback impact dashboard (KPI, ROI, Funnel, Incrementality) — v1.0
- ✓ i18n (EN/UK) з next-intl — v1.0

### Active

See: `.planning/REQUIREMENTS.md`

### Out of Scope (v1.1)

- Data Sources управління — окрема сторінка в майбутньому
- Реальний бекенд/API — все на моках
- PDF/CSV export довідників
- Drag-and-drop сортування
- Bulk operations (масове редагування)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Моки замість реальних даних | Швидка реалізація без бекенду | Реалістичні дані у константах файлу |
| Recharts замість нової бібліотеки | Вже використовується в exec page | Узгоджений стиль |
| Side sheet замість модалок | Користувач не хоче перекриваючих елементів | Table звужується, панель справа |
| Data Sources — окрема сторінка | Буде складний функціонал підключення/парсінгу | Прибрати з довідників |
| Фейковий CRUD | Демонстрація UX без бекенду | useState для стану, без persist |

---
*Last updated: 2026-03-21 після початку milestone v1.1*
