'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ANALYTICS_DATA_SOURCES,
  type ProductDictionaryEntry
} from '@/features/cashback/data/analytics-dictionaries.mock';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: ProductDictionaryEntry) => void;
}

const NONE_VALUE = '__none__';

function generateId() {
  return `PRD-${Date.now().toString(36).toUpperCase()}`;
}

const emptyForm = {
  name: '',
  productSourceDescription: '',
  productSourceId: NONE_VALUE,
  activeConditions: '',
  inactiveConditions: ''
};

export function AddProductDialog({
  open,
  onOpenChange,
  onAdd
}: AddProductDialogProps) {
  const t = useTranslations('dictionaries');
  const [form, setForm] = useState(emptyForm);

  const reset = useCallback(() => setForm(emptyForm), []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset]
  );

  const canSubmit = form.name.trim().length > 0;

  const handleSubmit = useCallback(() => {
    const product: ProductDictionaryEntry = {
      id: generateId(),
      name: form.name.trim(),
      productSourceDescription: form.productSourceDescription.trim(),
      productSourceId:
        form.productSourceId === NONE_VALUE ? undefined : form.productSourceId,
      activeConditions: form.activeConditions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      inactiveConditions: form.inactiveConditions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      targetActions: []
    };
    onAdd(product);
    reset();
    onOpenChange(false);
    toast.success(t('addProductSuccess'));
  }, [form, onAdd, onOpenChange, reset, t]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('addProductTitle')}</DialogTitle>
          <DialogDescription>{t('addProductDescription')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium' htmlFor='add-prd-name'>
              {t('fieldName')} *
            </label>
            <Input
              id='add-prd-name'
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t('addProductNamePlaceholder')}
              className='mt-1.5'
              autoFocus
            />
          </div>

          <div>
            <label className='text-sm font-medium' htmlFor='add-prd-desc'>
              {t('fieldDescription')}
            </label>
            <Textarea
              id='add-prd-desc'
              value={form.productSourceDescription}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  productSourceDescription: e.target.value
                }))
              }
              placeholder={t('addProductDescPlaceholder')}
              rows={2}
              className='mt-1.5'
            />
          </div>

          <div>
            <label className='text-sm font-medium'>
              {t('addProductSource')}
            </label>
            <Select
              value={form.productSourceId}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, productSourceId: v }))
              }
            >
              <SelectTrigger className='mt-1.5'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>{t('notSet')}</SelectItem>
                {ANALYTICS_DATA_SOURCES.map((src) => (
                  <SelectItem key={src.id} value={src.id}>
                    {src.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='text-sm font-medium' htmlFor='add-prd-active'>
              {t('activityConditions')}
            </label>
            <Textarea
              id='add-prd-active'
              value={form.activeConditions}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  activeConditions: e.target.value
                }))
              }
              placeholder={t('addProductConditionsPlaceholder')}
              rows={3}
              className='mt-1.5'
            />
          </div>

          <div>
            <label className='text-sm font-medium' htmlFor='add-prd-inactive'>
              {t('inactivityConditions')}
            </label>
            <Textarea
              id='add-prd-inactive'
              value={form.inactiveConditions}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  inactiveConditions: e.target.value
                }))
              }
              placeholder={t('addProductConditionsPlaceholder')}
              rows={3}
              className='mt-1.5'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            {t('cancelButton')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {t('addProductSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
