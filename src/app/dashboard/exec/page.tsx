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

const MONTHS = ['Вер', 'Жов', 'Лис', 'Гру', 'Січ', 'Лют'];

// 1. Активні клієнти
const activeTrend = [
  { month: 'Вер', active: 18200 },
  { month: 'Жов', active: 21000 },
  { month: 'Лис', active: 24500 },
  { month: 'Гру', active: 27000 },
  { month: 'Січ', active: 31000 },
  { month: 'Лют', active: 34800 }
];

// 2. Оберти (тис. ₴)
const turnoverTrend = [
  { month: 'Вер', withCashback: 52780, noCashback: 46200 },
  { month: 'Жов', withCashback: 67200, noCashback: 45990 },
  { month: 'Лис', withCashback: 85750, noCashback: 45780 },
  { month: 'Гру', withCashback: 99900, noCashback: 45395 },
  { month: 'Січ', withCashback: 122450, noCashback: 45100 },
  { month: 'Лют', withCashback: 146160, noCashback: 44850 }
];

// 3. ROI та витрати — по місяцях (тис. ₴)
// revenue = реальний дохід з фінсистеми від активних клієнтів
// accrued = нарахований кешбек (витрата банку)
// paid    = фактично виплачений (менше ніж нарахований — не всі виводять)
// balance = accrued - paid = залишок на рахунках клієнтів
const roiTable = [
  {
    month: 'Вер',
    revenue: 2690,
    accrued: 2200,
    paid: 1496,
    balance: 704,
    roi: 122
  },
  {
    month: 'Жов',
    revenue: 3410,
    accrued: 2520,
    paid: 1714,
    balance: 806,
    roi: 135
  },
  {
    month: 'Лис',
    revenue: 4340,
    accrued: 2870,
    paid: 1952,
    balance: 918,
    roi: 151
  },
  {
    month: 'Гру',
    revenue: 5090,
    accrued: 3200,
    paid: 2176,
    balance: 1024,
    roi: 159
  },
  {
    month: 'Січ',
    revenue: 6360,
    accrued: 3670,
    paid: 2496,
    balance: 1174,
    roi: 173
  },
  {
    month: 'Лют',
    revenue: 7560,
    accrued: 4060,
    paid: 2761,
    balance: 1299,
    roi: 186
  }
];
// Примітка: ROI = revenue / accrued * 100 (по нарахованому — консервативна оцінка)

// 4. Дохід на клієнта (₴/міс — реальний з фінсистеми)
const revenuePerClient = [
  { month: 'Вер', withCashback: 148, noCashback: 96 },
  { month: 'Жов', withCashback: 162, noCashback: 95 },
  { month: 'Лис', withCashback: 174, noCashback: 95 },
  { month: 'Гру', withCashback: 187, noCashback: 94 },
  { month: 'Січ', withCashback: 204, noCashback: 94 },
  { month: 'Лют', withCashback: 218, noCashback: 93 }
];

