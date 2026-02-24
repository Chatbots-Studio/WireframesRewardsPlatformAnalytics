'use client';

import { Fragment, useState } from 'react';
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
  IconCheck,
  IconInfoCircle,
  IconChevronDown,
  IconChevronUp,
  IconTrophy
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────
interface CashbackSegment {
  customers: number;
  purchases: number;
  revenue: number;
}

interface CommRow {
  customerId: string;
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
  return n.toLocaleString('uk-UA');
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
  Email: 'bg-blue-100 text-blue-700 border-blue-200',
  SMS: 'bg-purple-100 text-purple-700 border-purple-200',
  Push: 'bg-orange-100 text-orange-700 border-orange-200',
  Viber: 'bg-teal-100 text-teal-700 border-teal-200',
  Інше: 'bg-slate-100 text-slate-600 border-slate-200'
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  Email: <IconMail className='size-3' />,
  SMS: <IconDeviceMobile className='size-3' />,
  Push: <IconBell className='size-3' />,
  Viber: <IconMessage className='size-3' />,
  Інше: <IconMailForward className='size-3' />
};

const CHANNEL_ICON_LG: Record<string, React.ReactNode> = {
  Email: <IconMail className='size-4' />,
  SMS: <IconDeviceMobile className='size-4' />,
  Push: <IconBell className='size-4' />,
  Viber: <IconMessage className='size-4' />,
  Інше: <IconMailForward className='size-4' />
};

