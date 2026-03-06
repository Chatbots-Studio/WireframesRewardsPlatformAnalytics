'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCheck,
  IconX,
  IconEye,
  IconClick,
  IconCreditCard,
  IconUsers
} from '@tabler/icons-react';

// ─── Palette ────────────────────────────────────────────────

// ─── Types ──────────────────────────────────────────────────
type Status = 'ok' | 'warn' | 'critical';
type CashbackType = 'default' | 'partner' | 'personal';

interface Category {
  id: string;
  name: string;
  type: CashbackType;
  segment: string;
  shown: number;
  chosen: number;
  transacted: number;
  received: number;
  benchmark: number; // ціль конверсії shown→received, %
  convRate: number; // фактична конверсія, %
  trend: number; // delta vs минулий місяць, pp
}

// ─── Mock Data ───────────────────────────────────────────────
const categories: Category[] = [
  {
    id: '1',
    name: 'Персональний: Кафе',
    type: 'personal',
    segment: 'Молодь 18-35',
    shown: 8200,
    chosen: 7216,
    transacted: 6642,
    received: 6350,
    benchmark: 70,
    convRate: 77,
    trend: 5
  },
  {
    id: '2',
    name: 'Rozetka',
    type: 'partner',
    segment: 'Всі',
    shown: 18000,
    chosen: 14580,
    transacted: 12960,
    received: 12240,
    benchmark: 60,
    convRate: 68,
    trend: 3
  },
  {
    id: '3',
    name: 'Bolt Food',
    type: 'partner',
    segment: 'Всі',
    shown: 15000,
    chosen: 12000,
    transacted: 9600,
    received: 9000,
    benchmark: 60,
    convRate: 60,
    trend: 2
  },
  {
    id: '4',
    name: 'Супермаркети',
    type: 'default',
    segment: 'Всі',
    shown: 45000,
    chosen: 31500,
    transacted: 26100,
    received: 24300,
    benchmark: 55,
    convRate: 54,
    trend: 1
  },
  {
    id: '5',
    name: 'Аптеки',
    type: 'default',
    segment: 'Всі',
    shown: 29000,
    chosen: 19720,
    transacted: 15080,
    received: 14500,
    benchmark: 50,
    convRate: 50,
    trend: 0
  },
  {
    id: '6',
    name: 'Персональний: Спорт',
    type: 'personal',
    segment: 'Активні 25-45',
    shown: 6400,
    chosen: 4608,
    transacted: 3456,
    received: 2816,
    benchmark: 55,
    convRate: 44,
    trend: -7
  },
  {
    id: '7',
    name: 'АЗС',
    type: 'default',
    segment: 'Всі',
    shown: 38000,
    chosen: 22800,
    transacted: 17480,
    received: 16720,
    benchmark: 55,
    convRate: 44,
    trend: -7
  }
];

function getStatus(cat: Category): Status {
  const diff = cat.convRate - cat.benchmark;
  if (diff >= 0) return 'ok';
  if (diff >= -8) return 'warn';
  return 'critical';
}

// Воронка по категорії
function funnelSteps(cat: Category) {
  return [
    {
      label: 'Показано пропозицію',
      value: cat.shown,
      icon: <IconEye className='size-3.5' />
    },
    {
      label: 'Обрали кешбек',
      value: cat.chosen,
      icon: <IconClick className='size-3.5' />
    },
    {
      label: 'Зробили транзакцію',
      value: cat.transacted,
      icon: <IconCreditCard className='size-3.5' />
    },
    {
      label: 'Отримали кешбек',
      value: cat.received,
      icon: <IconUsers className='size-3.5' />
    }
  ];
}

// Конверсія по категоріях (sorted worst first)
const sortedByProblems = [...categories].sort(
  (a, b) => a.convRate - a.benchmark - (b.convRate - b.benchmark)
);

// ─── Sub-components ─────────────────────────────────────────

const typeLabel: Record<CashbackType, string> = {
  default: 'Дефолтний',
  partner: 'Партнерський',
  personal: 'Персональний'
};
const typeVariant: Record<CashbackType, 'secondary' | 'outline' | 'default'> = {
  default: 'secondary',
  partner: 'outline',
  personal: 'default'
};
const typeColor: Record<CashbackType, string> = {
  default: 'var(--chart-primary)',
  partner: 'var(--chart-2)',
  personal: 'var(--chart-3)'
};

