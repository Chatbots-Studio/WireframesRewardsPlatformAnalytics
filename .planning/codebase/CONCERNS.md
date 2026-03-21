# Codebase Concerns

**Analysis Date:** 2026-03-21

## Tech Debt

**Monolithic Page Components:**
- Issue: Large dashboard page components (1914 lines, 1252 lines, 981 lines) bundle business logic, calculations, rendering, and mock data together
- Files:
  - `src/app/dashboard/communications/page.tsx` (1914 lines)
  - `src/app/dashboard/exec/cashback-impact/page.tsx` (1252 lines)
  - `src/app/dashboard/exec/page.tsx` (981 lines)
  - `src/app/dashboard/cashback/page.tsx` (860 lines)
- Impact: Difficult to test, refactor, or reuse components. Makes debugging complex analytics logic harder. Performance optimization blocked by tight coupling.
- Fix approach: Extract calculation functions to separate utility modules (`src/features/communications/utils/stats.ts`), extract render components to feature directory (`src/features/communications/components/`), separate mock data to isolated files

**Mock Data Embedded in Pages:**
- Issue: Large mock datasets defined inline within page components (MOCK_BATCHES, ROI_CATEGORIES, etc.)
- Files: `src/app/dashboard/communications/page.tsx` (lines 250-477), `src/app/dashboard/exec/cashback-impact/page.tsx` (lines 47-350)
- Impact: Cannot easily swap real API data. Makes component testing with different data scenarios difficult. Increases page component size.
- Fix approach: Move all MOCK_* constants to `src/features/[feature]/data/` directory with feature-specific files like existing `analytics-dictionaries.mock.ts`

**Inline Calculation Logic:**
- Issue: Complex metric calculations (revenue aggregation, channel stats, KPI computations) defined directly in components with nested loops and map operations
- Files:
  - `src/app/dashboard/communications/page.tsx` (batchStats, getChannelStats, pct, fmtNum, fmtMoney functions at lines 91-247)
  - `src/app/dashboard/exec/cashback-impact/page.tsx` (metric aggregation logic)
- Impact: Hard to unit test. Performance issues if data grows (O(n²) in channel stats calculation). No reuse across pages.
- Fix approach: Extract to `src/features/communications/utils/stats.ts` and `src/features/exec/utils/metrics.ts`, write unit tests for each calculation function

**Hardcoded Color Mappings:**
- Issue: Channel colors and chart colors hardcoded as constants within components
- Files:
  - `src/app/dashboard/communications/page.tsx` (CHANNEL_COLORS, BATCH_COLORS at lines 203-234)
  - Multiple chart pages
- Impact: Difficult to implement theme switching or dark mode adjustments. Duplication across files.
- Fix approach: Move to `src/lib/chart-theme.ts`, centralize color management using CSS variables

**Locale Switching Causes Full Page Reload:**
- Issue: `window.location.reload()` used in `LocaleSwitcher` component to switch languages
- Files: `src/components/locale-switcher.tsx` (line 23)
- Impact: Loss of user state, focus position, scroll position. Poor UX on slow networks. Cannot preserve client-side state like form data or filter selections.
- Fix approach: Use Next.js router.push() with locale prefix pattern, implement proper next-intl language switching without full page reload

---

## Known Bugs

**LocaleSwitcher Full Reload Loses User State:**
- Symptoms: When user switches language via button, entire page reloads. Any unsaved form data, scroll position, or filter selections are lost.
- Files: `src/components/locale-switcher.tsx`
- Trigger: Click locale button (flag icon) in header
- Workaround: None - user must manually navigate back
- Root cause: `window.location.reload()` at line 23 forces full page refresh instead of using proper routing

**Sentry Configuration Incomplete:**
- Symptoms: Sentry error tracking is non-functional without environment setup
- Files: `next.config.ts` (lines 27-29)
- Trigger: Any error in production, or checking error tracking dashboard
- Workaround: Set `NEXT_PUBLIC_SENTRY_DISABLED=true` to disable Sentry
- Notes: FIXME comment in code indicates developer awareness of incomplete setup

---

## Security Considerations

