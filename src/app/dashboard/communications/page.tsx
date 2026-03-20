'use client';

import { Fragment, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IconTrash,
  IconUpload,
  IconDownload,
  IconMailForward,
  IconDeviceMobile,
  IconBell,
  IconMessage,
  IconMail,
  IconMailOpened,
  IconTag,
  IconCheck,
  IconInfoCircle,
  IconChevronDown,
  IconChevronUp,
  IconTrophy
} from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  PRODUCT_DICTIONARY,
  type ProductDictionaryEntry
} from '@/features/cashback/data/analytics-dictionaries.mock';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────
interface CashbackSegment {
  customers: number;
  purchases: number;
  revenue: number;
}

interface CommRow {
  customerId: string;
  campaignId?: string;
  name: string;
  channel: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  company?: string;
  date?: string;
  revenue?: number;
  avgSpendWithComm?: number;
  avgSpendControl?: number;
  cashback?: CashbackSegment;
  noCashback?: CashbackSegment;
}

interface CommBatch {
  id: string;
  name: string;
  uploadedAt: string;
  productId?: string;
  targetActionId?: string;
  rows: CommRow[];
}

// ─── Helpers ────────────────────────────────────────────────
function batchStats(rows: CommRow[]) {
  const sent = rows.reduce((s, r) => s + r.sent, 0);
  const delivered = rows.reduce((s, r) => s + r.delivered, 0);
  const opened = rows.reduce((s, r) => s + r.opened, 0);
  const clicked = rows.reduce((s, r) => s + r.clicked, 0);
  const converted = rows.reduce((s, r) => s + r.converted, 0);
  const revenue = rows.reduce((s, r) => s + (r.revenue ?? 0), 0);
  return { sent, delivered, opened, clicked, converted, revenue };
}

function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 100);
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return n.toLocaleString('en-US');
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₴`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k ₴`;
  return `${n} ₴`;
}

// ─── Channel stats aggregation ──────────────────────────────
interface ChannelStat {
  channel: string;
  sent: number;
  converted: number;
  overallConv: number;
  hasLift: boolean;
  liftPerUser: number;
  avgSpendWithComm: number;
  avgSpendControl: number;
  totalLift: number;
  bestCampaign: string;
  campaigns: number;
}

function getChannelStats(batches: CommBatch[]): ChannelStat[] {
  const allRows = batches.flatMap((b) => b.rows);
  const channels = Array.from(new Set(allRows.map((r) => r.channel)));

  return channels
    .map((channel) => {
      const rows = allRows.filter((r) => r.channel === channel);
      const sent = rows.reduce((s, r) => s + r.sent, 0);
      const converted = rows.reduce((s, r) => s + r.converted, 0);

      const liftRows = rows.filter(
        (r) =>
          r.avgSpendWithComm !== undefined && r.avgSpendControl !== undefined
      );
      const hasLift = liftRows.length > 0;

      let liftPerUser = 0;
      let avgSpendWithComm = 0;
      let avgSpendControl = 0;
      let totalLift = 0;

      if (hasLift) {
        const liftConverted = liftRows.reduce((s, r) => s + r.converted, 0);
        if (liftConverted > 0) {
          avgSpendWithComm = Math.round(
            liftRows.reduce(
              (s, r) => s + (r.avgSpendWithComm ?? 0) * r.converted,
              0
            ) / liftConverted
          );
          avgSpendControl = Math.round(
            liftRows.reduce(
              (s, r) => s + (r.avgSpendControl ?? 0) * r.converted,
              0
            ) / liftConverted
          );
          liftPerUser = avgSpendWithComm - avgSpendControl;
        }
        totalLift = liftRows.reduce(
          (s, r) =>
            s +
            ((r.avgSpendWithComm ?? 0) - (r.avgSpendControl ?? 0)) *
              r.converted,
          0
        );
      }

      const bestRow = rows.reduce((best, r) => {
        const conv = r.sent > 0 ? r.converted / r.sent : 0;
        const bestConv = best.sent > 0 ? best.converted / best.sent : 0;
        return conv > bestConv ? r : best;
      }, rows[0]);

      return {
        channel,
        sent,
        converted,
        overallConv: pct(converted, sent),
        hasLift,
        liftPerUser,
        avgSpendWithComm,
        avgSpendControl,
        totalLift,
        bestCampaign: bestRow?.name ?? '—',
        campaigns: rows.length
      };
    })
    .sort((a, b) => b.totalLift - a.totalLift);
}

const CHANNEL_COLORS: Record<string, string> = {
  Email: 'bg-channel-email/15 text-channel-email border-channel-email/30',
  SMS: 'bg-channel-sms/15 text-channel-sms border-channel-sms/30',
  Push: 'bg-channel-push/15 text-channel-push border-channel-push/30',
  Viber: 'bg-channel-viber/15 text-channel-viber border-channel-viber/30',
  Other: 'bg-muted text-muted-foreground border-border'
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  Email: <IconMail className='size-3' />,
  SMS: <IconDeviceMobile className='size-3' />,
  Push: <IconBell className='size-3' />,
  Viber: <IconMessage className='size-3' />,
  Other: <IconMailForward className='size-3' />
};

const CHANNEL_ICON_LG: Record<string, React.ReactNode> = {
  Email: <IconMail className='size-4' />,
  SMS: <IconDeviceMobile className='size-4' />,
  Push: <IconBell className='size-4' />,
  Viber: <IconMessage className='size-4' />,
  Other: <IconMailForward className='size-4' />
};

const BATCH_COLORS = [
  'var(--chart-1)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-primary-light)',
  'var(--chart-2)'
];