const BATCH_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#0ea5e9'
];

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_BATCHES: CommBatch[] = [
  {
    id: '1',
    name: 'Лютий 2025 — Email + Push',
    uploadedAt: '23.02.2025',
    rows: [
      {
        customerId: 'CL-00142',
        name: 'Акція на кешбек АЗС',
        channel: 'Email',
        company: 'WOG АЗС',
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
        name: 'Нагадування Rozetka',
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
        name: 'Персональна пропозиція кафе',
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
        name: 'Bolt Food — нова категорія',
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
    name: 'Січень 2025 — SMS-кампанія',
    uploadedAt: '31.01.2025',
    rows: [
      {
        customerId: 'CL-00672',
        name: 'Зимова акція супермаркети',
        channel: 'SMS',
        company: 'Сільпо',
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
        name: 'Аптеки — знижка 15%',
        channel: 'SMS',
        company: 'Аптека АНЦ',
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
        name: 'Viber: нові партнери',
        channel: 'Viber',
        company: 'Преміум партнери',
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
    name: 'Грудень 2024 — Новорічна кампанія',
    uploadedAt: '01.12.2024',
    rows: [
      {
        customerId: 'CL-01023',
        name: 'Email: Новорічні подарунки',
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
        name: 'Push: Святкові пропозиції',
        channel: 'Push',
        company: 'Всі партнери',
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
        name: 'SMS: Нагадування кешбек',
        channel: 'SMS',
        company: 'WOG АЗС',
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
        name: 'Viber: Ексклюзив преміум',
        channel: 'Viber',
        company: 'Преміум клуб',
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
  name: 'Новий імпорт — Березень 2025',
  uploadedAt: '01.03.2025',
  rows: [
    {
      customerId: 'CL-01530',
      name: 'Email: Весняна акція',
      channel: 'Email',
      company: 'Сільпо',
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
      name: 'Push: Повернення клієнтів',
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
      name: 'SMS: Знижка АЗС',
      channel: 'SMS',
      company: 'WOG АЗС',
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
  const s = batchStats(batch.rows);
  const steps = [
    { label: 'Надіслано', value: s.sent },
    { label: 'Доставлено', value: s.delivered },
    { label: 'Відкрито', value: s.opened },
    { label: 'Переходи', value: s.clicked },
    { label: 'Конвертовано', value: s.converted }
  ];
  const maxVal = steps[0].value;
  const W = 300;
  const stepH = 64;
  const H = stepH * steps.length + 8;
  const minPct = 0.25;

  return (
    <div>
      <p className='mb-2 truncate text-sm font-semibold text-slate-700'>
        {batch.name}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width='100%'
        style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
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
                fill='#f8faff'
                stroke={color}
                strokeWidth={1.5}
                opacity={0.95}
              />
              <text
                x={W / 2}
                y={y + 17}
                textAnchor='middle'
                fontSize={10}
                fill='#475569'
                fontWeight={500}
              >
                {step.label}
              </text>
              <text
                x={W / 2}
                y={y + 32}
                textAnchor='middle'
                fontSize={13}
                fill={color}
                fontWeight={700}
              >
                {step.value >= 1000
                  ? `${(step.value / 1000).toFixed(0)}k`
                  : step.value.toLocaleString('uk-UA')}
              </text>
              <text
                x={W / 2}
                y={y + 45}
                textAnchor='middle'
                fontSize={9}
                fill='#94a3b8'
              >
                {Math.round(pctVal * 100)}% від початку
              </text>
              {i > 0 && (
                <>
                  <rect
                    x={W - 72}
                    y={y - 13}
                    width={66}
                    height={13}
                    rx={2}
                    fill={dropPct > 30 ? '#fee2e2' : '#f1f5f9'}
                  />
                  <text
                    x={W - 39}
                    y={y - 3}
                    textAnchor='middle'
                    fontSize={8.5}
                    fontWeight={600}
                    fill={dropPct > 30 ? '#ef4444' : '#64748b'}
                  >
                    -{dropPct}% відвалилось
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
  const { cashback, noCashback } = row;

  return (
    <div className='px-4 py-3'>
      <p className='mb-2.5 text-xs font-semibold tracking-wide text-slate-400 uppercase'>
        Деталізація по сегментах
      </p>
      <div className='grid grid-cols-2 gap-3'>
        {/* З кешбеком */}
        {cashback ? (
          <div className='rounded-lg border border-emerald-200 bg-emerald-50/60 p-3'>
            <div className='mb-2 flex items-center gap-1.5'>
              <span className='inline-flex size-5 items-center justify-center rounded-full bg-emerald-100 text-xs'>
                🏷️
              </span>
              <span className='text-xs font-semibold text-emerald-700'>
                З кешбеком
              </span>
            </div>
            <div className='grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs'>
              <span className='text-slate-500'>Клієнтів</span>
              <span className='text-right font-medium text-slate-700 tabular-nums'>
                {fmtNum(cashback.customers)}
              </span>
              <span className='text-slate-500'>Покупок</span>
              <span className='text-right font-medium text-slate-700 tabular-nums'>
                {fmtNum(cashback.purchases)}
              </span>
              <span className='text-slate-500'>Загальна сума</span>
              <span className='text-right font-medium text-slate-700 tabular-nums'>
                {fmtMoney(cashback.revenue)}
              </span>
              <span className='text-slate-500'>Середній чек</span>
              <span className='text-right font-semibold text-emerald-600 tabular-nums'>
                {fmtMoney(
                  cashback.purchases > 0
                    ? Math.round(cashback.revenue / cashback.purchases)
                    : 0
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center rounded-lg border border-dashed border-slate-200 p-3'>
            <span className='text-xs text-slate-400'>Немає даних</span>
          </div>
        )}

        {/* Без кешбеку */}
        {noCashback ? (
          <div className='rounded-lg border border-slate-200 bg-slate-50/80 p-3'>
            <div className='mb-2 flex items-center gap-1.5'>
              <span className='inline-flex size-5 items-center justify-center rounded-full bg-slate-100 text-xs'>
                📩
              </span>
              <span className='text-xs font-semibold text-slate-600'>
                Без кешбеку (отримали повідомлення)
              </span>
            </div>
            <div className='grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs'>
              <span className='text-slate-500'>Клієнтів</span>
              <span className='text-right font-medium text-slate-700 tabular-nums'>
                {fmtNum(noCashback.customers)}
              </span>
              <span className='text-slate-500'>Покупок</span>
              <span className='text-right font-medium text-slate-700 tabular-nums'>
                {fmtNum(noCashback.purchases)}
              </span>
              <span className='text-slate-500'>Загальна сума</span>
              <span className='text-right font-medium text-slate-700 tabular-nums'>
                {fmtMoney(noCashback.revenue)}
              </span>
              <span className='text-slate-500'>Середній чек</span>
              <span className='text-right font-semibold text-slate-600 tabular-nums'>
                {fmtMoney(
                  noCashback.purchases > 0
                    ? Math.round(noCashback.revenue / noCashback.purchases)
                    : 0
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center rounded-lg border border-dashed border-slate-200 p-3'>
            <span className='text-xs text-slate-400'>Немає даних</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Campaign Detail Table ────────────────────────────────────
function CampaignDetailTable({ rows }: { rows: CommRow[] }) {
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
    <div className='overflow-x-auto rounded-xl border border-slate-200'>
      <Table>
        <TableHeader>
          <TableRow className='bg-slate-50'>
            <TableHead className='pl-4'>Назва кампанії</TableHead>
            <TableHead>Канал</TableHead>
            {hasCompany && <TableHead>Компанія</TableHead>}
            {hasDate && <TableHead>Дата</TableHead>}
            <TableHead className='text-right'>Надіслано</TableHead>
            <TableHead className='text-right font-semibold'>
              Зробили покупку
            </TableHead>
            <TableHead className='text-right'>Кількість покупок</TableHead>
            {hasRevenue && (
              <TableHead className='text-right'>Середній чек</TableHead>
            )}
            {hasRevenue && (
              <TableHead className={cn('text-right', !hasSegments && 'pr-4')}>
                Приріст обороту
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
                    isTop && !isExpanded && 'bg-emerald-50/60',
                    isExpanded && 'bg-indigo-50/50'
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
                        <IconTrophy className='size-3.5 shrink-0 text-amber-500' />
                      )}
                      <span className='text-sm font-medium text-slate-700'>
                        {r.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                        CHANNEL_COLORS[r.channel] ?? CHANNEL_COLORS['Інше']
                      )}
                    >
                      {CHANNEL_ICONS[r.channel] ?? CHANNEL_ICONS['Інше']}
                      {r.channel}
                    </span>
                  </TableCell>
                  {hasCompany && (
                    <TableCell className='text-xs text-slate-500'>
                      {r.company ?? '—'}
                    </TableCell>
                  )}
                  {hasDate && (
                    <TableCell className='text-xs text-slate-500 tabular-nums'>
                      {r.date ?? '—'}
                    </TableCell>
                  )}
                  <TableCell className='text-right text-xs text-slate-600 tabular-nums'>
                    {fmtNum(r.sent)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <span
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        isTop
                          ? 'text-emerald-600'
                          : rowConv >= 0.02
                            ? 'text-indigo-600'
                            : 'text-slate-600'
                      )}
                    >
                      {pct(r.converted, r.sent)}%
                    </span>
                  </TableCell>
                  <TableCell className='text-right text-xs text-slate-600 tabular-nums'>
                    {fmtNum(r.converted)}
                  </TableCell>
                  {hasRevenue && (
                    <TableCell className='text-right text-xs text-slate-600 tabular-nums'>
                      {r.revenue !== undefined && r.converted > 0
                        ? fmtMoney(Math.round(r.revenue / r.converted))
                        : '—'}
                    </TableCell>
                  )}
                  {hasRevenue && (
                    <TableCell
                      className={cn(
                        'text-right text-xs font-medium text-slate-600 tabular-nums',
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
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedKey(isExpanded ? null : rowKey);
                          }}
                          title='Деталізація по сегментах'
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
                  <TableRow className='bg-slate-50/60 hover:bg-slate-50/60'>
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
  if (batches.length === 0) return null;

  const stats = getChannelStats(batches);

  return (
    <div>
      <div className='mb-3'>
        <p className='text-sm font-semibold text-slate-800'>
          Ефективність каналів
        </p>
        <p className='text-muted-foreground text-xs'>
          Агрегат по всіх завантаженнях · сортування за приростом обороту
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
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-200 bg-white'
              )}
            >
              {isTop && (
                <div className='absolute top-3 right-3'>
                  <IconTrophy className='size-4 text-amber-400' />
                </div>
              )}

              {/* Rank + channel badge */}
              <div className='mb-3 flex items-center gap-2'>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isTop
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  #{idx + 1}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                    CHANNEL_COLORS[s.channel] ?? CHANNEL_COLORS['Інше']
                  )}
                >
                  {CHANNEL_ICON_LG[s.channel] ?? CHANNEL_ICON_LG['Інше']}
                  {s.channel}
                </span>
                <span className='text-xs text-slate-400'>
                  {s.campaigns} кампаній
                </span>
              </div>

              {/* Hero: Зробили покупку */}
              <div className='mb-3'>
                <p className='text-xs text-slate-400'>Зробили покупку</p>
                <p
                  className={cn(
                    'text-3xl leading-none font-black tabular-nums',
                    isTop ? 'text-emerald-600' : 'text-slate-800'
                  )}
                >
                  {s.overallConv}%
                </p>
                <p className='mt-0.5 text-xs text-slate-400'>
                  {fmtNum(s.converted)} з {fmtNum(s.sent)} отримали повідомлення
                </p>
              </div>

              {/* Lift */}
              {s.hasLift && (
                <>
                  <div className='mb-2 rounded-lg bg-emerald-50 px-2.5 py-2.5'>
                    <p className='text-[10px] text-slate-400'>
                      Приріст обороту на учасника
                    </p>
                    <p
                      className={cn(
                        'text-lg font-black tabular-nums',
                        s.liftPerUser > 0
                          ? 'text-emerald-700'
                          : 'text-slate-500'
                      )}
                    >
                      +{fmtNum(s.liftPerUser)} ₴/міс
                    </p>
                    <p className='mt-0.5 text-[10px] text-slate-400'>
                      {fmtNum(s.avgSpendWithComm)} ₴ з комунікацією ·{' '}
                      {fmtNum(s.avgSpendControl)} ₴ без
                    </p>
                  </div>

                  <div className='mb-3 rounded-lg bg-indigo-50 px-2.5 py-2'>
                    <p className='text-[10px] text-slate-400'>
                      Загальний приріст обороту
                    </p>
                    <p className='text-sm font-bold text-indigo-700 tabular-nums'>
                      {fmtMoney(s.totalLift)}
                    </p>
                    <p className='mt-0.5 text-[10px] text-slate-400'>
                      по {fmtNum(s.converted)} учасниках
                    </p>
                  </div>
                </>
              )}

              {/* Best campaign */}
              <div className='border-t border-slate-100 pt-2'>
                <p className='text-[10px] text-slate-400'>Топ-кампанія</p>
                <p className='mt-0.5 truncate text-xs font-medium text-slate-600'>
                  {s.bestCampaign}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className='mt-2 text-[11px] text-slate-400'>
        * Приріст обороту — порівняння середнього місячного обороту тих, хто
        отримав повідомлення, з клієнтами без будь-яких комунікацій і кешбеків
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
  const s = batchStats(batch.rows);
  const overallConv = pct(s.converted, s.sent);
  const channels = Array.from(new Set(batch.rows.map((r) => r.channel)));

  return (
    <div
      onClick={onExpand}
      className={cn(
        'cursor-pointer rounded-xl border transition-all',
        expanded
          ? 'border-indigo-400 ring-2 ring-indigo-300 ring-offset-1'
          : selected
            ? 'border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-400 ring-offset-1'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
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
              <p className='truncate text-sm font-semibold text-slate-800'>
                {batch.name}
              </p>
              <p className='mt-0.5 text-xs text-slate-400'>
                {batch.uploadedAt}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            {expanded ? (
              <IconChevronUp className='size-3.5 text-indigo-400' />
            ) : (
              <IconChevronDown className='size-3.5 text-slate-300' />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className='shrink-0 rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500'
            >
              <IconTrash className='size-3.5' />
            </button>
          </div>
        </div>

        <div className='mb-3 grid grid-cols-2 gap-2'>
          <div className='rounded-lg bg-slate-50 px-3 py-2'>
            <p className='text-xs text-slate-400'>Надіслано</p>
            <p className='text-base font-bold text-slate-700 tabular-nums'>
              {fmtNum(s.sent)}
            </p>
          </div>
          <div className='rounded-lg bg-indigo-50 px-3 py-2'>
            <p className='text-xs text-slate-400'>Зробили покупку</p>
            <p
              className={cn(
                'text-base font-bold tabular-nums',
                overallConv >= 3
                  ? 'text-emerald-600'
                  : overallConv >= 1.5
                    ? 'text-amber-600'
                    : 'text-red-500'
              )}
            >
              {overallConv}%
            </p>
          </div>
        </div>

        {s.revenue > 0 && (
          <div className='mb-3 rounded-lg bg-emerald-50 px-3 py-2'>
            <p className='text-xs text-slate-400'>
              Згенеровані оберти по покупках
            </p>
            <p className='text-base font-bold text-emerald-700 tabular-nums'>
              {fmtMoney(s.revenue)}
            </p>
          </div>
        )}

        <div className='mb-3 space-y-1.5'>
          {[
            { label: 'Доставка', val: pct(s.delivered, s.sent), ref: 95 },
            { label: 'Відкриття', val: pct(s.opened, s.delivered), ref: 30 },
            { label: 'Переходи', val: pct(s.clicked, s.opened), ref: 20 }
          ].map((m) => (
            <div key={m.label} className='flex items-center gap-2'>
              <span className='w-16 shrink-0 text-xs text-slate-400'>
                {m.label}
              </span>
              <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100'>
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    m.val >= m.ref ? 'bg-emerald-400' : 'bg-amber-400'
                  )}
                  style={{ width: `${Math.min(m.val, 100)}%` }}
                />
              </div>
              <span className='w-8 shrink-0 text-right text-xs font-medium text-slate-600 tabular-nums'>
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
                CHANNEL_COLORS[ch] ?? CHANNEL_COLORS['Інше']
              )}
            >
              {CHANNEL_ICONS[ch] ?? CHANNEL_ICONS['Інше']}
              {ch}
            </span>
          ))}
          <span className='inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500'>
            {batch.rows.length} кампаній
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Comparison Table ────────────────────────────────────────
function ComparisonTable({ batches }: { batches: CommBatch[] }) {
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
      label: 'Доставка',
      desc: 'Доставлено / Надіслано'
    },
    {
      key: 'openRate',
      label: 'Відкрили',
      desc: 'Відкрито / Доставлено'
    },
    {
      key: 'clickRate',
      label: 'Перейшли',
      desc: 'Переходи / Відкрито'
    },
    {
      key: 'convRate',
      label: 'Конверсія',
      desc: 'Зробили покупку / Перейшли'
    },
    {
      key: 'overallConv',
      label: 'Зробили покупку',
      desc: 'Зробили покупку / Надіслано'
    },
    ...(hasRevenue
      ? [
          {
            key: 'revenue' as MetricKey,
            label: 'Приріст обороту',
            desc: 'Сума транзакцій'
          }
        ]
      : [])
  ];

  return (
    <div className='overflow-x-auto rounded-xl border border-slate-200'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[220px]'>Завантаження</TableHead>
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
                        isBest ? 'text-emerald-600' : 'text-slate-700'
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
  const columns = [
    { col: 'customer_id', type: 'рядок', example: 'CL-00142', required: true },
    { col: 'name', type: 'рядок', example: 'Email про акцію', required: true },
    { col: 'channel', type: 'рядок', example: 'Email', required: true },
    { col: 'sent', type: 'дата', example: '18.02.2025', required: true },
    { col: 'delivered', type: 'дата', example: '18.02.2025', required: false },
    { col: 'opened', type: 'дата', example: '19.02.2025', required: false },
    { col: 'clicked', type: 'дата', example: '19.02.2025', required: false },
    { col: 'company', type: 'рядок', example: 'Rozetka', required: false }
  ];

  function downloadSample() {
    const header =
      'customer_id,name,channel,sent,delivered,opened,clicked,company';
    const rows = [
      'CL-00142,Email про акцію,Email,18.02.2025,18.02.2025,19.02.2025,19.02.2025,Rozetka',
      'CL-00298,SMS нагадування,SMS,20.02.2025,20.02.2025,21.02.2025,,WOG АЗС',
      'CL-00415,Push — Rozetka,Push,22.02.2025,22.02.2025,,,Rozetka',
      'CL-00533,Viber преміум,Viber,23.02.2025,23.02.2025,23.02.2025,24.02.2025,Преміум клуб'
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
            <CardTitle className='text-base'>Очікувана структура CSV</CardTitle>
            <CardDescription className='mt-0.5'>
              Перший рядок — заголовки, кодування UTF-8, роздільник — кома
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={downloadSample}
            className='shrink-0 gap-1.5'
          >
            <IconDownload className='size-3.5' />
            Зразок
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='pl-6'>Колонка</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Приклад</TableHead>
              <TableHead className='pr-6 text-right'>Обов.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columns.map((c) => (
              <TableRow key={c.col}>
                <TableCell className='pl-6'>
                  <code className='rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700'>
                    {c.col}
                  </code>
                </TableCell>
                <TableCell className='text-muted-foreground text-xs'>
                  {c.type}
                </TableCell>
                <TableCell className='text-muted-foreground text-xs'>
                  {c.example}
                </TableCell>
                <TableCell className='pr-6 text-right'>
                  {c.required ? (
                    <span className='text-xs font-medium text-emerald-600'>
                      ✓
                    </span>
                  ) : (
                    <span className='text-xs text-slate-300'>—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='flex items-start gap-2 border-t border-slate-100 px-6 py-3'>
          <IconInfoCircle className='mt-0.5 size-3.5 shrink-0 text-slate-400' />
          <p className='text-xs text-slate-400'>
            Один рядок = один клієнт. <strong>customer_id</strong> — унікальний
            ідентифікатор клієнта для звʼязування з внутрішньою системою та
            перевірки покупок. <strong>sent</strong> — дата надсилання
            (обов'язково); <strong>delivered</strong>, <strong>opened</strong>,{' '}
            <strong>clicked</strong> — дати подій (порожньо, якщо не відбулось).
            Значення каналу: <strong>Email</strong>, <strong>SMS</strong>,{' '}
            <strong>Push</strong>, <strong>Viber</strong> або{' '}
            <strong>Інше</strong>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Upload Card ─────────────────────────────────────────────
function UploadCard({ onUpload }: { onUpload: () => void }) {
  const [dragging, setDragging] = useState(false);

  return (
    <Card className='h-full'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>Завантажити комунікації</CardTitle>
        <CardDescription>
          Додайте нові дані для аналізу конверсії
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onUpload();
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 transition-all',
            dragging
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
          )}
          onClick={onUpload}
        >
          <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-indigo-100'>
            <IconUpload className='size-6 text-indigo-500' />
          </div>
          <p className='text-sm font-medium text-slate-700'>
            Перетягніть CSV сюди
          </p>
          <p className='mt-1 text-xs text-slate-400'>
            або натисніть для вибору
          </p>
          <Badge variant='outline' className='mt-3 text-xs'>
            .csv · UTF-8
          </Badge>
        </div>

        <div className='grid grid-cols-3 gap-2 text-center'>
          {[
            { label: 'Канали', value: 'Email, SMS, Push, Viber' },
            { label: 'Рядків', value: 'Без обмежень' },
            { label: 'Формат', value: 'CSV (UTF-8)' }
          ].map((item) => (
            <div key={item.label} className='rounded-lg bg-slate-50 px-2 py-2'>
              <p className='text-[10px] text-slate-400'>{item.label}</p>
              <p className='mt-0.5 text-xs font-medium text-slate-600'>
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
  const [batches, setBatches] = useState<CommBatch[]>(MOCK_BATCHES);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  function handleUpload() {
    if (batches.find((b) => b.id === EXTRA_MOCK_BATCH.id)) {
      toast.info('Це завантаження вже є в списку');
      return;
    }
    setBatches((prev) => [{ ...EXTRA_MOCK_BATCH }, ...prev]);
    toast.success('Файл успішно завантажено', {
      description: `${EXTRA_MOCK_BATCH.name} · ${EXTRA_MOCK_BATCH.rows.length} кампанії`
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
              Маркетинг · Канальні комунікації
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>Комунікації</h2>
            <p className='text-muted-foreground mt-0.5 text-sm'>
              Завантажуйте звіти, аналізуйте конверсію та порівнюйте кампанії
              між собою
            </p>
          </div>
          <Button
            onClick={() => setShowUpload((v) => !v)}
            className='shrink-0 gap-2'
            variant={showUpload ? 'outline' : 'default'}
          >
            <IconUpload className='size-4' />
            {showUpload ? 'Сховати' : 'Завантажити проведені комунікації'}
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
              <p className='text-sm font-semibold text-slate-800'>
                Завантажені кампанії
              </p>
              <p className='text-muted-foreground text-xs'>
                {batches.length} завантажень · Оберіть 2+ для порівняння
              </p>
            </div>
            {selectedIds.length > 0 && (
              <Badge variant='secondary' className='gap-1'>
                Обрано: {selectedIds.length}
                {canCompare && ' · порівняння активне'}
              </Badge>
            )}
          </div>
          {batches.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center'>
              <IconMailForward className='mb-3 size-10 text-slate-300' />
              <p className='text-sm font-medium text-slate-500'>
                Немає завантажених даних
              </p>
              <p className='mt-1 text-xs text-slate-400'>
                Завантажте перший CSV-файл щоб розпочати
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
                    <div className='mt-3 overflow-hidden rounded-xl border border-indigo-200 bg-white'>
                      <div className='flex items-center justify-between border-b border-slate-100 px-4 py-3'>
                        <div>
                          <p className='text-sm font-semibold text-slate-800'>
                            {b.name}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            Деталі по {b.rows.length} кампаніях
                          </p>
                        </div>
                        <button
                          onClick={() => setExpandedBatchId(null)}
                          className='rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600'
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
              <div className='h-px flex-1 bg-slate-200' />
              <p className='shrink-0 text-xs font-semibold tracking-widest text-slate-500 uppercase'>
                Порівняння {selectedBatches.length} завантажень
              </p>
              <div className='h-px flex-1 bg-slate-200' />
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
                      {batch.rows.length} кампаній · {batch.uploadedAt}
                    </CardDescription>
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
                                label: 'Відкрили',
                                val: pct(s.opened, s.delivered)
                              },
                              {
                                label: 'Перейшли',
                                val: pct(s.clicked, s.opened)
                              },
                              {
                                label: 'Конверсія',
                                val: pct(s.converted, s.clicked)
                              },
                              {
                                label: 'Зробили покупку',
                                val: pct(s.converted, s.sent)
                              }
                            ].map((m) => (
                              <div
                                key={m.label}
                                className='rounded-lg bg-slate-50 px-2.5 py-2 text-center'
                              >
                                <p className='text-xs font-bold text-indigo-600 tabular-nums'>
                                  {m.val}%
                                </p>
                                <p className='mt-0.5 text-[10px] text-slate-500'>
                                  {m.label}
                                </p>
                              </div>
                            ))}
                          </div>
                          {s.revenue > 0 && (
                            <div className='mt-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-center'>
                              <p className='text-xs font-bold text-emerald-700 tabular-nums'>
                                {fmtMoney(s.revenue)}
                              </p>
                              <p className='mt-0.5 text-[10px] text-slate-500'>
                                Згенеровані оберти
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
          <div className='flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700'>
            <IconInfoCircle className='size-4 shrink-0' />
            Оберіть ще одне завантаження для порівняння
          </div>
        )}
      </div>
    </PageContainer>
  );
}