**dangerouslySetInnerHTML Usage:**
- Risk: Potential XSS vulnerability if content becomes user-controlled
- Files:
  - `src/app/layout.tsx` (line 45-54) - Theme color meta tag script (LOW RISK - static hardcoded string)
  - `src/components/ui/chart.tsx` (line 85) - Chart context CSS injection (LOW RISK - static string)
- Current mitigation: Both instances use only static strings, no user input interpolation
- Recommendations: Add ESLint rule to catch future uses. Document why necessary. For layout.tsx, consider using CSS custom properties instead

**External Image Source Allowlisting:**
- Risk: Remote image domains could be exploited
- Files: `next.config.ts` (lines 9-15) - Allows `api.slingacademy.com`
- Current mitigation: Whitelist approach prevents arbitrary image loading
- Recommendations: Audit before adding new external domains. Prioritize removing test/demo domains before production

**No Input Validation on File Upload:**
- Risk: File upload accepts any file type at client level with no server-side verification
- Files: `src/components/file-uploader.tsx` (line 69-77 - maxSize and acceptedTypes only)
- Current mitigation: Client-side checks only
- Recommendations: When connected to real backend, implement server-side file type validation, size limits, malware scanning

---

## Performance Bottlenecks

**Channel Stats Calculation is O(n²):**
- Problem: `getChannelStats()` filters entire dataset multiple times per channel iteration
- Files: `src/app/dashboard/communications/page.tsx` (lines 133-201)
- Cause: For each channel, code filters all rows (O(n)), then filters again for lift data, then reduces multiple times - repeating work per channel
- Benchmark: With 50 batches × 10 campaigns each = 500 rows, O(n²) means 250,000 operations per render
- Improvement path: Single pass through data with `Map<channel, stats>`. Pre-compute aggregations instead of repeated filtering

**Large Component Re-renders:**
- Problem: 1900+ line page components likely re-render entire subtree on minimal state changes
- Files: `src/app/dashboard/communications/page.tsx`, `src/app/dashboard/exec/cashback-impact/page.tsx`
- Cause: No component boundaries. Multiple useState hooks without useCallback or React.memo. No memoization of sub-components.
- Impact: When user selects batch, entire page with all charts re-renders
- Improvement path: Extract sections to memoized components, wrap event handlers with useCallback, use virtualization for long tables

**UI Component Bundle Overhead:**
- Problem: Large number of UI component imports (shadows, dropdowns, menus, tables, etc.) from Shadcn/UI in communications page
- Files: `src/app/dashboard/communications/page.tsx` (lines 1-53)
- Cause: 50+ imports for UI components, many potentially unused in current view
- Impact: Initial page load delay
- Improvement path: Lazy load less-critical UI components, analyze actual usage vs imports

---

## Fragile Areas

**Communications Page - Massive State Management:**
- Files: `src/app/dashboard/communications/page.tsx` (entire 1914-line file)
- Why fragile: Multiple useState hooks managing selectedBatches, expandedRows, sortColumn, plus inline state mutations. No clear state flow. Business logic (calculations) intertwined with UI rendering.
- Safe modification: Before changes, extract state management to custom hook (useCommsBatchState), add unit tests for calculations
- Test coverage: Zero tests. No test file exists.

**Data Table Hook with Complex State Integration:**
- Files: `src/hooks/use-data-table.ts` (296 lines)
- Why fragile: Complex integration between React Table, nuqs query state, pagination, sorting, filtering. Manages 7+ interdependent state variables. Easy to introduce bugs in combo scenarios (pagination + sorting + filtering).
- Safe modification: Add integration tests for all state combinations. Document state flow diagram.
- Test coverage: No tests

**Metric Catalog - Large Unvalidated Data:**
- Files: `src/features/exec/cashback-impact/data/metric-catalog.ts` (471 lines)
- Why fragile: Flat array of metric objects with no schema validation. Adding/modifying metrics requires careful manual verification. No TypeScript enforcement of required fields.
- Safe modification: Add Zod schema for runtime validation of metric structure
- Test coverage: No validation tests

---

## Scaling Limits

**Mock Data Cannot Scale Beyond Prototype:**
- Current capacity: ~40-50 mock communication batches and campaigns (500 rows). Calculations complete instantly.
- Limit: Beyond 500 rows, O(n²) calculations noticeably slow (1ms → 10ms+). UI responsiveness degrades.
- Scaling path: Integrate real API. Move calculations to backend. Implement pagination. Use caching (React Query/SWR).

