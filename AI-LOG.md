# Registro de uso de IA

**Herramienta:** Claude Code (modelo Claude Opus 5.5), dentro de VS Code.

## Prompt principal

> "ayudame con este trabajo" — adjuntando el PDF del enunciado del parcial "Mi Tienda".

La IA reutilizó mis archivos de la Semana 8/9 (proyecto `geocam`): `lib/secureStorage.ts`, `lib/supabase.ts`, la base de `context/AuthContext.tsx` y la configuración de Drizzle, Babel y Metro. Después escribió el esquema, el repositorio, los hooks, las pantallas y `services/sync.ts`, e hizo un commit por bloque del plan.

## Qué se corrigió o ajustó del código generado

- **`syncedAt` al subir:** se marca con el `updatedAt` del producto que se subió y no con `new Date()`. Si se usara la hora actual, un producto editado mientras se subía quedaría marcado como sincronizado sin estarlo.
- **`markSynced` no toca `updatedAt`**: si lo cambiara, el producto volvería a quedar pendiente después de cada sincronización.
- **Confirmación al eliminar en web:** `Alert.alert` con botones no funciona en web, así que se usa `window.confirm` en esa plataforma.
- **`signUp`**: el mensaje original de la Semana 8 decía "Revisa tu correo"; se cambió para avisar que hay que desactivar "Confirm email" en Supabase.
- **Usuario dueño local (`userId`)**: se agregó para que dos cuentas en el mismo teléfono no mezclen inventarios.
- **`.env`**: la IA intentó copiar el `.env` del proyecto anterior y la acción fue bloqueada; el `.env` se crea a mano desde `.env.example` y nunca se sube.
- _PENDIENTE: agregar aquí lo que yo mismo corregí al probar en el teléfono._

## Alucinaciones detectadas

- _PENDIENTE: completar si al probar algo no funcionó como la IA dijo (o escribir "Ninguna detectada")._

## Verificación hecha

- `npx tsc --noEmit` sin errores.
- `npx expo install --check`: dependencias compatibles con el SDK 57.
- `npx expo export --platform android` compila el bundle.
- Prueba manual en la versión web: registro con validación, login, CRUD, producto creado en Offline (DevTools) marcado como pendiente, sincronización automática al volver la conexión ("3 subidos, 0 bajados") y 4 filas sin duplicados en Supabase (ver `capturas/`).
- Al probar apareció el aviso de "falta confirmar el correo": la opción **Confirm email** de Supabase seguía activa. Se agregó la traducción del error "Email not confirmed".
