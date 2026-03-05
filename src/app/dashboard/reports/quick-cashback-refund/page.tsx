'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import {
  FraudReportPeriodDays,
  getQuickCashbackRefundRows
} from '@/features/reports/data/quick-cashback-refund.mock';

function formatMoney(value: number): string {
  return `${value.toLocaleString('uk-UA')} ₴`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function QuickCashbackRefundReportPage() {
  const [periodDays, setPeriodDays] = useState<FraudReportPeriodDays>(7);

  const rows = useMemo(
    () => getQuickCashbackRefundRows(periodDays),
    [periodDays]
  );

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.maxCashbackTotal += row.maxCashbackAmount;
        acc.withdrawnCashbackTotal += row.withdrawnCashbackAmount;
        return acc;
      },
      { maxCashbackTotal: 0, withdrawnCashbackTotal: 0 }
    );
  }, [rows]);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <p className='text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase'>
              Звіти · Антифрод
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>
              Швидкий вивід кешбеку + повернення
            </h2>
            <p className='text-muted-foreground mt-1 text-sm'>
              Клієнти з підозрілим сценарієм: максимальний кешбек в одній
              транзакції, вивід за 10-40 хвилин і подальше повернення товару.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-xs'>
              Період
            </Badge>
            <Select
              value={String(periodDays)}
              onValueChange={(value) =>
                setPeriodDays(Number(value) as FraudReportPeriodDays)
              }
            >
              <SelectTrigger className='w-[130px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7'>Останні 7 днів</SelectItem>
                <SelectItem value='14'>Останні 14 днів</SelectItem>
                <SelectItem value='30'>Останні 30 днів</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Підозрілих клієнтів</CardDescription>
              <CardTitle className='text-2xl'>{rows.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Сумарний max кешбек</CardDescription>
              <CardTitle className='text-primary text-2xl'>
                {formatMoney(summary.maxCashbackTotal)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Сумарно виведено кешбеку</CardDescription>
              <CardTitle className='text-2xl'>
                {formatMoney(summary.withdrawnCashbackTotal)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Перелік клієнтів</CardTitle>
            <CardDescription>
              Сортування за датою події: від нових до старих
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID клієнта</TableHead>
                  <TableHead className='text-right'>Сума покупки</TableHead>
                  <TableHead className='text-right'>Макс кешбек</TableHead>
                  <TableHead className='text-right'>Виведений кешбек</TableHead>
                  <TableHead className='text-right'>Поточний баланс</TableHead>
                  <TableHead className='text-right'>Дата події</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground h-24 text-center'
                    >
                      Немає кейсів за вибраний період
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className='font-medium'>
                        {row.clientId}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatMoney(row.purchaseAmount)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatMoney(row.maxCashbackAmount)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatMoney(row.withdrawnCashbackAmount)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatMoney(row.cashbackBalance)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatDate(row.eventDate)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
