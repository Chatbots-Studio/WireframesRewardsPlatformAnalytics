'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  type MetricAction,
  type MetricCatalogItem
} from '@/features/exec/cashback-impact/data/metric-catalog';

interface MetricInsightDrawerProps {
  metric: MetricCatalogItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ActionItem({ action }: { action: MetricAction }) {
  return (
    <div className='bg-muted/50 space-y-1.5 rounded-md border p-3'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <Badge variant='outline' className='text-xs'>
          {action.role}
        </Badge>
        <span className='text-muted-foreground text-xs'>
          {action.expectedImpact}
        </span>
      </div>
      <p className='text-sm'>{action.action}</p>
    </div>
  );
}

export function MetricInsightDrawer({
  metric,
  open,
  onOpenChange
}: MetricInsightDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full overflow-y-auto sm:max-w-[520px]'
      >
        <SheetHeader>
          <SheetTitle>{metric.title}</SheetTitle>
          <SheetDescription>{metric.shortDefinition}</SheetDescription>
        </SheetHeader>

        <div className='space-y-5 px-4'>
          <section>
            <h3 className='text-sm font-semibold'>How It&apos;s Calculated</h3>
            <p className='text-muted-foreground mt-1 text-sm'>
              {metric.formula.expression}
            </p>
            <ul className='mt-2 list-inside list-disc space-y-1 text-sm'>
              {metric.formula.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            {metric.formula.example && (
              <div className='bg-muted/60 mt-3 rounded-md border px-3 py-2.5'>
                <p className='text-muted-foreground mb-1 text-[11px] font-semibold tracking-wide uppercase'>
                  Example
                </p>
                <p className='text-sm leading-relaxed'>
                  {metric.formula.example}
                </p>
              </div>
            )}
          </section>

          <Separator />

          <section>
            <h3 className='text-sm font-semibold'>What Drives the Metric</h3>
            <ul className='mt-1 space-y-1 text-sm'>
              {metric.drivers.map((driver) => (
                <li key={driver} className='list-inside list-disc'>
                  {driver}
                </li>
              ))}
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className='text-sm font-semibold'>What to Do</h3>
            <div className='mt-2 space-y-2'>
              {metric.actions.map((item) => (
                <ActionItem key={`${metric.id}-${item.role}`} action={item} />
              ))}
            </div>
          </section>

          <Separator />

          <section>
            <h3 className='text-sm font-semibold'>Interpretation Thresholds</h3>
            <div className='mt-2 space-y-2'>
              {metric.thresholds.map((item) => (
                <div
                  key={item.label}
                  className={`flex gap-3 rounded-md border p-2.5 ${
                    item.level === 'good'
                      ? 'border-l-primary border-l-4'
                      : item.level === 'watch'
                        ? 'border-l-chart-warning border-l-4'
                        : 'border-l-muted-foreground border-l-4'
                  }`}
                >
                  <span
                    className={`mt-0.5 size-2.5 shrink-0 rounded-full ${
                      item.level === 'good'
                        ? 'bg-primary'
                        : item.level === 'watch'
                          ? 'bg-chart-warning'
                          : 'bg-muted-foreground'
                    }`}
                  />
                  <div className='min-w-0 flex-1'>
                    <span className='text-sm font-medium'>{item.label}</span>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {item.condition}
                    </p>
                    <p className='text-sm'>{item.interpretation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section>
            <h3 className='text-sm font-semibold'>Caveats</h3>
            <ul className='mt-1 space-y-1 text-sm'>
              {metric.caveats.map((item) => (
                <li key={item} className='list-inside list-disc'>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <SheetFooter className='pb-0'>
          <p className='text-muted-foreground text-xs'>
            The same calculation methodology and identical client base are used
            for comparison with the previous period.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
