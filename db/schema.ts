// db/schema.ts
// Solo drizzle-orm: drizzle-kit lee este archivo con Node, así que aquí no se importa ningún paquete de Expo.
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Mismo producto en el teléfono y en la nube (el UUID lo genera el repositorio con expo-crypto)
  clientId: text('client_id').notNull().unique(),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(), // pesos, sin decimales
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  // Versión (updatedAt) que quedó en la nube; vacío = nunca subido
  syncedAt: integer('synced_at', { mode: 'timestamp_ms' }),
  // Extra: dueño local, para no mezclar inventarios si otra cuenta inicia sesión en el mismo teléfono
  userId: text('user_id').notNull(),
  // Extra: borrado lógico, para poder borrar también en la nube al sincronizar
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
});

export type Product = typeof products.$inferSelect;
