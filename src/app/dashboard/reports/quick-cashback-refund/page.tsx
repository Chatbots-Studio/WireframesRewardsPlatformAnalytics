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
              Reports · Anti-Fraud
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>
              Quick Cashback Withdrawal + Refund
            </h2>
            <p className='text-muted-foreground mt-1 text-sm'>
              Clients with suspicious patterns: maximum cashback in a single
              transaction, withdrawal within 10-40 minutes, and subsequent product return.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-xs'>
              Period
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
                <SelectItem value='7'>Last 7 Days</SelectItem>
                <SelectItem value='14'>Last 14 Days</SelectItem>
                <SelectItem value='30'>Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Suspicious Clients</CardDescription>
              <CardTitle className='text-2xl'>{rows.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Total Max Cashback</CardDescription>
              <CardTitle className='text-primary text-2xl'>
                {formatMoney(summary.maxCashbackTotal)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Total Cashback Withdrawn</CardDescription>
              <CardTitle className='text-2xl'>
                {formatMoney(summary.withdrawnCashbackTotal)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client List</CardTitle>
            <CardDescription>
              Sorted by event date: newest first
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client ID</TableHead>
                  <TableHead className='text-right'>Purchase Amount</TableHead>
                  <TableHead className='text-right'>Max Cashback</TableHead>
                  <TableHead className='text-right'>Withdrawn Cashback</TableHead>
                  <TableHead className='text-right'>Current Balance</TableHead>
                  <TableHead className='text-right'>Event Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground h-24 text-center'
                    >
                      No cases for selected period
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
