'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ANALYTICS_DATA_SOURCES,
  PRODUCT_DICTIONARY,
  type DataSourceStatus,
  type DataSourceType
} from '@/features/cashback/data/analytics-dictionaries.mock';

const SOURCE_TYPE_LABEL: Record<DataSourceType, string> = {
  api: 'API',
  dwh: 'DWH',
  event_stream: 'Event Stream',
  file_upload: 'File Upload'
};

const SOURCE_STATUS_KEY: Record<DataSourceStatus, string> = {
  active: 'statusActive',
  planned: 'statusPlanned'
};

const SOURCE_STATUS_VARIANT: Record<
  DataSourceStatus,
  'default' | 'secondary' | 'outline'
> = {
  active: 'default',
  planned: 'outline'
};

export default function CashbackDictionariesPage() {
  const t = useTranslations('dictionaries');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    PRODUCT_DICTIONARY[0]?.id ?? ''
  );

  const dataSourceById = useMemo(() => {
    return Object.fromEntries(ANALYTICS_DATA_SOURCES.map((item) => [item.id, item]));
  }, []);

  const selectedProduct =
    PRODUCT_DICTIONARY.find((item) => item.id === selectedProductId) ??
    PRODUCT_DICTIONARY[0];

  const totalTargetActions = PRODUCT_DICTIONARY.reduce(
    (sum, item) => sum + item.targetActions.length,
    0
  );

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase'>
              {t('breadcrumb')}
            </p>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('title')}
            </h2>
            <p className='text-muted-foreground mt-1 max-w-3xl text-sm'>
              {t('description')}
            </p>
          </div>
          <Badge variant='secondary' className='h-fit'>
            {t('version')}
          </Badge>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>{t('products')}</CardDescription>
              <CardTitle className='text-2xl'>{PRODUCT_DICTIONARY.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>{t('targetActions')}</CardDescription>
              <CardTitle className='text-2xl'>{totalTargetActions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>{t('dataSources')}</CardDescription>
              <CardTitle className='text-2xl'>
                {ANALYTICS_DATA_SOURCES.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='text-base'>{t('productDictionary')}</CardTitle>
              <CardDescription>
                {t('productDictionaryDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              {PRODUCT_DICTIONARY.map((product) => {
                const isSelected = product.id === selectedProduct.id;
                return (
                  <button
                    key={product.id}
                    className={cn(
                      'w-full rounded-lg border p-3 text-left transition-colors',
                      isSelected
                        ? 'border-primary/40 bg-primary/10 ring-primary/20 ring-1'
                        : 'border-border bg-card hover:bg-muted/60'
                    )}
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    <p className='text-sm font-semibold'>{product.name}</p>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {t('targetActionsCount', { count: product.targetActions.length })}
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle className='text-base'>{selectedProduct.name}</CardTitle>
              <CardDescription>
                {t('productInfoDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-5'>
              <div className='space-y-2 rounded-lg border p-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='text-xs font-semibold tracking-wide uppercase'>
                    {t('productInfoSource')}
                  </p>
                  <Badge variant='outline'>v2</Badge>
                </div>
                <p className='text-sm'>{selectedProduct.productSourceDescription}</p>
                <p className='text-muted-foreground text-xs'>
                  {t('source')}{' '}
                  <span className='text-foreground font-medium'>
                    {selectedProduct.productSourceId
                      ? dataSourceById[selectedProduct.productSourceId]?.name
                      : t('notSet')}
                  </span>
                </p>
              </div>

              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div className='rounded-lg border p-3'>
                  <div className='mb-2 flex items-center gap-2'>
                    <p className='text-xs font-semibold tracking-wide uppercase'>
                      {t('activityConditions')}
                    </p>
                    <Badge variant='outline'>v2</Badge>
                  </div>
                  <ul className='space-y-1.5'>
                    {selectedProduct.activeConditions.map((item) => (
                      <li key={item} className='text-sm'>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='rounded-lg border p-3'>
                  <div className='mb-2 flex items-center gap-2'>
                    <p className='text-xs font-semibold tracking-wide uppercase'>
                      {t('inactivityConditions')}
                    </p>
                    <Badge variant='outline'>v2</Badge>
                  </div>
                  <ul className='space-y-1.5'>
                    {selectedProduct.inactiveConditions.map((item) => (
                      <li key={item} className='text-sm'>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              {t('productTargetActionsList')}
            </CardTitle>
            <CardDescription>
              {t('productTargetActionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableId')}</TableHead>
                  <TableHead>{t('tableName')}</TableHead>
                  <TableHead>{t('tableDefinition')}</TableHead>
                  <TableHead>{t('tableIdentification')}</TableHead>
                  <TableHead>{t('tableDataSource')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProduct.targetActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className='font-medium'>{action.id}</TableCell>
                    <TableCell>{action.name}</TableCell>
                    <TableCell className='text-sm'>{action.definition}</TableCell>
                    <TableCell className='text-muted-foreground font-mono text-xs'>
                      {action.identificationMethod}
                    </TableCell>
                    <TableCell>
                      {action.dataSourceId ? (
                        <span className='text-sm'>
                          {dataSourceById[action.dataSourceId]?.name ?? '—'}
                        </span>
                      ) : (
                        <span className='text-muted-foreground text-sm'>
                          {t('notSetOptional')}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>{t('dataSourcesDictionary')}</CardTitle>
            <CardDescription>
              {t('dataSourcesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableId')}</TableHead>
                  <TableHead>{t('tableName')}</TableHead>
                  <TableHead>{t('tableType')}</TableHead>
                  <TableHead>{t('tableOwner')}</TableHead>
                  <TableHead>{t('tableRefresh')}</TableHead>
                  <TableHead>{t('tableStatus')}</TableHead>
                  <TableHead>{t('tableDescription')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ANALYTICS_DATA_SOURCES.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className='font-medium'>{source.id}</TableCell>
                    <TableCell>{source.name}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{SOURCE_TYPE_LABEL[source.type]}</Badge>
                    </TableCell>
                    <TableCell>{source.owner}</TableCell>
                    <TableCell>{source.refreshPolicy}</TableCell>
                    <TableCell>
                      <Badge variant={SOURCE_STATUS_VARIANT[source.status]}>
                        {t(SOURCE_STATUS_KEY[source.status] as any)}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm'>{source.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
