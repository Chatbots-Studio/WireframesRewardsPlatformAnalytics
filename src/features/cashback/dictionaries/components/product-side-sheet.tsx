'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProductDictionaryEntry } from '@/features/cashback/data/analytics-dictionaries.mock';

import { GeneralTab } from './general-tab';
import { TargetActionsTab } from './target-actions-tab';

interface ProductSideSheetProps {
  product: ProductDictionaryEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: ProductDictionaryEntry) => void;
}

interface ProductSideSheetInnerProps {
  product: ProductDictionaryEntry;
  onSave: (updated: ProductDictionaryEntry) => void;
}

function ProductSideSheetInner({
  product,
  onSave
}: ProductSideSheetInnerProps) {
  const t = useTranslations('dictionaries');
  const [activeTab, setActiveTab] = useState('general');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProductDictionaryEntry>(() => product);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = useCallback((value: string) => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
    setActiveTab(value);
  }, []);

  const handleSave = useCallback(() => {
    onSave(form);
    setEditing(false);
    toast.success(t('saveSuccess'), {
      description: t('demoModeNotice')
    });
  }, [form, onSave, t]);

  const handleCancel = useCallback(() => {
    setForm(product);
    setEditing(false);
  }, [product]);

  return (
    <SheetContent
      side='right'
      className='flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]'
    >
      <SheetHeader className='border-b p-4 pb-3'>
        <SheetTitle>{form.name}</SheetTitle>
      </SheetHeader>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='flex min-h-0 flex-1 flex-col overflow-hidden'
      >
        <TabsList className='mx-4 mt-3 w-fit'>
          <TabsTrigger value='general'>{t('tabGeneral')}</TabsTrigger>
          <TabsTrigger value='targetActions'>
            {t('tabTargetActions')}
          </TabsTrigger>
        </TabsList>
        <div
          ref={scrollContainerRef}
          className='flex-1 overflow-y-auto px-4 py-3'
        >
          <TabsContent value='general' className='mt-0'>
            <GeneralTab
              product={product}
              form={form}
              setForm={setForm}
              editing={editing}
              onEditClick={() => setEditing(true)}
            />
          </TabsContent>
          <TabsContent value='targetActions' className='mt-0'>
            <TargetActionsTab targetActions={product.targetActions} />
          </TabsContent>
        </div>
      </Tabs>
      {activeTab === 'general' && editing && (
        <SheetFooter className='mt-auto flex-row justify-end gap-2 border-t px-4 py-3'>
          <Button variant='outline' onClick={handleCancel}>
            {t('cancelButton')}
          </Button>
          <Button onClick={handleSave}>{t('saveButton')}</Button>
        </SheetFooter>
      )}
    </SheetContent>
  );
}

export function ProductSideSheet({
  product,
  open,
  onOpenChange,
  onSave
}: ProductSideSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open && product ? (
        <ProductSideSheetInner
          key={product.id}
          product={product}
          onSave={onSave}
        />
      ) : null}
    </Sheet>
  );
}
