'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus
} from '@tabler/icons-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { chartPalette, chartGradientId } from '@/lib/chart-theme';

// ─── Palette ────────────────────────────────────────────────
const C = {
  active: chartPalette.primary,
  noProgram: chartPalette.neutral,
  revenue: chartPalette.primary,
  accrued: chartPalette.primaryLighter,
  paid: chartPalette.neutral,
  balance: chartPalette.neutralLight,
  roi: chartPalette.primary,
  interchange: chartPalette.primary,
  commission: chartPalette.primaryLight,
  credit: chartPalette.primaryLighter,
  other: chartPalette.primaryLightest
};

// ─── Mock data ───────────────────────────────────────────────

const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

// 1. Active clients
const activeTrend = [
  { month: 'Sep', active: 18200 },
  { month: 'Oct', active: 21000 },
  { month: 'Nov', active: 24500 },
  { month: 'Dec', active: 27000 },
  { month: 'Jan', active: 31000 },
  { month: 'Feb', active: 34800 }
];

// 2. Turnover (K ₴)
const turnoverTrend = [
  { month: 'Sep', withCashback: 52780, noCashback: 46200 },
  { month: 'Oct', withCashback: 67200, noCashback: 45990 },
  { month: 'Nov', withCashback: 85750, noCashback: 45780 },
  { month: 'Dec', withCashback: 99900, noCashback: 45395 },
  { month: 'Jan', withCashback: 122450, noCashback: 45100 },
  { month: 'Feb', withCashback: 146160, noCashback: 44850 }
];

// 3. ROI and costs — by month (K ₴)
// revenue = actual revenue from financial system for active clients
// accrued = accrued cashback (bank expense)
// paid    = actually paid out (less than accrued — not everyone withdraws)
// balance = accrued - paid = balance on client accounts
const roiTable = [
  {
    month: 'Sep',
    revenue: 2690,
    accrued: 2200,
    paid: 1496,
    balance: 704,
    roi: 122
  },
  {
    month: 'Oct',
    revenue: 3410,
    accrued: 2520,
    paid: 1714,
    balance: 806,
    roi: 135
  },
  {
    month: 'Nov',
    revenue: 4340,
    accrued: 2870,
    paid: 1952,
    balance: 918,
    roi: 151
  },
  {
    month: 'Dec',
    revenue: 5090,
    accrued: 3200,
    paid: 2176,
    balance: 1024,
    roi: 159
  },
  {
    month: 'Jan',
    revenue: 6360,
    accrued: 3670,
    paid: 2496,
    balance: 1174,
    roi: 173
  },
  {
    month: 'Feb',
    revenue: 7560,
    accrued: 4060,
    paid: 2761,
    balance: 1299,
    roi: 186
  }
];
// Note: ROI = revenue / accrued * 100 (based on accrued — conservative estimate)

// 4. Revenue per client (₴/month — actual from financial system)
const revenuePerClient = [
  { month: 'Sep', withCashback: 148, noCashback: 96 },
  { month: 'Oct', withCashback: 162, noCashback: 95 },
  { month: 'Nov', withCashback: 174, noCashback: 95 },
  { month: 'Dec', withCashback: 187, noCashback: 94 },
  { month: 'Jan', withCashback: 204, noCashback: 94 },
  { month: 'Feb', withCashback: 218, noCashback: 93 }
];

