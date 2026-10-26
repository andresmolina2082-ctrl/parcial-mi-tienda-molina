// app/login.tsx
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button, ErrorBox, Field, colors } from '@/components/ui';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setLoading(true);
    setError(null);
    // Si sale bien, Stack.Protected cambia solo a la pantalla principal
    const message = await signIn(email, password);
    setLoading(false);
    if (message) setError(message);
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Mi Tienda</Text>
        <Text style={styles.subtitle}>Inicia sesión para ver tu inventario</Text>

        {error ? <ErrorBox>{error}</ErrorBox> : null}

        <Field
          label="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="rosa@correo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />

        <Button title="Ingresar" onPress={handleLogin} loading={loading} />

        <Link href="/registro" style={styles.link}>
          ¿No tienes cuenta? Regístrate
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 20, width: '100%', maxWidth: 420, alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  subtitle: { color: colors.muted, textAlign: 'center', marginBottom: 20, marginTop: 4 },
  link: { color: colors.primary, textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