// ─── Target action lookup ────────────────────────────────────
function getTargetActionLabel(
  productId?: string,
  targetActionId?: string
): { productName: string; actionName: string } | null {
  if (!productId || !targetActionId) return null;
  const product = PRODUCT_DICTIONARY.find((p) => p.id === productId);
  if (!product) return null;
  const action = product.targetActions.find((ta) => ta.id === targetActionId);
  if (!action) return null;
  return { productName: product.name, actionName: action.name };
}

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_BATCHES: CommBatch[] = [
  {
    id: '1',
    name: 'February 2025 — Email + Push',
    uploadedAt: '23.02.2025',
    productId: 'PRD-RADA-CARD',
    targetActionId: 'TA-RADA-CB-TX',
    rows: [
      {
        customerId: 'CL-00142',
        name: 'Gas Station Cashback Promo',
        channel: 'Email',
        company: 'WOG Gas',
        date: '18.02.2025',
        sent: 42000,
        delivered: 39900,
        opened: 14364,
        clicked: 2873,
        converted: 689,
        revenue: 447850,
        avgSpendWithComm: 1350,
        avgSpendControl: 950,
        cashback: { customers: 487, purchases: 560, revenue: 369600 },
        noCashback: { customers: 99, purchases: 129, revenue: 78250 }
      },
      {
        customerId: 'CL-00298',
        name: 'Rozetka Reminder',
        channel: 'Push',
        company: 'Rozetka',
        date: '20.02.2025',
        sent: 28000,
        delivered: 27160,
        opened: 10864,
        clicked: 3259,
        converted: 978,
        revenue: 802360,
        avgSpendWithComm: 1100,
        avgSpendControl: 850,
        cashback: { customers: 702, purchases: 800, revenue: 656000 },
        noCashback: { customers: 148, purchases: 178, revenue: 146360 }
      },
      {
        customerId: 'CL-00415',
        name: 'Personalized Café Offer',
        channel: 'Email',
        company: 'Honey',
        date: '19.02.2025',
        sent: 9500,
        delivered: 9120,
        opened: 4560,
        clicked: 1368,
        converted: 479,
        revenue: 134120,
        avgSpendWithComm: 1350,
        avgSpendControl: 950,
        cashback: { customers: 340, purchases: 370, revenue: 103820 },
        noCashback: { customers: 85, purchases: 109, revenue: 30300 }
      },
      {
        customerId: 'CL-00533',
        name: 'Bolt Food — New Category',
        channel: 'Push',
        company: 'Bolt Food',
        date: '21.02.2025',
        sent: 15000,
        delivered: 14400,
        opened: 5040,
        clicked: 1008,
        converted: 252,
        revenue: 88200,
        avgSpendWithComm: 1100,
        avgSpendControl: 850,
        cashback: { customers: 175, purchases: 196, revenue: 68600 },
        noCashback: { customers: 45, purchases: 56, revenue: 19600 }
      }
    ]
  },
  {
    id: '2',
    name: 'January 2025 — SMS Campaign',
    uploadedAt: '31.01.2025',
    productId: 'PRD-RADA-CARD',
    targetActionId: 'TA-RADA-CATEGORY-SELECT',
    rows: [
      {
        customerId: 'CL-00672',
        name: 'Winter Supermarket Promo',
        channel: 'SMS',
        company: 'Silpo',
        date: '15.01.2025',
        sent: 55000,
        delivered: 52800,
        opened: 26400,
        clicked: 3960,
        converted: 792,
        revenue: 950400,
        avgSpendWithComm: 980,
        avgSpendControl: 850,
        cashback: { customers: 521, purchases: 600, revenue: 720000 },
        noCashback: { customers: 149, purchases: 192, revenue: 230400 }
      },
      {
        customerId: 'CL-00781',
        name: 'Pharmacies — 15% Discount',
        channel: 'SMS',
        company: 'ANC Pharmacy',
        date: '20.01.2025',
        sent: 35000,
        delivered: 33600,
        opened: 15120,
        clicked: 1814,
        converted: 326,
        revenue: 114100,
        avgSpendWithComm: 980,
        avgSpendControl: 850,
        cashback: { customers: 204, purchases: 220, revenue: 77000 },
        noCashback: { customers: 79, purchases: 106, revenue: 37100 }
      },
      {
        customerId: 'CL-00894',
        name: 'Viber: New Partners',
        channel: 'Viber',
        company: 'Premium Partners',
        date: '25.01.2025',
        sent: 12000,
        delivered: 11520,
        opened: 5760,
        clicked: 1728,
        converted: 604,
        revenue: 573800,
        avgSpendWithComm: 2400,
        avgSpendControl: 1600,
        cashback: { customers: 423, purchases: 504, revenue: 479800 },
        noCashback: { customers: 81, purchases: 100, revenue: 94000 }
      }
    ]
  },
  {
    id: '3',
    name: 'December 2024 — New Year Campaign',
    uploadedAt: '01.12.2024',
    productId: 'PRD-DEPOSIT',
    targetActionId: 'TA-DEP-OPEN',
    rows: [
      {
        customerId: 'CL-01023',
        name: 'Email: New Year Gifts',
        channel: 'Email',
        company: 'Rozetka',
        date: '01.12.2024',
        sent: 68000,
        delivered: 64600,
        opened: 29070,
        clicked: 7267,
        converted: 2180,
        revenue: 2398000,
        avgSpendWithComm: 1350,
        avgSpendControl: 950
      },
      {
        customerId: 'CL-01156',
        name: 'Push: Holiday Offers',
        channel: 'Push',
        company: 'All Partners',
        date: '10.12.2024',
        sent: 95000,
        delivered: 91200,
        opened: 27360,
        clicked: 5472,
        converted: 1094,
        revenue: 547000,
        avgSpendWithComm: 1100,
        avgSpendControl: 850
      },
      {
        customerId: 'CL-01289',
        name: 'SMS: Cashback Reminder',
        channel: 'SMS',
        company: 'WOG Gas',
        date: '15.12.2024',
        sent: 22000,
        delivered: 21120,
        opened: 11616,
        clicked: 2323,
        converted: 603,
        revenue: 422100,
        avgSpendWithComm: 980,
        avgSpendControl: 850
      },
      {
        customerId: 'CL-01402',
        name: 'Viber: Premium Exclusive',
        channel: 'Viber',
        company: 'Premium Club',
        date: '20.12.2024',
        sent: 8500,
        delivered: 8245,
        opened: 5358,
        clicked: 1607,
        converted: 643,
        revenue: 900200,
        avgSpendWithComm: 2400,
        avgSpendControl: 1600
      }
    ]
  }
];

const EXTRA_MOCK_BATCH: CommBatch = {
  id: 'extra',
  name: 'New Import — March 2025',
  uploadedAt: '01.03.2025',
  productId: 'PRD-SALARY',
  targetActionId: 'TA-SAL-ACTIVE-CARD-TX',
  rows: [
    {
      customerId: 'CL-01530',
      name: 'Email: Spring Promo',
      channel: 'Email',
      company: 'Silpo',
      date: '01.03.2025',
      sent: 50000,
      delivered: 47500,
      opened: 19000,
      clicked: 4750,
      converted: 1425,
      revenue: 1282500,
      avgSpendWithComm: 1350,
      avgSpendControl: 950
    },
    {
      customerId: 'CL-01647',
      name: 'Push: Client Retention',
      channel: 'Push',
      company: 'Bolt Food',
      date: '03.03.2025',
      sent: 18000,
      delivered: 17280,
      opened: 5184,
      clicked: 1036,
      converted: 207,
      revenue: 72450,
      avgSpendWithComm: 1100,
      avgSpendControl: 850
    },
    {
      customerId: 'CL-01763',
      name: 'SMS: Gas Station Discount',
      channel: 'SMS',
      company: 'WOG Gas',
      date: '05.03.2025',
      sent: 30000,
      delivered: 28800,
      opened: 14400,
      clicked: 2160,
      converted: 432,
      revenue: 302400,
      avgSpendWithComm: 980,
      avgSpendControl: 850
    }
  ]
};

