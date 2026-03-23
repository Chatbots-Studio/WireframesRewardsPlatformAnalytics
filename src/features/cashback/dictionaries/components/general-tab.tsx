'use client';

import { useTranslations } from 'next-intl';
import type { Dispatch, SetStateAction } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ANALYTICS_DATA_SOURCES,
  type ProductDictionaryEntry
} from '@/features/cashback/data/analytics-dictionaries.mock';

interface GeneralTabProps {
  product: ProductDictionaryEntry;
  form: ProductDictionaryEntry;
  setForm: Dispatch<SetStateAction<ProductDictionaryEntry>>;
  editing: boolean;
  onEditClick: () => void;
}

const sourceNameById = Object.fromEntries(
  ANALYTICS_DATA_SOURCES.map((s) => [s.id, s.name])
);

export function GeneralTab({
  product,
  form,
  setForm,
  editing,
  onEditClick
}: GeneralTabProps) {
  const t = useTranslations('dictionaries');

  const resolvedSourceLabel = product.productSourceId
    ? (sourceNameById[product.productSourceId] ?? product.productSourceId)
    : t('notSet');

  if (editing) {
    return (
      <div className='space-y-4'>
        <div>
          <label className='text-sm font-medium' htmlFor='dict-product-name'>
            {t('fieldName')}
          </label>
          <Input
            id='dict-product-name'
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className='mt-1.5'
          />
        </div>
        <div>
          <label className='text-sm font-medium' htmlFor='dict-product-desc'>
            {t('fieldDescription')}
          </label>
          <Textarea
            id='dict-product-desc'
            value={form.productSourceDescription}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                productSourceDescription: e.target.value
              }))
            }
            rows={3}
            className='mt-1.5'
          />
        </div>
        <div>
          <label className='text-sm font-medium' htmlFor='dict-active-cond'>
            {t('activityConditions')}
          </label>
          <Textarea
            id='dict-active-cond'
            value={form.activeConditions.join('\n')}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                activeConditions: e.target.value.split('\n').filter(Boolean)
              }))
            }
            rows={4}
            className='mt-1.5'
          />
        </div>
        <div>
          <label className='text-sm font-medium' htmlFor='dict-inactive-cond'>
            {t('inactivityConditions')}
          </label>
          <Textarea
            id='dict-inactive-cond'
            value={form.inactiveConditions.join('\n')}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                inactiveConditions: e.target.value.split('\n').filter(Boolean)
              }))
            }
            rows={4}
            className='mt-1.5'
          />
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      <div className='flex justify-end'>
        <Button variant='outline' size='sm' onClick={onEditClick}>
          {t('editButton')}
        </Button>
      </div>

      <div className='space-y-2 rounded-lg border p-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-xs font-semibold tracking-wide uppercase'>
            {t('productInfoSource')}
          </p>
          <Badge variant='outline'>v2</Badge>
        </div>
        <p className='text-sm'>{product.productSourceDescription}</p>
        <p className='text-muted-foreground text-xs'>
          {t('source')}{' '}
          <span className='text-foreground font-medium'>
            {resolvedSourceLabel}
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
            {product.activeConditions.map((item) => (
              <li key={item} className='text-sm'>
                {'\u2022'} {item}
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
            {product.inactiveConditions.map((item) => (
              <li key={item} className='text-sm'>
                {'\u2022'} {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