const statusIcon = {
  ok: <IconCircleCheck className='text-primary size-4 shrink-0' />,
  warn: <IconAlertTriangle className='text-muted-foreground size-4 shrink-0' />,
  critical: <IconCircleX className='text-muted-foreground size-4 shrink-0' />
};
const statusBg = {
  ok: 'bg-primary/10 border-primary/30',
  warn: 'bg-muted border-border',
  critical: 'bg-muted border-border'
};
const statusText = {
  ok: 'text-primary',
  warn: 'text-muted-foreground',
  critical: 'text-muted-foreground'
};

// ─── SVG Funnel ─────────────────────────────────────────────
function SvgFunnel({ cat }: { cat: Category }) {
  const steps = funnelSteps(cat);
  const color = typeColor[cat.type];
  const maxVal = steps[0].value;
  const W = 420;
  const stepH = 76;
  const H = stepH * steps.length + 8;
  const minPct = 0.3;

  return (
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
        const pct = step.value / maxVal;
        const prevPct = i === 0 ? 1 : steps[i - 1].value / maxVal;
        const w = Math.max(pct, minPct) * W;
        const pw = Math.max(prevPct, minPct) * W;
        const x = (W - w) / 2;
        const px = (W - pw) / 2;
        const y = i * stepH;
        const dropPct =
          i > 0 ? Math.round((1 - step.value / steps[i - 1].value) * 100) : 0;
        const convPct =
          i > 0 ? Math.round((step.value / steps[i - 1].value) * 100) : 100;
        // Benchmark тільки для фінального кроку
        const isFinalBad =
          i === steps.length - 1 && cat.convRate < cat.benchmark;

        const path = `M${px} ${y + 4} L${px + pw} ${y + 4} L${x + w} ${y + stepH - 8} L${x} ${y + stepH - 8} Z`;

        return (
          <g key={i}>
            <path
              d={path}
              fill={isFinalBad ? 'var(--destructive)' : 'var(--card)'}
              fillOpacity={isFinalBad ? 0.1 : 1}
              stroke={isFinalBad ? 'var(--destructive)' : color}
              strokeWidth={isFinalBad ? 2 : 1.5}
              opacity={0.95}
            />
            {/* Іконка + назва */}
            <text
              x={W / 2}
              y={y + 20}
              textAnchor='middle'
              fontSize={11}
              fill='var(--foreground)'
              fontWeight={500}
            >
              {step.label}
            </text>
            {/* Число */}
            <text
              x={W / 2}
              y={y + 38}
              textAnchor='middle'
              fontSize={14}
              fill={color}
              fontWeight={700}
            >
              {step.value.toLocaleString('uk-UA')}
            </text>
            {/* % від початку */}
            <text
              x={W / 2}
              y={y + 52}
              textAnchor='middle'
              fontSize={10}
              fill='var(--muted-foreground)'
            >
              {Math.round(pct * 100)}% від початку
            </text>
            {/* Dropout між кроками */}
            {i > 0 && (
              <>
                <rect
                  x={W - 88}
                  y={y - 16}
                  width={82}
                  height={16}
                  rx={3}
                  fill={dropPct > 25 ? 'var(--destructive)' : 'var(--muted)'}
                  fillOpacity={dropPct > 25 ? 0.1 : 1}
                />
                <text
                  x={W - 47}
                  y={y - 4}
                  textAnchor='middle'
                  fontSize={10}
                  fontWeight={600}
                  fill={
                    dropPct > 25
                      ? 'var(--destructive)'
                      : 'var(--muted-foreground)'
                  }
                >
                  -{dropPct}% відвалилось
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Health Check Card ───────────────────────────────────────
function HealthCard({
  cat,
  onClick,
  selected
}: {
  cat: Category;
  onClick: () => void;
  selected: boolean;
}) {
  const status = getStatus(cat);
  const diff = cat.convRate - cat.benchmark;
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-all hover:shadow-sm',
        statusBg[status],
        selected && 'ring-primary ring-2 ring-offset-1'
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex min-w-0 items-start gap-2'>
          {statusIcon[status]}
          <div className='min-w-0'>
            <p className='text-foreground truncate text-sm leading-tight font-semibold'>
              {cat.name}
            </p>
            <Badge
              variant={typeVariant[cat.type]}
              className='mt-1 py-0 text-xs'
            >
              {typeLabel[cat.type]}
            </Badge>
          </div>
        </div>
        <div className='shrink-0 text-right'>
          <p
            className={`text-lg font-black tabular-nums ${statusText[status]}`}
          >
            {cat.convRate}%
          </p>
          <p
            className={`text-xs font-medium ${diff >= 0 ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {diff >= 0 ? '+' : ''}
            {diff}pp vs ціль
          </p>
        </div>
      </div>
      <div className='text-muted-foreground mt-2 flex items-center gap-1 text-xs'>
        {cat.trend !== 0 && (
          <>
            {cat.trend > 0 ? (
              <IconArrowUpRight className='text-primary size-3' />
            ) : (
              <IconArrowDownRight className='text-muted-foreground size-3' />
            )}
            <span
              className={
                cat.trend > 0 ? 'text-primary' : 'text-muted-foreground'
              }
            >
              {cat.trend > 0 ? '+' : ''}
              {cat.trend}pp
            </span>
            <span>vs минулий місяць</span>
          </>
        )}
        {cat.trend === 0 && <span>Без змін vs минулий місяць</span>}
      </div>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function ProductDashboard() {
  const [selectedId, setSelectedId] = useState<string>('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('feb2025');

  const criticalCount = categories.filter(
    (c) => getStatus(c) === 'critical'
  ).length;

  const filtered = categories.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    return true;
  });
  const sortedFiltered = [...filtered].sort(
    (a, b) => a.convRate - a.benchmark - (b.convRate - b.benchmark)
  );

  // Агреговані дані по відфільтрованих категоріях → синтетична Category для воронки
  const totalShown = filtered.reduce((s, c) => s + c.shown, 0);
  const totalChosen = filtered.reduce((s, c) => s + c.chosen, 0);
  const totalTransacted = filtered.reduce((s, c) => s + c.transacted, 0);
  const totalReceived = filtered.reduce((s, c) => s + c.received, 0);
  const avgConv = filtered.length
    ? Math.round((totalReceived / totalShown) * 100)
    : 0;
  const avgBenchmark = filtered.length
    ? Math.round(
        filtered.reduce((s, c) => s + c.benchmark, 0) / filtered.length
      )
    : 0;

  const allAggregate: Category = {
    id: 'all',
    name: 'Всі категорії та пропозиції',
    type: 'default',
    segment: `${filtered.length} категорій`,
    shown: totalShown,
    chosen: totalChosen,
    transacted: totalTransacted,
    received: totalReceived,
    benchmark: avgBenchmark,
    convRate: avgConv,
    trend: 0
  };

  const isAll = selectedId === 'all';
  const selectedCat = isAll
    ? allAggregate
    : (categories.find((c) => c.id === selectedId) ?? allAggregate);
  const status = getStatus(selectedCat);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* ── Header ── */}
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase'>
              Продакт-менеджер · Кешбек-програма
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>
              Деталізація пропозицій
            </h2>
            <p className='text-muted-foreground mt-0.5 text-sm'>
              {criticalCount > 0
                ? `${criticalCount} категорі${criticalCount === 1 ? 'я потребує' : 'ї потребують'} негайної уваги`
                : 'Всі категорії в нормі або вище цілі'}
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='feb2025'>Лютий 2025</SelectItem>
                <SelectItem value='jan2025'>Січень 2025</SelectItem>
                <SelectItem value='q1'>Q1 2025</SelectItem>
                <SelectItem value='custom'>Довільний...</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Тип кешбеку' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Всі типи</SelectItem>
                <SelectItem value='default'>Дефолтний</SelectItem>
                <SelectItem value='partner'>Партнерський</SelectItem>
                <SelectItem value='personal'>Персональний</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSegment} onValueChange={setFilterSegment}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Сегмент' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Всі сегменти</SelectItem>
                <SelectItem value='youth'>Молодь 18-35</SelectItem>
                <SelectItem value='active'>Активні 25-45</SelectItem>
                <SelectItem value='premium'>Преміум</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Головний блок: список категорій зліва + Воронка праворуч ── */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
          {/* Всі категорії та пропозиції — клікабельний список */}
          <div className='space-y-2 lg:col-span-2'>
            <p className='text-muted-foreground px-1 text-xs font-semibold tracking-wide uppercase'>
              Всі категорії та пропозиції · відхилення від цілі
            </p>
            <div className='space-y-2 overflow-y-auto pr-1'>
              {/* Пункт «Всі» — зведена воронка */}
              <button
                onClick={() => setSelectedId('all')}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition-all hover:shadow-sm',
                  isAll
                    ? 'border-primary/30 bg-primary/10 ring-primary ring-2 ring-offset-1'
                    : 'border-primary/20 bg-primary/5'
                )}
              >
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex min-w-0 items-center gap-2'>
                    <div className='bg-primary flex size-4 shrink-0 items-center justify-center rounded-full'>
                      <span className='text-primary-foreground text-[10px] leading-none font-black'>
                        ∑
                      </span>
                    </div>
                    <div className='min-w-0'>
                      <p className='text-foreground text-sm leading-tight font-semibold'>
                        Всі категорії та пропозиції
                      </p>
                      <p className='text-muted-foreground mt-0.5 text-xs'>
                        {filtered.length} категорій · зведена воронка
                      </p>
                    </div>
                  </div>
                  <div className='shrink-0 text-right'>
                    <p className='text-primary text-lg font-black tabular-nums'>
                      {avgConv}%
                    </p>
                    <p className='text-muted-foreground text-xs'>заг. конв.</p>
                  </div>
                </div>
              </button>

              {sortedFiltered.map((cat) => (
                <HealthCard
                  key={cat.id}
                  cat={cat}
                  selected={selectedId === cat.id}
                  onClick={() => setSelectedId(cat.id)}
                />
              ))}
            </div>
          </div>

          {/* Воронка вибраної категорії */}
          <Card
            className={cn(
              'lg:col-span-3',
              !isAll &&
                status === 'critical' &&
                'ring-destructive ring-2 ring-offset-2',
              !isAll && status === 'warn' && 'ring-border ring-1',
              isAll && 'ring-primary/30 ring-1'
            )}
          >
            <CardHeader className='pb-2'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <CardTitle className='text-base'>
                    {selectedCat.name}
                  </CardTitle>
                  <div className='mt-1 flex items-center gap-2'>
                    {isAll ? (
                      <span className='text-muted-foreground text-xs'>
                        Сумарно по {filtered.length} категоріях
                      </span>
                    ) : (
                      <>
                        <Badge variant={typeVariant[selectedCat.type]}>
                          {typeLabel[selectedCat.type]}
                        </Badge>
                        <span className='text-muted-foreground text-xs'>
                          Сегмент: {selectedCat.segment}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className='shrink-0 text-right'>
                  <p
                    className={`text-2xl font-black tabular-nums ${isAll ? 'text-primary' : statusText[status]}`}
                  >
                    {selectedCat.convRate}%
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    Ціль: {selectedCat.benchmark}%
                  </p>
                </div>
              </div>
              <CardDescription className='mt-1'>
                Воронка: Показано → Обрали → Транзакція → Кешбек · Червоний
                dropout {'>'} 25%
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-0'>
              <SvgFunnel cat={selectedCat} />

              <div className='mt-4 grid grid-cols-3 gap-3'>
                {[
                  {
                    label: 'Показано → Обрали',
                    val: Math.round(
                      (selectedCat.chosen / selectedCat.shown) * 100
                    ),
                    ref: 75
                  },
                  {
                    label: 'Обрали → Транзакція',
                    val: Math.round(
                      (selectedCat.transacted / selectedCat.chosen) * 100
                    ),
                    ref: 85
                  },
                  {
                    label: 'Транзакція → Отримали',
                    val: Math.round(
                      (selectedCat.received / selectedCat.transacted) * 100
                    ),
                    ref: 95
                  }
                ].map((m, i) => {
                  const ok = m.val >= m.ref;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-center',
                        ok
                          ? 'border-primary/30 bg-primary/10'
                          : 'border-border bg-muted'
                      )}
                    >
                      <p
                        className={`text-xl font-bold tabular-nums ${ok ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {m.val}%
                      </p>
                      <p className='text-muted-foreground mt-0.5 text-xs'>
                        {m.label}
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 flex items-center justify-center gap-0.5 text-xs font-medium',
                          ok ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        ціль {m.ref}%{' '}
                        {ok ? (
                          <IconCheck className='size-3' />
                        ) : (
                          <IconX className='size-3' />
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>

            {!isAll && status !== 'ok' && (
              <CardFooter className='pt-0'>
                <div
                  className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                    status === 'critical'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {status === 'critical' ? (
                    <IconCircleX className='mt-0.5 size-3.5 shrink-0' />
                  ) : (
                    <IconAlertTriangle className='mt-0.5 size-3.5 shrink-0' />
                  )}
                  <span>
                    {selectedCat.convRate < selectedCat.benchmark
                      ? `Конверсія ${selectedCat.convRate}% нижче цілі ${selectedCat.benchmark}% на ${selectedCat.benchmark - selectedCat.convRate}pp. `
                      : ''}
                    {selectedCat.trend < 0
                      ? `Падає ${Math.abs(selectedCat.trend)}pp за місяць — динаміка негативна. Рекомендовано запустити A/B тест.`
                      : 'Стабільний стан.'}
                  </span>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* ── Таблиця деталізації — одразу під воронкою ── */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              Всі категорії — деталізація
            </CardTitle>
            <CardDescription>
              Відсортовано за відхиленням від цілі · Клікни на рядок щоб
              побачити воронку · Червоний = нижче benchmark
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Категорія</TableHead>
                  <TableHead className='text-right'>Показано</TableHead>
                  <TableHead className='text-right'>Обрали</TableHead>
                  <TableHead className='text-right'>Транзакція</TableHead>
                  <TableHead className='text-right'>Отримали</TableHead>
                  <TableHead className='text-right'>Конв.</TableHead>
                  <TableHead className='text-right'>Ціль</TableHead>
                  <TableHead className='text-right'>Відхилення</TableHead>
                  <TableHead className='text-right'>MoM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByProblems.map((cat) => {
                  const s = getStatus(cat);
                  const diff = cat.convRate - cat.benchmark;
                  return (
                    <TableRow
                      key={cat.id}
                      className={cn(
                        'hover:bg-muted/50 cursor-pointer transition-colors',
                        s === 'critical' && 'bg-destructive/5',
                        s === 'warn' && 'bg-muted/50',
                        selectedId === cat.id &&
                          'ring-primary/30 ring-1 ring-inset'
                      )}
                      onClick={() => setSelectedId(cat.id)}
                    >
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {statusIcon[s]}
                          <div>
                            <p className='text-sm font-medium'>{cat.name}</p>
                            <Badge
                              variant={typeVariant[cat.type]}
                              className='mt-0.5 py-0 text-xs'
                            >
                              {typeLabel[cat.type]}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-right text-sm tabular-nums'>
                        {(cat.shown / 1000).toFixed(0)}k
                      </TableCell>
                      <TableCell className='text-right text-sm tabular-nums'>
                        {(cat.chosen / 1000).toFixed(0)}k
                        <span className='text-muted-foreground ml-1 text-xs'>
                          ({Math.round((cat.chosen / cat.shown) * 100)}%)
                        </span>
                      </TableCell>
                      <TableCell className='text-right text-sm tabular-nums'>
                        {(cat.transacted / 1000).toFixed(0)}k
                        <span className='text-muted-foreground ml-1 text-xs'>
                          ({Math.round((cat.transacted / cat.chosen) * 100)}%)
                        </span>
                      </TableCell>
                      <TableCell className='text-right text-sm tabular-nums'>
                        {(cat.received / 1000).toFixed(0)}k
                      </TableCell>
                      <TableCell className='text-right'>
                        <span
                          className={`text-sm font-bold ${
                            s === 'critical'
                              ? 'text-muted-foreground'
                              : s === 'warn'
                                ? 'text-muted-foreground'
                                : 'text-primary'
                          }`}
                        >
                          {cat.convRate}%
                        </span>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-right text-sm'>
                        {cat.benchmark}%
                      </TableCell>
                      <TableCell className='text-right'>
                        <span
                          className={`text-sm font-semibold ${diff >= 0 ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          {diff >= 0 ? '+' : ''}
                          {diff}pp
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <span
                          className={`flex items-center justify-end gap-0.5 text-sm font-medium ${
                            cat.trend > 0
                              ? 'text-primary'
                              : cat.trend < 0
                                ? 'text-muted-foreground'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {cat.trend > 0 && (
                            <IconArrowUpRight className='size-3.5' />
                          )}
                          {cat.trend < 0 && (
                            <IconArrowDownRight className='size-3.5' />
                          )}
                          {cat.trend !== 0
                            ? `${cat.trend > 0 ? '+' : ''}${cat.trend}pp`
                            : '—'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
