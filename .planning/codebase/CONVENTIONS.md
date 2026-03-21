# Coding Conventions

**Analysis Date:** 2026-03-21

## Naming Patterns

**Files:**
- PascalCase for React component files: `Breadcrumbs.tsx`, `LocaleSwitcher.tsx`, `FormInput.tsx`
- camelCase for hooks: `use-breadcrumbs.tsx`, `use-data-table.ts`, `use-mobile.tsx`
- camelCase for utility/config files: `nav-config.ts`, `data.ts`, `utils.ts`, `infoconfig.ts`
- kebab-case for directories: `form-card-skeleton.tsx`, `demo-form.tsx`, `file-uploader.tsx`

**Functions:**
- camelCase for function names: `formatBytes()`, `cn()`, `useBreadcrumbs()`, `handleSwitch()`
- Functions that are hooks always start with `use`: `useDataTable()`, `useBreadcrumbs()`, `useMediaQuery()`
- Exported components are PascalCase: `export function Breadcrumbs()`, `export function LocaleSwitcher()`
- Internal functions follow camelCase pattern: `const onPaginationChange = useCallback(...)`

**Variables:**
- camelCase for all variable names: `activeThemeValue`, `themeToApply`, `cookieStore`, `locale`, `messages`
- Constants are UPPER_SNAKE_CASE: `PAGE_KEY`, `PER_PAGE_KEY`, `SORT_KEY`, `DEBOUNCE_MS`, `ARRAY_SEPARATOR`
- HTML attributes use camelCase in JSX: `dangerouslySetInnerHTML`, `suppressHydrationWarning`, `enableSystem`
- URL segments/routes use kebab-case: `/dashboard/exec/cashback-impact`, `/dashboard/quick-cashback-refund`

**Types:**
- Interfaces use PascalCase: `NavItem`, `SidebarNavItem`, `BaseFormFieldProps`, `FormInputProps`
- Generic type parameters use TPascalCase: `TFieldValues`, `TName`, `TData`
- Types extending base types append descriptors: `NavItemWithChildren`, `NavItemWithOptionalChildren`
- Interface props always end with `Props`: `FormInputProps`, `BaseFormFieldProps`

## Code Style

**Formatting:**
- Tool: Prettier v3.8.1
- Configuration: `.prettierrc`
- Key settings:
  - Arrow parentheses: `always` - `(arg) => {}`
  - Bracket spacing: `true` - `{ key: value }`
  - Semicolons: `true` - All statements end with `;`
  - Trailing comma: `none` - No trailing commas
  - JSX single quote: `true` - Use single quotes in JSX
  - Single quote: `true` - Single quotes for strings
  - Tab width: `2` - 2-space indentation
  - End of line: `lf` - Unix line endings
  - Plugins: `prettier-plugin-tailwindcss` - Tailwind class sorting

**Linting:**
- Tool: ESLint v9.39.3
- Configuration: `eslint.config.mjs` (flat config format)
- Base config: `eslint-config-next/core-web-vitals`
- TypeScript support: `@typescript-eslint/eslint-plugin` v8.56.1, `@typescript-eslint/parser` v8.56.1
- Additional plugins: `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react`
- Key rules:
  - `@typescript-eslint/no-unused-vars`: `warn`
  - `import/no-unresolved`: `off`
  - `import/named`: `off`
  - `no-console`: `warn` - Discourage console statements
  - `react-hooks/exhaustive-deps`: `warn` - Warn on dependency array issues

## Import Organization

**Order:**
1. External libraries (React, Next.js, third-party packages)
   ```typescript
   import { useLocale } from 'next-intl';
   import { Button } from '@/components/ui/button';
   import { locales, type Locale } from '@/i18n/config';
   ```
2. Internal project imports with path aliases
3. Type imports using `import type` when appropriate

**Path Aliases:**
- `@/*` resolves to `./src/*` - Primary alias for all internal imports
- `~/*` resolves to `./public/*` - For public assets (less common)
- All imports consistently use `@/` for components, hooks, types, lib, config, constants, features

**Import grouping pattern (as seen in codebase):**
```typescript
// 1. External libraries first
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

// 2. Config/types
import { locales, type Locale } from '@/i18n/config';

// 3. Hooks (internal)
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';

// 4. Utilities
import { cn } from '@/lib/utils';
```

## Error Handling

**Patterns:**
- Use try-catch blocks for operations that might fail:
  ```typescript
  try {
    // Operation
  } catch {
    // Handle error
  }
  ```
- Throw error objects with descriptive messages:
  ```typescript
  throw new Error('useSidebar must be used within a SidebarProvider.');
  ```
