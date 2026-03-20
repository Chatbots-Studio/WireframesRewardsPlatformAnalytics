'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { cn } from '@/lib/utils';
import { getMetricById } from '@/features/exec/cashback-impact/data/metric-catalog';
import { MetricInsightDrawer } from '@/features/exec/cashback-impact/components/metric-insight-drawer';
import { KpiMetricCard } from '@/features/exec/cashback-impact/components/kpi-metric-card';
import type { KpiDelta } from '@/features/exec/cashback-impact/components/kpi-metric-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { chartPalette } from '@/lib/chart-theme';

const CHART_TOOLTIP_CLASS =
  'bg-card/95 text-card-foreground backdrop-blur-sm min-w-[180px] space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md';

const CATEGORIES = [
  'All Categories',
  'Products',
  'Gas Stations',
  'Restaurants',
  'Online Shopping',
  'Pharmacies',
  'Travel',
  'Entertainment',
  'Clothing & Shoes',
  'Electronics',
  'Home & Garden',
  'Sports',
  'Beauty & Health',
  'Education',
  'Insurance',
  'Utilities',
  'Taxi & Delivery',
  'Other'
];

const ZERO_CONVERSION_CATEGORIES = [
  { name: 'Insurance', conversion: 0, cause: 'Offer issue' },
  {
    name: 'Utilities',
    conversion: 1.2,
    cause: 'Communication issue'
  },
  { name: 'Education', conversion: 2.1, cause: 'Offer issue' }
];

const ROI_CATEGORIES = [
  {
    name: 'Supermarkets',
    roi: 340,
    turnover: 2100,
    cashback: 62,
    transactions: 18400,
    isAnomaly: false
  },
  {
    name: 'Restaurants',
    roi: 280,
    turnover: 1840,
    cashback: 66,
    transactions: 14200,
    isAnomaly: false
  },
  {
    name: 'Gas Stations',
    roi: 245,
    turnover: 980,
    cashback: 40,
    transactions: 9800,
    isAnomaly: false
  },
  {
    name: 'Pharmacies',
    roi: 210,
    turnover: 620,
    cashback: 30,
    transactions: 7200,
    isAnomaly: false
  },
  {
    name: 'Transport',
    roi: 185,
    turnover: 440,
    cashback: 24,
    transactions: 22100,
    isAnomaly: false
  },
  {
    name: 'Online Shopping',
    roi: 162,
    turnover: 1420,
    cashback: 88,
    transactions: 11300,
    isAnomaly: false
  },
  {
    name: 'Clothing & Shoes',
    roi: 130,
    turnover: 890,
    cashback: 68,
    transactions: 6400,
    isAnomaly: false
  },
  {
    name: 'Beauty & Care',
    roi: 98,
    turnover: 340,
    cashback: 35,
    transactions: 4800,
    isAnomaly: false
  },
  {
    name: 'Sports & Fitness',
    roi: 87,
    turnover: 280,
    cashback: 32,
    transactions: 3200,
    isAnomaly: false
  },
  {
    name: 'Electronics',
    roi: 74,
    turnover: 1680,
    cashback: 227,
    transactions: 2100,
    isAnomaly: false
  },
  {
    name: 'Entertainment',
    roi: 62,
    turnover: 190,
    cashback: 31,
    transactions: 4100,
    isAnomaly: false
  },
  {
    name: "Children's Goods",
    roi: 55,
    turnover: 420,
    cashback: 76,
    transactions: 3800,
    isAnomaly: false
  },
  {
    name: 'Travel',
    roi: 48,
    turnover: 2800,
    cashback: 583,
    transactions: 1200,
    isAnomaly: true
  },
  {
    name: 'Books & Education',
    roi: 41,
    turnover: 120,
    cashback: 29,
    transactions: 2200,
    isAnomaly: false
  },
  {
    name: 'Pet Supplies',
    roi: 38,
    turnover: 180,
    cashback: 47,
    transactions: 2900,
    isAnomaly: false
  },
  {
    name: 'Building Materials',
    roi: 22,
    turnover: 560,
    cashback: 255,
    transactions: 890,
    isAnomaly: true
  },
  {
    name: 'Medicine',
    roi: 15,
    turnover: 240,
    cashback: 160,
    transactions: 1400,
    isAnomaly: true
  }
];

