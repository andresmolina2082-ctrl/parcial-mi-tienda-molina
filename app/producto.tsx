// app/producto.tsx
// Crear (sin id) o editar (con ?id=) un producto. Todo se guarda en SQLite: funciona sin internet.
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useProductForm } from '@/hooks/useProducts';
import { Button, ErrorBox, Field, colors } from '@/components/ui';

type Errors = { name?: string; quantity?: string; price?: string };

const isWholeNumber = (value: string) => /^\d+$/.test(value.trim());

function validate(name: string, quantity: string, price: string): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!isWholeNumber(quantity)) errors.quantity = 'La cantidad debe ser un número entero mayor o igual a 0.';
  if (!isWholeNumber(price)) errors.price = 'El precio debe ser un número entero (sin decimales) mayor o igual a 0.';
  return errors;
}

export default function ProductoScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : undefined;
  const isEditing = id !== undefined;
  const { product, loading, save } = useProductForm(id);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Al editar, el formulario arranca con los datos guardados
  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setQuantity(String(product.quantity));
    setPrice(String(product.price));
  }, [product]);

  async function handleSave() {
    const found = validate(name, quantity, price);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await save({ name: name.trim(), quantity: Number(quantity), price: Number(price) });
      router.back();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'No se pudo guardar el producto.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isEditing && !product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>El producto no existe.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: isEditing ? 'Editar producto' : 'Nuevo producto' }} />
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        {saveError ? <ErrorBox>{saveError}</ErrorBox> : null}

        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Arroz Diana 500 g" error={errors.name} />
        <Field
          label="Cantidad (unidades)"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="0"
          keyboardType="number-pad"
          error={errors.quantity}
        />
        <Field
          label="Precio (pesos)"
          value={price}
          onChangeText={setPrice}
          placeholder="0"
          keyboardType="number-pad"
          error={errors.price}
        />

        <View style={{ gap: 10, marginTop: 6 }}>
          <Button title={isEditing ? 'Guardar cambios' : 'Agregar producto'} onPress={handleSave} loading={saving} />
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, width: '100%', maxWidth: 520, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
