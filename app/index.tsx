// app/index.tsx
// Pantalla principal: inventario leído siempre de SQLite (lista reactiva con useLiveQuery).
import { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { isPending, useProducts } from '@/hooks/useProducts';
import { useSync } from '@/hooks/useSync';
import type { Product } from '@/db/schema';
import { Button, colors, formatPesos } from '@/components/ui';

function confirmDelete(product: Product, onConfirm: () => void) {
  const message = `¿Eliminar "${product.name}" del inventario?`;
  // Alert con botones no existe en web
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert('Eliminar producto', message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

function ProductRow({ product, onDelete }: { product: Product; onDelete: () => void }) {
  const pending = isPending(product);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/producto', params: { id: String(product.id) } })}
      onLongPress={() => confirmDelete(product, onDelete)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{product.name}</Text>
        <Text style={styles.rowDetail}>
          {product.quantity} und · {formatPesos(product.price)} c/u · {formatPesos(product.quantity * product.price)}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: pending ? colors.pendingBg : colors.syncedBg }]}>
        <Text style={{ color: pending ? colors.pending : colors.synced, fontWeight: '700', fontSize: 12 }}>
          {pending ? '⏳ Pendiente' : '☁️ En la nube'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const { products, totals, remove } = useProducts(search);
  const { sync, syncing, message } = useSync();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mi Tienda</Text>
          <Text style={styles.email} numberOfLines={1}>
            {session?.user.email}
          </Text>
        </View>
        <Pressable onPress={signOut} hitSlop={8}>
          <Text style={styles.logout}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat label="Unidades" value={String(totals.units)} />
        <Stat label="Valor total" value={formatPesos(totals.value)} />
        <Stat label="Pendientes" value={String(totals.pending)} highlight={totals.pending > 0} />
      </View>

      <Button title={syncing ? 'Sincronizando…' : '⟳ Sincronizar'} onPress={sync} loading={syncing} />
      {message ? (
        <View style={[styles.message, { backgroundColor: message.type === 'ok' ? colors.syncedBg : colors.dangerBg }]}>
          <Text style={{ color: message.type === 'ok' ? colors.synced : colors.danger, fontWeight: '600' }}>
            {message.type === 'ok' ? '✓ ' : '⚠ '}
            {message.text}
          </Text>
        </View>
      ) : null}

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nombre…"
        placeholderTextColor={colors.muted}
      />

      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => <ProductRow product={item} onDelete={() => remove(item)} />}
        contentContainerStyle={{ paddingBottom: 90, gap: 8 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {search ? 'Ningún producto coincide con la búsqueda.' : 'Aún no hay productos. Toca "+ Agregar".'}
          </Text>
        }
        ListFooterComponent={
          products.length > 0 ? <Text style={styles.hint}>Toca para editar · Mantén presionado para eliminar</Text> : null
        }
      />

      <View style={styles.fab}>
        <Button title="+ Agregar producto" onPress={() => router.push('/producto')} />
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, highlight && { color: colors.pending }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.primary },
  email: { color: colors.muted },
  logout: { color: colors.danger, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 10, alignItems: 'center' },
  statValue: { fontSize: 17, fontWeight: '800', color: colors.text },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  message: { borderRadius: 8, padding: 10, marginTop: 8 },
  search: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  rowName: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowDetail: { color: colors.muted, marginTop: 2 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 8 },
  fab: { position: 'absolute', left: 16, right: 16, bottom: 20 },
});
