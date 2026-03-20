'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IconFlask,
  IconTrendingUp,
  IconTrendingDown,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconUsers,
  IconChartBar,
  IconCreditCard
} from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { chartPalette } from '@/lib/chart-theme';

// --- Tooltip ---
function ABTestTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className='bg-card text-card-foreground min-w-[200px] space-y-1 rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='mb-1 text-sm font-semibold'>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// --- Palette ---
const C = {
  control: chartPalette.neutral,
  test: chartPalette.primary
};

// --- Mock Data ---
const activeTests = [
  {
    id: 'AB-2025-07',
    name: 'Personal Cashback: Café 5% vs 7%',
    type: 'personal',
    status: 'active',
    startDate: '01.02.2025',
    endDate: '28.02.2025',
    daysLeft: 7,
    confidence: 87,
    targetMetric: 'Funnel Conversion',
    controlGroup: { size: 4100, conversion: 58, turnover: 3200, txCount: 5.1 },
    testGroup: { size: 4100, conversion: 71, turnover: 4800, txCount: 6.8 },
    winner: null
  },
  {
    id: 'AB-2025-08',
    name: 'Push Cashback Reminder (Day 3)',
    type: 'default',
    status: 'active',
    startDate: '10.02.2025',
    endDate: '10.03.2025',
    daysLeft: 18,
    confidence: 72,
    targetMetric: 'Cashback Activation',
    controlGroup: { size: 8500, conversion: 62, turnover: 3800, txCount: 5.6 },
    testGroup: { size: 8500, conversion: 67, turnover: 4100, txCount: 5.9 },
    winner: null
  }
];

const completedTests = [
  {
    id: 'AB-2025-04',
    name: 'Default: Gas Stations 3% vs 5%',
    type: 'default',
    status: 'completed',
    startDate: '01.01.2025',
    endDate: '31.01.2025',
    daysLeft: 0,
    confidence: 98,
    targetMetric: 'Gas Station Turnover',
    controlGroup: { size: 12000, conversion: 41, turnover: 2100, txCount: 3.8 },
    testGroup: { size: 12000, conversion: 56, turnover: 3400, txCount: 5.2 },
    winner: 'test'
  },
  {
    id: 'AB-2025-05',
    name: 'Personal: Sports — Display Variant A vs B',
    type: 'personal',
    status: 'completed',
    startDate: '05.01.2025',
    endDate: '04.02.2025',
    daysLeft: 0,
    confidence: 95,
    targetMetric: 'Offer CTR',
    controlGroup: { size: 2200, conversion: 68, turnover: 4200, txCount: 6.1 },
    testGroup: { size: 2200, conversion: 65, turnover: 3900, txCount: 5.8 },
    winner: 'control'
  },
  {
    id: 'AB-2025-06',
    name: 'Bolt Food Partner: Limited vs Unlimited Cashback',
    type: 'partner',
    status: 'completed',
    startDate: '15.01.2025',
    endDate: '14.02.2025',
    daysLeft: 0,
    confidence: 99,
    targetMetric: 'Conversion & Turnover',
    controlGroup: { size: 5500, conversion: 55, turnover: 2800, txCount: 4.9 },
    testGroup: { size: 5500, conversion: 72, turnover: 4600, txCount: 7.2 },
    winner: 'test'
  }
];

const selectedTestData = [
  { metric: 'Conversion %', control: 58, test: 71 },
  { metric: 'Turnover (₴/100)', control: 32, test: 48 },
  { metric: 'Transaction Count', control: 51, test: 68 },
  { metric: 'Avg Transaction (₴/10)', control: 63, test: 71 }
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')
    return (
      <Badge className='bg-primary/10 text-primary hover:bg-primary/10'>
        <IconClock className='mr-1 size-3' /> Active
      </Badge>
    );
  return (
    <Badge className='bg-success/10 text-success hover:bg-success/10'>
      <IconCircleCheck className='mr-1 size-3' /> Completed
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'outline' }
  > = {
    default: { label: 'Default', variant: 'secondary' },
    partner: { label: 'Partner', variant: 'outline' },
    personal: { label: 'Personal', variant: 'default' }
  };
  const t = map[type] || map['default'];
  return <Badge variant={t.variant}>{t.label}</Badge>;
}

