# Планова дизайн-специфікація: Пояснюваність KPI для Cashback Impact

## Проблема
У блоці `Вплив кешбеків` KPI-показники показують значення та дельту, але:
- невідомо, яка дата/вікно використовується в чисельнику,
- не видно драйверів змін,
- немає чітких action-items для відповідальних команд.

## Мета
Дати менеджменту зрозумілу інтерпретацію кожної метрики без перевантаження карточок:
- швидкий огляд через tooltip (1 екран),
- детальний розбір через правий drawer (відкритий за 1 клік),
- єдині формулювання в UI і документації.

## Обраний UX-подход
Гібрид:
- на кожній KPI-картці додається іконка інформації;
- hover/click на іконці:
  - **Tooltip (кратко):** що таке метрика і коротка формула;
  - **Drawer (детально):** формула, драйвери, що робити, пороги, застереження.

## Компонентна схема
- `MetricInfoTrigger`
  - відображає іконку у заголовку KPI-карти,
  - відкриває tooltip,
  - передає `metricId` в callback.
- `MetricInsightDrawer`
  - відкривається з правого краю (`Sheet`),
  - рендерить структуру з 5 секцій:
    - `Що вимірюємо`
    - `Як рахується`
    - `Що рухає`
    - `Що робити`
    - `Пороги інтерпретації + застереження`
- `metric-catalog.ts`
  - окремий каталог контенту для всіх 6 KPI,
  - дозволяє зміцнити консистентність між UI та документацією.

## Data contract
```ts
type AlertLevel = 'good' | 'watch' | 'risk';

type ActionByRole = {
  role: string;
  action: string;
  expectedImpact: string;
};

type MetricThreshold = {
  level: AlertLevel;
  label: string;
  condition: string;
  interpretation: string;
};

type MetricCatalogItem = {
  id: string;
  title: string;
  aliases?: string[];
  shortDefinition: string;
  quickFormula: string;
  formula: {
    expression: string;
    details: string[];
  };
  drivers: string[];
  actions: ActionByRole[];
  thresholds: MetricThreshold[];
  caveats: string[];
};
```

## Контент для KPI-карток
Для кожної з 6 метрик має бути:
- `title`,
- 1 рядок пояснення (`shortDefinition`),
- коротка формула (`quickFormula`),
- `formula.expression` + `formula.details`,
- `drivers` (5–7 позицій, коротко),
- `actions` з ролями (Product/CRM/Risk),
- `thresholds` (3 зони: good/watch/risk),
- `caveats` (2–3 позиції).

## UX-поведінка і валідація
- Tooltip не повинен дублювати детальну інформацію.
- Drawer відкривається з `metricId` без перезавантаження дашборду.
- На мобільних/десктопах блоки мають бути читаємими:
  - короткі рядки в tooltip,
  - скролл-контейнер у drawer,
  - ключова інформація у списках з читабельною типографікою.

## Ризики
- Непогоджені формули між сторінкою та docs — вирішується через один каталог `metric-catalog.ts`.
- Довгі формулювання в tooltip — обмежені до 2–3 коротких фраз.
- Надмірне інформаційне навантаження drawer — компенсується секційною структурою.
