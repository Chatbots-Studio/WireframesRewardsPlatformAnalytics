# Technology Stack

**Analysis Date:** 2026-03-10

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- JavaScript (CommonJS) - Legacy config files (`postcss.config.js`)
- CSS 4 - Styling via Tailwind CSS v4 (`src/styles/**/*.css`)

## Runtime

**Environment:**
- Node.js 22 (Alpine) - Specified in `Dockerfile` (`node:22-alpine`)

**Package Manager:**
- npm - Primary (used in `Dockerfile` with `npm ci --legacy-peer-deps`)
- Bun - Secondary lockfile present (`bun.lock` exists alongside `package-lock.json`)
- Lockfiles: Both `package-lock.json` and `bun.lock` present and committed

## Frameworks

**Core:**
- Next.js 16.1.6 (`next` ^16.1.6) - App Router, React Server Components enabled
- React 19.2.0 (`react`, `react-dom` ^19.2.0) - UI rendering
- Tailwind CSS 4.2.1 (`tailwindcss` ^4.2.1) - Utility-first CSS via PostCSS plugin

**UI Component System:**
- shadcn/ui (new-york style) - Pre-built Radix-based components (`components.json`, `src/components/ui/`)
- Radix UI - Headless primitives (25+ `@radix-ui/react-*` packages)
- class-variance-authority 0.7.1 - Component variant management

**Build/Dev:**
- PostCSS 8.5.6 with `@tailwindcss/postcss` plugin (`postcss.config.js`)
- lightningcss 1.31.1 - CSS minification/transformation
- ESLint 9.39.3 - Flat config (`eslint.config.mjs`)
- Prettier 3.8.1 with `prettier-plugin-tailwindcss` - Code formatting
- Husky 9.1.7 + lint-staged 16.2.7 - Pre-commit hooks (`package.json` "prepare" script)

**Testing:**
- No test framework installed. No test runner config files found. `@faker-js/faker` 10.3.0 is a devDependency used for mock data generation, not testing.

## Key Dependencies

**Critical (Core Functionality):**
- `recharts` 3.7.0 - All dashboard charts (BarChart, LineChart, AreaChart, ScatterChart) - Used extensively across exec and cashback-impact pages
- `@tanstack/react-table` 8.21.2 - Data tables with sorting, filtering, pagination (`src/components/ui/table/data-table*.tsx`)
- `react-hook-form` 7.54.1 + `@hookform/resolvers` 5.2.1 - Form management (`src/components/forms/`)
- `zod` 4.1.8 - Schema validation (form validation, data parsing)
- `zustand` 5.0.2 - Client state management (installed but not actively imported in source)
- `nuqs` 2.4.1 - Type-safe URL search params (`src/lib/searchparams.ts`, root layout `NuqsAdapter`)

**UI Enhancement:**
- `kbar` 0.1.0-beta.45 - Command palette / Cmd+K search (`src/components/kbar/`)
- `sonner` 2.0.7 - Toast notifications (`src/components/ui/sonner.tsx`)
- `motion` 12.34.3 - Animations (Framer Motion successor)
- `vaul` 1.1.2 - Drawer component (`src/components/ui/drawer.tsx`)
- `cmdk` 1.1.1 - Command menu primitive (`src/components/ui/command.tsx`)
- `next-themes` 0.4.6 - Dark/light/system theme switching (`src/components/themes/`)
- `nextjs-toploader` 3.7.15 - Route change progress bar
- `@tabler/icons-react` 3.31.0 + `lucide-react` 0.575.0 - Icon libraries (dual icon sets)
- `react-day-picker` 9.13.2 + `date-fns` 4.1.0 - Calendar/date picker
- `react-dropzone` 15.0.0 - File upload (`src/components/file-uploader.tsx`)
- `react-resizable-panels` 4.6.5 - Resizable panel layout (`src/components/ui/resizable.tsx`)
- `react-responsive` 10.0.0 - Media query hooks
- `@dnd-kit/*` - Drag and drop (core 6.3.1, sortable 10.0.0, modifiers 9.0.0, utilities 3.2.2)

**Infrastructure:**
- `@sentry/nextjs` 10.39.0 + `@sentry/webpack-plugin` 5.0.0 - Error tracking and monitoring
- `sharp` 0.34.5 - Image optimization (Next.js image processing)
- `match-sorter` 8.0.0 - Fuzzy search/filtering in mock API (`src/constants/mock-api.ts`)
- `uuid` 13.0.0 - Unique ID generation

**Styling Utilities:**
- `clsx` 2.1.1 + `tailwind-merge` 3.0.2 - Class name merging via `cn()` helper (`src/lib/utils.ts`)
- `tailwindcss-animate` 1.0.7 + `tw-animate-css` 1.2.4 - Animation utilities

## Configuration

**TypeScript:**
- Config: `tsconfig.json`
- Target: ES5, Module: ESNext, Strict mode enabled
- Path aliases: `@/*` -> `./src/*`, `~/*` -> `./public/*`
- JSX: react-jsx, Incremental compilation enabled

**Next.js:**
- Config: `next.config.ts`
- Output: `standalone` (optimized for Docker deployment)
- Sentry integration conditionally enabled (disabled when `NEXT_PUBLIC_SENTRY_DISABLED` is set)
- Remote image patterns: `api.slingacademy.com` (sample user avatars)
- Transpile packages: `geist` (font package)
- Sentry tunnel route: `/monitoring`

**shadcn/ui:**
- Config: `components.json`
- Style: `new-york`
- RSC: enabled
- CSS variables: enabled
- Base color: zinc
- Component alias: `@/components`, Utils alias: `@/lib/utils`

**ESLint:**
- Config: `eslint.config.mjs` (flat config format)
- Extends: `eslint-config-next/core-web-vitals`
- TypeScript plugin with parser
- Key rules: `no-console: warn`, `@typescript-eslint/no-unused-vars: warn`, `react-hooks/exhaustive-deps: warn`

**Prettier:**
- Plugin: `prettier-plugin-tailwindcss` for class sorting

**Environment:**
- Template: `env.example.txt` (Sentry-only configuration)
- Required env vars documented in `env.example.txt`:
  - `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking
  - `NEXT_PUBLIC_SENTRY_ORG` - Sentry organization
  - `NEXT_PUBLIC_SENTRY_PROJECT` - Sentry project name
  - `SENTRY_AUTH_TOKEN` - Source map upload authentication
  - `NEXT_PUBLIC_SENTRY_DISABLED` - Toggle Sentry on/off
- Clerk auth redirect URLs defined in `docker-compose.yml` environment section
- `.env*` files gitignored

**Theming:**
- Custom theme system with cookie-based persistence
- Default theme: `42flows` (`src/components/themes/theme.config.ts`)
- Theme CSS files: `src/styles/themes/42flows.css`, `src/styles/theme.css`
- 11 Google Fonts loaded via `next/font/google` (`src/components/themes/font.config.ts`)
- Chart color palette via CSS custom properties (`src/lib/chart-theme.ts`)

## Platform Requirements

**Development:**
- Node.js 22+
- npm (with `--legacy-peer-deps` flag needed for install)
- Ports: 3000 (default Next.js dev server)

**Production:**
- Docker containerized deployment (`Dockerfile` - multi-stage build)
- `docker-compose.yml` for orchestration
- Node.js 22 Alpine runtime
- Standalone Next.js output
- Port 3000 exposed
- Health check: `wget -qO- http://localhost:3000/`

---

*Stack analysis: 2026-03-10*
