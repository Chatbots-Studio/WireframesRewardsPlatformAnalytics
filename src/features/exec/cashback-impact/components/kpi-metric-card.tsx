'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type MetricCatalogItem } from '@/features/exec/cashback-impact/data/metric-catalog';
import { MetricInfoTrigger } from './metric-info-trigger';

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiDelta {
  value: string;
  comparison: string;
  trend: KpiTrend;
}

export interface KpiMetricCardProps {
  metric: MetricCatalogItem;
  value: string;
  delta: KpiDelta;
  subtitle?: string;
  onInfoOpen: (metricId: string) => void;
}

const trendColorMap: Record<KpiTrend, string> = {
  up: 'text-primary',
  down: 'text-muted-foreground',
  neutral: 'text-muted-foreground'
};

export function KpiMetricCard({
  metric,
  value,
  delta,
  subtitle,
  onInfoOpen
}: KpiMetricCardProps) {
  const deltaColor = trendColorMap[delta.trend];

  return (
    <Card
      className='flex h-full cursor-pointer flex-col gap-0 py-4 transition-shadow hover:shadow-md'
      onClick={() => onInfoOpen(metric.id)}
    >
      <CardHeader className='px-4 pt-0 pb-0'>
        <div className='flex min-h-[3.25rem] items-start justify-between gap-1'>
          <p className='text-muted-foreground line-clamp-3 flex-1 text-[11px] leading-tight font-medium tracking-wide uppercase'>
            {metric.title}
          </p>
          <span
            className='mt-0.5 shrink-0'
            onClick={(e) => e.stopPropagation()}
          >
            <MetricInfoTrigger metric={metric} onOpen={onInfoOpen} />
          </span>
        </div>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col px-4 pb-0'>
        <div className='flex-1' />

        <div className='text-2xl font-semibold tracking-tight tabular-nums'>
          {value}
        </div>

        <div className='min-h-[3.25rem]'>
          {subtitle && (
            <p className='text-muted-foreground mt-0.5 text-[11px] leading-snug'>
              {subtitle}
            </p>
          )}

          <div className={cn('mt-1 flex items-center gap-0.5', deltaColor)}>
            {delta.trend === 'up' && (
              <TrendingUp className='h-3 w-3 shrink-0' aria-hidden />
            )}
            {delta.trend === 'down' && (
              <TrendingDown className='h-3 w-3 shrink-0' aria-hidden />
            )}
            <p className='text-[11px] leading-snug'>
              <span className='font-medium'>{delta.value}</span>{' '}
              <span className='text-muted-foreground'>{delta.comparison}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
