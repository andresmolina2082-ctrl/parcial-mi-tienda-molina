// db/client.ts
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// enableChangeListener permite que useLiveQuery refresque las pantallas al cambiar la tabla
export const expoDb = openDatabaseSync('mitienda.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });
