'use client';

import { useTranslations } from 'next-intl';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ProductSideSheet } from '@/features/cashback/dictionaries/components/product-side-sheet';
import { ProductsTable } from '@/features/cashback/dictionaries/components/products-table';
import { useDictionariesState } from '@/features/cashback/dictionaries/hooks/use-dictionaries-state';

export default function CashbackDictionariesPage() {
  const t = useTranslations('dictionaries');
  const state = useDictionariesState();

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
          <Badge variant='secondary' className='h-fit'>
            {t('version')}
          </Badge>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>{t('products')}</CardDescription>
              <CardTitle className='text-2xl'>
                {state.products.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>{t('targetActions')}</CardDescription>
              <CardTitle className='text-2xl'>
                {state.totalTargetActions}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className='flex min-h-[420px] flex-1 flex-col'>
          <CardHeader>
            <CardTitle className='text-base'>
              {t('productDictionary')}
            </CardTitle>
            <CardDescription>
              {t('productDictionaryDescription')}
            </CardDescription>
          </CardHeader>
          <div className='flex flex-1 flex-col px-6 pb-6'>
            <ProductsTable
              data={state.products}
              selectedId={state.selectedId}
              sheetOpen={state.sheetOpen}
              onRowClick={state.selectProduct}
            />
          </div>
        </Card>

        <ProductSideSheet
          product={state.selectedProduct}
          open={state.sheetOpen}
          onOpenChange={state.setSheetOpen}
          onSave={state.updateProduct}
        />
      </div>
    </PageContainer>
  );
}
