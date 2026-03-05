/**
 * Chart palette — CSS variable references.
 *
 * All values are `var(--...)` strings so they resolve at render time
 * using the currently active theme. Pass these directly as `fill` or
 * `stroke` props on any Recharts element — modern browsers resolve
 * CSS custom properties inside SVG presentation attributes.
 *
 * Tokens are defined per-theme in `src/styles/themes/*.css` and fall
 * back to sensible defaults declared in `src/styles/theme.css :root`.
 */
export const chartPalette = {
  // ── Primary series (brand color, 4 tints dark→light) ──────────────
  primary: 'var(--chart-primary)',
  primaryLight: 'var(--chart-primary-light)',
  primaryLighter: 'var(--chart-primary-lighter)',
  primaryLightest: 'var(--chart-primary-lightest)',

  // ── Semantic ───────────────────────────────────────────────────────
  success: 'var(--chart-success)',
  warning: 'var(--chart-warning)',
  danger: 'var(--chart-danger)',

  // ── Neutral series (muted, 4 tints dark→light) ─────────────────────
  neutral: 'var(--chart-neutral)',
  neutralLight: 'var(--chart-neutral-light)',
  neutralLighter: 'var(--chart-neutral-lighter)',
  neutralLightest: 'var(--chart-neutral-lightest)',

  // ── Generic chart slots (theme-defined) ────────────────────────────
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)'
} as const;

export type ChartPaletteKey = keyof typeof chartPalette;

/**
 * Returns a unique SVG gradient id string for a given palette key.
 * Ensures gradient ids don't collide across multiple charts on the page.
 */
export function chartGradientId(
  key: ChartPaletteKey | string,
  suffix?: string
): string {
  return suffix ? `chart-gradient-${key}-${suffix}` : `chart-gradient-${key}`;
}
