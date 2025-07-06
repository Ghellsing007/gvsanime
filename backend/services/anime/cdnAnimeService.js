// cdnAnimeService.js
// Servicio para manejar datos de anime desde archivos JSON en CDN
// Precarga todos los datos en memoria para acceso rápido

import axios from 'axios';
import { normalizeImages } from './normalizers/jikanNormalizer.js';
import { getCDNConfig } from '../../config/cdn.js';

// Obtener configuración del CDN
const config = getCDNConfig();
const CDN_URLS = config.URLs;

// Almacén en memoria para todos los datos de anime
let animeData = [];
let isDataLoaded = false;
let lastLoadTime = null;
let loadError = null;

// Configuración desde el archivo de configuración
const RELOAD_INTERVAL = config.loadConfig.reloadInterval;
const MAX_RETRIES = config.loadConfig.maxRetries;
const RETRY_DELAY = config.loadConfig.retryDelay;

/**
 * Precarga todos los datos de anime desde el CDN
 */
export async function preloadAnimeData(forceReload = false) {
  // Si ya está cargado y no es un reload forzado, verificar si necesita actualización
  if (isDataLoaded && !forceReload) {
    const timeSinceLastLoad = Date.now() - lastLoadTime;
    if (timeSinceLastLoad < RELOAD_INTERVAL) {
      console.log('📦 Datos de anime ya cargados en memoria');
      return animeData;
    }
  }

  console.log('🔄 Cargando datos de anime desde CDN...');
  
  try {
    const startTime = Date.now();
    
    // Cargar todos los archivos en paralelo
    const responses = await Promise.allSettled(
      CDN_URLS.map(url => axios.get(url, { timeout: 30000 }))
    );

    // Procesar respuestas exitosas
    const successfulResponses = responses
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value.data;
        } else {
          console.error(`❌ Error cargando parte ${index + 1}:`, result.reason.message);
          return null;
        }
      })
      .filter(data => data !== null);

    if (successfulResponses.length === 0) {
      throw new Error('No se pudo cargar ningún archivo desde el CDN');
    }

    // Combinar todos los datos
    animeData = successfulResponses.flat();
    
    // Normalizar imágenes para todos los animes
    animeData = animeData.map(anime => ({
      ...anime,
      images: normalizeImages(anime.images) || anime.images
    }));

    isDataLoaded = true;
    lastLoadTime = Date.now();
    loadError = null;

    const loadTime = Date.now() - startTime;
    console.log(`✅ Datos cargados exitosamente: ${animeData.length} animes en ${loadTime}ms`);
    
    return animeData;
  } catch (error) {
    console.error('❌ Error precargando datos de anime:', error.message);
    loadError = error;
    throw error;
  }
}

/**
 * Obtiene un anime por ID
 */
export async function getAnimeById(malId) {
  await ensureDataLoaded();
  
  const anime = animeData.find(a => a.mal_id === parseInt(malId));
  if (!anime) {
    throw new Error(`Anime con ID ${malId} no encontrado`);
  }
  
  return anime;
}

/**
 * Busca animes por query con paginación
 */
export async function searchAnime(query, page = 1, limit = 12) {
  await ensureDataLoaded();
  
  const searchTerm = query.toLowerCase();
  const filteredAnimes = animeData.filter(anime => {
    const title = (anime.title || '').toLowerCase();
    const titleEnglish = (anime.title_english || '').toLowerCase();
    const titleJapanese = (anime.title_japanese || '').toLowerCase();
    const synopsis = (anime.synopsis || '').toLowerCase();
    
    return title.includes(searchTerm) ||
           titleEnglish.includes(searchTerm) ||
           titleJapanese.includes(searchTerm) ||
           synopsis.includes(searchTerm);
  });

  // Ordenar por score (si existe) o por popularidad
  filteredAnimes.sort((a, b) => {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    const popularityA = a.popularity || 999999;
    const popularityB = b.popularity || 999999;
    
    if (scoreA !== scoreB) return scoreB - scoreA;
    return popularityA - popularityB;
  });

  // Aplicar paginación
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredAnimes.slice(startIndex, endIndex);

  return {
    data: paginatedResults,
    pagination: {
      current_page: page,
      items: {
        count: filteredAnimes.length,
        total: filteredAnimes.length,
        per_page: limit
      },
      last_visible_page: Math.ceil(filteredAnimes.length / limit)
    }
  };
}