function TestCard({ test }: { test: (typeof activeTests)[0] }) {
  const lift = test.testGroup.conversion - test.controlGroup.conversion;
  const isWinnerTest = test.winner === 'test';
  const isWinnerControl = test.winner === 'control';

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <div className='mb-1 flex items-center gap-2'>
              <StatusBadge status={test.status} />
              <TypeBadge type={test.type} />
              <span className='text-muted-foreground text-xs'>{test.id}</span>
            </div>
            <CardTitle className='text-base'>{test.name}</CardTitle>
            <CardDescription className='mt-0.5'>
              {test.startDate} – {test.endDate} · Target:{' '}
              <strong>{test.targetMetric}</strong>
            </CardDescription>
          </div>
          <div className='text-right'>
            <p className='text-muted-foreground text-xs'>Confidence</p>
            <p
              className={`text-2xl font-bold ${test.confidence >= 95 ? 'text-primary' : test.confidence >= 80 ? 'text-chart-warning' : 'text-muted-foreground'}`}
            >
              {test.confidence}%
            </p>
            <p
              className={`text-xs ${test.confidence >= 95 ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {test.confidence >= 95
                ? '✓ Statistically Significant'
                : 'Collecting Data'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          {/* Control */}
          <div
            className={`rounded-lg border p-3 ${isWinnerControl ? 'border-success/50 bg-success/10' : ''}`}
          >
            <div className='mb-2 flex items-center gap-2'>
              <span className='text-sm font-semibold'>Control Group</span>
              {isWinnerControl && (
                <Badge className='bg-success text-success-foreground text-xs'>
                  Winner
                </Badge>
              )}
            </div>
            <p className='text-muted-foreground text-xs'>
              {test.controlGroup.size.toLocaleString()} clients
            </p>
            <div className='mt-2 space-y-1'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Conversion</span>
                <span className='font-semibold'>
                  {test.controlGroup.conversion}%
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Turnover</span>
                <span className='font-semibold'>
                  {test.controlGroup.turnover.toLocaleString()} ₴
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Transaction Count</span>
                <span className='font-semibold'>
                  {test.controlGroup.txCount}
                </span>
              </div>
            </div>
          </div>

          {/* Test */}
          <div
            className={`rounded-lg border p-3 ${isWinnerTest ? 'border-success/50 bg-success/10' : ''}`}
          >
            <div className='mb-2 flex items-center gap-2'>
              <span className='text-sm font-semibold'>Test Group</span>
              {isWinnerTest && (
                <Badge className='bg-success text-success-foreground text-xs'>
                  Winner
                </Badge>
              )}
            </div>
            <p className='text-muted-foreground text-xs'>
              {test.testGroup.size.toLocaleString()} clients
            </p>
            <div className='mt-2 space-y-1'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Conversion</span>
                <span className='font-semibold'>
                  {test.testGroup.conversion}%
                  <span
                    className={`ml-1 text-xs ${lift > 0 ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    ({lift > 0 ? '+' : ''}
                    {lift}pp)
                  </span>
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Turnover</span>
                <span className='font-semibold'>
                  {test.testGroup.turnover.toLocaleString()} ₴
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Transaction Count</span>
                <span className='font-semibold'>{test.testGroup.txCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className='mt-3'>
          <div className='mb-1 flex items-center justify-between text-xs'>
            <span className='text-muted-foreground'>
              Statistical Confidence
            </span>
            <span className='font-medium'>{test.confidence}% / 95% threshold</span>
          </div>
          <Progress value={test.confidence} className='h-1.5' />
        </div>
      </CardContent>
      {test.status === 'active' && (
        <CardFooter className='text-muted-foreground text-xs'>
          <IconClock className='mr-1 size-3' />
          {test.daysLeft} days remaining until completion
        </CardFooter>
      )}
    </Card>
  );
}

export default function ABTestsPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-5'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>A/B Tests</h2>
            <p className='text-muted-foreground text-sm'>
              Comparison of test and control groups for cashback offers
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Select defaultValue='all'>
              <SelectTrigger className='w-[160px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='default'>Default</SelectItem>
                <SelectItem value='partner'>Partner</SelectItem>
                <SelectItem value='personal'>Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {[
            {
              label: 'Active Tests',
              value: '2',
              icon: <IconFlask className='size-4' />,
              color: 'text-primary'
            },
            {
              label: 'Completed (month)',
              value: '3',
              icon: <IconCircleCheck className='size-4' />,
              color: 'text-primary'
            },
            {
              label: 'Confirmed Hypotheses',
              value: '2 / 3',
              icon: <IconTrendingUp className='size-4' />,
              color: 'text-primary'
            },
            {
              label: 'Avg Conversion Lift',
              value: '+11.3pp',
              icon: <IconChartBar className='size-4' />,
              color: 'text-primary'
            }
          ].map((kpi, i) => (
            <Card key={i}>
              <CardHeader className='pb-2'>
                <CardDescription
                  className={`flex items-center gap-1 ${kpi.color}`}
                >
                  {kpi.icon} {kpi.label}
                </CardDescription>
                <CardTitle className='text-2xl font-bold'>
                  {kpi.value}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Tabs: Active / Completed */}
        <Tabs defaultValue='active'>
          <TabsList>
            <TabsTrigger value='active'>
              Active{' '}
              <Badge className='bg-primary text-primary-foreground ml-2'>
                {activeTests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value='completed'>
              Completed{' '}
              <Badge className='ml-2' variant='secondary'>
                {completedTests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='active' className='mt-4 space-y-4'>
            {activeTests.map((test) => (
              <TestCard key={test.id} test={test as any} />
            ))}
          </TabsContent>

          <TabsContent value='completed' className='mt-4 space-y-4'>
            {completedTests.map((test) => (
              <TestCard key={test.id} test={test as any} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Deep dive chart */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison: AB-2025-07</CardTitle>
            <CardDescription>
              Personal Cashback Café 5% vs 7% — group metrics comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={260}>
              <BarChart data={selectedTestData} barCategoryGap='25%' barGap={4}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='var(--border)'
                  xAxisId={0}
                  yAxisId={0}
                />
                <XAxis dataKey='metric' tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<ABTestTooltip />} />
                <Legend
                  iconSize={8}
                  iconType='square'
                  wrapperStyle={{
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                    fontFamily: 'var(--font-sans)'
                  }}
                />
                <ReferenceLine y={0} stroke='var(--border)' />
                <Bar
                  dataKey='control'
                  name='Control Group'
                  fill={C.control}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey='test'
                  name='Test Group'
                  fill={C.test}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className='text-muted-foreground text-sm'>
            Confidence 87% — test ongoing. Expected result date: 28.02.2025
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
