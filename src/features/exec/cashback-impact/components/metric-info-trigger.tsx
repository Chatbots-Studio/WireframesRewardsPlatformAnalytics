'use client';

import { CircleHelp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { type MetricCatalogItem } from '@/features/exec/cashback-impact/data/metric-catalog';

interface MetricInfoTriggerProps {
  metric: MetricCatalogItem;
  onOpen: (metricId: string) => void;
}

export function MetricInfoTrigger({ metric, onOpen }: MetricInfoTriggerProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 shrink-0'
          onClick={() => onOpen(metric.id)}
          aria-label={`Пояснення метрики ${metric.title}`}
        >
          <CircleHelp className='h-3.5 w-3.5' />
          <span className='sr-only'>Відкрити пояснення</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className='max-w-xs space-y-1'>
        <p className='font-medium'>{metric.title}</p>
        <p className='text-primary-foreground/80 text-[11px] leading-relaxed'>
          {metric.quickFormula}
        </p>
        <p className='text-primary-foreground/60 text-[11px] leading-relaxed'>
          {metric.shortDefinition}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