/**
 * Obtiene todos los animes con paginación
 */
export async function getAllAnimes(page = 1, limit = 25) {
  await ensureDataLoaded();
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = animeData.slice(startIndex, endIndex);

  return {
    data: paginatedResults,
    pagination: {
      current_page: page,
      items: {
        count: animeData.length,
        total: animeData.length,
        per_page: limit
      },
      last_visible_page: Math.ceil(animeData.length / limit)
    }
  };
}

/**
 * Obtiene animes por género
 */
export async function getAnimesByGenre(genreId, page = 1, limit = 24) {
  await ensureDataLoaded();
  
  const filteredAnimes = animeData.filter(anime => 
    anime.genres && anime.genres.some(g => g.mal_id === parseInt(genreId))
  );

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredAnimes.slice(startIndex, endIndex);

  return {
    data: paginatedResults,
    pagination: {
      current_page: page,
      items: {
        count: filteredAnimes.length,
        total: filteredAnimes.length,
        per_page: limit
      },
      last_visible_page: Math.ceil(filteredAnimes.length / limit)
    }
  };
}

/**
 * Obtiene animes top (por score)
 */
export async function getTopAnimes(limit = 20) {
  await ensureDataLoaded();
  
  const topAnimes = animeData
    .filter(anime => anime.score && anime.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return topAnimes;
}

/**
 * Obtiene animes recientes (por año de emisión)
 */
export async function getRecentAnimes(limit = 20) {
  await ensureDataLoaded();
  
  const currentYear = new Date().getFullYear();
  const recentAnimes = animeData
    .filter(anime => anime.year && anime.year >= currentYear - 2)
    .sort((a, b) => b.year - a.year || (b.score || 0) - (a.score || 0))
    .slice(0, limit);

  return recentAnimes;
}

/**
 * Obtiene animes destacados (combinación de score y popularidad)
 */
export async function getFeaturedAnimes(limit = 20) {
  await ensureDataLoaded();
  
  const featuredAnimes = animeData
    .filter(anime => anime.score && anime.score > 7 && anime.popularity && anime.popularity < 1000)
    .sort((a, b) => {
      // Combinar score y popularidad para ranking
      const scoreWeight = 0.7;
      const popularityWeight = 0.3;
      const normalizedScore = (a.score - 1) / 9; // Normalizar 1-10 a 0-1
      const normalizedPopularity = 1 - (a.popularity / 1000); // Invertir popularidad
      
      const rankA = (normalizedScore * scoreWeight) + (normalizedPopularity * popularityWeight);
      const rankB = (normalizedScore * scoreWeight) + (normalizedPopularity * popularityWeight);
      
      return rankB - rankA;
    })
    .slice(0, limit);

  return featuredAnimes;
}

/**
 * Obtiene información de paginación
 */
export async function getPaginationInfo() {
  await ensureDataLoaded();
  
  return {
    items: {
      count: animeData.length,
      total: animeData.length,
      per_page: 25
    },
    last_visible_page: Math.ceil(animeData.length / 25)
  };
}

/**
 * Asegura que los datos estén cargados
 */
async function ensureDataLoaded() {
  if (!isDataLoaded) {
    await preloadAnimeData();
  }
  
  if (loadError) {
    throw new Error(`Error en datos de anime: ${loadError.message}`);
  }
}

/**
 * Obtiene estadísticas de los datos cargados
 */
export function getDataStats() {
  return {
    isLoaded: isDataLoaded,
    totalAnimes: animeData.length,
    lastLoadTime,
    loadError: loadError?.message || null,
    memoryUsage: process.memoryUsage()
  };
}

/**
 * Fuerza la recarga de datos
 */
export async function forceReload() {
  console.log('🔄 Forzando recarga de datos de anime...');
  isDataLoaded = false;
  return await preloadAnimeData(true);
}

/**
 * Obtiene animes por temporada
 */
export async function getAnimesBySeason(year, season, page = 1, limit = 24) {
  await ensureDataLoaded();
  
  const seasonMap = {
    'spring': 'Spring',
    'summer': 'Summer', 
    'fall': 'Fall',
    'winter': 'Winter'
  };
  
  const seasonName = seasonMap[season.toLowerCase()] || season;
  const yearInt = parseInt(year);
  
  const filteredAnimes = animeData.filter(anime => {
    if (!anime.year || !anime.season) return false;
    return anime.year === yearInt && anime.season === seasonName;
  });

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredAnimes.slice(startIndex, endIndex);

  return {
    data: paginatedResults,
    pagination: {
      current_page: page,
      items: {
        count: filteredAnimes.length,
        total: filteredAnimes.length,
        per_page: limit
      },
      last_visible_page: Math.ceil(filteredAnimes.length / limit)
    }
  };
}

/**
 * Obtiene la lista de géneros únicos desde el CDN
 */
export async function getGenresFromCDN() {
  await ensureDataLoaded();
  
  const genreMap = new Map();
  
  animeData.forEach(anime => {
    if (anime.genres) {
      anime.genres.forEach(genre => {
        if (!genreMap.has(genre.mal_id)) {
          genreMap.set(genre.mal_id, {
            mal_id: genre.mal_id,
            name: genre.name,
            type: genre.type || 'anime',
            url: genre.url
          });
        }
      });
    }
  });
  
  // Convertir a array y ordenar por nombre
  const genres = Array.from(genreMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  return genres;
}

/**
 * Obtiene animes populares desde el CDN
 */
export async function getTopAnimesFromCDN(limit = 20) {
  await ensureDataLoaded();
  
  // Ordenar por score y popularidad
  const sortedAnimes = animeData
    .filter(anime => anime.score && anime.score > 0)
    .sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      const popularityA = a.popularity || 999999;
      const popularityB = b.popularity || 999999;
      
      if (scoreA !== scoreB) return scoreB - scoreA;
      return popularityA - popularityB;
    })
    .slice(0, limit);
  
  return sortedAnimes;
}

