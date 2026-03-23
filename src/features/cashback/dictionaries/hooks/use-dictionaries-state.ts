'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  PRODUCT_DICTIONARY,
  type ProductDictionaryEntry
} from '@/features/cashback/data/analytics-dictionaries.mock';

export function useDictionariesState(): {
  products: ProductDictionaryEntry[];
  selectedProduct: ProductDictionaryEntry | null;
  selectedId: string | null;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  selectProduct: (id: string) => void;
  totalTargetActions: number;
  updateProduct: (updated: ProductDictionaryEntry) => void;
} {
  const [products, setProducts] = useState<ProductDictionaryEntry[]>(() =>
    structuredClone(PRODUCT_DICTIONARY)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectProduct = useCallback((id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  const totalTargetActions = useMemo(
    () => products.reduce((sum, p) => sum + p.targetActions.length, 0),
    [products]
  );

  const updateProduct = useCallback((updated: ProductDictionaryEntry) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  return {
    products,
    selectedProduct,
    selectedId,
    sheetOpen,
    setSheetOpen,
    selectProduct,
    totalTargetActions,
    updateProduct
  };
}
