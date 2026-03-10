# Testing Patterns

**Analysis Date:** 2026-03-10

## Test Framework

**Runner:**
- No test framework is installed or configured
- No test runner (Jest, Vitest, Playwright, Cypress) present in `package.json` dependencies or devDependencies
- No test configuration files detected (`jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`)

**Assertion Library:**
- None

**Run Commands:**
```bash
# No test scripts defined in package.json
# Only available scripts:
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint via next lint
npm run lint:fix     # Fix ESLint issues + format
npm run lint:strict  # Lint with zero warnings threshold
npm run format       # Run Prettier
npm run format:check # Check Prettier formatting
```

## Test File Organization

**Location:**
- No test files exist anywhere in the codebase
- Zero `.test.*`, `.spec.*`, or `__tests__` directories found

**Naming:**
- Not established

**Structure:**
- Not established

## Test Structure

**Suite Organization:**
- Not established. No tests exist.

**Patterns:**
- None

## Mocking

**Framework:** `@faker-js/faker` is installed as a devDependency

**Current Usage:**
- `@faker-js/faker` is used exclusively for generating mock UI data in `src/constants/mock-api.ts`, not for test mocking
- Mock data files use `.mock.ts` suffix convention and live alongside feature code:
  - `src/features/cashback/data/analytics-dictionaries.mock.ts`
  - `src/features/reports/data/quick-cashback-refund.mock.ts`
  - `src/constants/mock-api.ts`

**Mock Data Pattern:**
```typescript
// Pattern from src/features/reports/data/quick-cashback-refund.mock.ts
export interface QuickCashbackRefundEvent {
  id: string;
  clientId: string;
  purchaseAmount: number;
  // ... typed fields
}

export const QUICK_CASHBACK_REFUND_EVENTS: QuickCashbackRefundEvent[] = [
  {
    id: 'F-001',
    clientId: 'CL-19002',
    purchaseAmount: 12450,
    // ... static mock data
  },
  // ...
];

// Filtering/query functions operate on mock data
export function getQuickCashbackRefundRows(
  periodDays: FraudReportPeriodDays
): QuickCashbackRefundEvent[] {
  // Filter and sort logic
}
```

**What to Mock (when tests are added):**
- External API calls (none exist yet -- all data is currently mock)
- Sentry error reporting (`@sentry/nextjs`)
- Next.js server functions (`cookies()`, `redirect()`)
- Browser APIs (`window.matchMedia`, `document.cookie`)

**What NOT to Mock:**
- UI component rendering (test with real shadcn/ui components)
- `cn()` utility and Tailwind class merging
- Zod schemas in `src/lib/parsers.ts` (test with real validation)

## Fixtures and Factories

**Test Data:**
- No test fixtures or factory patterns exist
- Mock data for UI is defined as static typed arrays in `.mock.ts` files
- `@faker-js/faker` generates dynamic sample data in `src/constants/mock-api.ts`

**Pattern from `src/constants/mock-api.ts`:**
```typescript
import { faker } from '@faker-js/faker';

function generateRandomProductData(id: number): Product {
  return {
    id,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
    category: faker.helpers.arrayElement(categories),
    // ...
  };
}
```

**Location:**
- Feature mock data: `src/features/{feature}/data/*.mock.ts`
- General mock data: `src/constants/mock-api.ts`

## Coverage

**Requirements:** None enforced. No coverage tool configured.

**View Coverage:**
```bash
# Not available -- no test runner configured
```

## Test Types

**Unit Tests:**
- Not present. Candidates for unit testing:
  - `src/lib/utils.ts` -- `cn()`, `formatBytes()`
  - `src/lib/format.ts` -- `formatDate()`
  - `src/lib/parsers.ts` -- `getSortingStateParser()`, `getFiltersStateParser()`
  - `src/features/reports/data/quick-cashback-refund.mock.ts` -- `getQuickCashbackRefundRows()` filter logic
  - `src/features/exec/cashback-impact/data/metric-catalog.ts` -- `getMetricById()`
  - `src/lib/chart-theme.ts` -- `chartGradientId()`

**Integration Tests:**
- Not present. Candidates:
  - `src/hooks/use-data-table.ts` -- complex hook integrating nuqs, TanStack Table, debouncing
  - Form components in `src/components/forms/` -- form validation with react-hook-form + zod

**E2E Tests:**
- Not present. No Playwright or Cypress configured.
- Candidates: dashboard navigation flow, sidebar collapse, theme switching

## Quality Gates

**Pre-commit:** Husky runs `lint-staged` (Prettier only) via `src/.husky/pre-commit`
**Pre-push:** No checks (placeholder script in `.husky/pre-push`)
**CI:** Not analyzed (no CI config found in repo root)
**Build:** `next build` serves as a type-checking gate (`strict: true` in tsconfig)

## Recommended Test Setup (When Adding Tests)

**Suggested Framework:** Vitest (aligns with the Vite/Next.js ecosystem)

**Suggested File Pattern:**
- Co-locate tests with source: `src/lib/utils.test.ts`, `src/hooks/use-data-table.test.ts`
- Feature tests: `src/features/exec/cashback-impact/data/metric-catalog.test.ts`

**Suggested Commands:**
```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

**Priority Test Targets (by risk):**
1. `src/lib/parsers.ts` -- Zod parsing logic used by data table URL state
2. `src/hooks/use-data-table.ts` -- Core hook with complex state management
3. `src/features/reports/data/quick-cashback-refund.mock.ts` -- Business logic filtering
4. `src/features/exec/cashback-impact/data/metric-catalog.ts` -- Data lookup functions
5. `src/lib/format.ts` and `src/lib/utils.ts` -- Shared utility functions

---

*Testing analysis: 2026-03-10*
