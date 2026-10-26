// app/index.tsx
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Button, colors } from '@/components/ui';

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Inventario</Text>
      <Text style={{ color: colors.muted, marginBottom: 20 }}>{session?.user.email}</Text>
      <Button title="Cerrar sesión" variant="outline" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary },
});