// 5. Revenue structure — stacked bar (K ₴)
const revenueBreakdown = [
  {
    month: 'Sep',
    nc_i: 2100,
    nc_c: 1480,
    nc_cr: 890,
    nc_o: 210,
    wb_i: 1240,
    wb_c: 870,
    wb_cr: 520,
    wb_o: 150
  },
  {
    month: 'Oct',
    nc_i: 2080,
    nc_c: 1460,
    nc_cr: 880,
    nc_o: 200,
    wb_i: 1550,
    wb_c: 1090,
    wb_cr: 650,
    wb_o: 190
  },
  {
    month: 'Nov',
    nc_i: 2060,
    nc_c: 1440,
    nc_cr: 870,
    nc_o: 195,
    wb_i: 1960,
    wb_c: 1380,
    wb_cr: 820,
    wb_o: 230
  },
  {
    month: 'Dec',
    nc_i: 2040,
    nc_c: 1430,
    nc_cr: 860,
    nc_o: 190,
    wb_i: 2320,
    wb_c: 1630,
    wb_cr: 970,
    wb_o: 270
  },
  {
    month: 'Jan',
    nc_i: 2020,
    nc_c: 1420,
    nc_cr: 855,
    nc_o: 185,
    wb_i: 2890,
    wb_c: 2030,
    wb_cr: 1210,
    wb_o: 340
  },
  {
    month: 'Feb',
    nc_i: 2000,
    nc_c: 1400,
    nc_cr: 845,
    nc_o: 180,
    wb_i: 3480,
    wb_c: 2450,
    wb_cr: 1460,
    wb_o: 410
  }
];

// ─── Current month (Feb) ───────────────────────────────────
const curr = roiTable[roiTable.length - 1];
const prev = roiTable[roiTable.length - 2];
const paidPct = Math.round((curr.paid / curr.accrued) * 100);
const balancePct = Math.round((curr.balance / curr.accrued) * 100);

// ─── Signals ─────────────────────────────────────────────────
const signals: {
  level: 'ok' | 'warn' | 'info';
  title: string;
  detail: string;
}[] = [
  {
    level: 'ok',
    title: `ROI ${curr.roi}% for February — 150% target exceeded`,
    detail: `Revenue ${curr.revenue.toLocaleString('uk-UA')} K ₴ with accrued cashback costs of ${curr.accrued.toLocaleString('uk-UA')} K ₴. Growth for the 6th consecutive month.`
  },
  {
    level: 'warn',
    title: 'Funnel conversion: 61% at 64% target',
    detail:
      'Product team launched an A/B test with push reminders. Results expected March 10.'
  },
  {
    level: 'info',
    title: `Cashback balance on accounts: ${curr.balance.toLocaleString('uk-UA')} K ₴ (${balancePct}% of accrued)`,
    detail:
      'Clients retain part of the cashback — this is a bank liability and also a retention resource.'
  }
];

const signalIcon = {
  ok: <IconCircleCheck className='text-primary mt-0.5 size-4 shrink-0' />,
  warn: (
    <IconAlertTriangle className='text-muted-foreground mt-0.5 size-4 shrink-0' />
  ),
  info: <IconInfoCircle className='text-primary mt-0.5 size-4 shrink-0' />
};

// ─── Tooltips ────────────────────────────────────────────────
function RoiBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value ?? 0;
  const acc = payload.find((p: any) => p.dataKey === 'accrued')?.value ?? 0;
  const paid = payload.find((p: any) => p.dataKey === 'paid')?.value ?? 0;
  const bal = acc - paid;
  const roi = Math.round((rev / acc) * 100);
  const fmt = (v: number) => `${v.toLocaleString('uk-UA')} K ₴`;
  return (
    <div className='bg-card text-card-foreground min-w-[200px] space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      <p className='text-primary font-semibold'>Bank revenue: {fmt(rev)}</p>
      <Separator />
      <p className='text-muted-foreground font-medium'>Costs (cashback):</p>
      <p className='text-muted-foreground pl-2'>· Accrued: {fmt(acc)}</p>
      <p className='text-muted-foreground pl-2'>
        · Paid out: {fmt(paid)} ({Math.round((paid / acc) * 100)}%)
      </p>
      <p className='text-muted-foreground pl-2'>
        · Balance on accounts: {fmt(bal)} ({Math.round((bal / acc) * 100)}%)
      </p>
      <Separator />
      <p className='font-bold'>Monthly ROI: {roi}%</p>
    </div>
  );
}

function ActiveClientsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className='bg-card text-card-foreground space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 font-semibold'>{label}</p>
      <p style={{ color: C.active }}>
        Active clients: <strong>{val.toLocaleString('uk-UA')}</strong>
      </p>
    </div>
  );
}

function TurnoverTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const wb = payload.find((p: any) => p.dataKey === 'withCashback')?.value ?? 0;
  const nc = payload.find((p: any) => p.dataKey === 'noCashback')?.value ?? 0;
  const fmt = (v: number) => `${(v / 1000).toFixed(1)} M ₴`;
  return (
    <div className='bg-card text-card-foreground space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 font-semibold'>{label}</p>
      <p style={{ color: C.active }}>
        With cashback: <strong>{fmt(wb)}</strong>
      </p>
      <p className='text-muted-foreground'>Without program: {fmt(nc)}</p>
      <Separator />
      <p className='font-semibold'>Total: {fmt(wb + nc)}</p>
    </div>
  );
}

function RevenuePerClientTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const wb = payload.find((p: any) => p.dataKey === 'withCashback')?.value ?? 0;
  const nc = payload.find((p: any) => p.dataKey === 'noCashback')?.value ?? 0;
  return (
    <div className='bg-card text-card-foreground space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 font-semibold'>{label}</p>
      <p style={{ color: C.active }}>
        With cashback: <strong>{wb} ₴</strong>
      </p>
      <p className='text-muted-foreground'>Without program: {nc} ₴</p>
      <Separator />
      <p className='text-primary font-semibold'>
        +{wb - nc} ₴ / client (+{Math.round((wb / nc - 1) * 100)}%)
      </p>
    </div>
  );
}

function BreakdownTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const g = (k: string) =>
    payload.find((p: any) => p.dataKey === k)?.value ?? 0;
  const wb = g('wb_i') + g('wb_c') + g('wb_cr') + g('wb_o');
  const nc = g('nc_i') + g('nc_c') + g('nc_cr') + g('nc_o');
  const fmt = (v: number) => `${v.toLocaleString('uk-UA')} K ₴`;
  return (
    <div className='bg-card text-card-foreground min-w-[210px] space-y-0.5 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      <p className='font-medium' style={{ color: C.active }}>
        With cashback: {fmt(wb)}
      </p>
      <p className='text-muted-foreground pl-2'>
        · Interchange: {fmt(g('wb_i'))}
      </p>
      <p className='text-muted-foreground pl-2'>
        · Commission: {fmt(g('wb_c'))}
      </p>
      <p className='text-muted-foreground pl-2'>
        · Credit limit %: {fmt(g('wb_cr'))}
      </p>
      <p className='text-muted-foreground pl-2'>· Other: {fmt(g('wb_o'))}</p>
      <Separator />
      <p className='text-muted-foreground/70 font-medium'>
        Without program: {fmt(nc)}
      </p>
      <p className='text-muted-foreground/50 pl-2'>
        · Interchange: {fmt(g('nc_i'))}
      </p>
      <p className='text-muted-foreground/50 pl-2'>
        · Commission: {fmt(g('nc_c'))}
      </p>
      <p className='text-muted-foreground/50 pl-2'>
        · Credit limit %: {fmt(g('nc_cr'))}
      </p>
      <p className='text-muted-foreground/50 pl-2'>· Other: {fmt(g('nc_o'))}</p>
      <Separator />
      <p className='font-bold'>Total: {fmt(wb + nc)}</p>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────
export default function ExecDashboard() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-5'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase'>
              Top Management · Cashback Program · February 2025
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>
              ROI {curr.roi}% — revenue exceeds costs by 1.86×
            </h2>
            <p className='text-muted-foreground mt-0.5 text-sm'>
              Revenue {curr.revenue.toLocaleString('uk-UA')} K ₴ · Accrued
              cashback {curr.accrued.toLocaleString('uk-UA')} K ₴ · Paid out{' '}
              {curr.paid.toLocaleString('uk-UA')} K ₴ ({paidPct}%)
            </p>
          </div>
          <Select defaultValue='6m'>
            <SelectTrigger className='w-[160px] shrink-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='6m'>Last 6 months</SelectItem>
              <SelectItem value='3m'>Last 3 months</SelectItem>
              <SelectItem value='ytd'>Year to date</SelectItem>
              <SelectItem value='2024'>Year 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── ROI Hero block — revenue vs costs ── */}
        <Card className='ring-primary/20 ring-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base'>
              Revenue vs Cashback Costs · by month
            </CardTitle>
            <CardDescription>
              K ₴ · Purple = bank revenue · Light = accrued cashback ·
              Neutral = paid cashback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
              {/* Chart */}
              <div className='lg:col-span-3'>
                <ResponsiveContainer width='100%' height={220}>
                  <BarChart
                    data={roiTable}
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                    barCategoryGap='25%'
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='var(--border)'
                      xAxisId={0}
                      yAxisId={0}
                    />
                    <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `${v}k`}
                    />
                    <Tooltip content={<RoiBarTooltip />} />
                    <Legend
                      iconSize={8}
                      iconType='square'
                      wrapperStyle={{
                        fontSize: '12px',
                        color: 'var(--muted-foreground)',
                        fontFamily: 'var(--font-sans)'
                      }}
                      formatter={(v) =>
                        v === 'revenue'
                          ? 'Bank revenue'
                          : v === 'accrued'
                            ? 'Accrued cashback'
                            : 'Paid cashback'
                      }
                    />
                    <Bar
                      dataKey='revenue'
                      name='revenue'
                      fill={C.revenue}
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey='accrued'
                      name='accrued'
                      fill={C.accrued}
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey='paid'
                      name='paid'
                      fill={C.paid}
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Current month rows */}
              <div className='flex flex-col justify-center space-y-3 lg:col-span-2'>
                <p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                  February 2025
                </p>

                {/* Revenue */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='size-3 rounded-sm'
                      style={{ backgroundColor: C.revenue }}
                    />
                    <span className='text-foreground/80 text-sm'>
                      Bank revenue
                    </span>
                  </div>
                  <span className='text-primary font-bold tabular-nums'>
                    {curr.revenue.toLocaleString('uk-UA')} K ₴
                  </span>
                </div>
                <Separator />

                {/* Accrued */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='size-3 rounded-sm'
                      style={{ backgroundColor: C.accrued }}
                    />
                    <span className='text-foreground/80 text-sm'>
                      Accrued cashback
                    </span>
                  </div>
                  <span className='text-muted-foreground font-semibold tabular-nums'>
                    {curr.accrued.toLocaleString('uk-UA')} K ₴
                  </span>
                </div>

                {/* Paid out */}
                <div className='flex items-center justify-between pl-3'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='size-2.5 rounded-sm'
                      style={{ backgroundColor: C.paid }}
                    />
                    <span className='text-muted-foreground text-xs'>
                      of which paid out
                    </span>
                  </div>
                  <span className='text-muted-foreground text-sm font-medium tabular-nums'>
                    {curr.paid.toLocaleString('uk-UA')} K ₴ ({paidPct}%)
                  </span>
                </div>

                {/* Balance */}
                <div className='flex items-center justify-between pl-3'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-muted-foreground/20 size-2.5 rounded-sm' />
                    <span className='text-muted-foreground text-xs'>
                      balance on accounts
                    </span>
                  </div>
                  <span className='text-muted-foreground text-sm font-medium tabular-nums'>
                    {curr.balance.toLocaleString('uk-UA')} K ₴ ({balancePct}
                    %)
                  </span>
                </div>
                <Separator />

                {/* ROI */}
                <div className='flex items-center justify-between'>
                  <span className='text-foreground text-sm font-semibold'>
                    Monthly ROI
                  </span>
                  <div className='text-right'>
                    <span className='text-primary text-2xl font-black tabular-nums'>
                      {curr.roi}%
                    </span>
                    <p className='text-muted-foreground text-xs'>
                      vs {prev.roi}% in January{' '}
                      <span className='text-primary font-medium'>
                        +{curr.roi - prev.roi}pp
                      </span>
                    </p>
                  </div>
                </div>
                <p className='text-muted-foreground bg-muted rounded-md px-2 py-1.5 text-xs'>
                  ROI = Revenue / Accrued cashback × 100. Conservative estimate —
                  accounts for all liabilities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Row 2: Active + Turnover ── */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Active Clients Growth
              </CardTitle>
              <CardDescription>
                Selected and used cashback during the month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={190}>
                <AreaChart
                  data={activeTrend}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={chartGradientId('primary')}
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor={C.active}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset='95%'
                        stopColor={C.active}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='var(--border)'
                    xAxisId={0}
                    yAxisId={0}
                  />
                  <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<ActiveClientsTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='active'
                    name='Active'
                    stroke={C.active}
                    fill={`url(#${chartGradientId('primary')})`}
                    strokeWidth={2.5}
                    dot={(p: any) => (
                      <circle
                        key={p.index}
                        cx={p.cx}
                        cy={p.cy}
                        r={p.index === activeTrend.length - 1 ? 5 : 3}
                        fill={C.active}
                        stroke={
                          p.index === activeTrend.length - 1
                            ? 'var(--background)'
                            : 'none'
                        }
                        strokeWidth={2}
                      />
                    )}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className='text-muted-foreground text-xs'>
              +91% over 6 months · Covered base share:{' '}
              <strong className='text-foreground'>57%</strong>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Turnover Dynamics</CardTitle>
              <CardDescription>
                With cashback vs without program · K ₴ / month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={190}>
                <BarChart
                  data={turnoverTrend}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  barCategoryGap='25%'
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='var(--border)'
                    xAxisId={0}
                    yAxisId={0}
                  />
                  <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}M`}
                  />
                  <Tooltip content={<TurnoverTooltip />} />
                  <Legend
                    iconSize={8}
                    iconType='square'
                    wrapperStyle={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)',
                      fontFamily: 'var(--font-sans)'
                    }}
                    formatter={(v) =>
                      v === 'withCashback' ? 'With cashback' : 'Without program'
                    }
                  />
                  <Bar
                    dataKey='noCashback'
                    name='noCashback'
                    stackId='a'
                    fill={C.noProgram}
                  />
                  <Bar
                    dataKey='withCashback'
                    name='withCashback'
                    stackId='a'
                    fill={C.active}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className='text-muted-foreground text-xs'>
              Cashback turnover +177% over 6 months · February total:{' '}
              <strong className='text-foreground'>191 M ₴</strong>
            </CardFooter>
          </Card>
        </div>

        {/* ── Row 3: Revenue per client + Revenue structure ── */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
          <Card className='col-span-2'>
            <CardHeader>
              <CardTitle className='text-base'>
                Bank Revenue per Client
              </CardTitle>
              <CardDescription>
                Actual monthly revenue · ₴ / client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={190}>
                <LineChart
                  data={revenuePerClient}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='var(--border)'
                    xAxisId={0}
                    yAxisId={0}
                  />
                  <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}₴`}
                    domain={[80, 240]}
                  />
                  <Tooltip content={<RevenuePerClientTooltip />} />
                  <Legend
                    iconSize={8}
                    iconType='square'
                    wrapperStyle={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)',
                      fontFamily: 'var(--font-sans)'
                    }}
                    formatter={(v) =>
                      v === 'withCashback' ? 'With cashback' : 'Without program'
                    }
                  />
                  <Line
                    type='monotone'
                    dataKey='withCashback'
                    name='withCashback'
                    stroke={C.active}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: C.active }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='noCashback'
                    name='noCashback'
                    stroke={C.noProgram}
                    strokeWidth={1.5}
                    strokeDasharray='5 4'
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className='text-muted-foreground text-xs'>
              February: <strong className='text-primary'>218 ₴</strong> with cashback
              vs <strong className='text-muted-foreground'>93 ₴</strong> without ·{' '}
              <strong className='text-primary'>+134%</strong>
            </CardFooter>
          </Card>

          <Card className='col-span-3'>
            <CardHeader>
              <CardTitle className='text-base'>
                Bank Revenue Structure
              </CardTitle>
              <CardDescription>
                K ₴ · <span style={{ color: C.active }}>■</span> With cashback
                &nbsp;
                <span className='text-muted-foreground/40'>■</span> Without program
                · Hover = details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={190}>
                <BarChart
                  data={revenueBreakdown}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  barCategoryGap='25%'
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='var(--border)'
                    xAxisId={0}
                    yAxisId={0}
                  />
                  <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}k`}
                  />
                  <Tooltip content={<BreakdownTooltip />} />
                  {/* Without program — neutral tints */}
                  <Bar
                    dataKey='nc_i'
                    stackId='nc'
                    fill={chartPalette.neutral}
                    legendType='none'
                  />
                  <Bar
                    dataKey='nc_c'
                    stackId='nc'
                    fill={chartPalette.neutralLight}
                    legendType='none'
                  />
                  <Bar
                    dataKey='nc_cr'
                    stackId='nc'
                    fill={chartPalette.neutralLighter}
                    legendType='none'
                  />
                  <Bar
                    dataKey='nc_o'
                    stackId='nc'
                    fill={chartPalette.neutralLightest}
                    radius={[3, 3, 0, 0]}
                    legendType='none'
                  />
                  {/* With cashback — indigo */}
                  <Bar
                    dataKey='wb_i'
                    stackId='wb'
                    fill={C.interchange}
                    legendType='none'
                  />
                  <Bar
                    dataKey='wb_c'
                    stackId='wb'
                    fill={C.commission}
                    legendType='none'
                  />
                  <Bar
                    dataKey='wb_cr'
                    stackId='wb'
                    fill={C.credit}
                    legendType='none'
                  />
                  <Bar
                    dataKey='wb_o'
                    stackId='wb'
                    fill={C.other}
                    radius={[3, 3, 0, 0]}
                    legendType='none'
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Manual legend */}
              <div className='mt-3 space-y-1.5 text-xs'>
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                  <span className='text-muted-foreground w-24 shrink-0 font-medium'>
                    With cashback:
                  </span>
                  {[
                    { color: C.interchange, label: 'Interchange' },
                    { color: C.commission, label: 'Commission' },
                    { color: C.credit, label: 'Credit limit %' },
                    { color: C.other, label: 'Other' }
                  ].map((l, i) => (
                    <span key={i} className='flex items-center gap-1'>
                      <span
                        className='inline-block size-2.5 rounded-sm'
                        style={{ backgroundColor: l.color }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
                <div className='flex items-center gap-x-3'>
                  <span className='text-muted-foreground w-24 shrink-0 font-medium'>
                    Without program:
                  </span>
                  <span className='flex items-center gap-1'>
                    <span
                      className='inline-block size-2.5 rounded-sm'
                      style={{ backgroundColor: chartPalette.neutralLight }}
                    />
                    same structure (neutral)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Signals ── */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-muted-foreground text-sm font-semibold tracking-wide uppercase'>
              Key Signals
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 pt-0'>
            {signals.map((s, i) => (
              <div key={i}>
                {i > 0 && <Separator className='mb-3' />}
                <div className='flex items-start gap-3'>
                  {signalIcon[s.level]}
                  <div>
                    <p className='text-sm font-semibold'>{s.title}</p>
                    <p className='text-muted-foreground mt-0.5 text-xs'>
                      {s.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