**Page Component File Size at Ceiling:**
- Current capacity: 1914 lines is maximum maintainable size for single component
- Limit: Adding new analytics pages or features will push files beyond 2000 lines. Merge conflicts increase. Developer onboarding gets harder.
- Scaling path: Extract features to separate modules NOW before adding more pages. Establish feature structure: `src/features/{feature}/components/`, `src/features/{feature}/utils/`, `src/features/{feature}/data/`

**Translation Key Organization:**
- Current capacity: ~479 flat translation keys per language
- Limit: As dashboard grows to 15+ pages, flat key structure causes collisions and naming confusion
- Scaling path: Move to namespaced keys: `pages.dashboard.communications.channelStats` instead of `channelStats`

---

## Dependencies at Risk

**Sentry Configuration Incomplete:**
- Risk: Error tracking and monitoring disabled in production
- Impact: Production errors go untraced. Cannot diagnose customer issues.
- Fix timeline: Set environment variables (`NEXT_PUBLIC_SENTRY_ORG`, `NEXT_PUBLIC_SENTRY_PROJECT`) before deployment
- Migration: Test Sentry setup in staging with manual error triggers

**next-intl Locale Switching Pattern Non-Standard:**
- Risk: Using `window.location.reload()` is not idiomatic for next-intl. May conflict with future updates.
- Impact: Poor UX. State loss. Blocks client-side state preservation.
- Migration path: Use next-intl's recommended locale switching with router navigation and proper cache invalidation

**Recharts Multiple Instance Loading:**
- Risk: 5+ chart components in single page with large datasets
- Impact: Page responsiveness degrades as dataset size grows
- Migration: Implement lazy loading with React.lazy() or next/dynamic. Profile bundle size with @next/bundle-analyzer.

---

## Missing Critical Features

**No Error Boundaries:**
- Problem: Only global error boundary exists (`src/app/global-error.tsx`). Dashboard pages have no per-section error boundaries.
- Blocks: Chart rendering error crashes entire page instead of showing fallback
- Recommendation: Add `<ErrorBoundary>` wrapper around major sections (charts, tables)

**No Loading/Skeleton States:**
- Problem: Mock data loads instantly. No loading UI skeleton or shimmer effects defined.
- Blocks: When real API is added, users will see blank page until data loads
- Recommendation: Create skeleton components for table rows, chart placeholders before API integration

**No Authentication/Authorization:**
- Problem: No auth system, role-based access, or session management
- Blocks: Cannot deploy with real financial data. Navigation suggests multiple roles ("Top Management", "Product Manager") but no role enforcement exists.
- Recommendation: Critical before production deployment

---

## Test Coverage Gaps

**Zero Unit Tests:**
- What's not tested:
  - Calculation functions: `batchStats()`, `getChannelStats()`, `pct()`, `fmtNum()`, `fmtMoney()`
  - KPI aggregation logic in exec pages
  - Metric catalog data structure validation
  - Data table state transitions (pagination, sorting, filtering)
- Files:
  - `src/app/dashboard/communications/page.tsx`
  - `src/app/dashboard/exec/cashback-impact/page.tsx`
  - `src/features/exec/cashback-impact/data/metric-catalog.ts`
  - `src/hooks/use-data-table.ts`
- Risk: Critical business logic (numbers shown to executives) has no validation. Silent data corruption possible.
- Priority: **HIGH** - Business logic must be tested before real data deployment

**No Component Integration Tests:**
- What's not tested:
  - Batch selection state changes + chart updates
  - Data table pagination + sorting + filtering combinations
  - Locale switching doesn't break rendered content
  - File upload state management
- Files: All dashboard pages
- Risk: UI regressions unnoticed. Complex state combinations work locally but fail in production.
- Priority: **MEDIUM** - Add before deploying new features

**No E2E Tests:**
- What's not tested: Full user flows (select batch → see stats → export CSV), filter interactions, locale switching
- Risk: Manual testing only. Regression testing is manual.
- Priority: **MEDIUM** - Establish framework (Playwright/Cypress) before scaling to more pages

---

*Concerns audit: 2026-03-21*