/**
 * Obtiene animes recientes desde el CDN
 */
export async function getRecentAnimesFromCDN(limit = 20) {
  await ensureDataLoaded();
  
  // Ordenar por año de lanzamiento (más recientes primero)
  const sortedAnimes = animeData
    .filter(anime => anime.year && anime.year > 0)
    .sort((a, b) => b.year - a.year)
    .slice(0, limit);
  
  return sortedAnimes;
}

/**
 * Obtiene animes destacados desde el CDN
 */
export async function getFeaturedAnimesFromCDN(limit = 20) {
  await ensureDataLoaded();
  // Combinar criterios: priorizar animes recientes con buen score
  let sortedAnimes = animeData
    .filter(anime => anime.score && anime.score >= 7.0 && anime.year && anime.year >= 2020)
    .sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      const popularityA = a.popularity || 999999;
      const popularityB = b.popularity || 999999;
      // Priorizar año reciente, luego score alto, luego popularidad
      if (yearA !== yearB) return yearB - yearA;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return popularityA - popularityB;
    });
  // Filtrar duplicados por mal_id
  const unique = [];
  const seen = new Set();
  for (const anime of sortedAnimes) {
    const id = anime.mal_id || anime.id;
    if (!seen.has(id)) {
      unique.push(anime);
      seen.add(id);
    }
    if (unique.length >= limit) break;
  }
  return unique;
}

/**
 * Obtiene animes recientes de alta calidad para Hero Section
 */
export async function getRecentHighQualityAnimes(limit = 20) {
  await ensureDataLoaded();
  let sortedAnimes = animeData
    .filter(anime => anime.score && anime.score >= 7.5 && anime.year && anime.year >= 2022)
    .sort((a, b) => {
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      const popularityA = a.popularity || 999999;
      const popularityB = b.popularity || 999999;
      if (yearA !== yearB) return yearB - yearA;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return popularityA - popularityB;
    });
  // Filtrar duplicados por mal_id
  const unique = [];
  const seen = new Set();
  for (const anime of sortedAnimes) {
    const id = anime.mal_id || anime.id;
    if (!seen.has(id)) {
      unique.push(anime);
      seen.add(id);
    }
    if (unique.length >= limit) break;
  }
  return unique;
}

// Inicializar carga de datos al importar el módulo
preloadAnimeData().catch(error => {
  console.error('❌ Error en carga inicial de datos:', error.message);
}); 