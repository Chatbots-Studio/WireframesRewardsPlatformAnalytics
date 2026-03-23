'use client';

import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { ProductTargetAction } from '@/features/cashback/data/analytics-dictionaries.mock';

interface TargetActionsTabProps {
  targetActions: ProductTargetAction[];
  onAdd: (action: ProductTargetAction) => void;
}

const emptyForm = {
  name: '',
  definition: '',
  identificationMethod: ''
};

export function TargetActionsTab({
  targetActions,
  onAdd
}: TargetActionsTabProps) {
  const t = useTranslations('dictionaries');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const canSubmit = form.name.trim().length > 0;

  const handleSubmit = useCallback(() => {
    const action: ProductTargetAction = {
      id: `TA-${Date.now().toString(36).toUpperCase()}`,
      name: form.name.trim(),
      definition: form.definition.trim(),
      identificationMethod: form.identificationMethod.trim()
    };
    onAdd(action);
    setForm(emptyForm);
    setAdding(false);
  }, [form, onAdd]);

  const handleCancel = useCallback(() => {
    setForm(emptyForm);
    setAdding(false);
  }, []);

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        {!adding && (
          <Button variant='outline' size='sm' onClick={() => setAdding(true)}>
            <PlusIcon className='size-4' />
            {t('addTargetAction')}
          </Button>
        )}
      </div>

      {targetActions.length === 0 && !adding ? (
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
      ) : targetActions.length > 0 ? (
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
      ) : null}

      {adding && (
        <div className='space-y-3 rounded-lg border p-3'>
          <p className='text-sm font-medium'>{t('newTargetAction')}</p>
          <div>
            <label className='text-sm font-medium' htmlFor='ta-name'>
              {t('tableName')} *
            </label>
            <Input
              id='ta-name'
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t('taNamePlaceholder')}
              className='mt-1'
              autoFocus
            />
          </div>
          <div>
            <label className='text-sm font-medium' htmlFor='ta-definition'>
              {t('tableDefinition')}
            </label>
            <Textarea
              id='ta-definition'
              value={form.definition}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, definition: e.target.value }))
              }
              placeholder={t('taDefinitionPlaceholder')}
              rows={2}
              className='mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium' htmlFor='ta-ident'>
              {t('tableIdentification')}
            </label>
            <Textarea
              id='ta-ident'
              value={form.identificationMethod}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  identificationMethod: e.target.value
                }))
              }
              placeholder={t('taIdentPlaceholder')}
              rows={2}
              className='mt-1'
            />
          </div>
          <div className='flex justify-end gap-2 pt-1'>
            <Button variant='outline' size='sm' onClick={handleCancel}>
              {t('cancelButton')}
            </Button>
            <Button size='sm' onClick={handleSubmit} disabled={!canSubmit}>
              {t('addTargetAction')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
