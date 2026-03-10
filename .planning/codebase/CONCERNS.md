# Codebase Concerns

**Analysis Date:** 2026-03-10

## Tech Debt

**100% Mock Data -- No Real API Integration:**
- Issue: Every dashboard page renders hardcoded mock data defined inline or in `.mock.ts` files. There are zero `fetch()` calls, no API routes, and no backend integration anywhere in the codebase. The entire application is a static wireframe/prototype.
- Files:
  - `src/app/dashboard/communications/page.tsx` (lines 222-477 -- ~250 lines of inline mock data)
  - `src/app/dashboard/ab-tests/page.tsx` (lines 78-159 -- inline mock data)
  - `src/app/dashboard/exec/page.tsx` (lines 60-250 -- inline mock data)
  - `src/app/dashboard/exec/cashback-impact/page.tsx` (lines 47-600 -- inline mock data)
  - `src/app/dashboard/cashback/page.tsx` (lines 64+ -- inline mock data)
  - `src/features/reports/data/quick-cashback-refund.mock.ts`
  - `src/features/cashback/data/analytics-dictionaries.mock.ts`
  - `src/features/exec/cashback-impact/data/metric-catalog.ts`
  - `src/constants/mock-api.ts` (fake product database using `@faker-js/faker`)
  - `src/constants/data.ts` (hardcoded sample users with external image URLs)
- Impact: The application cannot display real data. Transitioning to real APIs will require restructuring every page component to separate data fetching from rendering.
- Fix approach: Introduce a data layer (API routes or server actions) and move mock data behind an adapter pattern. Each page should fetch data through a service interface that can be swapped between mock and real implementations.

**Monolithic Page Components (God Components):**
- Issue: Dashboard pages contain everything -- types, helpers, mock data, sub-components, and the main page component -- all in a single file. No separation of concerns.
- Files:
  - `src/app/dashboard/communications/page.tsx` -- 1,727 lines (types, helpers, 6+ sub-components, mock data, SVG funnel renderer, CSV export, file upload UI)
  - `src/app/dashboard/exec/cashback-impact/page.tsx` -- 1,254 lines
  - `src/app/dashboard/exec/page.tsx` -- 947 lines
  - `src/app/dashboard/cashback/page.tsx` -- 857 lines
  - `src/app/dashboard/ab-tests/page.tsx` -- 480 lines
- Impact: Files are difficult to navigate, impossible to test individual pieces, and prone to merge conflicts. Adding features requires editing massive files.
- Fix approach: Extract sub-components to `src/features/{domain}/components/`, types to `src/features/{domain}/types.ts`, helpers/utils to `src/features/{domain}/utils.ts`, and mock data to `src/features/{domain}/data/`. The `cashback-impact` feature already demonstrates this pattern partially with `src/features/exec/cashback-impact/components/` and `src/features/exec/cashback-impact/data/`.

**Duplicated Utility Functions:**
- Issue: Number and money formatting functions are redefined locally in multiple page files instead of using shared utilities.
- Files:
  - `src/app/dashboard/communications/page.tsx` -- defines `fmtNum()` (line 92), `fmtMoney()` (line 98), `pct()` (line 87)
  - `src/app/dashboard/reports/quick-cashback-refund/page.tsx` -- defines `formatMoney()` (line 33), `formatDate()` (line 37)
  - `src/lib/format.ts` -- contains a shared `formatDate()` but is only used by `src/components/ui/table/data-table-date-filter.tsx`
- Impact: Inconsistent formatting across pages. Bug fixes must be applied in multiple places.
- Fix approach: Create `src/lib/format.ts` utilities for `formatNumber()`, `formatMoney()`, `formatPercent()` with Ukrainian locale (`uk-UA`) as default. Replace all local implementations.

**Starter Template Remnants:**
- Issue: The project is forked from `next-shadcn-dashboard-starter` by Kiranism. Several files from the starter template remain unused and unrelated to the cashback analytics domain.
- Files:
  - `src/constants/mock-api.ts` -- fake product database (Electronics, Furniture, etc.) unrelated to cashback analytics
  - `src/constants/data.ts` -- sample users (Olivia Martin, Jackson Lee) with external avatar URLs from `api.slingacademy.com`
  - `src/config/infoconfig.ts` -- generic "Product Management" info content about CRUD operations
  - `src/components/forms/demo-form.tsx` -- 303-line demo form with `console.log` on submit
  - `src/components/file-uploader.tsx` -- generic file uploader component (317 lines)
  - `src/app/layout.tsx` metadata still says "Next Shadcn" / "Basic dashboard with Next.js and Shadcn"
  - `src/app/dashboard/layout.tsx` metadata says "Next Shadcn Dashboard Starter"
  - `package.json` name is `next-shadcn-dashboard-starter`
