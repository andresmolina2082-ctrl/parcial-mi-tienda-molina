// hooks/useSync.ts
// Estado del botón Sincronizar y sincronización automática al recuperar la conexión.
import { useCallback, useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { describeResult, syncProducts } from '@/services/sync';
import { useAuth } from '@/context/AuthContext';

export type SyncMessage = { type: 'ok' | 'error'; text: string } | null;

export function useSync() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<SyncMessage>(null);
  const running = useRef(false); // evita dos sincronizaciones a la vez

  const sync = useCallback(
    async (auto = false) => {
      if (!userId || running.current) return;
      running.current = true;
      setSyncing(true);
      try {
        const result = await syncProducts(userId);
        setMessage({ type: 'ok', text: `${auto ? 'Sincronización automática: ' : ''}${describeResult(result)}` });
      } catch (e) {
        setMessage({ type: 'error', text: e instanceof Error ? e.message : 'No se pudo sincronizar.' });
      } finally {
        running.current = false;
        setSyncing(false);
      }
    },
    [userId],
  );

  // Extra · al pasar de sin conexión a con conexión, sincroniza solo
  useEffect(() => {
    let wasOffline = false;
    return NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      if (!online) wasOffline = true;
      else if (wasOffline) {
        wasOffline = false;
        sync(true);
      }
    });
  }, [sync]);

  return { sync: () => sync(false), syncing, message };
}