// 5. Структура доходу — stacked bar (тис. ₴)
const revenueBreakdown = [
  {
    month: 'Вер',
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
    month: 'Жов',
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
    month: 'Лис',
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
    month: 'Гру',
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
    month: 'Січ',
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
    month: 'Лют',
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

// ─── Поточний місяць (лют) ───────────────────────────────────
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
    title: `ROI ${curr.roi}% за лютий — ціль 150% перевищена`,
    detail: `Дохід ${curr.revenue.toLocaleString('uk-UA')} тис. ₴ при витратах на нарахований кешбек ${curr.accrued.toLocaleString('uk-UA')} тис. ₴. Зростання 6-й місяць поспіль.`
  },
  {
    level: 'warn',
    title: 'Конверсія воронки: 61% при цілі 64%',
    detail:
      'Продакт-команда запустила A/B тест з push-нагадуваннями. Результат очікується 10 березня.'
  },
  {
    level: 'info',
    title: `Залишок кешбеку на рахунках: ${curr.balance.toLocaleString('uk-UA')} тис. ₴ (${balancePct}% від нарахованого)`,
    detail:
      "Клієнти утримують частину кешбеку — це зобов'язання банку і водночас ресурс для утримання клієнта."
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
  const fmt = (v: number) => `${v.toLocaleString('uk-UA')} тис. ₴`;
  return (
    <div className='bg-card text-card-foreground min-w-[200px] space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      <p className='text-primary font-semibold'>Дохід банку: {fmt(rev)}</p>
      <Separator />
      <p className='text-muted-foreground font-medium'>Витрати (кешбек):</p>
      <p className='text-muted-foreground pl-2'>· Нараховано: {fmt(acc)}</p>
      <p className='text-muted-foreground pl-2'>
        · Виплачено: {fmt(paid)} ({Math.round((paid / acc) * 100)}%)
      </p>
      <p className='text-muted-foreground pl-2'>
        · Залишок на рахунках: {fmt(bal)} ({Math.round((bal / acc) * 100)}%)
      </p>
      <Separator />
      <p className='font-bold'>ROI місяця: {roi}%</p>
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
        Активних клієнтів: <strong>{val.toLocaleString('uk-UA')}</strong>
      </p>
    </div>
  );
}

function TurnoverTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const wb = payload.find((p: any) => p.dataKey === 'withCashback')?.value ?? 0;
  const nc = payload.find((p: any) => p.dataKey === 'noCashback')?.value ?? 0;
  const fmt = (v: number) => `${(v / 1000).toFixed(1)} млн ₴`;
  return (
    <div className='bg-card text-card-foreground space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 font-semibold'>{label}</p>
      <p style={{ color: C.active }}>
        З кешбеком: <strong>{fmt(wb)}</strong>
      </p>
      <p className='text-muted-foreground'>Без програми: {fmt(nc)}</p>
      <Separator />
      <p className='font-semibold'>Тотал: {fmt(wb + nc)}</p>
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
        З кешбеком: <strong>{wb} ₴</strong>
      </p>
      <p className='text-muted-foreground'>Без програми: {nc} ₴</p>
      <Separator />
      <p className='text-primary font-semibold'>
        +{wb - nc} ₴ / клієнт (+{Math.round((wb / nc - 1) * 100)}%)
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
  const fmt = (v: number) => `${v.toLocaleString('uk-UA')} тис. ₴`;
  return (
    <div className='bg-card text-card-foreground min-w-[210px] space-y-0.5 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      <p className='font-medium' style={{ color: C.active }}>
        З кешбеком: {fmt(wb)}
      </p>
      <p className='text-muted-foreground pl-2'>
        · Інтерчендж: {fmt(g('wb_i'))}
      </p>
      <p className='text-muted-foreground pl-2'>
        · Комісійний: {fmt(g('wb_c'))}
      </p>
      <p className='text-muted-foreground pl-2'>
        · % кред. ліміту: {fmt(g('wb_cr'))}
      </p>
      <p className='text-muted-foreground pl-2'>· Інші: {fmt(g('wb_o'))}</p>
      <Separator />
      <p className='text-muted-foreground/70 font-medium'>
        Без програми: {fmt(nc)}
      </p>
      <p className='text-muted-foreground/50 pl-2'>
        · Інтерчендж: {fmt(g('nc_i'))}
      </p>
      <p className='text-muted-foreground/50 pl-2'>
        · Комісійний: {fmt(g('nc_c'))}
      </p>
      <p className='text-muted-foreground/50 pl-2'>
        · % кред. ліміту: {fmt(g('nc_cr'))}
      </p>
      <p className='text-muted-foreground/50 pl-2'>· Інші: {fmt(g('nc_o'))}</p>
      <Separator />
      <p className='font-bold'>Тотал: {fmt(wb + nc)}</p>
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
              Топ-менеджмент · Кешбек-програма · Лютий 2025
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>
              ROI {curr.roi}% — дохід перевищує витрати в 1.86×
            </h2>
            <p className='text-muted-foreground mt-0.5 text-sm'>
              Дохід {curr.revenue.toLocaleString('uk-UA')} тис. ₴ · Нарахований
              кешбек {curr.accrued.toLocaleString('uk-UA')} тис. ₴ · Виплачено{' '}
              {curr.paid.toLocaleString('uk-UA')} тис. ₴ ({paidPct}%)
            </p>
          </div>
          <Select defaultValue='6m'>
            <SelectTrigger className='w-[160px] shrink-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='6m'>Останні 6 місяців</SelectItem>
              <SelectItem value='3m'>Останні 3 місяці</SelectItem>
              <SelectItem value='ytd'>З початку року</SelectItem>
              <SelectItem value='2024'>2024 рік</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── ROI Hero блок — дохід vs витрати ── */}
        <Card className='ring-primary/20 ring-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base'>
              Дохід vs Витрати на кешбек · по місяцях
            </CardTitle>
            <CardDescription>
              Тис. ₴ · Фіолетовий = дохід банку · Світлий = нарахований кешбек ·
              Нейтральний = виплачений кешбек
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
              {/* Чарт */}
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
                          ? 'Дохід банку'
                          : v === 'accrued'
                            ? 'Нараховано кешбеку'
                            : 'Виплачено кешбеку'
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

              {/* Рядки поточного місяця */}
              <div className='flex flex-col justify-center space-y-3 lg:col-span-2'>
                <p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                  Лютий 2025
                </p>

                {/* Дохід */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='size-3 rounded-sm'
                      style={{ backgroundColor: C.revenue }}
                    />
                    <span className='text-foreground/80 text-sm'>
                      Дохід банку
                    </span>
                  </div>
                  <span className='text-primary font-bold tabular-nums'>
                    {curr.revenue.toLocaleString('uk-UA')} тис. ₴
                  </span>
                </div>
                <Separator />

                {/* Нарахований */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='size-3 rounded-sm'
                      style={{ backgroundColor: C.accrued }}
                    />
                    <span className='text-foreground/80 text-sm'>
                      Нараховано кешбеку
                    </span>
                  </div>
                  <span className='text-muted-foreground font-semibold tabular-nums'>
                    {curr.accrued.toLocaleString('uk-UA')} тис. ₴
                  </span>
                </div>

                {/* Виплачений */}
                <div className='flex items-center justify-between pl-3'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='size-2.5 rounded-sm'
                      style={{ backgroundColor: C.paid }}
                    />
                    <span className='text-muted-foreground text-xs'>
                      з них виплачено
                    </span>
                  </div>
                  <span className='text-muted-foreground text-sm font-medium tabular-nums'>
                    {curr.paid.toLocaleString('uk-UA')} тис. ₴ ({paidPct}%)
                  </span>
                </div>

                {/* Залишок */}
                <div className='flex items-center justify-between pl-3'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-muted-foreground/20 size-2.5 rounded-sm' />
                    <span className='text-muted-foreground text-xs'>
                      залишок на рахунках
                    </span>
                  </div>
                  <span className='text-muted-foreground text-sm font-medium tabular-nums'>
                    {curr.balance.toLocaleString('uk-UA')} тис. ₴ ({balancePct}
                    %)
                  </span>
                </div>
                <Separator />

                {/* ROI */}
                <div className='flex items-center justify-between'>
                  <span className='text-foreground text-sm font-semibold'>
                    ROI місяця
                  </span>
                  <div className='text-right'>
                    <span className='text-primary text-2xl font-black tabular-nums'>
                      {curr.roi}%
                    </span>
                    <p className='text-muted-foreground text-xs'>
                      vs {prev.roi}% у січні{' '}
                      <span className='text-primary font-medium'>
                        +{curr.roi - prev.roi}pp
                      </span>
                    </p>
                  </div>
                </div>
                <p className='text-muted-foreground bg-muted rounded-md px-2 py-1.5 text-xs'>
                  ROI = Дохід / Нарахований кешбек × 100. Консервативна оцінка —
                  враховує всі зобов&apos;язання.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Ряд 2: Активні + Оберти ── */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Зростання активних клієнтів
              </CardTitle>
              <CardDescription>
                Обрали і використали кешбек за місяць
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
                    name='Активні'
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
              +91% за 6 місяців · Частка охопленої бази:{' '}
              <strong className='text-foreground'>57%</strong>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Динаміка обертів</CardTitle>
              <CardDescription>
                З кешбеком vs без програми · тис. ₴ / місяць
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
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}м`}
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
                      v === 'withCashback' ? 'З кешбеком' : 'Без програми'
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
              Оберти з кешбеком +177% за 6 міс · Тотал лютий:{' '}
              <strong className='text-foreground'>191 млн ₴</strong>
            </CardFooter>
          </Card>
        </div>

        {/* ── Ряд 3: Дохід на клієнта + Структура доходу ── */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
          <Card className='col-span-2'>
            <CardHeader>
              <CardTitle className='text-base'>
                Дохід банку на клієнта
              </CardTitle>
              <CardDescription>
                Реальний місячний дохід · ₴ / клієнт
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
                      v === 'withCashback' ? 'З кешбеком' : 'Без програми'
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
              Лютий: <strong className='text-primary'>218 ₴</strong> з кешбеком
              vs <strong className='text-muted-foreground'>93 ₴</strong> без ·{' '}
              <strong className='text-primary'>+134%</strong>
            </CardFooter>
          </Card>

          <Card className='col-span-3'>
            <CardHeader>
              <CardTitle className='text-base'>
                Структура доходу банку
              </CardTitle>
              <CardDescription>
                Тис. ₴ · <span style={{ color: C.active }}>■</span> З кешбеком
                &nbsp;
                <span className='text-muted-foreground/40'>■</span> Без програми
                · Hover = деталі
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
                  {/* Без програми — neutral tints */}
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
                  {/* З кешбеком — indigo */}
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

              {/* Ручна легенда */}
              <div className='mt-3 space-y-1.5 text-xs'>
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                  <span className='text-muted-foreground w-24 shrink-0 font-medium'>
                    З кешбеком:
                  </span>
                  {[
                    { color: C.interchange, label: 'Інтерчендж' },
                    { color: C.commission, label: 'Комісійний' },
                    { color: C.credit, label: '% кред. ліміту' },
                    { color: C.other, label: 'Інші' }
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
                    Без програми:
                  </span>
                  <span className='flex items-center gap-1'>
                    <span
                      className='inline-block size-2.5 rounded-sm'
                      style={{ backgroundColor: chartPalette.neutralLight }}
                    />
                    аналогічна структура (нейтральний)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Сигнали ── */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-muted-foreground text-sm font-semibold tracking-wide uppercase'>
              На що звернути увагу
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
