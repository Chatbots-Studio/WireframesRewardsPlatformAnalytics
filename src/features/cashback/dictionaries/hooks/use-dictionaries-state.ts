'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  PRODUCT_DICTIONARY,
  type ProductDictionaryEntry
} from '@/features/cashback/data/analytics-dictionaries.mock';

const STORAGE_KEY = 'dictionaries:products';

function loadProducts(): ProductDictionaryEntry[] {
  if (typeof window === 'undefined') return structuredClone(PRODUCT_DICTIONARY);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProductDictionaryEntry[];
  } catch {
    /* corrupted — fall back to defaults */
  }
  return structuredClone(PRODUCT_DICTIONARY);
}

export function useDictionariesState() {
  const [products, setProducts] =
    useState<ProductDictionaryEntry[]>(loadProducts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

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

  const addProduct = useCallback((product: ProductDictionaryEntry) => {
    setProducts((prev) => [...prev, product]);
  }, []);

  return {
    products,
    selectedProduct,
    selectedId,
    sheetOpen,
    setSheetOpen,
    selectProduct,
    totalTargetActions,
    updateProduct,
    addProduct
  };
}
