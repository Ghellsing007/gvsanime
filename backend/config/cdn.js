// config/cdn.js
// Configuración para el servicio de CDN de anime

export const CDN_CONFIG = {
  // URLs de los archivos JSON en CDN
  URLs: [
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part1.json',
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part2.json',
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part3.json',
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part4.json',
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part5.json',
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part6.json',
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part7.json',
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part8.json',
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part9.json',
    'https://cdn.jsdelivr.net/gh/Ghellsing007/api-anime@main/anime_data_part10.json'
  ],
  
  // Configuración de carga
  loadConfig: {
    timeout: 30000, // 30 segundos
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    reloadInterval: 1000 * 60 * 60 * 6, // 6 horas
    parallelLoad: true // Cargar archivos en paralelo
  },
  
  // Configuración de búsqueda
  searchConfig: {
    defaultLimit: 12,
    maxLimit: 100,
    searchFields: ['title', 'title_english', 'title_japanese', 'synopsis'],
    sortBy: ['score', 'popularity']
  },
  
  // Configuración de paginación
  paginationConfig: {
    defaultPage: 1,
    defaultLimit: 25,
    maxLimit: 100
  },
  
  // Configuración de filtros
  filterConfig: {
    minScore: 0,
    maxScore: 10,
    minYear: 1960,
    maxYear: new Date().getFullYear() + 1
  }
};

// Función para obtener configuración desde variables de entorno
export function getCDNConfig() {
  return {
    ...CDN_CONFIG,
    loadConfig: {
      ...CDN_CONFIG.loadConfig,
      timeout: parseInt(process.env.CDN_TIMEOUT) || CDN_CONFIG.loadConfig.timeout,
      maxRetries: parseInt(process.env.CDN_MAX_RETRIES) || CDN_CONFIG.loadConfig.maxRetries,
      retryDelay: parseInt(process.env.CDN_RETRY_DELAY) || CDN_CONFIG.loadConfig.retryDelay,
      reloadInterval: parseInt(process.env.CDN_RELOAD_INTERVAL) || CDN_CONFIG.loadConfig.reloadInterval
    }
  };
}

// Función para validar URLs del CDN
export function validateCDNUrls() {
  const validUrls = CDN_CONFIG.URLs.filter(url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
  
  if (validUrls.length !== CDN_CONFIG.URLs.length) {
    console.warn('⚠️ Algunas URLs del CDN no son válidas');
  }
  
  return validUrls;
}

// Función para obtener estadísticas de configuración
export function getCDNConfigStats() {
  return {
    totalFiles: CDN_CONFIG.URLs.length,
    validUrls: validateCDNUrls().length,
    config: getCDNConfig(),
    environment: {
      CDN_TIMEOUT: process.env.CDN_TIMEOUT,
      CDN_MAX_RETRIES: process.env.CDN_MAX_RETRIES,
      CDN_RETRY_DELAY: process.env.CDN_RETRY_DELAY,
      CDN_RELOAD_INTERVAL: process.env.CDN_RELOAD_INTERVAL
    }
  };
} 