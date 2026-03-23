'use client';

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getCommonPinningStyles } from '@/lib/data-table';
import type { ProductDictionaryEntry } from '@/features/cashback/data/analytics-dictionaries.mock';

import { createProductColumns } from '../columns/products-columns';

interface ProductsTableProps {
  data: ProductDictionaryEntry[];
  selectedId: string | null;
  sheetOpen: boolean;
  onRowClick: (id: string) => void;
  productsCount: number;
  targetActionsCount: number;
  onAddProduct: () => void;
}

export function ProductsTable({
  data,
  selectedId,
  sheetOpen,
  onRowClick,
  productsCount,
  targetActionsCount,
  onAddProduct
}: ProductsTableProps) {
  const t = useTranslations('dictionaries');
  const columns = useMemo(() => createProductColumns(t), [t]);

  const highlightId = sheetOpen ? selectedId : null;

  const rowSelection: RowSelectionState = useMemo(
    () => (highlightId ? { [highlightId]: true } : {}),
    [highlightId]
  );

  // TanStack Table: React Compiler cannot memoize this hook safely (known limitation).
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    state: { rowSelection },
    onRowSelectionChange: () => {},
    enableMultiRowSelection: false
  });

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <DataTableToolbar table={table}>
        <div className='text-muted-foreground flex items-center gap-3 text-xs whitespace-nowrap'>
          <span>
            {t('products')}:{' '}
            <strong className='text-foreground'>{productsCount}</strong>
          </span>
          <span className='text-border'>|</span>
          <span>
            {t('targetActions')}:{' '}
            <strong className='text-foreground'>{targetActionsCount}</strong>
          </span>
        </div>
        <Button size='sm' onClick={onAddProduct}>
          <PlusIcon className='size-4' />
          {t('addProductButton')}
        </Button>
      </DataTableToolbar>
      <div className='relative flex flex-1'>
        <div className='absolute inset-0 flex overflow-hidden rounded-lg border'>
          <ScrollArea className='h-full w-full'>
            <Table>
              <TableHeader className='bg-muted sticky top-0 z-10'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          ...getCommonPinningStyles({ column: header.column })
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      onClick={() => onRowClick(row.original.id)}
                      className='cursor-pointer'
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles({ column: cell.column })
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      {t('tableNoResults')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
