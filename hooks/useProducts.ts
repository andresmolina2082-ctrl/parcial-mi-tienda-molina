// hooks/useProducts.ts
// Puente entre las pantallas y el repositorio: las pantallas nunca importan Drizzle.
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { isPending, productsRepo, type ProductInput } from '@/db/repositories/products';
import type { Product } from '@/db/schema';
import { useAuth } from '@/context/AuthContext';

/** Lista reactiva del inventario con sus totales. */
export function useProducts(search: string) {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const { data } = useLiveQuery(productsRepo.listQuery(userId, search), [userId, search]);
  const { data: deletes } = useLiveQuery(productsRepo.pendingDeletesQuery(userId), [userId]);

  const totals = useMemo(() => {
    const list = data ?? [];
    return {
      units: list.reduce((sum, p) => sum + p.quantity, 0),
      value: list.reduce((sum, p) => sum + p.quantity * p.price, 0),
      pending: list.filter(isPending).length + (deletes?.length ?? 0),
    };
  }, [data, deletes]);

  return {
    products: data ?? [],
    totals,
    remove: (product: Product) => productsRepo.remove(product),
  };
}

/** Datos y acciones del formulario: crea si no hay id, edita si lo hay. */
export function useProductForm(id?: number) {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(id !== undefined);

  useEffect(() => {
    if (id === undefined) return;
    productsRepo.getById(id, userId).then((row) => {
      setProduct(row);
      setLoading(false);
    });
  }, [id, userId]);

  return {
    product,
    loading,
    save: (input: ProductInput) => (id !== undefined ? productsRepo.update(id, input) : productsRepo.create(input, userId)),
  };
}

export { isPending };