- Impact: Confusing codebase navigation. External dependencies (`@faker-js/faker`, `match-sorter`) are bundled for unused code. Misleading metadata in production.
- Fix approach: Remove unused starter files, update metadata and `package.json` name, remove `@faker-js/faker` and `match-sorter` from dependencies (or move to devDependencies if needed for development mocks).

**Stub Components:**
- Issue: Some components are empty stubs returning null, placeholder implementations with no functionality.
- Files:
  - `src/components/layout/user-nav.tsx` -- returns `null` (entire component is a no-op)
  - `src/hooks/use-nav.ts` -- `useFilteredNavItems()` returns items unchanged (no filtering logic)
  - `src/components/layout/app-sidebar.tsx` line 48-50 -- empty `useEffect` with comment "Side effects based on sidebar state changes"
- Impact: Dead code that adds confusion. Components are imported and rendered but do nothing.
- Fix approach: Either implement the intended functionality or remove the stubs entirely.

**All Dashboard Pages Are Client Components:**
- Issue: Every dashboard `page.tsx` is marked `'use client'` at the top. With mock data being static, these pages lose all Next.js SSR/SSG benefits.
- Files:
  - `src/app/dashboard/exec/page.tsx`
  - `src/app/dashboard/exec/cashback-impact/page.tsx`
  - `src/app/dashboard/cashback/page.tsx`
  - `src/app/dashboard/cashback/dictionaries/page.tsx`
  - `src/app/dashboard/communications/page.tsx`
  - `src/app/dashboard/ab-tests/page.tsx`
  - `src/app/dashboard/reports/quick-cashback-refund/page.tsx`
- Impact: Entire page JavaScript is shipped to the client. No SEO benefit. No streaming/Suspense boundaries. When real data integration happens, the architecture won't support server-side data fetching at the page level.
- Fix approach: When integrating real data, make page components server components that fetch data, and pass data to client sub-components that need interactivity.

**Dual Lockfiles:**
- Issue: Both `bun.lock` and `package-lock.json` exist in the project root.
- Files:
  - `bun.lock`
  - `package-lock.json`
- Impact: Inconsistent installs between developers using different package managers. Potential for dependency version drift.
- Fix approach: Standardize on one package manager. Remove the unused lockfile. Document the chosen package manager in README.

## Known Bugs

**`@ts-nocheck` Suppressing Type Errors:**
- Symptoms: Two UI components have `@ts-nocheck` at the top, completely disabling TypeScript checking.
- Files:
  - `src/components/ui/chart.tsx` (line 1)
  - `src/components/ui/resizable.tsx` (line 1)
- Trigger: These are likely shadcn/ui generated components that had type incompatibilities with the current TypeScript or React version.
- Workaround: The `@ts-nocheck` directive suppresses all errors in the file.

**Unsafe Type Casts (`as any`):**
- Symptoms: AB tests page casts test data `as any` to satisfy component props, bypassing type safety.
- Files:
  - `src/app/dashboard/ab-tests/page.tsx` (lines 417, 423) -- `test={test as any}`
- Trigger: The `activeTests` and `completedTests` arrays have different shapes (e.g., `winner: null` vs `winner: 'test'`), and the `TestCard` component type expects `(typeof activeTests)[0]`.
- Workaround: Cast to `any` hides the structural type mismatch.

**Docker Compose References Non-Existent Routes:**
- Symptoms: Docker compose environment variables reference Clerk auth routes (`/auth/sign-in`, `/auth/sign-up`) and redirect to `/dashboard/overview`, but no auth system is implemented and no `/dashboard/overview` route exists.
- Files:
  - `docker-compose.yml` (lines 14-17)
- Trigger: Starting the app in Docker and navigating to auth URLs will 404.
- Workaround: These environment variables are inactive since Clerk is not installed.

