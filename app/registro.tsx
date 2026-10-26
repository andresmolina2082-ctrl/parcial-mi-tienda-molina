// app/registro.tsx
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button, ErrorBox, Field, colors } from '@/components/ui';

type Errors = { email?: string; password?: string; confirm?: string };

function validate(email: string, password: string, confirm: string): Errors {
  const errors: Errors = {};
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Escribe un correo válido.';
  if (password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.';
  if (confirm !== password) errors.confirm = 'Las contraseñas no coinciden.';
  return errors;
}

export default function RegistroScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const found = validate(email, password, confirm);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    // Con la confirmación por correo desactivada, signUp devuelve sesión y Stack.Protected entra solo
    const message = await signUp(email, password);
    setLoading(false);
    if (message) setServerError(message);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>

          {serverError ? <ErrorBox>{serverError}</ErrorBox> : null}

          <Field
            label="Correo"
            value={email}
            onChangeText={setEmail}
            placeholder="rosa@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />
          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            error={errors.password}
          />
          <Field
            label="Confirmar contraseña"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repite la contraseña"
            secureTextEntry
            error={errors.confirm}
          />

          <Button title="Registrarme" onPress={handleRegister} loading={loading} />

          <Link href="/login" style={styles.link}>
            ¿Ya tienes cuenta? Volver al inicio de sesión
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 20, width: '100%', maxWidth: 420, alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary, textAlign: 'center', marginBottom: 20 },
  link: { color: colors.primary, textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
