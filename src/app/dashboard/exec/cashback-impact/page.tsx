import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const KPI_LABELS = [
  'Конверсія активації',
  'Час до 1-ї транзакції',
  'Reactivation Rate',
  'Транзакційність',
  'Зміна середнього чека',
  'Credit Utilization'
];

export default function CashbackImpactPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div>
          <p className='text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase'>
            Топ-менеджмент · Кешбек-програма
          </p>
          <h2 className='text-2xl font-bold tracking-tight'>Вплив кешбеків</h2>
          <p className='text-muted-foreground mt-0.5 text-sm'>
            Аналіз ефективності кешбек-програми за категоріями
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
          {KPI_LABELS.map((label) => (
            <Card key={label}>
              <CardHeader className='pb-2'>
                <p className='text-muted-foreground text-xs font-medium'>
                  {label}
                </p>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Skeleton className='h-7 w-16' />
                <Skeleton className='h-3 w-20' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