## Security Considerations

**Sentry `sendDefaultPii: true` in Production:**
- Risk: Sentry is configured to send Personally Identifiable Information (request headers, IP addresses) in both server and client configurations. For a financial analytics dashboard, this could leak sensitive user data to Sentry's servers.
- Files:
  - `src/instrumentation.ts` (line 11)
  - `src/instrumentation-client.ts` (line 14)
- Current mitigation: Sentry can be disabled via `NEXT_PUBLIC_SENTRY_DISABLED` environment variable.
- Recommendations: Set `sendDefaultPii: false` or carefully review what PII is acceptable to send. For a banking/fintech dashboard, this is especially sensitive.

**Sentry `tracesSampleRate: 1` (100% Sampling):**
- Risk: Every single request is traced and sent to Sentry. In production with real traffic, this will generate excessive data volume and costs, and may impact performance.
- Files:
  - `src/instrumentation.ts` (line 14)
  - `src/instrumentation-client.ts` (line 17)
- Current mitigation: None. Comments say "Adjust this value in production" but it has not been adjusted.
- Recommendations: Set `tracesSampleRate` to 0.1-0.2 for production. Use `tracesSampler` function for finer control.

**No Authentication or Authorization:**
- Risk: The dashboard has no auth layer. Any user can access any dashboard page. Docker compose references Clerk configuration but Clerk is not installed or integrated.
- Files:
  - `src/proxy.ts` -- middleware that does nothing (returns `NextResponse.next()`)
  - `docker-compose.yml` (lines 13-17) -- dead Clerk environment variables
  - No middleware.ts file exists
- Current mitigation: None. The app is wide open.
- Recommendations: Implement authentication before deploying with real financial data. The `src/proxy.ts` file appears to be a placeholder for middleware -- rename to `middleware.ts` and add auth guards.

**`dangerouslySetInnerHTML` Usage:**
- Risk: Inline script injection in the root layout for theme detection.
- Files:
  - `src/app/layout.tsx` (line 40) -- theme color meta tag script
  - `src/components/ui/chart.tsx` (line 85) -- chart CSS injection
- Current mitigation: The injected content is hardcoded strings, not user input.
- Recommendations: Low risk since no user input is interpolated, but worth noting for security audits.

**External Image Domains:**
- Risk: `next.config.ts` allows images from `api.slingacademy.com`, an external sample data API. This is a starter template remnant.
- Files:
  - `next.config.ts` (lines 8-13)
  - `src/constants/data.ts` -- references `api.slingacademy.com` for avatar images
- Current mitigation: None.
- Recommendations: Remove the external domain from `remotePatterns` when starter template remnants are cleaned up.

## Performance Bottlenecks

**Large Client-Side JavaScript Bundles:**
- Problem: All dashboard pages are `'use client'` with hundreds of lines of inline mock data, meaning all data is shipped as JavaScript to the browser.
- Files: All `src/app/dashboard/**/page.tsx` files.
- Cause: No code splitting within pages. Mock data arrays (some 200+ lines) are bundled into client JavaScript.
- Improvement path: Move static data to server components or API routes. Use dynamic imports for heavy sub-components. Split large pages into smaller client boundary components.

**Recharts Bundle Size:**
- Problem: Multiple pages import large subsets of Recharts components. Recharts is a heavy charting library.
- Files:
  - `src/app/dashboard/exec/page.tsx` -- imports AreaChart, BarChart, LineChart, etc.
  - `src/app/dashboard/exec/cashback-impact/page.tsx` -- imports BarChart, LineChart, ScatterChart, etc.
  - `src/app/dashboard/ab-tests/page.tsx` -- imports BarChart
- Cause: Multiple chart types imported across pages. No lazy loading of chart components.
- Improvement path: Lazy load chart sections with `React.lazy()` or `next/dynamic`. Consider lighter charting alternatives for simpler visualizations.

**No Data Caching Strategy:**
- Problem: When real API integration happens, there is no caching layer planned (no React Query, no SWR, no Next.js cache configuration).
- Files: N/A -- no data fetching exists yet.
- Cause: Prototype phase -- all data is static mock.
- Improvement path: Adopt a data fetching library (TanStack Query or SWR) when integrating real APIs. Configure Next.js fetch cache for server components.

## Fragile Areas

**Communications Page:**
- Files: `src/app/dashboard/communications/page.tsx` (1,727 lines)
- Why fragile: This single file contains 6+ React components, SVG rendering logic, CSV export, file upload simulation, channel statistics aggregation, batch management state, and all UI rendering. Any change risks breaking unrelated functionality.
- Safe modification: Extract components first. Test each extracted component in isolation.
- Test coverage: Zero tests.

**Inline Tooltip Components:**
- Files:
  - `src/app/dashboard/exec/page.tsx` (lines 261-360) -- 5 different tooltip components
  - `src/app/dashboard/exec/cashback-impact/page.tsx` (lines 456-590) -- 6+ tooltip components
  - `src/app/dashboard/ab-tests/page.tsx` (lines 57-69)
- Why fragile: Every chart has its own tooltip component defined inline with `any` typed props. They all follow the same pattern but are copy-pasted and slightly modified.
- Safe modification: Create a generic `ChartTooltip` component that accepts a config for which fields to display.
- Test coverage: Zero tests.

**Mock Data Coupled to UI:**
- Files: All dashboard page files.
- Why fragile: Mock data shapes are tightly coupled to component rendering logic. Changing a data field name requires finding all rendering references in the same 800-1700 line file.
- Safe modification: Extract types to separate files. Use TypeScript strict mode to catch shape mismatches.
- Test coverage: Zero tests.

## Scaling Limits

**Single-File Page Architecture:**
- Current capacity: Works for prototype/wireframe phase with 6-8 dashboard pages.
- Limit: Adding more features (filters, drill-downs, comparisons) to existing pages will push already-large files past maintainability limits.
- Scaling path: Adopt feature-based folder structure (partially started in `src/features/`) for all pages. Each page should be a thin orchestrator importing feature components.

## Dependencies at Risk

**`@faker-js/faker` in Production Dependencies:**
- Risk: `@faker-js/faker` is listed in `devDependencies` but is imported by `src/constants/mock-api.ts` which could be bundled into production. It is a large library (~6MB unpacked).
- Impact: Increased bundle size if tree-shaking doesn't eliminate it completely.
- Migration plan: Move mock data that uses faker to a development-only module, or remove the dependency entirely and use static seed data.

**`kbar` at Beta Version:**
- Risk: `kbar` is pinned at `^0.1.0-beta.45`, a pre-release version. Beta APIs may change without following semver.
- Impact: Updating dependencies could break the command palette functionality.
- Migration plan: Monitor for stable 1.0 release. Pin exact version to avoid surprise breakage.

## Missing Critical Features

**No Authentication System:**
- Problem: No user authentication, authorization, or session management exists.
- Blocks: Cannot deploy with real financial data. Cannot implement role-based access (the nav config suggests multiple roles: "Top Management", "Product Manager").

**No Real Data Integration Layer:**
- Problem: No API routes, server actions, database connections, or external service integrations exist.
- Blocks: The application cannot display real data. Every page needs a data source implementation.

**No Error Boundaries Per Page:**
- Problem: Only a global error boundary exists (`src/app/global-error.tsx`). Individual dashboard pages have no error boundaries.
- Blocks: A rendering error in one chart crashes the entire page rather than showing a fallback for just that section.

## Test Coverage Gaps

**Zero Test Files:**
- What's not tested: The entire codebase. There are no test files (`.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`) anywhere in the project. No test configuration (jest.config, vitest.config) exists.
- Files: All `src/**/*.ts` and `src/**/*.tsx` files.
- Risk: Any refactoring (especially the critical task of splitting monolithic page components) could silently break functionality with no safety net.
- Priority: High -- establish testing infrastructure and add tests for utility functions and key components before any major refactoring.

**No Linting CI/CD Pipeline:**
- What's not tested: No GitHub Actions or CI pipeline exists (`.github/` only contains `FUNDING.yml`). Lint and build checks only run locally via husky pre-commit hooks.
- Files: `.github/FUNDING.yml` (no workflow files)
- Risk: Contributors who skip hooks (`--no-verify`) can push broken code. No automated quality gates on PRs.
- Priority: Medium -- add a basic CI workflow with `lint`, `type-check`, and `build` steps.

---

*Concerns audit: 2026-03-10*