// ─── SVG Funnel ──────────────────────────────────────────────
function CommFunnel({ batch, color }: { batch: CommBatch; color: string }) {
  const t = useTranslations('communications');
  const s = batchStats(batch.rows);
  const steps = [
    { label: t('sent'), value: s.sent },
    { label: t('delivered'), value: s.delivered },
    { label: t('opened'), value: s.opened },
    { label: t('clicks'), value: s.clicked },
    { label: t('converted'), value: s.converted }
  ];
  const maxVal = steps[0].value;
  const W = 300;
  const stepH = 64;
  const H = stepH * steps.length + 8;
  const minPct = 0.25;

  return (
    <div>
      <p className='text-foreground mb-2 truncate text-sm font-semibold'>
        {batch.name}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width='100%'
        style={{
          maxWidth: W,
          display: 'block',
          margin: '0 auto',
          fontFamily: 'var(--font-sans)'
        }}
      >
        {steps.map((step, i) => {
          const pctVal = step.value / maxVal;
          const prevPct = i === 0 ? 1 : steps[i - 1].value / maxVal;
          const w = Math.max(pctVal, minPct) * W;
          const pw = Math.max(prevPct, minPct) * W;
          const x = (W - w) / 2;
          const px = (W - pw) / 2;
          const y = i * stepH;
          const dropPct =
            i > 0 ? Math.round((1 - step.value / steps[i - 1].value) * 100) : 0;

          const path = `M${px} ${y + 4} L${px + pw} ${y + 4} L${x + w} ${y + stepH - 8} L${x} ${y + stepH - 8} Z`;

          return (
            <g key={i}>
              <path
                d={path}
                fill='var(--card)'
                stroke={color}
                strokeWidth={2}
              />
              <text
                x={W / 2}
                y={y + 17}
                textAnchor='middle'
                fontSize={11}
                fill='var(--foreground)'
                fontWeight={500}
              >
                {step.label}
              </text>
              <text
                x={W / 2}
                y={y + 32}
                textAnchor='middle'
                fontSize={12}
                fill={color}
                fontWeight={700}
              >
                {step.value >= 1000
                  ? `${(step.value / 1000).toFixed(0)}k`
                  : step.value.toLocaleString('en-US')}
              </text>
              <text
                x={W / 2}
                y={y + 45}
                textAnchor='middle'
                fontSize={10}
                fill='var(--muted-foreground)'
              >
                {Math.round(pctVal * 100)}{t('fromStart')}
              </text>
              {i > 0 && (
                <>
                  <rect
                    x={W - 72}
                    y={y - 13}
                    width={66}
                    height={13}
                    rx={2}
                    fill={dropPct > 30 ? 'var(--destructive)' : 'var(--muted)'}
                    fillOpacity={dropPct > 30 ? 0.1 : 1}
                  />
                  <text
                    x={W - 39}
                    y={y - 3}
                    textAnchor='middle'
                    fontSize={9}
                    fontWeight={600}
                    fill={
                      dropPct > 30
                        ? 'var(--destructive)'
                        : 'var(--muted-foreground)'
                    }
                  >
                    -{dropPct}% {t('droppedOff')}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Cashback Detail Panel ─────────────────────────────────────
function CashbackDetailPanel({ row }: { row: CommRow }) {
  const t = useTranslations('communications');
  const { cashback, noCashback } = row;

  return (
    <div className='px-4 py-3'>
      <p className='text-muted-foreground mb-2.5 text-xs font-semibold tracking-wide uppercase'>
        {t('segmentBreakdown')}
      </p>
      <div className='grid grid-cols-2 gap-3'>
        {/* With Cashback */}
        {cashback ? (
          <div className='border-primary/30 bg-primary/10 rounded-lg border p-3'>
            <div className='mb-2 flex items-center gap-1.5'>
              <span className='bg-primary/15 inline-flex size-5 items-center justify-center rounded-full'>
                <IconTag className='text-primary size-3' />
              </span>
              <span className='text-primary text-xs font-semibold'>
                {t('withCashback')}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs'>
              <span className='text-muted-foreground'>{t('clients')}</span>
              <span className='text-foreground text-right font-medium tabular-nums'>
                {fmtNum(cashback.customers)}
              </span>
              <span className='text-muted-foreground'>{t('purchases')}</span>
              <span className='text-foreground text-right font-medium tabular-nums'>
                {fmtNum(cashback.purchases)}
              </span>
              <span className='text-muted-foreground'>{t('totalAmount')}</span>
              <span className='text-foreground text-right font-medium tabular-nums'>
                {fmtMoney(cashback.revenue)}
              </span>
              <span className='text-muted-foreground'>{t('averageCheck')}</span>
              <span className='text-primary text-right font-semibold tabular-nums'>
                {fmtMoney(
                  cashback.purchases > 0
                    ? Math.round(cashback.revenue / cashback.purchases)
                    : 0
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className='border-border flex items-center justify-center rounded-lg border border-dashed p-3'>
            <span className='text-muted-foreground text-xs'>{t('noData')}</span>
          </div>
        )}

        {/* Without Cashback */}
        {noCashback ? (
          <div className='border-border bg-muted/50 rounded-lg border p-3'>
            <div className='mb-2 flex items-center gap-1.5'>
              <span className='bg-muted inline-flex size-5 items-center justify-center rounded-full'>
                <IconMailOpened className='text-muted-foreground size-3' />
              </span>
              <span className='text-muted-foreground text-xs font-semibold'>
                {t('withoutCashback')}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs'>
              <span className='text-muted-foreground'>{t('clients')}</span>
              <span className='text-foreground text-right font-medium tabular-nums'>
                {fmtNum(noCashback.customers)}
              </span>
              <span className='text-muted-foreground'>{t('purchases')}</span>
              <span className='text-foreground text-right font-medium tabular-nums'>
                {fmtNum(noCashback.purchases)}
              </span>
              <span className='text-muted-foreground'>{t('totalAmount')}</span>
              <span className='text-foreground text-right font-medium tabular-nums'>
                {fmtMoney(noCashback.revenue)}
              </span>
              <span className='text-muted-foreground'>{t('averageCheck')}</span>
              <span className='text-muted-foreground text-right font-semibold tabular-nums'>
                {fmtMoney(
                  noCashback.purchases > 0
                    ? Math.round(noCashback.revenue / noCashback.purchases)
                    : 0
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className='border-border flex items-center justify-center rounded-lg border border-dashed p-3'>
            <span className='text-muted-foreground text-xs'>{t('noData')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Campaign Detail Table ────────────────────────────────────
function CampaignDetailTable({ rows }: { rows: CommRow[] }) {
  const t = useTranslations('communications');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const hasCompany = rows.some((r) => r.company);
  const hasDate = rows.some((r) => r.date);
  const hasRevenue = rows.some((r) => r.revenue !== undefined);
  const hasSegments = rows.some((r) => r.cashback ?? r.noCashback);

  const sorted = [...rows].sort((a, b) => {
    const ca = a.sent > 0 ? a.converted / a.sent : 0;
    const cb = b.sent > 0 ? b.converted / b.sent : 0;
    return cb - ca;
  });

  const bestConv = Math.max(
    ...sorted.map((r) => (r.sent > 0 ? r.converted / r.sent : 0))
  );

  const colCount =
    3 +
    (hasCompany ? 1 : 0) +
    (hasDate ? 1 : 0) +
    (hasRevenue ? 2 : 0) +
    (hasSegments ? 1 : 0);

  return (
    <div className='border-border overflow-x-auto rounded-xl border'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted'>
            <TableHead className='pl-4'>{t('campaignName')}</TableHead>
            <TableHead>{t('channel')}</TableHead>
            {hasCompany && <TableHead>{t('company')}</TableHead>}
            {hasDate && <TableHead>{t('date')}</TableHead>}
            <TableHead className='text-right'>{t('sent')}</TableHead>
            <TableHead className='text-right font-semibold'>
              {t('madePurchase')}
            </TableHead>
            <TableHead className='text-right'>{t('purchaseCount')}</TableHead>
            {hasRevenue && (
              <TableHead className='text-right'>{t('averageCheck')}</TableHead>
            )}
            {hasRevenue && (
              <TableHead className={cn('text-right', !hasSegments && 'pr-4')}>
                {t('revenueLift')}
              </TableHead>
            )}
            {hasSegments && <TableHead className='w-8 pr-3' />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r, idx) => {
            const rowKey = r.customerId || String(idx);
            const rowConv = r.sent > 0 ? r.converted / r.sent : 0;
            const isTop = rowConv === bestConv && rowConv > 0;
            const hasDetail = !!(r.cashback ?? r.noCashback);
            const isExpanded = expandedKey === rowKey;

            return (
              <Fragment key={rowKey}>
                <TableRow
                  className={cn(
                    hasDetail && 'cursor-pointer select-none',
                    isTop && !isExpanded && 'bg-primary/10',
                    isExpanded && 'bg-primary/10'
                  )}
                  onClick={() =>
                    hasDetail
                      ? setExpandedKey(isExpanded ? null : rowKey)
                      : undefined
                  }
                >
                  <TableCell className='pl-4'>
                    <div className='flex items-center gap-1.5'>
                      {isTop && (
                        <IconTrophy className='text-primary size-3.5 shrink-0' />
                      )}
                      <span className='text-foreground text-sm font-medium'>
                        {r.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                        CHANNEL_COLORS[r.channel] ?? CHANNEL_COLORS['Other']
                      )}
                    >
                      {CHANNEL_ICONS[r.channel] ?? CHANNEL_ICONS['Other']}
                      {r.channel}
                    </span>
                  </TableCell>
                  {hasCompany && (
                    <TableCell className='text-muted-foreground text-xs'>
                      {r.company ?? '—'}
                    </TableCell>
                  )}
                  {hasDate && (
                    <TableCell className='text-muted-foreground text-xs tabular-nums'>
                      {r.date ?? '—'}
                    </TableCell>
                  )}
                  <TableCell className='text-muted-foreground text-right text-xs tabular-nums'>
                    {fmtNum(r.sent)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <span
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        isTop
                          ? 'text-primary'
                          : rowConv >= 0.02
                            ? 'text-primary'
                            : 'text-muted-foreground'
                      )}
                    >
                      {pct(r.converted, r.sent)}%
                    </span>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-right text-xs tabular-nums'>
                    {fmtNum(r.converted)}
                  </TableCell>
                  {hasRevenue && (
                    <TableCell className='text-muted-foreground text-right text-xs tabular-nums'>
                      {r.revenue !== undefined && r.converted > 0
                        ? fmtMoney(Math.round(r.revenue / r.converted))
                        : '—'}
                    </TableCell>
                  )}
                  {hasRevenue && (
                    <TableCell
                      className={cn(
                        'text-muted-foreground text-right text-xs font-medium tabular-nums',
                        !hasSegments && 'pr-4'
                      )}
                    >
                      {r.revenue !== undefined ? fmtMoney(r.revenue) : '—'}
                    </TableCell>
                  )}
                  {hasSegments && (
                    <TableCell className='pr-3 text-right'>
                      {hasDetail ? (
                        <button
                          className={cn(
                            'inline-flex size-6 items-center justify-center rounded-md transition-colors',
                            isExpanded
                              ? 'bg-primary/15 text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedKey(isExpanded ? null : rowKey);
                          }}
                          title={t('segmentBreakdown')}
                        >
                          {isExpanded ? (
                            <IconChevronUp className='size-3.5' />
                          ) : (
                            <IconChevronDown className='size-3.5' />
                          )}
                        </button>
                      ) : null}
                    </TableCell>
                  )}
                </TableRow>
                {isExpanded && (
                  <TableRow className='bg-muted/50 hover:bg-muted/50'>
                    <TableCell colSpan={colCount} className='p-0'>
                      <CashbackDetailPanel row={r} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Channel Summary Section ─────────────────────────────────
function ChannelSummarySection({ batches }: { batches: CommBatch[] }) {
  const t = useTranslations('communications');
  if (batches.length === 0) return null;

  const stats = getChannelStats(batches);

  return (
    <div>
      <div className='mb-3'>
        <p className='text-foreground text-sm font-semibold'>
          {t('channelEffectiveness')}
        </p>
        <p className='text-muted-foreground text-xs'>
          {t('channelEffectivenessDescription')}
        </p>
      </div>

      <div
        className={cn(
          'grid gap-3',
          stats.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : stats.length === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        )}
      >
        {stats.map((s, idx) => {
          const isTop = idx === 0;
          return (
            <div
              key={s.channel}
              className={cn(
                'relative rounded-xl border p-4 transition-all',
                isTop
                  ? 'border-primary/40 bg-primary/10'
                  : 'border-border bg-card'
              )}
            >
              {isTop && (
                <div className='absolute top-3 right-3'>
                  <IconTrophy className='text-primary size-4' />
                </div>
              )}

              {/* Rank + channel badge */}
              <div className='mb-3 flex items-center gap-2'>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isTop
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  #{idx + 1}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                    CHANNEL_COLORS[s.channel] ?? CHANNEL_COLORS['Other']
                  )}
                >
                  {CHANNEL_ICON_LG[s.channel] ?? CHANNEL_ICON_LG['Other']}
                  {s.channel}
                </span>
                <span className='text-muted-foreground text-xs'>
                  {s.campaigns} {t('campaigns')}
                </span>
              </div>

              {/* Hero: Made Purchase */}
              <div className='mb-3'>
                <p className='text-muted-foreground text-xs'>{t('madePurchase')}</p>
                <p
                  className={cn(
                    'text-3xl leading-none font-black tabular-nums',
                    isTop ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {s.overallConv}%
                </p>
                <p className='text-muted-foreground mt-0.5 text-xs'>
                  {fmtNum(s.converted)} {t('receivedMessage', { count: fmtNum(s.sent) })}
                </p>
              </div>

              {/* Lift */}
              {s.hasLift && (
                <>
                  <div className='bg-primary/10 mb-2 rounded-lg px-2.5 py-2'>
                    <p className='text-muted-foreground text-[10px]'>
                      {t('revenueLiftPerParticipant')}
                    </p>
                    <p
                      className={cn(
                        'text-lg font-black tabular-nums',
                        s.liftPerUser > 0
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      +{fmtNum(s.liftPerUser)} {t('perMonth')}
                    </p>
                    <p className='text-muted-foreground mt-0.5 text-[10px]'>
                      {fmtNum(s.avgSpendWithComm)} ₴ {t('withCommunication')} ·{' '}
                      {fmtNum(s.avgSpendControl)} ₴ {t('without')}
                    </p>
                  </div>

                  <div className='bg-primary/10 mb-3 rounded-lg px-2.5 py-2'>
                    <p className='text-muted-foreground text-[10px]'>
                      {t('totalRevenueLift')}
                    </p>
                    <p className='text-primary text-sm font-bold tabular-nums'>
                      {fmtMoney(s.totalLift)}
                    </p>
                    <p className='text-muted-foreground mt-0.5 text-[10px]'>
                      {t('acrossParticipants', { count: fmtNum(s.converted) })}
                    </p>
                  </div>
                </>
              )}

              {/* Best campaign */}
              <div className='border-border/50 border-t pt-2'>
                <p className='text-muted-foreground text-[10px]'>
                  {t('topCampaign')}
                </p>
                <p className='text-muted-foreground mt-0.5 truncate text-xs font-medium'>
                  {s.bestCampaign}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className='text-muted-foreground mt-2 text-[11px]'>
        {t('revenueLiftNote')}
      </p>
    </div>
  );
}

// ─── Batch Card ──────────────────────────────────────────────
function BatchCard({
  batch,
  selected,
  expanded,
  onToggle,
  onDelete,
  onExpand
}: {
  batch: CommBatch;
  selected: boolean;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onExpand: () => void;
}) {
  const t = useTranslations('communications');
  const s = batchStats(batch.rows);
  const overallConv = pct(s.converted, s.sent);
  const channels = Array.from(new Set(batch.rows.map((r) => r.channel)));

  return (
    <div
      onClick={onExpand}
      className={cn(
        'cursor-pointer rounded-xl border transition-all',
        expanded
          ? 'border-primary ring-primary/30 ring-2 ring-offset-1'
          : selected
            ? 'border-primary/50 bg-primary/10 ring-primary/30 ring-2 ring-offset-1'
            : 'border-border bg-card hover:border-border/60 hover:shadow-sm'
      )}
    >
      <div className='p-4'>
        <div className='mb-3 flex items-start justify-between gap-2'>
          <div className='flex min-w-0 items-start gap-2.5'>
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selected}
                onCheckedChange={onToggle}
                className='mt-0.5 shrink-0'
              />
            </div>
            <div className='min-w-0'>
              <p className='text-foreground truncate text-sm font-semibold'>
                {batch.name}
              </p>
              <p className='text-muted-foreground mt-0.5 text-xs'>
                {batch.uploadedAt}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            {expanded ? (
              <IconChevronUp className='text-primary size-3.5' />
            ) : (
              <IconChevronDown className='text-muted-foreground/40 size-3.5' />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className='text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive shrink-0 rounded p-1 transition-colors'
            >
              <IconTrash className='size-3.5' />
            </button>
          </div>
        </div>

        <div className='mb-3 grid grid-cols-2 gap-2'>
          <div className='bg-muted rounded-lg px-3 py-2'>
            <p className='text-muted-foreground text-xs'>{t('sent')}</p>
            <p className='text-foreground text-base font-bold tabular-nums'>
              {fmtNum(s.sent)}
            </p>
          </div>
          <div className='bg-primary/10 rounded-lg px-3 py-2'>
            <p className='text-muted-foreground text-xs'>{t('madePurchase')}</p>
            <p
              className={cn(
                'text-base font-bold tabular-nums',
                overallConv >= 3
                  ? 'text-primary'
                  : overallConv >= 1.5
                    ? 'text-muted-foreground'
                    : 'text-destructive'
              )}
            >
              {overallConv}%
            </p>
          </div>
        </div>

        {s.revenue > 0 && (
          <div className='bg-primary/10 mb-3 rounded-lg px-3 py-2'>
            <p className='text-muted-foreground text-xs'>
              {t('generatedTurnover')}
            </p>
            <p className='text-primary text-base font-bold tabular-nums'>
              {fmtMoney(s.revenue)}
            </p>
          </div>
        )}

        <div className='mb-3 space-y-1.5'>
          {[
            { label: t('delivery'), val: pct(s.delivered, s.sent), ref: 95 },
            { label: t('opens'), val: pct(s.opened, s.delivered), ref: 30 },
            { label: t('clicks'), val: pct(s.clicked, s.opened), ref: 20 }
          ].map((m) => (
            <div key={m.label} className='flex items-center gap-2'>
              <span className='text-muted-foreground w-16 shrink-0 text-xs'>
                {m.label}
              </span>
              <div className='bg-muted h-1.5 flex-1 overflow-hidden rounded-full'>
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    m.val >= m.ref ? 'bg-primary' : 'bg-muted-foreground/40'
                  )}
                  style={{ width: `${Math.min(m.val, 100)}%` }}
                />
              </div>
              <span className='text-muted-foreground w-8 shrink-0 text-right text-xs font-medium tabular-nums'>
                {m.val}%
              </span>
            </div>
          ))}
        </div>

        <div className='flex flex-wrap gap-1.5'>
          {channels.map((ch) => (
            <span
              key={ch}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                CHANNEL_COLORS[ch] ?? CHANNEL_COLORS['Other']
              )}
            >
              {CHANNEL_ICONS[ch] ?? CHANNEL_ICONS['Other']}
              {ch}
            </span>
          ))}
          <span className='border-border bg-muted text-muted-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-xs'>
            {t('campaignCount', { count: batch.rows.length })}
          </span>
        </div>

        {(() => {
          const label = getTargetActionLabel(
            batch.productId,
            batch.targetActionId
          );
          if (!label) return null;
          return (
            <div className='border-border/50 mt-3 flex items-start gap-1.5 border-t pt-3'>
              <IconTag className='text-muted-foreground mt-0.5 size-3 shrink-0' />
              <div className='min-w-0'>
                <p className='text-muted-foreground truncate text-[10px] leading-none'>
                  {label.productName}
                </p>
                <p className='text-foreground mt-0.5 truncate text-xs font-medium'>
                  {label.actionName}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Comparison Table ────────────────────────────────────────
function ComparisonTable({ batches }: { batches: CommBatch[] }) {
  const t = useTranslations('communications');
  const metrics = batches.map((b) => {
    const s = batchStats(b.rows);
    return {
      id: b.id,
      name: b.name,
      deliveryRate: pct(s.delivered, s.sent),
      openRate: pct(s.opened, s.delivered),
      clickRate: pct(s.clicked, s.opened),
      convRate: pct(s.converted, s.clicked),
      overallConv: pct(s.converted, s.sent),
      revenue: s.revenue
    };
  });

  const best = {
    deliveryRate: Math.max(...metrics.map((m) => m.deliveryRate)),
    openRate: Math.max(...metrics.map((m) => m.openRate)),
    clickRate: Math.max(...metrics.map((m) => m.clickRate)),
    convRate: Math.max(...metrics.map((m) => m.convRate)),
    overallConv: Math.max(...metrics.map((m) => m.overallConv)),
    revenue: Math.max(...metrics.map((m) => m.revenue))
  };

  type MetricKey = keyof typeof best;

  const hasRevenue = metrics.some((m) => m.revenue > 0);

  const cols: { key: MetricKey; label: string; desc: string }[] = [
    {
      key: 'deliveryRate',
      label: t('delivery'),
      desc: t('deliveryDesc')
    },
    {
      key: 'openRate',
      label: t('opened'),
      desc: t('openedDesc')
    },
    {
      key: 'clickRate',
      label: t('clicked'),
      desc: t('clickedDesc')
    },
    {
      key: 'convRate',
      label: t('conversion'),
      desc: t('conversionDesc')
    },
    {
      key: 'overallConv',
      label: t('madePurchase'),
      desc: t('madePurchaseDesc')
    },
    ...(hasRevenue
      ? [
          {
            key: 'revenue' as MetricKey,
            label: t('revenueLift'),
            desc: t('revenueLiftDesc')
          }
        ]
      : [])
  ];

  return (
    <div className='border-border overflow-x-auto rounded-xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[220px]'>{t('upload')}</TableHead>
            {cols.map((c) => (
              <TableHead key={c.key} className='text-right'>
                <div>
                  <p className='text-xs font-semibold'>{c.label}</p>
                  <p className='text-muted-foreground text-xs font-normal'>
                    {c.desc}
                  </p>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((m, idx) => (
            <TableRow key={m.id}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <span
                    className='inline-block size-2.5 shrink-0 rounded-full'
                    style={{
                      background: BATCH_COLORS[idx % BATCH_COLORS.length]
                    }}
                  />
                  <span className='text-sm font-medium'>{m.name}</span>
                </div>
              </TableCell>
              {cols.map((c) => {
                const val = m[c.key];
                const isBest = val === best[c.key] && val > 0;
                return (
                  <TableCell key={c.key} className='text-right'>
                    <span
                      className={cn(
                        'inline-flex items-center justify-end gap-1 text-sm font-semibold tabular-nums',
                        isBest ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {isBest && <IconCheck className='size-3' />}
                      {c.key === 'revenue'
                        ? fmtMoney(val as number)
                        : `${val}%`}
                    </span>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── CSV Format Card ─────────────────────────────────────────
function FormatCard() {
  const t = useTranslations('communications');
  const columns = [
    { col: 'customer_id', type: 'string', example: 'CL-00142', required: true },
    { col: 'campaign_id', type: 'string', example: 'CMP-001', required: true },
    { col: 'name', type: 'string', example: 'Email promo', required: true },
    { col: 'channel', type: 'string', example: 'Email', required: true },
    { col: 'sent', type: 'date', example: '18.02.2025', required: true },
    { col: 'delivered', type: 'date', example: '18.02.2025', required: false },
    { col: 'opened', type: 'date', example: '19.02.2025', required: false },
    { col: 'clicked', type: 'date', example: '19.02.2025', required: false },
    { col: 'company', type: 'string', example: 'Rozetka', required: false }
  ];

  function downloadSample() {
    const header =
      'customer_id,campaign_id,name,channel,sent,delivered,opened,clicked,company';
    const rows = [
      'CL-00142,CMP-001,Email promo,Email,18.02.2025,18.02.2025,19.02.2025,19.02.2025,Rozetka',
      'CL-00298,CMP-002,SMS reminder,SMS,20.02.2025,20.02.2025,21.02.2025,,WOG Gas',
      'CL-00415,CMP-001,Push — Rozetka,Push,22.02.2025,22.02.2025,,,Rozetka',
      'CL-00533,CMP-003,Viber premium,Viber,23.02.2025,23.02.2025,23.02.2025,24.02.2025,Premium Club'
    ];
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'communications_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className='h-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <CardTitle className='text-base'>{t('csvStructureTitle')}</CardTitle>
            <CardDescription className='mt-0.5'>
              {t('csvStructureDescription')}
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={downloadSample}
            className='shrink-0 gap-1.5'
          >
            <IconDownload className='size-3.5' />
            {t('sample')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='pl-6'>{t('column')}</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('example')}</TableHead>
              <TableHead className='pr-6 text-right'>{t('required')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columns.map((c) => (
              <TableRow key={c.col}>
                <TableCell className='pl-6'>
                  <code className='bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs'>
                    {c.col}
                  </code>
                </TableCell>
                <TableCell className='text-muted-foreground text-xs'>
                  {c.type === 'date' ? t('typeDate') : t('typeString')}
                </TableCell>
                <TableCell className='text-muted-foreground text-xs'>
                  {c.example}
                </TableCell>
                <TableCell className='pr-6 text-right'>
                  {c.required ? (
                    <span className='text-primary text-xs font-medium'>✓</span>
                  ) : (
                    <span className='text-muted-foreground/40 text-xs'>—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='border-border/50 flex items-start gap-2 border-t px-6 py-3'>
          <IconInfoCircle className='text-muted-foreground mt-0.5 size-3.5 shrink-0' />
          <p className='text-muted-foreground text-xs'>
            {t.rich('csvHelpText', {
              b: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Upload Card ─────────────────────────────────────────────
function UploadCard({
  onUpload
}: {
  onUpload: (productId: string, targetActionId: string) => void;
}) {
  const t = useTranslations('communications');
  const [dragging, setDragging] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedTargetActionId, setSelectedTargetActionId] = useState('');

  const selectedProduct: ProductDictionaryEntry | undefined =
    PRODUCT_DICTIONARY.find((p) => p.id === selectedProductId);
  const canUpload = !!selectedProductId && !!selectedTargetActionId;

  function handleProductChange(value: string) {
    setSelectedProductId(value);
    setSelectedTargetActionId('');
  }

  function triggerUpload() {
    if (!canUpload) return;
    onUpload(selectedProductId, selectedTargetActionId);
  }

  return (
    <Card className='h-full'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>{t('uploadTitle')}</CardTitle>
        <CardDescription>
          {t('uploadDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='grid gap-3'>
          <div className='grid gap-1.5'>
            <label className='text-foreground text-xs font-medium'>
              {t('product')}
            </label>
            <Select
              value={selectedProductId}
              onValueChange={handleProductChange}
            >
              <SelectTrigger className='w-full text-sm'>
                <SelectValue placeholder={t('selectProduct')} />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_DICTIONARY.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-1.5'>
            <label
              className={cn(
                'text-xs font-medium transition-colors',
                selectedProductId
                  ? 'text-foreground'
                  : 'text-muted-foreground/50'
              )}
            >
              {t('targetAction')}
            </label>
            <Select
              value={selectedTargetActionId}
              onValueChange={setSelectedTargetActionId}
              disabled={!selectedProductId}
            >
              <SelectTrigger className='w-full text-sm'>
                <SelectValue
                  placeholder={
                    selectedProductId
                      ? t('selectTargetAction')
                      : t('selectProductFirst')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {selectedProduct?.targetActions.map((ta) => (
                  <SelectItem key={ta.id} value={ta.id}>
                    {ta.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (canUpload) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            triggerUpload();
          }}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-all',
            canUpload
              ? dragging
                ? 'border-primary bg-primary/10 cursor-pointer'
                : 'border-border bg-muted hover:border-primary/50 hover:bg-primary/10 cursor-pointer'
              : 'border-border/40 bg-muted/40 cursor-not-allowed opacity-50'
          )}
          onClick={triggerUpload}
        >
          <div
            className={cn(
              'mb-3 flex size-12 items-center justify-center rounded-full',
              canUpload ? 'bg-primary/15' : 'bg-muted'
            )}
          >
            <IconUpload
              className={cn(
                'size-6',
                canUpload ? 'text-primary' : 'text-muted-foreground/40'
              )}
            />
          </div>
          <p className='text-foreground text-sm font-medium'>
            {t('dragCsvHere')}
          </p>
          <p className='text-muted-foreground mt-1 text-xs'>
            {canUpload ? t('orClickToSelect') : t('selectProductAndAction')}
          </p>
          <Badge variant='outline' className='mt-3 text-xs'>
            .csv · UTF-8
          </Badge>
        </div>

        <div className='grid grid-cols-3 gap-2 text-center'>
          {[
            { label: t('channels'), value: 'Email, SMS, Push, Viber' },
            { label: t('rows'), value: t('noLimit') },
            { label: t('format'), value: 'CSV (UTF-8)' }
          ].map((item) => (
            <div key={item.label} className='bg-muted rounded-lg px-2 py-2'>
              <p className='text-muted-foreground text-[10px]'>{item.label}</p>
              <p className='text-foreground mt-0.5 text-xs font-medium'>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function CommunicationsPage() {
  const t = useTranslations('communications');
  const [batches, setBatches] = useState<CommBatch[]>(MOCK_BATCHES);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  function handleUpload(productId: string, targetActionId: string) {
    if (batches.find((b) => b.id === EXTRA_MOCK_BATCH.id)) {
      toast.info(t('alreadyInList'));
      return;
    }
    setBatches((prev) => [
      { ...EXTRA_MOCK_BATCH, productId, targetActionId },
      ...prev
    ]);
    toast.success(t('fileUploaded'), {
      description: `${EXTRA_MOCK_BATCH.name} · ${t('campaignCount', { count: EXTRA_MOCK_BATCH.rows.length })}`
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function deleteBatch(id: string) {
    setBatches((prev) => prev.filter((b) => b.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    if (expandedBatchId === id) setExpandedBatchId(null);
  }

  function toggleExpand(id: string) {
    setExpandedBatchId((prev) => (prev === id ? null : id));
  }

  const selectedBatches = batches.filter((b) => selectedIds.includes(b.id));
  const canCompare = selectedBatches.length >= 2;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* ── Header ── */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase'>
              {t('breadcrumb')}
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>{t('title')}</h2>
            <p className='text-muted-foreground mt-0.5 text-sm'>
              {t('description')}
            </p>
          </div>
          <Button
            onClick={() => setShowUpload((v) => !v)}
            className='shrink-0 gap-2'
            variant={showUpload ? 'outline' : 'default'}
          >
            <IconUpload className='size-4' />
            {showUpload ? t('hideButton') : t('uploadButton')}
          </Button>
        </div>

        {/* ── Upload + Format ── */}
        {showUpload && (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <UploadCard onUpload={handleUpload} />
            <FormatCard />
          </div>
        )}

        {/* ── Channel Summary ── */}
        {batches.length > 0 && <ChannelSummarySection batches={batches} />}

        {/* ── History ── */}
        <div>
          <div className='mb-3 flex items-center justify-between gap-2'>
            <div>
              <p className='text-foreground text-sm font-semibold'>
                {t('uploadedCampaigns')}
              </p>
              <p className='text-muted-foreground text-xs'>
                {t('uploadsSelectCompare', { count: batches.length })}
              </p>
            </div>
            {selectedIds.length > 0 && (
              <Badge variant='secondary' className='gap-1'>
                {canCompare
                  ? t('selectedComparison', { count: selectedIds.length })
                  : t('selectedCount', { count: selectedIds.length })}
              </Badge>
            )}
          </div>
          {batches.length === 0 ? (
            <div className='border-border flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center'>
              <IconMailForward className='text-muted-foreground/40 mb-3 size-10' />
              <p className='text-muted-foreground text-sm font-medium'>
                {t('noUploadedData')}
              </p>
              <p className='text-muted-foreground mt-1 text-xs'>
                {t('uploadFirstCsv')}
              </p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {batches.map((batch) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    selected={selectedIds.includes(batch.id)}
                    expanded={expandedBatchId === batch.id}
                    onToggle={() => toggleSelect(batch.id)}
                    onDelete={() => deleteBatch(batch.id)}
                    onExpand={() => toggleExpand(batch.id)}
                  />
                ))}
              </div>

              {expandedBatchId &&
                (() => {
                  const b = batches.find((x) => x.id === expandedBatchId);
                  if (!b) return null;
                  return (
                    <div className='border-primary/30 bg-card mt-3 overflow-hidden rounded-xl border'>
                      <div className='border-border/50 flex items-center justify-between border-b px-4 py-3'>
                        <div>
                          <p className='text-foreground text-sm font-semibold'>
                            {b.name}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {t('detailsFor', { count: b.rows.length })}
                          </p>
                          {(() => {
                            const label = getTargetActionLabel(
                              b.productId,
                              b.targetActionId
                            );
                            if (!label) return null;
                            return (
                              <div className='mt-1 flex items-center gap-1'>
                                <IconTag className='text-muted-foreground size-3 shrink-0' />
                                <span className='text-muted-foreground text-xs'>
                                  {label.productName}
                                </span>
                                <span className='text-muted-foreground/40 text-xs'>
                                  ·
                                </span>
                                <span className='text-foreground text-xs font-medium'>
                                  {label.actionName}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <button
                          onClick={() => setExpandedBatchId(null)}
                          className='text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors'
                        >
                          <IconChevronUp className='size-4' />
                        </button>
                      </div>
                      <CampaignDetailTable rows={b.rows} />
                    </div>
                  );
                })()}
            </>
          )}
        </div>

        {/* ── Comparison ── */}
        {canCompare && (
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-border h-px flex-1' />
              <p className='text-muted-foreground shrink-0 text-xs font-semibold tracking-widest uppercase'>
                {t('comparingUploads', { count: selectedBatches.length })}
              </p>
              <div className='bg-border h-px flex-1' />
            </div>

            <ComparisonTable batches={selectedBatches} />

            <div
              className={cn(
                'grid gap-4',
                selectedBatches.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : selectedBatches.length === 3
                    ? 'grid-cols-1 md:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              )}
            >
              {selectedBatches.map((batch, idx) => (
                <Card key={batch.id}>
                  <CardHeader className='pb-2'>
                    <div className='flex items-center gap-2'>
                      <span
                        className='inline-block size-3 rounded-full'
                        style={{
                          background: BATCH_COLORS[idx % BATCH_COLORS.length]
                        }}
                      />
                      <CardTitle className='text-sm'>{batch.name}</CardTitle>
                    </div>
                    <CardDescription className='text-xs'>
                      {t('campaignCount', { count: batch.rows.length })} · {batch.uploadedAt}
                    </CardDescription>
                    {(() => {
                      const label = getTargetActionLabel(
                        batch.productId,
                        batch.targetActionId
                      );
                      if (!label) return null;
                      return (
                        <div className='flex items-center gap-1 pt-0.5'>
                          <IconTag className='text-muted-foreground size-3 shrink-0' />
                          <span className='text-muted-foreground text-xs'>
                            {label.productName} · {label.actionName}
                          </span>
                        </div>
                      );
                    })()}
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <CommFunnel
                      batch={batch}
                      color={BATCH_COLORS[idx % BATCH_COLORS.length]}
                    />

                    {(() => {
                      const s = batchStats(batch.rows);
                      return (
                        <>
                          <div className='mt-3 grid grid-cols-2 gap-2'>
                            {[
                              {
                                label: t('opened'),
                                val: pct(s.opened, s.delivered)
                              },
                              {
                                label: t('clicked'),
                                val: pct(s.clicked, s.opened)
                              },
                              {
                                label: t('conversion'),
                                val: pct(s.converted, s.clicked)
                              },
                              {
                                label: t('madePurchase'),
                                val: pct(s.converted, s.sent)
                              }
                            ].map((m) => (
                              <div
                                key={m.label}
                                className='bg-muted rounded-lg px-2.5 py-2 text-center'
                              >
                                <p className='text-primary text-xs font-bold tabular-nums'>
                                  {m.val}%
                                </p>
                                <p className='text-muted-foreground mt-0.5 text-[10px]'>
                                  {m.label}
                                </p>
                              </div>
                            ))}
                          </div>
                          {s.revenue > 0 && (
                            <div className='bg-primary/10 mt-2 rounded-lg px-2.5 py-2 text-center'>
                              <p className='text-primary text-xs font-bold tabular-nums'>
                                {fmtMoney(s.revenue)}
                              </p>
                              <p className='text-muted-foreground mt-0.5 text-[10px]'>
                                {t('generatedTurnoverShort')}
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!canCompare && selectedIds.length === 1 && (
          <div className='border-primary/30 bg-primary/10 text-primary flex items-center gap-2 rounded-lg border px-4 py-3 text-sm'>
            <IconInfoCircle className='size-4 shrink-0' />
            {t('selectOneMore')}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
