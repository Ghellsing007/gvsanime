// cacheManager.js
// Gestor automático del caché de anime y búsquedas

import { cleanOldCache, getCacheStats } from './animeAggregator.js';

// Función para limpiar caché automáticamente (ejecutar cada día)
export async function autoCleanCache() {
  try {
    console.log('Iniciando limpieza automática del caché...');
    const stats = await getCacheStats();
    console.log(`Estado del caché antes de limpiar:`, stats);
    
    const result = await cleanOldCache();
    console.log('Limpieza automática completada:', result);
    
    const newStats = await getCacheStats();
    console.log(`Estado del caché después de limpiar:`, newStats);
    
    return result;
  } catch (error) {
    console.error('Error en limpieza automática del caché:', error);
    throw error;
  }
}

// Función para obtener estadísticas detalladas del caché
export async function getDetailedCacheStats() {
  try {
    const stats = await getCacheStats();
    const now = new Date();
    
    return {
      ...stats,
      timestamp: now.toISOString(),
      lastCleanup: 'Programado diariamente',
      nextCleanup: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas detalladas:', error);
    throw error;
  }
}

// Función para verificar si el caché necesita limpieza
export async function shouldCleanCache() {
  try {
    const stats = await getCacheStats();
    // Limpiar si hay más de 1000 elementos en caché
    return stats.total > 1000;
  } catch (error) {
    console.error('Error verificando necesidad de limpieza:', error);
    return false;
  }
}

/*
Explicación:
- autoCleanCache: Función principal para limpiar caché automáticamente
- getDetailedCacheStats: Obtiene estadísticas con información adicional
- shouldCleanCache: Verifica si es necesario limpiar el caché
- Se puede programar para ejecutar diariamente usando un cron job o similar
*/ 