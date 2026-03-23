'use client';

import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import {
  ANALYTICS_DATA_SOURCES,
  type ProductDictionaryEntry
} from '@/features/cashback/data/analytics-dictionaries.mock';

const nameFilterFn: FilterFn<ProductDictionaryEntry> = (
  row,
  columnId,
  filterValue
) => {
  const name = String(row.getValue(columnId) ?? '');
  const q = String(filterValue ?? '')
    .trim()
    .toLowerCase();
  if (!q) return true;
  return name.toLowerCase().includes(q);
};

const sourceById = Object.fromEntries(
  ANALYTICS_DATA_SOURCES.map((s) => [s.id, s.name])
);

export function createProductColumns(
  t: (key: string) => string
): ColumnDef<ProductDictionaryEntry>[] {
  return [
    {
      accessorKey: 'name',
      header: t('columnProduct'),
      filterFn: nameFilterFn,
      meta: {
        variant: 'text' as const,
        placeholder: t('searchProductsPlaceholder')
      },
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.name}</span>
      )
    },
    {
      id: 'targetActionsCount',
      header: t('columnTargetActions'),
      enableColumnFilter: false,
      cell: ({ row }) => row.original.targetActions.length
    },
    {
      id: 'dataSource',
      header: t('columnDataSource'),
      enableColumnFilter: false,
      cell: ({ row }) => {
        const id = row.original.productSourceId;
        if (!id) return '\u2014';
        return sourceById[id] ?? id;
      }
    }
  ];
}
