// services/sync.ts
// SQLite es la fuente de verdad; Supabase es el respaldo. Solo aquí se habla con la tabla de la nube.
import { supabase } from '@/lib/supabase';
import { productsRepo } from '@/db/repositories/products';

interface CloudProduct {
  client_id: string;
  name: string;
  quantity: number;
  price: number;
  updated_at: string;
}

export interface SyncResult {
  uploaded: number;
  downloaded: number;
  deleted: number;
}

function friendlyError(message: string) {
  if (/network request failed|failed to fetch|fetch failed|network/i.test(message)) {
    return 'Sin conexión a internet. Los cambios siguen guardados en el teléfono.';
  }
  return message;
}

export async function syncProducts(userId: string): Promise<SyncResult> {
  try {
    return await runSync(userId);
  } catch (e) {
    throw new Error(friendlyError(e instanceof Error ? e.message : String(e)));
  }
}

async function runSync(userId: string): Promise<SyncResult> {
  const result: SyncResult = { uploaded: 0, downloaded: 0, deleted: 0 };

  // 1. Bajar: RLS ya filtra, solo llegan los productos de este usuario
  const { data, error } = await supabase.from('products').select('client_id, name, quantity, price, updated_at');
  if (error) throw new Error(error.message);

  for (const remote of (data ?? []) as CloudProduct[]) {
    const cloud = {
      name: remote.name,
      quantity: remote.quantity,
      price: remote.price,
      updatedAt: new Date(remote.updated_at),
    };
    const local = await productsRepo.findByClientId(remote.client_id, userId);

    if (!local) {
      // No existe en el teléfono: se inserta ya marcado como sincronizado
      await productsRepo.insertFromCloud({ ...cloud, clientId: remote.client_id }, userId);
      result.downloaded++;
    } else if (cloud.updatedAt.getTime() > local.updatedAt.getTime()) {
      // Extra · gana el último cambio: la nube tiene una versión más nueva que la local
      await productsRepo.replaceFromCloud(local.id, cloud);
      result.downloaded++;
    }
  }

  // 2. Subir: pendientes = syncedAt vacío o anterior a updatedAt
  const pending = await productsRepo.listPending(userId);

  // Extra · borrado sincronizado: lo marcado con deletedAt se borra en la nube y luego en el teléfono
  for (const p of pending.filter((p) => p.deletedAt)) {
    const { error: deleteError } = await supabase.from('products').delete().eq('client_id', p.clientId);
    if (deleteError) throw new Error(deleteError.message);
    await productsRepo.purge(p.id);
    result.deleted++;
  }

  const toUpload = pending.filter((p) => !p.deletedAt);
  if (toUpload.length > 0) {
    // upsert por client_id: si ya existe se actualiza, así nunca se duplican filas
    const { error: upsertError } = await supabase.from('products').upsert(
      toUpload.map((p) => ({
        client_id: p.clientId,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        updated_at: p.updatedAt.toISOString(),
      })),
      { onConflict: 'client_id' },
    );
    if (upsertError) throw new Error(upsertError.message);

    // syncedAt = el updatedAt que se subió: si el producto se edita durante la subida, sigue pendiente
    for (const p of toUpload) await productsRepo.markSynced(p.id, p.updatedAt);
    result.uploaded = toUpload.length;
  }

  return result;
}

export function describeResult({ uploaded, downloaded, deleted }: SyncResult) {
  const parts = [
    `${uploaded} ${uploaded === 1 ? 'subido' : 'subidos'}`,
    `${downloaded} ${downloaded === 1 ? 'bajado' : 'bajados'}`,
  ];
  if (deleted > 0) parts.push(`${deleted} ${deleted === 1 ? 'borrado' : 'borrados'}`);
  return parts.join(', ');
}