const ROI_DYNAMICS = [
  {
    month: 'Sep',
    Supermarkets: 290,
    Restaurants: 240,
    'Gas Stations': 210,
    'Online Shopping': 135,
    Pharmacies: 185
  },
  {
    month: 'Oct',
    Supermarkets: 305,
    Restaurants: 252,
    'Gas Stations': 218,
    'Online Shopping': 142,
    Pharmacies: 190
  },
  {
    month: 'Nov',
    Supermarkets: 318,
    Restaurants: 261,
    'Gas Stations': 226,
    'Online Shopping': 149,
    Pharmacies: 196
  },
  {
    month: 'Dec',
    Supermarkets: 326,
    Restaurants: 270,
    'Gas Stations': 233,
    'Online Shopping': 154,
    Pharmacies: 201
  },
  {
    month: 'Jan',
    Supermarkets: 334,
    Restaurants: 276,
    'Gas Stations': 240,
    'Online Shopping': 158,
    Pharmacies: 207
  },
  {
    month: 'Feb',
    Supermarkets: 340,
    Restaurants: 280,
    'Gas Stations': 245,
    'Online Shopping': 162,
    Pharmacies: 210
  }
];

const FUNNEL_DATA: Record<
  string,
  { label: string; value: number; pct: number }[]
> = {
  all: [
    { label: 'Total Transactions', value: 186400, pct: 100 },
    { label: 'Saw Offer', value: 142300, pct: 76.3 },
    { label: 'Selected Category', value: 98700, pct: 52.9 },
    { label: 'Activated Cashback', value: 61400, pct: 32.9 }
  ],
  Supermarkets: [
    { label: 'Total Transactions', value: 42100, pct: 100 },
    { label: 'Saw Offer', value: 38900, pct: 92.4 },
    { label: 'Selected Category', value: 31200, pct: 74.1 },
    { label: 'Activated Cashback', value: 26800, pct: 63.7 }
  ],
  Restaurants: [
    { label: 'Total Transactions', value: 14200, pct: 100 },
    { label: 'Saw Offer', value: 11400, pct: 80.3 },
    { label: 'Selected Category', value: 8700, pct: 61.3 },
    { label: 'Activated Cashback', value: 6100, pct: 43.0 }
  ],
  'Gas Stations': [
    { label: 'Total Transactions', value: 9800, pct: 100 },
    { label: 'Saw Offer', value: 7200, pct: 73.5 },
    { label: 'Selected Category', value: 5100, pct: 52.0 },
    { label: 'Activated Cashback', value: 3400, pct: 34.7 }
  ],
  Online: [
    { label: 'Total Transactions', value: 11300, pct: 100 },
    { label: 'Saw Offer', value: 8400, pct: 74.3 },
    { label: 'Selected Category', value: 5800, pct: 51.3 },
    { label: 'Activated Cashback', value: 3200, pct: 28.3 }
  ]
};

const FUNNEL_CATEGORIES = ['all', 'Supermarkets', 'Restaurants', 'Gas Stations', 'Online'];

const HEATMAP_CHECK_RANGES = [
  '<200₴',
  '200–500₴',
  '500–1000₴',
  '1000–3000₴',
  '>3000₴'
];

const HEATMAP_DATA = [
  { category: 'Supermarkets', values: [72, 68, 61, 44, 28] },
  { category: 'Restaurants', values: [58, 52, 48, 38, 22] },
  { category: 'Gas Stations', values: [45, 42, 38, 31, 18] },
  { category: 'Pharmacies', values: [61, 57, 51, 40, 24] },
  { category: 'Transport', values: [82, 74, 63, 41, 19] },
  { category: 'Online Shopping', values: [34, 41, 48, 52, 46] },
  { category: 'Clothing & Shoes', values: [28, 35, 44, 55, 48] },
  { category: 'Electronics', values: [12, 18, 28, 42, 58] },
  { category: 'Travel', values: [8, 14, 22, 38, 61] },
  { category: 'Beauty & Care', values: [51, 48, 42, 31, 18] }
];

function getHeatColor(pct: number): string {
  if (pct < 20) return 'bg-chart-danger/15';
  if (pct < 40) return 'bg-chart-warning/15';
  if (pct < 60) return 'bg-chart-primary/10';
  if (pct < 80) return 'bg-chart-primary/20';
  return 'bg-chart-success/20';
}

const BEFORE_AFTER_DATA = [
  {
    category: 'Supermarkets',
    before: 890,
    after: 2100,
    txBefore: 9200,
    txAfter: 18400
  },
  {
    category: 'Restaurants',
    before: 620,
    after: 1840,
    txBefore: 6800,
    txAfter: 14200
  },
  { category: 'Gas Stations', before: 510, after: 980, txBefore: 5100, txAfter: 9800 },
  {
    category: 'Online',
    before: 780,
    after: 1420,
    txBefore: 6200,
    txAfter: 11300
  },
  {
    category: 'Pharmacies',
    before: 380,
    after: 620,
    txBefore: 3800,
    txAfter: 7200
  },
  { category: 'Clothing', before: 560, after: 890, txBefore: 3900, txAfter: 6400 },
  {
    category: 'Transport',
    before: 220,
    after: 440,
    txBefore: 11200,
    txAfter: 22100
  },
  { category: 'Beauty', before: 180, after: 340, txBefore: 2600, txAfter: 4800 }
];

const COHORT_DATA = [
  { month: 'Sep', activated: 148, control: 96 },
  { month: 'Oct', activated: 162, control: 95 },
  { month: 'Nov', activated: 181, control: 95 },
  { month: 'Dec', activated: 196, control: 94 },
  { month: 'Jan', activated: 214, control: 94 },
  { month: 'Feb', activated: 229, control: 93 }
];

const CANNIBALIZATION_DATA = [
  { month: 'Sep', cashbackCats: 892, otherCats: 640, total: 1532 },
  { month: 'Oct', cashbackCats: 1080, otherCats: 618, total: 1698 },
  { month: 'Nov', cashbackCats: 1280, otherCats: 601, total: 1881 },
  { month: 'Dec', cashbackCats: 1440, otherCats: 590, total: 2030 },
  { month: 'Jan', cashbackCats: 1680, otherCats: 578, total: 2258 },
  { month: 'Feb', cashbackCats: 1890, otherCats: 562, total: 2452 }
];

interface KpiCardData {
  metricId: string;
  value: string;
  delta: KpiDelta;
  subtitle?: string;
}

const KPI_CARDS: KpiCardData[] = [
  {
    metricId: 'activation_conversion',
    value: '61.4%',
    delta: { value: '+3.1pp', comparison: 'vs previous month', trend: 'up' }
  },
  {
    metricId: 'time_to_first_tx',
    value: '2.3 days',
    delta: {
      value: '−0.2 days',
      comparison: 'vs previous month',
      trend: 'up'
    }
  },
  {
    metricId: 'reactivation_rate',
    value: '18.7%',
    delta: { value: '+1.2pp', comparison: 'vs previous month', trend: 'up' }
  },
  {
    metricId: 'transaction_frequency',
    value: '4.2',
    subtitle: 'vs 2.1 without cashback',
    delta: {
      value: '+2.1 txn/month',
      comparison: 'vs control group',
      trend: 'up'
    }
  },
  {
    metricId: 'avg_check_delta',
    value: '+23.4%',
    delta: { value: '+2.1pp', comparison: 'vs previous month', trend: 'up' }
  },
  {
    metricId: 'credit_utilization',
    value: '34.8%',
    delta: {
      value: '−1.5pp',
      comparison: 'vs previous month',
      trend: 'down'
    }
  }
];

function BeforeAfterTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { payload: (typeof BEFORE_AFTER_DATA)[0] }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className={CHART_TOOLTIP_CLASS}>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      <p>
        Before: <strong>{row?.before?.toLocaleString('uk-UA')} k ₴</strong>
      </p>
      <p>
        After: <strong>{row?.after?.toLocaleString('uk-UA')} k ₴</strong>
      </p>
      <p className='text-muted-foreground pt-1'>
        Transactions: {row?.txBefore?.toLocaleString('uk-UA')} →{' '}
        {row?.txAfter?.toLocaleString('uk-UA')}
      </p>
    </div>
  );
}

function CohortTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { name: string; value: number; stroke?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={CHART_TOOLTIP_CLASS}>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      {payload.map((p) => (
        <p key={p.name}>
          {p.name}: <strong>{p.value} ₴</strong>
        </p>
      ))}
    </div>
  );
}

function CannibalizationTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { payload: (typeof CANNIBALIZATION_DATA)[0] }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className={CHART_TOOLTIP_CLASS}>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      <p>
        Cashback categories:{' '}
        <strong>{row?.cashbackCats?.toLocaleString('uk-UA')} ₴</strong>
      </p>
      <p>
        Other categories:{' '}
        <strong>{row?.otherCats?.toLocaleString('uk-UA')} ₴</strong>
      </p>
      <p className='pt-1 font-medium'>
        Total: {row?.total?.toLocaleString('uk-UA')} ₴
      </p>
    </div>
  );
}

function ROIBarTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={CHART_TOOLTIP_CLASS}>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      <p className='font-bold'>ROI: {payload[0]?.value ?? 0}x</p>
    </div>
  );
}

const ANOMALY_MESSAGES: Record<string, string> = {
  Travel: 'High turnover and cashback with low ROI',
  'Building Materials': 'Disproportionately high cashback relative to turnover',
  Medicine: 'Low ROI with high cashback'
};

function ROIScatterTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: { payload: (typeof ROI_CATEGORIES)[0] }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className={cn(CHART_TOOLTIP_CLASS, 'min-w-[200px]')}>
      <p className='mb-1 text-sm font-semibold'>{d.name}</p>
      <p>Turnover: {d.turnover.toLocaleString('uk-UA')} k ₴</p>
      <p>Cashback: {d.cashback.toLocaleString('uk-UA')} k ₴</p>
      <p>Transactions: {d.transactions.toLocaleString('uk-UA')}</p>
      {d.isAnomaly && ANOMALY_MESSAGES[d.name] && (
        <p className='text-warning mt-1 font-medium'>
          ⚠️ Anomaly: {ANOMALY_MESSAGES[d.name]}
        </p>
      )}
    </div>
  );
}

function ROILineTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={CHART_TOOLTIP_CLASS}>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      {payload.map((p) => (
        <p key={p.name}>
          {p.name}: {p.value}x
        </p>
      ))}
    </div>
  );
}

