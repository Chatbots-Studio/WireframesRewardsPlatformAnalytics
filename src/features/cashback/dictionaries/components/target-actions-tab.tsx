'use client';

import { useTranslations } from 'next-intl';

import type { ProductTargetAction } from '@/features/cashback/data/analytics-dictionaries.mock';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface TargetActionsTabProps {
  targetActions: ProductTargetAction[];
}

export function TargetActionsTab({ targetActions }: TargetActionsTabProps) {
  const t = useTranslations('dictionaries');

  if (targetActions.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={3}
              className='text-muted-foreground h-24 text-center'
            >
              {t('noTargetActions')}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('tableName')}</TableHead>
          <TableHead>{t('tableDefinition')}</TableHead>
          <TableHead>{t('tableIdentification')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targetActions.map((action) => (
          <TableRow key={action.id}>
            <TableCell className='font-medium'>{action.name}</TableCell>
            <TableCell className='text-muted-foreground'>
              {action.definition}
            </TableCell>
            <TableCell className='text-muted-foreground'>
              {action.identificationMethod}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
