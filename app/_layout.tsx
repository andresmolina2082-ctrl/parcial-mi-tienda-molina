// app/_layout.tsx
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/db/client';
import migrations from '@/drizzle/migrations';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { supabaseConfigError } from '@/lib/supabase';
import { colors } from '@/components/ui';

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {/* Con sesión solo existen Principal y Formulario */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="producto"
          options={{ headerShown: true, title: 'Producto', headerTintColor: colors.primary }}
        />
      </Stack.Protected>
      {/* Sin sesión solo existen Login y Registro */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
      </Stack.Protected>
    </Stack>
  );
}

function Message({ text }: { text: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: colors.danger, textAlign: 'center' }}>{text}</Text>
    </View>
  );
}

export default function RootLayout() {
  // Primero se aplican las migraciones de SQLite, después se carga la sesión
  const { success, error } = useMigrations(db, migrations);

  if (supabaseConfigError) return <Message text={supabaseConfigError} />;
  if (error) return <Message text={`Error en la base local: ${error.message}`} />;
  if (!success) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}