export default function CashbackImpactPage() {
  const [selectedFunnelCategory, setSelectedFunnelCategory] =
    useState<string>('all');
  const [isMetricDrawerOpen, setIsMetricDrawerOpen] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState<string>(
    'activation_conversion'
  );

  const openMetricDetail = (metricId: string) => {
    setSelectedMetricId(metricId);
    setIsMetricDrawerOpen(true);
  };

  const selectedMetric = getMetricById(selectedMetricId);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase'>
              Top Management · Cashback Program · February 2025
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>
              Cashback Impact
            </h2>
            <p className='text-muted-foreground mt-0.5 text-sm'>
              Cashback program effectiveness analysis by category
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Select defaultValue='all'>
              <SelectTrigger className='w-[180px] shrink-0'>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c === 'All Categories' ? 'all' : c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue='6m'>
              <SelectTrigger className='w-[160px] shrink-0'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='6m'>Last 6 months</SelectItem>
                <SelectItem value='3m'>Last 3 months</SelectItem>
                <SelectItem value='ytd'>Year to date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6'>
          {KPI_CARDS.map((item) => (
            <KpiMetricCard
              key={item.metricId}
              metric={getMetricById(item.metricId)}
              value={item.value}
              delta={item.delta}
              subtitle={item.subtitle}
              onInfoOpen={openMetricDetail}
            />
          ))}
        </div>

        <Card className='border-muted-foreground/20 bg-muted/30'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-semibold tracking-wide uppercase'>
              Categories with Low Conversion (&lt;5%)
            </CardTitle>
            <p className='text-muted-foreground mt-1 text-xs'>
              Categories with conversion &lt;5% require offer or
              communication review.
            </p>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {ZERO_CONVERSION_CATEGORIES.map((item) => (
                <div
                  key={item.name}
                  className='border-primary/20 bg-background/50 border-l-primary/40 flex flex-col gap-0.5 rounded-md border-l-4 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4'
                >
                  <div className='flex flex-col gap-0.5'>
                    <span className='font-medium'>{item.name}</span>
                    <span className='text-muted-foreground text-xs'>
                      {item.cause}
                    </span>
                  </div>
                  <span className='text-muted-foreground font-medium tabular-nums'>
                    {item.conversion}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className='space-y-6'>
          <div className='border-border border-t pt-6'>
            <h3 className='text-lg font-semibold tracking-tight'>
              Block 1: ROI by Categories
            </h3>
            <p className='text-muted-foreground text-sm'>
              ROI analysis by categories: bar chart, turnover/cashback scatter,
              top-5 dynamics
            </p>
          </div>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>ROI by Categories</CardTitle>
              <CardDescription>
                Sorted by ROI from highest to lowest. Zones: red
                &lt;50x, yellow 50–200x, green &gt;200x
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={380}>
                <BarChart
                  data={ROI_CATEGORIES}
                  layout='vertical'
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <ReferenceArea
                    x1={0}
                    x2={50}
                    fill={chartPalette.danger}
                    fillOpacity={0.15}
                  />
                  <ReferenceArea
                    x1={50}
                    x2={200}
                    fill={chartPalette.warning}
                    fillOpacity={0.15}
                  />
                  <ReferenceArea
                    x1={200}
                    x2={400}
                    fill={chartPalette.primary}
                    fillOpacity={0.1}
                  />
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='var(--border)'
                    horizontal={false}
                  />
                  <XAxis
                    type='number'
                    tickFormatter={(v) => `${v}x`}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type='category'
                    dataKey='name'
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<ROIBarTooltip />} />
                  <Bar dataKey='roi' radius={[0, 3, 3, 0]}>
                    {ROI_CATEGORIES.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.roi < 50
                            ? chartPalette.danger
                            : entry.roi <= 200
                              ? chartPalette.warning
                              : chartPalette.primary
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Turnover vs Cashback</CardTitle>
              <CardDescription>
                Each category = bubble. Size = number of transactions.
                Anomalous categories highlighted in tooltip
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <ScatterChart
                  margin={{ top: 16, right: 16, left: 16, bottom: 16 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
                  <XAxis
                    dataKey='turnover'
                    name='Turnover (k ₴)'
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    dataKey='cashback'
                    name='Cashback (k ₴)'
                    tick={{ fontSize: 12 }}
                  />
                  <ZAxis
                    dataKey='transactions'
                    type='number'
                    range={[40, 400]}
                    name='Transactions'
                  />
                  <Tooltip content={<ROIScatterTooltip />} />
                  <Scatter data={ROI_CATEGORIES} fill={chartPalette.primary}>
                    {ROI_CATEGORIES.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.isAnomaly
                            ? chartPalette.warning
                            : chartPalette.primary
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>
                ROI Dynamics for Top 5 Categories
              </CardTitle>
              <CardDescription>Last 6 months (Sep–Feb)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart
                  data={ROI_DYNAMICS}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
                  <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${v}x`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<ROILineTooltip />} />
                  <Legend
                    iconSize={8}
                    iconType='square'
                    wrapperStyle={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  />
                  <Line
                    type='monotone'
                    dataKey='Supermarkets'
                    stroke={chartPalette.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartPalette.primary }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='Restaurants'
                    stroke={chartPalette.chart2}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartPalette.chart2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='Gas Stations'
                    stroke={chartPalette.chart3}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartPalette.chart3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='Online Shopping'
                    stroke={chartPalette.chart4}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartPalette.chart4 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='Pharmacies'
                    stroke={chartPalette.chart5}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartPalette.chart5 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className='border-border border-t pt-6'>
            <h3 className='text-lg font-semibold tracking-tight'>
              Block 2: Conversion Funnel
            </h3>
            <p className='text-muted-foreground text-sm'>
              Conversion funnel and heatmap "Conversion vs Average Check"
            </p>
          </div>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Conversion Funnel</CardTitle>
              <CardDescription>
                4 steps: transactions → offer → category → activation
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Select
                value={selectedFunnelCategory}
                onValueChange={setSelectedFunnelCategory}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNNEL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === 'all' ? 'All Categories' : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className='space-y-4'>
                {(FUNNEL_DATA[selectedFunnelCategory] ?? FUNNEL_DATA.all).map(
                  (step) => (
                    <div key={step.label} className='space-y-1'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='font-medium'>{step.label}</span>
                        <span className='text-muted-foreground tabular-nums'>
                          {step.value.toLocaleString('uk-UA')}
                          {step.pct < 100 ? ` (${step.pct}%)` : ''}
                        </span>
                      </div>
                      <div className='bg-muted relative h-8 w-full overflow-hidden rounded-md'>
                        <div
                          className='bg-primary/80 relative flex h-full items-center rounded-md transition-all'
                          style={{ width: `${step.pct}%` }}
                        >
                          {step.pct < 100 && step.pct >= 15 && (
                            <span className='text-primary-foreground px-2 text-xs font-medium'>
                              {step.pct}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>
                Conversion vs Average Check
              </CardTitle>
              <CardDescription>
                Rows = categories, columns = check ranges. Color = %
                conversion. Transport and Supermarkets show the highest conversion
                at low check — the cheapest loyalty.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <div className='min-w-[500px]'>
                  <div className='mb-2 grid grid-cols-6 gap-1 text-center text-xs'>
                    <div className='font-medium' />
                    {HEATMAP_CHECK_RANGES.map((range) => (
                      <div
                        key={range}
                        className='text-muted-foreground font-medium'
                      >
                        {range}
                      </div>
                    ))}
                  </div>
                  {HEATMAP_DATA.map((row) => (
                    <div
                      key={row.category}
                      className='mb-1 grid grid-cols-6 gap-1'
                    >
                      <div className='flex items-center text-sm font-medium'>
                        {row.category}
                      </div>
                      {row.values.map((pct, i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex min-h-[36px] items-center justify-center rounded-md text-sm font-medium tabular-nums',
                            getHeatColor(pct)
                          )}
                          title={`${row.category}: ${HEATMAP_CHECK_RANGES[i]} — ${pct}%`}
                        >
                          {pct}%
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='border-border border-t pt-6'>
            <h3 className='text-lg font-semibold tracking-tight'>
              Block 3: Incrementality
            </h3>
            <p className='text-muted-foreground text-sm'>
              Before/after, cohort activated vs control group, cannibalization
              analysis
            </p>
          </div>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>
                Turnover and transactions: before vs after offer launch
              </CardTitle>
              <CardDescription>
                3 months before vs 3 months after for top 8 categories
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <p className='text-muted-foreground mb-2 text-xs font-medium'>
                  Turnover (k ₴)
                </p>
                <ResponsiveContainer width='100%' height={280}>
                  <BarChart
                    data={BEFORE_AFTER_DATA}
                    layout='vertical'
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    barCategoryGap='25%'
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='var(--border)'
                      horizontal={false}
                    />
                    <XAxis type='number' tick={{ fontSize: 12 }} />
                    <YAxis
                      type='category'
                      dataKey='category'
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip content={<BeforeAfterTooltip />} />
                    <Bar
                      dataKey='before'
                      name='Before'
                      fill={chartPalette.neutral}
                      radius={[0, 3, 3, 0]}
                    />
                    <Bar
                      dataKey='after'
                      name='After'
                      fill={chartPalette.primary}
                      radius={[0, 3, 3, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className='text-muted-foreground mb-2 text-xs font-medium'>
                  Transactions
                </p>
                <ResponsiveContainer width='100%' height={280}>
                  <BarChart
                    data={BEFORE_AFTER_DATA}
                    layout='vertical'
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    barCategoryGap='25%'
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='var(--border)'
                      horizontal={false}
                    />
                    <XAxis
                      type='number'
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                      }
                    />
                    <YAxis
                      type='category'
                      dataKey='category'
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip content={<BeforeAfterTooltip />} />
                    <Bar
                      dataKey='txBefore'
                      name='Before'
                      fill={chartPalette.neutral}
                      radius={[0, 3, 3, 0]}
                    />
                    <Bar
                      dataKey='txAfter'
                      name='After'
                      fill={chartPalette.primary}
                      radius={[0, 3, 3, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>
                Cohort: activated vs control group
              </CardTitle>
              <CardDescription>
                Average turnover per client (₴/month) over 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={260}>
                <LineChart
                  data={COHORT_DATA}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
                  <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v} ₴`}
                  />
                  <Tooltip content={<CohortTooltip />} />
                  <Legend
                    iconSize={8}
                    iconType='square'
                    wrapperStyle={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)',
                      fontFamily: 'var(--font-sans)'
                    }}
                    formatter={(v) =>
                      v === 'activated'
                        ? 'Cashback Activated'
                        : 'Control Group'
                    }
                  />
                  <Line
                    type='monotone'
                    dataKey='activated'
                    name='activated'
                    stroke={chartPalette.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartPalette.primary }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='control'
                    name='control'
                    stroke={chartPalette.neutral}
                    strokeWidth={1.5}
                    strokeDasharray='5 5'
                    dot={{ r: 3, fill: chartPalette.neutral }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className='text-muted-foreground text-xs'>
              February: +146% activated vs control group
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>
                Cannibalization: cashback categories vs others
              </CardTitle>
              <CardDescription>
                Total client spending before and after cashback activation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={260}>
                <BarChart
                  data={CANNIBALIZATION_DATA}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  barCategoryGap='25%'
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
                  <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip content={<CannibalizationTooltip />} />
                  <Legend
                    iconSize={8}
                    iconType='square'
                    wrapperStyle={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)',
                      fontFamily: 'var(--font-sans)'
                    }}
                    formatter={(v) =>
                      v === 'cashbackCats'
                        ? 'Cashback categories'
                        : 'Other categories'
                    }
                  />
                  <Bar
                    dataKey='cashbackCats'
                    name='cashbackCats'
                    stackId='a'
                    fill={chartPalette.primary}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey='otherCats'
                    name='otherCats'
                    stackId='a'
                    fill={chartPalette.neutral}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className='text-muted-foreground text-xs'>
              Total spending increased — not just redistribution between categories.
              Cashback categories +112%, others −12% for the period.
            </CardFooter>
          </Card>
        </div>
        <MetricInsightDrawer
          metric={selectedMetric}
          open={isMetricDrawerOpen}
          onOpenChange={setIsMetricDrawerOpen}
        />
      </div>
    </PageContainer>
  );
}
