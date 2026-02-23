'use client';

import { useState } from 'react';
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
  IconInfoCircle
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────
interface CommRow {
  name: string;
  channel: string;
  segment: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
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
  return { sent, delivered, opened, clicked, converted };
}

function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 100);
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
        name: 'Акція на кешбек АЗС',
        channel: 'Email',
        segment: 'Всі',
        sent: 42000,
        delivered: 39900,
        opened: 14364,
        clicked: 2873,
        converted: 689
      },
      {
        name: 'Нагадування Rozetka',
        channel: 'Push',
        segment: 'Активні 25-45',
        sent: 28000,
        delivered: 27160,
        opened: 10864,
        clicked: 3259,
        converted: 978
      },
      {
        name: 'Персональна пропозиція кафе',
        channel: 'Email',
        segment: 'Молодь 18-35',
        sent: 9500,
        delivered: 9120,
        opened: 4560,
        clicked: 1368,
        converted: 479
      },
      {
        name: 'Bolt Food — нова категорія',
        channel: 'Push',
        segment: 'Молодь 18-35',
        sent: 15000,
        delivered: 14400,
        opened: 5040,
        clicked: 1008,
        converted: 252
      }
    ]
  },
  {
    id: '2',
    name: 'Січень 2025 — SMS-кампанія',
    uploadedAt: '31.01.2025',
    rows: [
      {
        name: 'Зимова акція супермаркети',
        channel: 'SMS',
        segment: 'Всі',
        sent: 55000,
        delivered: 52800,
        opened: 26400,
        clicked: 3960,
        converted: 792
      },
      {
        name: 'Аптеки — знижка 15%',
        channel: 'SMS',
        segment: 'Всі',
        sent: 35000,
        delivered: 33600,
        opened: 15120,
        clicked: 1814,
        converted: 326
      },
      {
        name: 'Viber: нові партнери',
        channel: 'Viber',
        segment: 'Преміум',
        sent: 12000,
        delivered: 11520,
        opened: 5760,
        clicked: 1728,
        converted: 604
      }
    ]
  },
  {
    id: '3',
    name: 'Грудень 2024 — Новорічна кампанія',
    uploadedAt: '01.12.2024',
    rows: [
      {
        name: 'Email: Новорічні подарунки',
        channel: 'Email',
        segment: 'Всі',
        sent: 68000,
        delivered: 64600,
        opened: 29070,
        clicked: 7267,
        converted: 2180
      },
      {
        name: 'Push: Святкові пропозиції',
        channel: 'Push',
        segment: 'Всі',
        sent: 95000,
        delivered: 91200,
        opened: 27360,
        clicked: 5472,
        converted: 1094
      },
      {
        name: 'SMS: Нагадування кешбек',
        channel: 'SMS',
        segment: 'Активні 25-45',
        sent: 22000,
        delivered: 21120,
        opened: 11616,
        clicked: 2323,
        converted: 603
      },
      {
        name: 'Viber: Ексклюзив преміум',
        channel: 'Viber',
        segment: 'Преміум',
        sent: 8500,
        delivered: 8245,
        opened: 5358,
        clicked: 1607,
        converted: 643
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
      name: 'Email: Весняна акція',
      channel: 'Email',
      segment: 'Всі',
      sent: 50000,
      delivered: 47500,
      opened: 19000,
      clicked: 4750,
      converted: 1425
    },
    {
      name: 'Push: Повернення клієнтів',
      channel: 'Push',
      segment: 'Неактивні',
      sent: 18000,
      delivered: 17280,
      opened: 5184,
      clicked: 1036,
      converted: 207
    },
    {
      name: 'SMS: Знижка АЗС',
      channel: 'SMS',
      segment: 'Всі',
      sent: 30000,
      delivered: 28800,
      opened: 14400,
      clicked: 2160,
      converted: 432
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

// ─── Batch Card ──────────────────────────────────────────────
function BatchCard({
  batch,
  selected,
  onToggle,
  onDelete
}: {
  batch: CommBatch;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const s = batchStats(batch.rows);
  const overallConv = pct(s.converted, s.sent);
  const channels = [...new Set(batch.rows.map((r) => r.channel))];

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all',
        selected
          ? 'border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-400 ring-offset-1'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      )}
    >
      <div className='mb-3 flex items-start justify-between gap-2'>
        <div className='flex min-w-0 items-start gap-2.5'>
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            className='mt-0.5 shrink-0'
          />
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold text-slate-800'>
              {batch.name}
            </p>
            <p className='mt-0.5 text-xs text-slate-400'>{batch.uploadedAt}</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className='shrink-0 rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500'
        >
          <IconTrash className='size-3.5' />
        </button>
      </div>

      <div className='mb-3 grid grid-cols-2 gap-2'>
        <div className='rounded-lg bg-slate-50 px-3 py-2'>
          <p className='text-xs text-slate-400'>Надіслано</p>
          <p className='text-base font-bold text-slate-700 tabular-nums'>
            {s.sent >= 1000 ? `${(s.sent / 1000).toFixed(0)}k` : s.sent}
          </p>
        </div>
        <div className='rounded-lg bg-indigo-50 px-3 py-2'>
          <p className='text-xs text-slate-400'>Конверсія</p>
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

      <div className='mb-3 space-y-1.5'>
        {[
          {
            label: 'Доставка',
            val: pct(s.delivered, s.sent),
            ref: 95
          },
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
      overallConv: pct(s.converted, s.sent)
    };
  });

  const best = {
    deliveryRate: Math.max(...metrics.map((m) => m.deliveryRate)),
    openRate: Math.max(...metrics.map((m) => m.openRate)),
    clickRate: Math.max(...metrics.map((m) => m.clickRate)),
    convRate: Math.max(...metrics.map((m) => m.convRate)),
    overallConv: Math.max(...metrics.map((m) => m.overallConv))
  };

  type MetricKey = keyof typeof best;

  const cols: { key: MetricKey; label: string; desc: string }[] = [
    {
      key: 'deliveryRate',
      label: 'Delivery Rate',
      desc: 'Доставлено / Надіслано'
    },
    {
      key: 'openRate',
      label: 'Open Rate',
      desc: 'Відкрито / Доставлено'
    },
    {
      key: 'clickRate',
      label: 'Click Rate',
      desc: 'Переходи / Відкрито'
    },
    {
      key: 'convRate',
      label: 'Conv Rate',
      desc: 'Конвертовано / Переходи'
    },
    {
      key: 'overallConv',
      label: 'Overall Conv',
      desc: 'Конвертовано / Надіслано'
    }
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
                const isBest = val === best[c.key];
                return (
                  <TableCell key={c.key} className='text-right'>
                    <span
                      className={cn(
                        'inline-flex items-center justify-end gap-1 text-sm font-semibold tabular-nums',
                        isBest ? 'text-emerald-600' : 'text-slate-700'
                      )}
                    >
                      {isBest && <IconCheck className='size-3' />}
                      {val}%
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
    { col: 'name', type: 'рядок', example: 'Email про акцію', required: true },
    { col: 'channel', type: 'рядок', example: 'Email', required: true },
    { col: 'segment', type: 'рядок', example: 'Молодь 18-35', required: false },
    { col: 'sent', type: 'число', example: '15000', required: true },
    { col: 'delivered', type: 'число', example: '14200', required: true },
    { col: 'opened', type: 'число', example: '5680', required: true },
    { col: 'clicked', type: 'число', example: '1136', required: true },
    { col: 'converted', type: 'число', example: '284', required: true }
  ];

  function downloadSample() {
    const header =
      'name,channel,segment,sent,delivered,opened,clicked,converted';
    const rows = [
      'Email про акцію,Email,Молодь 18-35,15000,14200,5680,1136,284',
      'SMS нагадування,SMS,Всі,32000,30720,15360,2150,430',
      'Push — Rozetka,Push,Активні 25-45,25000,24000,7200,1440,360',
      'Viber преміум,Viber,Преміум,8000,7760,3880,1164,350'
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
            Значення каналу: <strong>Email</strong>, <strong>SMS</strong>,{' '}
            <strong>Push</strong>, <strong>Viber</strong> або{' '}
            <strong>Інше</strong>
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
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {batches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  selected={selectedIds.includes(batch.id)}
                  onToggle={() => toggleSelect(batch.id)}
                  onDelete={() => deleteBatch(batch.id)}
                />
              ))}
            </div>
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

            {/* Conversion metrics table */}
            <ComparisonTable batches={selectedBatches} />

            {/* SVG Funnels */}
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

                    <div className='mt-3 grid grid-cols-2 gap-2'>
                      {(() => {
                        const s = batchStats(batch.rows);
                        return [
                          {
                            label: 'Open Rate',
                            val: pct(s.opened, s.delivered)
                          },
                          {
                            label: 'Click Rate',
                            val: pct(s.clicked, s.opened)
                          },
                          {
                            label: 'Conv Rate',
                            val: pct(s.converted, s.clicked)
                          },
                          {
                            label: 'Overall Conv',
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
                        ));
                      })()}
                    </div>
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