- Use early returns for validation/null checks:
  ```typescript
  if (items.length === 0) return null;
  ```
- Guard clauses for context hooks:
  ```typescript
  const sidebar = useSidebarContext();
  if (!sidebar) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  ```
- Toast notifications for user-facing errors:
  ```typescript
  toast.error('Cannot upload more than 1 file at a time');
  ```
- Catch blocks use underscore prefix for unused variables: `catch (_)`, `catch (_err)`

## Logging

**Framework:** `console` (built-in)

**Patterns:**
- Linted to warn on console usage (`no-console: warn`)
- Limited use in production code - demo components may log for development:
  ```typescript
  console.log('Form submitted:', data);
  ```
- No structured logging framework configured (logging warnings are acceptable for debugging)

## Comments

**When to Comment:**
- Explain the "why" not the "what" for complex logic
- Document component purpose if not obvious from name
- Add JSDoc comments for exported functions and types
- Explain i18n patterns with inline comments (seen in nav-config):
  ```typescript
  /** Translation key for i18n (resolved via useTranslations('nav')) */
  titleKey?: string;
  ```

**JSDoc/TSDoc:**
- Minimal TSDoc usage in current codebase
- Interfaces and types document through property comments:
  ```typescript
  interface NavItem {
    title: string;
    /** Translation key for i18n (resolved via useTranslations('nav')) */
    titleKey?: string;
  }
  ```

## Function Design

**Size:**
- Keep functions focused and small
- Complex hooks (like `useDataTable`) can be longer but stay focused on single responsibility
- Callback handlers should be defined inline or use `useCallback` for dependency optimization

**Parameters:**
- Destructure parameters when component receives multiple props
- Use typed prop interfaces for component parameters
- Pass options objects for functions with many parameters:
  ```typescript
  function formatBytes(
    bytes: number,
    opts: {
      decimals?: number;
      sizeType?: 'accurate' | 'normal';
    } = {}
  ) { ... }
  ```

**Return Values:**
- Always include type annotations for return values
- Return null for optional components: `if (items.length === 0) return null;`
- Use React.ReactNode for flexible JSX returns
- Hooks return objects when multiple values: `return { table, shallow, debounceMs, throttleMs };`

## Module Design

**Exports:**
- Use named exports for components: `export function Breadcrumbs() { ... }`
- Use named exports for hooks: `export function useDataTable<TData>(props: UseDataTableProps<TData>) { ... }`
- Use named exports for utilities: `export function cn(...inputs: ClassValue[]) { ... }`
- Mix of default and named exports not used (consistent pattern)
- Export types separately: `export { FormInput };` (explicit export statement)

**Barrel Files:**
- Limited barrel file usage - most directories export their own files
- Index file exists: `src/types/index.ts` (re-exports types)
- Component directories typically don't use barrel files (import directly from component)
- Prefer direct imports over barrel files for better tree-shaking

## Component Organization

**Client vs Server Components:**
- Client components marked explicitly: `'use client';` at top of file
- Server components (default) don't require marking
- Layout and page components are server components by default
- Interactive components (with hooks, event handlers) marked as client:
  - `src/components/breadcrumbs.tsx`
  - `src/components/locale-switcher.tsx`
  - `src/components/forms/form-input.tsx`
  - `src/hooks/*.tsx` (use client hooks)

**Component Structure Pattern:**
1. Use client directive (if needed)
2. Import statements (organized by section)
3. Type definitions (interfaces/types specific to component)
4. Component function definition
5. Conditional renders early with guards
6. Main JSX structure
7. Named export

Example from `breadcrumbs.tsx`:
```typescript
'use client';
import { ... } from '@/...';

export function Breadcrumbs() {
  const items = useBreadcrumbs();
  if (items.length === 0) return null;  // Guard clause

  return (
    <Breadcrumb>
      {/* JSX */}
    </Breadcrumb>
  );
}
```

## TypeScript Usage

**Strict Mode:** `strict: true` in tsconfig.json
- All implicit `any` types are errors
- Null/undefined checks required
- Generic types must be explicit

**Generic Type Parameters:**
- Form components use generics for flexibility:
  ```typescript
  function FormInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  >(props: FormInputProps<TFieldValues, TName>) { ... }
  ```
- Data table hook uses generic for type safety:
  ```typescript
  export function useDataTable<TData>(props: UseDataTableProps<TData>) { ... }
  ```

**Type Safety Patterns:**
- `as const` for literal types: `const locale = useLocale() as Locale;`
- Type narrowing with guards
- Exhaustive type checks required due to strict mode

---

*Convention analysis: 2026-03-21*
