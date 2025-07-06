// middleware/cdnReady.js
// Middleware para verificar que los datos del CDN estén cargados antes de procesar peticiones

import { getDataStats } from '../services/anime/cdnAnimeService.js';

export default function cdnReady(req, res, next) {
  const stats = getDataStats();
  
  if (!stats.isLoaded) {
    console.log('⚠️ Petición bloqueada - CDN aún cargando datos...');
    return res.status(503).json({
      status: 'loading',
      message: 'El servidor está precargando los datos del CDN. Intenta de nuevo en unos segundos.',
      retryAfter: 3, // segundos
      stats: {
        isLoaded: stats.isLoaded,
        totalAnimes: stats.totalAnimes,
        lastLoadTime: stats.lastLoadTime,
        loadError: stats.loadError
      }
    });
  }
  
  // Si hay un error de carga, también bloquear
  if (stats.loadError) {
    console.log('❌ Petición bloqueada - Error en CDN:', stats.loadError);
    return res.status(503).json({
      status: 'error',
      message: 'Error cargando datos del CDN. El servidor está intentando recuperarse.',
      retryAfter: 5,
      stats: {
        isLoaded: stats.isLoaded,
        loadError: stats.loadError
      }
    });
  }
  
  // Datos listos, continuar
  next();
}

// Middleware opcional que solo advierte pero no bloquea
export function cdnReadyWarning(req, res, next) {
  const stats = getDataStats();
  
  if (!stats.isLoaded) {
    console.log('⚠️ Advertencia - CDN aún cargando, pero permitiendo petición...');
    // Agregar headers para que el frontend sepa el estado
    res.set({
      'X-CDN-Status': 'loading',
      'X-CDN-Total-Animes': stats.totalAnimes || 0,
      'X-CDN-Load-Error': stats.loadError || ''
    });
  } else {
    res.set({
      'X-CDN-Status': 'ready',
      'X-CDN-Total-Animes': stats.totalAnimes || 0
    });
  }
  
  next();
} 