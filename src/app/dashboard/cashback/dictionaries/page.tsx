'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import PageContainer from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { AddProductDialog } from '@/features/cashback/dictionaries/components/add-product-dialog';
import { ProductSideSheet } from '@/features/cashback/dictionaries/components/product-side-sheet';
import { ProductsTable } from '@/features/cashback/dictionaries/components/products-table';
import { useDictionariesState } from '@/features/cashback/dictionaries/hooks/use-dictionaries-state';

export default function CashbackDictionariesPage() {
  const t = useTranslations('dictionaries');
  const state = useDictionariesState();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase'>
              {t('breadcrumb')}
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>{t('title')}</h2>
            <p className='text-muted-foreground mt-1 max-w-3xl text-sm'>
              {t('description')}
            </p>
          </div>
        </div>

        <Card className='flex min-h-[420px] flex-1 flex-col'>
          <div className='flex flex-1 flex-col px-6 pt-5 pb-6'>
            <ProductsTable
              data={state.products}
              selectedId={state.selectedId}
              sheetOpen={state.sheetOpen}
              onRowClick={state.selectProduct}
              productsCount={state.products.length}
              targetActionsCount={state.totalTargetActions}
              onAddProduct={() => setAddOpen(true)}
            />
          </div>
        </Card>

        <ProductSideSheet
          product={state.selectedProduct}
          open={state.sheetOpen}
          onOpenChange={state.setSheetOpen}
          onSave={state.updateProduct}
        />

        <AddProductDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onAdd={state.addProduct}
        />
      </div>
    </PageContainer>
  );
}
