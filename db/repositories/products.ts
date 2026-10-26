// db/repositories/products.ts
// Única capa que conoce SQLite/Drizzle para los productos: las pantallas usan esto a través de los hooks.
import * as Crypto from 'expo-crypto';
import { and, asc, eq, isNotNull, isNull, like, lt, or } from 'drizzle-orm';
import { db } from '../client';
import { products, type Product } from '../schema';

export type ProductInput = Pick<Product, 'name' | 'quantity' | 'price'>;

/** Pendiente = nunca subido, o modificado después de la última sincronización. */
export function isPending(p: Pick<Product, 'syncedAt' | 'updatedAt'>) {
  return !p.syncedAt || p.syncedAt.getTime() < p.updatedAt.getTime();
}

const pendingCondition = or(isNull(products.syncedAt), lt(products.syncedAt, products.updatedAt));

export const productsRepo = {
  /** Consulta (sin ejecutar) de los productos visibles del usuario, para useLiveQuery. */
  listQuery(userId: string, search = '') {
    const conditions = [eq(products.userId, userId), isNull(products.deletedAt)];
    if (search.trim()) conditions.push(like(products.name, `%${search.trim()}%`));
    return db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(asc(products.name));
  },

  /** Borrados que aún no se han subido: cuentan como pendientes aunque ya no se vean en la lista. */
  pendingDeletesQuery(userId: string) {
    return db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.userId, userId), isNotNull(products.deletedAt), pendingCondition));
  },

  async getById(id: number, userId: string) {
    const [row] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.userId, userId), isNull(products.deletedAt)))
      .limit(1);
    return row ?? null;
  },

  async create(input: ProductInput, userId: string) {
    await db.insert(products).values({
      ...input,
      userId,
      clientId: Crypto.randomUUID(),
      updatedAt: new Date(),
    });
  },

  /** Cada edición escribe updatedAt, así el producto vuelve a quedar pendiente. */
  async update(id: number, input: ProductInput) {
    await db
      .update(products)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(products.id, id));
  },

  /** Borrado lógico: si nunca se subió, se borra de una vez; si no, se marca para borrarlo en la nube. */
  async remove(product: Product) {
    if (!product.syncedAt) {
      await db.delete(products).where(eq(products.id, product.id));
      return;
    }
    const now = new Date();
    await db.update(products).set({ deletedAt: now, updatedAt: now }).where(eq(products.id, product.id));
  },

  // ---- Usadas solo por services/sync.ts ----

  async listPending(userId: string) {
    return db
      .select()
      .from(products)
      .where(and(eq(products.userId, userId), pendingCondition));
  },

  async findByClientId(clientId: string, userId: string) {
    const [row] = await db
      .select()
      .from(products)
      .where(and(eq(products.clientId, clientId), eq(products.userId, userId)))
      .limit(1);
    return row ?? null;
  },

  /** Marca como sincronizada la versión que se subió (no cambia updatedAt). */
  async markSynced(id: number, version: Date) {
    await db.update(products).set({ syncedAt: version }).where(eq(products.id, id));
  },

  /** Producto que llegó de la nube: se guarda ya sincronizado. */
  async insertFromCloud(input: ProductInput & { clientId: string; updatedAt: Date }, userId: string) {
    await db.insert(products).values({ ...input, userId, syncedAt: input.updatedAt });
  },

  /** "Gana el último cambio": la versión de la nube reemplaza a la local. */
  async replaceFromCloud(id: number, input: ProductInput & { updatedAt: Date }) {
    await db
      .update(products)
      .set({ ...input, syncedAt: input.updatedAt, deletedAt: null })
      .where(eq(products.id, id));
  },

  async purge(id: number) {
    await db.delete(products).where(eq(products.id, id));
  },
};
