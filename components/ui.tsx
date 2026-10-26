// components/ui.tsx
// Piezas visuales compartidas por las pantallas.
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

export const colors = {
  bg: '#f5f7fa',
  card: '#ffffff',
  text: '#1f2933',
  muted: '#6b7280',
  primary: '#0f766e',
  danger: '#b91c1c',
  dangerBg: '#fee2e2',
  border: '#d1d5db',
  pending: '#b45309',
  pendingBg: '#fef3c7',
  synced: '#047857',
  syncedBg: '#d1fae5',
};

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string | null }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        style={[styles.input, error ? { borderColor: colors.danger } : null]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function Button({
  title,
  onPress,
  loading,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
}) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const fg = variant === 'outline' ? colors.primary : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: pressed || loading ? 0.7 : 1 },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.primary },
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <View style={styles.errorBox}>
      <Text style={{ color: colors.danger }}>{children}</Text>
    </View>
  );
}

/** Pesos sin decimales con punto de miles: 12500 → $12.500 */
export function formatPesos(value: number) {
  return '$' + String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  fieldError: { color: colors.danger, marginTop: 4, fontSize: 13 },
  button: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  buttonText: { fontWeight: '700', fontSize: 16 },
  errorBox: { backgroundColor: colors.dangerBg, borderRadius: 8, padding: 10, marginBottom: 14 },
});
