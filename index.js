// index.js
// En web, openDatabaseSync falla en la primera carga si el worker de SQLite aún no arranca:
// se precarga de forma asíncrona antes de cargar la app.
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const { openDatabaseAsync } = require('expo-sqlite');
  openDatabaseAsync('mitienda.db')
    .then((warmup) => warmup.closeAsync())
    .catch((e) => console.warn('No se pudo precargar SQLite en web', e))
    .finally(() => require('expo-router/entry'));
} else {
  require('expo-router/entry');
}
