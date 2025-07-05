// clear-cache.js
// Script para limpiar el cache de MongoDB

import { clearMongoDBCache } from './services/anime/dataSourceManager.js';

console.log('🧹 Limpiando cache de MongoDB...');

try {
  await clearMongoDBCache();
  console.log('✅ Cache de MongoDB limpiado exitosamente');
  console.log('🔄 Ahora las consultas obtendrán datos frescos de Jikan');
} catch (error) {
  console.error('❌ Error limpiando cache:', error.message);
} 