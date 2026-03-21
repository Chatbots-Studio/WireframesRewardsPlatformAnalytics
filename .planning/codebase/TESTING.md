# Testing Patterns

**Analysis Date:** 2026-03-21

## Test Framework

**Status:** No testing framework configured

**Note:** The codebase has no Jest, Vitest, or other testing framework configured. No test files (`.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`) found in the project.

**Dependencies observed:**
- `@faker-js/faker` v10.3.0 in devDependencies (suggests testing was considered or in development)
- No test runner configuration files present

**Run Commands:**
Currently there are no test commands in `package.json`. Available commands:
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linting
npm run lint:fix         # Run linting with fixes + format
npm run lint:strict      # Run linting with zero warnings
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
```

## Test File Organization

**Not Applicable** - No test framework is currently configured.

**Recommendation for future implementation:**
- Co-locate tests with source files: `Button.tsx` and `Button.test.tsx` in same directory
- Use `.test.ts` suffix for unit tests
- Use `.spec.ts` suffix for integration/specification tests
- Place E2E tests in dedicated `e2e/` directory at project root

## Test Structure

**Not Applicable** - No tests are currently written.

**If implementing Jest/Vitest, suggested patterns based on codebase:**

For React component testing:
```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text content', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

For hook testing:
```typescript
// use-breadcrumbs.test.tsx
import { renderHook } from '@testing-library/react';
import { useBreadcrumbs } from './use-breadcrumbs';

describe('useBreadcrumbs', () => {
  it('returns breadcrumbs for current path', () => {
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current).toEqual(expectedBreadcrumbs);
  });
});
```

For utility testing:
```typescript
// utils.test.ts
import { formatBytes, cn } from './utils';

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });
});
```

## Mocking

**Framework:** Not configured

**Recommended approach when tests are added:**
- Use Jest/Vitest's built-in mocking
- Mock Next.js hooks (`useRouter`, `usePathname`, `useSearchParams`)
- Mock external libraries:
  - `next-intl` hooks and components
  - `next-themes` provider
  - Form libraries (react-hook-form)
  - UI library components (Radix UI)

**Pattern for mocking Next.js modules:**
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams()
}));
```

**What to Mock:**
- External API calls
- Next.js router and navigation
- Browser APIs (localStorage, window.location)
- Date/time for consistent snapshots
- Random generators (use faker for consistent test data)

**What NOT to Mock:**
- Pure utility functions
- Custom hooks that don't depend on external APIs
- UI component libraries (render real components for integration tests)
- Internal business logic layers

## Fixtures and Factories

**Test Data Pattern:**
The codebase uses mock data patterns in `src/constants/` and `src/features/*/data/`:

```typescript
// src/constants/data.ts - Example of test data pattern
export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  // More items...
];
```

**Factory pattern with faker:**
Since `@faker-js/faker` is installed, use it for generating test data:
```typescript
// test/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export function createMockUser(overrides?: Partial<SaleUser>): SaleUser {
  return {
    id: faker.number.int(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    amount: `+$${faker.finance.amount()}`,
    image: faker.image.avatar(),
    initials: 'AB',
    ...overrides
  };
}
```

**Location:**
- Place fixtures in `test/fixtures/` directory
- Place factories in `test/factories/` directory at project root
- Export from barrel file: `test/index.ts`

## Coverage

**Requirements:** Not enforced

Currently no coverage thresholds are configured. When implementing tests:
- Aim for 80%+ statement coverage for critical paths
- 100% coverage for utility functions
- 70%+ coverage for React components
- Focus on behavior testing over line coverage

**View Coverage (when configured):**
```bash
npm test -- --coverage        # Generate coverage report
npm test -- --coverage --watch # Watch mode with coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, hooks, components in isolation
- Approach: Mock external dependencies
- Examples to test:
  - `formatBytes()` utility function in `src/lib/utils.ts`
  - `cn()` className utility in `src/lib/utils.ts`
  - Individual form field components in `src/components/forms/`
  - Custom hooks like `useDataTable`, `useBreadcrumbs`, `useMediaQuery`

**Integration Tests:**
- Scope: Multiple components working together, features
- Approach: Render components with their dependencies, test user interactions
- Examples:
  - Form submission with validation via react-hook-form
  - Data table with filtering, sorting, pagination (`src/hooks/use-data-table.ts`)
  - Navigation with breadcrumb updates (`src/hooks/use-breadcrumbs.tsx`)
  - Theme switching with locale switching (`src/components/locale-switcher.tsx`)

**E2E Tests:**
- Framework: Not configured (Playwright, Cypress recommended)
- Scope: Full user workflows across pages
- Examples:
  - User navigation flow through dashboard pages
  - Form submission and data persistence
  - Authentication and authorization flows
  - Multi-language support across the application

## Common Patterns

**Async Testing:**
Since Next.js layout component is async:
```typescript
// For async components - render within appropriate wrapper
it('renders with fetched locale', async () => {
  const component = await RootLayout({ children: <div>test</div> });
  expect(component).toBeDefined();
});
```

For async hooks/functions:
```typescript
it('handles async data loading', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useAsyncData());
  expect(result.current.loading).toBe(true);

  await waitForNextUpdate();
  expect(result.current.data).toBeDefined();
});
```

**Error Testing:**
```typescript
describe('Error handling', () => {
  it('throws when context not found', () => {
    expect(() => {
      renderHook(() => useSidebar());
    }).toThrow('useSidebar must be used within a SidebarProvider.');
  });

  it('shows toast error on upload failure', async () => {
    const { getByText } = render(<FileUploader />);
    // Trigger error condition
    // Assert toast was called
  });
});
```

**React Hook Form Testing:**
```typescript
it('validates form input', async () => {
  const { render } = renderWithFormProvider();
  const { getByRole, getByText } = render(<FormInput name="email" required />);

  const input = getByRole('textbox');
  await userEvent.clear(input);
  await userEvent.type(input, 'invalid');

  expect(getByText(/invalid/i)).toBeInTheDocument();
});
```

## Testing Setup Recommendations

**When implementing tests, configure:**

1. **Package.json scripts:**
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

2. **Vitest config:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts']
  }
});
```

3. **Test setup file:** `test/setup.ts`
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

4. **Testing library dependencies:**
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `vitest`
- `@vitest/ui`
- `@vitest/coverage-v8`

## Current Testing Gaps

**Areas without tests:**
- All React components lack unit/integration tests
- All custom hooks lack tests (`useDataTable`, `useBreadcrumbs`, `useMediaQuery`, `useMobile`, `useDebounce`, `useCallbackRef`, etc.)
- Utility functions not tested (`formatBytes`, `cn`, parsers in `src/lib/`)
- Form validation and submission flows not tested
- i18n configuration and locale switching not tested
- Data table functionality (filtering, sorting, pagination) not tested
- Route navigation and breadcrumb logic not tested

**Priority for test implementation:**
1. **High:** `useDataTable` hook in `src/hooks/use-data-table.ts` (complex, heavily used)
2. **High:** Form components in `src/components/forms/` and validation with react-hook-form
3. **High:** Utility functions (`formatBytes`, `cn`) in `src/lib/utils.ts`
4. **Medium:** Custom hooks (`useBreadcrumbs`, `useMediaQuery`, `useMobile`) in `src/hooks/`
5. **Medium:** Critical UI components (Button, Input, Select)
6. **Low:** Presentational components with minimal logic

---

*Testing analysis: 2026-03-21*
