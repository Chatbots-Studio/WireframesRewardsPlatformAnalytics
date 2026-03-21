# External Integrations

**Analysis Date:** 2026-03-21

## APIs & External Services

**Error Tracking:**
- Sentry - Application error tracking, session replay, performance monitoring
  - SDK/Client: `@sentry/nextjs` 10.39.0
  - Server init: `src/instrumentation.ts` (Node.js + Edge runtimes)
  - Client init: `src/instrumentation-client.ts` (browser with replay integration)
  - Global error handler: `src/app/global-error.tsx`
  - Build plugin: `@sentry/webpack-plugin` 5.0.0 (source map upload)
  - Auth: `SENTRY_AUTH_TOKEN` (build-time only, for source maps)
  - Config: `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ORG`, `NEXT_PUBLIC_SENTRY_PROJECT`
  - Toggle: `NEXT_PUBLIC_SENTRY_DISABLED` - set to disable Sentry entirely
  - Tunnel route: `/monitoring` (bypasses ad-blockers via Next.js rewrite in `next.config.ts`)
  - Features enabled: Session replay (10% sample, 100% on error), tracing (100% sample), PII collection, component annotations

**Image/Avatar Service:**
- Sling Academy API (`api.slingacademy.com`) - Sample user profile images and product photos
  - Used in: `src/constants/data.ts` (user avatars), `src/constants/mock-api.ts` (product images)
  - Pattern: `https://api.slingacademy.com/public/sample-users/{id}.png`
  - Pattern: `https://api.slingacademy.com/public/sample-products/{id}.png`
  - Configured in: `next.config.ts` remotePatterns
  - Note: Demo/placeholder images only - not a production dependency

## Data Storage

**Databases:**
- None - No database client, ORM, or database connection configured
- All data is mock/hardcoded:
  - `src/constants/mock-api.ts` - Fake product data generated with `@faker-js/faker`
  - `src/constants/data.ts` - Static sample user/sales data
  - `src/features/exec/cashback-impact/data/metric-catalog.ts` - Static metric definitions
  - `src/features/cashback/data/analytics-dictionaries.mock.ts` - Static analytics data sources and product dictionary
  - `src/features/reports/data/quick-cashback-refund.mock.ts` - Static fraud report data
  - Dashboard pages contain inline mock chart data (e.g., `src/app/dashboard/exec/page.tsx`, `src/app/dashboard/exec/cashback-impact/page.tsx`)

**File Storage:**
- Local filesystem only (public assets in `public/`)

**Caching:**
- Browser cookies for:
  - Theme preference (via `src/components/themes/active-theme.tsx`)
  - Locale preference (NEXT_LOCALE cookie via `src/i18n/request.ts`)
- Next.js built-in caching (ISR, static generation)
- No Redis, Memcached, or external caching layer

## Authentication & Identity

**Auth Provider:**
- Clerk (planned/partially configured) - NOT actively used in code
  - No Clerk SDK installed in `package.json`
  - No Clerk imports found in source code
  - No middleware for auth protection (`src/proxy.ts` is a pass-through)
  - Redirect URLs configured in `docker-compose.yml` environment:
    - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in`
    - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up`
    - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard/overview`
    - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard/overview`
  - Comment in docker-compose: "keyless mode -- no API keys required"
  - Status: URLs defined but no auth enforcement - app is fully open

**Current State:**
- No authentication middleware
- No protected routes
- `src/proxy.ts` defines a matcher but returns `NextResponse.next()` unconditionally

## Monitoring & Observability

**Error Tracking:**
- Sentry (detailed above)
  - Server-side: Node.js and Edge runtime instrumentation
  - Client-side: Browser SDK with session replay
  - Global error boundary: `src/app/global-error.tsx`

**Performance Monitoring:**
- Sentry Tracing with `tracesSampleRate: 1` (100% of transactions sampled)
- Sentry `captureRouterTransitionStart` for client navigation tracking

**Logs:**
- `console` only - No structured logging framework
- ESLint rule `no-console: warn` discourages console usage

**Analytics:**
- Next.js telemetry disabled (`NEXT_TELEMETRY_DISABLED=1` in `Dockerfile` and `docker-compose.yml`)
- No user analytics SDK (no Google Analytics, Mixpanel, Amplitude, etc.)

## CI/CD & Deployment

**Hosting:**
- Docker container (platform-agnostic)
- Multi-stage Dockerfile: `Dockerfile`
  - Stage 1 (deps): `node:22-alpine` + `npm ci --legacy-peer-deps`
  - Stage 2 (builder): Build with Sentry disabled
  - Stage 3 (runner): Standalone Next.js server, non-root user (nextjs:1001)
- Docker Compose: `docker-compose.yml`
  - Service name: `wareframes-statistic`
  - Port: 3000
  - Health check configured
  - Restart policy: `unless-stopped`

**CI Pipeline:**
- GitHub-hosted repository
- No CI config detected (no `.github/workflows/`, no `Jenkinsfile`, no `.gitlab-ci.yml`)
- Vercel configuration present (`.vercelignore`) - Vercel deployment support likely

## Environment Configuration

**Required env vars (production):**
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry data source name (for error collection)
- `SENTRY_AUTH_TOKEN` - Build-time only (source map upload to Sentry)
- `NEXT_PUBLIC_SENTRY_ORG` - Sentry organization slug
- `NEXT_PUBLIC_SENTRY_PROJECT` - Sentry project slug

**Optional env vars:**
- `NEXT_PUBLIC_SENTRY_DISABLED` - Set to `true` to fully disable Sentry
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Clerk sign-in page path
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Clerk sign-up page path
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Post-login redirect
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Post-signup redirect
- `NEXT_TELEMETRY_DISABLED` - Disable Next.js telemetry

**Secrets location:**
- `.env` / `.env.local` files (gitignored via `.gitignore`)
- `env.example.txt` serves as the template (NOT `.env.example`)
- Docker Compose loads from `.env.local` and `.env` (both optional)

## Webhooks & Callbacks

**Incoming:**
- None - No API routes (`src/app/api/`) exist
- Sentry tunnel at `/monitoring` (Next.js rewrite, not a webhook)

**Outgoing:**
- None - No outbound webhook configurations

## API Routes

**None** - The application has no `route.ts` or `route.tsx` files. All pages are client-rendered dashboard views consuming static/mock data. No backend API layer exists.

## Third-Party Font Services

**Google Fonts (via `next/font/google`):**
- 11 font families loaded in `src/components/themes/font.config.ts`:
  - Geist (primary sans), Geist Mono (primary mono)
  - Instrument Sans, Inter, Mulish, DM Sans, Outfit (additional sans options)
  - Noto Sans Mono, Fira Code, Space Mono (additional mono options)
  - Architects Daughter (display/handwriting)
- Self-hosted at build time via Next.js font optimization (no runtime requests to Google)

## Internationalization Integration

**i18n Framework:**
- next-intl 4.8.3
- Supported locales: `en` (English), `uk` (Ukrainian)
- Default locale: `en`
- Configuration: `src/i18n/config.ts`
- Server-side message loading: `src/i18n/request.ts`
- Locale detection:
  1. Check NEXT_LOCALE cookie (set via cookie store)
  2. Fall back to defaultLocale if cookie not found or invalid
- Message files: `messages/{locale}.json`
  - `messages/en.json` - English translations
  - `messages/uk.json` - Ukrainian translations
- Client-side translations: `useTranslations()` hook from next-intl
- Server-side translations: `getTranslations()` function from next-intl
- Navigation: Locale switcher component changes locale via cookie and page refresh

---

*Integration audit: 2026-03-21*
