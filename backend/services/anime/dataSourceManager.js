// dataSourceManager.js
// Gestor optimizado para CDN + Supabase + MongoDB (solo interacciones)
// Prioriza CDN para datos de anime, MongoDB solo para interacciones de usuario

import mongoose from '../../services/shared/mongooseClient.js';
import { getAnimeById, searchAnime, getAllAnimes } from './jikanService.js';
import { 
  getAnimeById as getAnimeByIdCDN,
  searchAnime as searchAnimeCDN,
  getAllAnimes as getAllAnimesCDN,
  getTopAnimes,
  getRecentAnimes,
  getFeaturedAnimes,
  getAnimesByGenre,
  getAnimesBySeason,
  getDataStats,
  forceReload,
  getRecentHighQualityAnimes,
  getFeaturedAnimesFromCDN
} from './cdnAnimeService.js';
import { normalizeImages } from './normalizers/jikanNormalizer.js';
import axios from 'axios';

// Configuración de fuente de datos desde variables de entorno
const DATA_SOURCE = process.env.ANIME_DATA_SOURCE || 'cdn'; // 'cdn', 'jikan', 'hybrid'
const FORCE_JIKAN = process.env.FORCE_JIKAN === 'true';
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false'; // true por defecto

// Modelos de MongoDB solo para interacciones de usuario
const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', new mongoose.Schema({
  userId: String,
  animeId: String,
  createdAt: { type: Date, default: Date.now }
}));

const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', new mongoose.Schema({
  userId: String,
  animeId: String,
  createdAt: { type: Date, default: Date.now }
}));

const Rating = mongoose.models.Rating || mongoose.model('Rating', new mongoose.Schema({
  userId: String,
  animeId: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now }
}));

// Función para determinar qué fuente usar (optimizada para CDN)
function getDataSource() {
  // Leer variables de entorno dinámicamente
  const currentDataSource = process.env.ANIME_DATA_SOURCE || 'cdn';
  const currentForceJikan = process.env.FORCE_JIKAN === 'true';
  
  // Si FORCE_JIKAN está activado, usar solo Jikan
  if (currentForceJikan) {
    console.log('🔧 FORCE_JIKAN activado, usando solo Jikan');
    return 'jikan';
  }
  
  // Si ANIME_DATA_SOURCE está configurado específicamente
  if (currentDataSource === 'jikan') {
    console.log('🔧 ANIME_DATA_SOURCE=jikan, usando solo Jikan');
    return 'jikan';
  }
  
  if (currentDataSource === 'hybrid') {
    console.log('🔧 ANIME_DATA_SOURCE=hybrid, usando CDN + Jikan fallback');
    return 'hybrid';
  }
  
  // Por defecto usar CDN
  console.log('🔧 Usando CDN como fuente principal');
  return 'cdn';
}

// Función para obtener anime por ID (optimizada para CDN)
export async function getAnimeByIdManager(animeId, userId = null) {
  const source = getDataSource();
  console.log(`🔍 Obteniendo anime ${animeId} desde: ${source}`);

  try {
    switch (source) {
      case 'jikan':
        return await getAnimeFromJikanWithSupabase(animeId, userId);
      
      case 'hybrid':
        return await getAnimeHybrid(animeId, userId);
      
      case 'cdn':
      default:
        return await getAnimeFromCDN(animeId, userId);
    }
  } catch (error) {
    console.error(`❌ Error obteniendo anime ${animeId}:`, error.message);
    
    // Fallback: CDN -> Jikan
    if (source === 'cdn') {
      console.log('🔄 Fallback a Jikan...');
      try {
        return await getAnimeFromJikanWithSupabase(animeId, userId);
      } catch (jikanError) {
        console.error('❌ Fallback a Jikan también falló:', jikanError.message);
        throw error;
      }
    } else if (source === 'hybrid') {
      console.log('🔄 Fallback a Jikan...');
      try {
        return await getAnimeFromJikanWithSupabase(animeId, userId);
      } catch (jikanError) {
        console.error('❌ Fallback a Jikan también falló:', jikanError.message);
        throw error;
      }
    }
    
    throw error;
  }
}

// Función para buscar anime (optimizada para CDN)
export async function searchAnimeManager(query, page = 1, limit = 12) {
  const source = getDataSource();
  console.log(`🔍 Buscando "${query}" desde: ${source}`);

  try {
    switch (source) {
      case 'jikan':
        return await searchAnimeFromJikanOnly(query, page, limit);
      
      case 'hybrid':
        return await searchAnimeHybrid(query, page, limit);
      
      case 'cdn':
      default:
        return await searchAnimeFromCDN(query, page, limit);
    }
  } catch (error) {
    console.error(`❌ Error buscando "${query}":`, error.message);
    
    // Fallback: CDN -> Jikan
    if (source === 'cdn') {
      console.log('🔄 Fallback a Jikan...');
      try {
        return await searchAnimeFromJikanOnly(query, page, limit);
      } catch (jikanError) {
        console.error('❌ Fallback a Jikan también falló:', jikanError.message);
        throw error;
      }
    } else if (source === 'hybrid') {
      console.log('🔄 Fallback a Jikan...');
      try {
        return await searchAnimeFromJikanOnly(query, page, limit);
      } catch (jikanError) {
        console.error('❌ Fallback a Jikan también falló:', jikanError.message);
        throw error;
      }
    }
    
    throw error;
  }
}

// Función para obtener animes top (optimizada para CDN)
export async function getTopAnimeManager() {
  const source = getDataSource();
  console.log(`🔍 Obteniendo animes top desde: ${source}`);

  try {
    switch (source) {
      case 'jikan':
        return await getTopAnimeFromJikan();
      
      case 'hybrid':
        return await getTopAnimeHybrid();
      
      case 'cdn':
      default:
        return await getTopAnimeFromCDN();
    }
  } catch (error) {
    console.error('❌ Error obteniendo animes top:', error.message);
    
    // Fallback: CDN -> Jikan
    if (source === 'cdn') {
      console.log('🔄 Fallback a Jikan...');
      try {
        return await getTopAnimeFromJikan();
      } catch (jikanError) {
        console.error('❌ Fallback a Jikan también falló:', jikanError.message);
        throw error;
      }
    }
    
    throw error;
  }
}

// Función para obtener animes recientes (optimizada para CDN)
export async function getRecentAnimeManager() {
  const source = getDataSource();
  console.log(`🔍 Obteniendo animes recientes desde: ${source}`);

  try {
    switch (source) {
      case 'jikan':
        return await getRecentAnimeFromJikan();
      
      case 'hybrid':
        return await getRecentAnimeHybrid();
      
      case 'cdn':
      default:
        return await getRecentAnimeFromCDN();
    }
  } catch (error) {
    console.error('❌ Error obteniendo animes recientes:', error.message);
    
    // Fallback: CDN -> Jikan
    if (source === 'cdn') {
      console.log('🔄 Fallback a Jikan...');
      try {
        return await getRecentAnimeFromJikan();
      } catch (jikanError) {
        console.error('❌ Fallback a Jikan también falló:', jikanError.message);
        throw error;
      }
    }
    
    throw error;
  }
}

// Función para obtener animes destacados (optimizada para CDN)
export async function getFeaturedAnimeManager() {
  const source = getDataSource();
  console.log(`🔍 Obteniendo animes destacados desde: ${source}`);

  try {
    switch (source) {
      case 'jikan':
        return await getFeaturedAnimeFromJikan();
      
      case 'hybrid':
        return await getFeaturedAnimeHybrid();
      
      case 'cdn':
      default:
        return await getFeaturedAnimeFromCDN();
    }
  } catch (error) {
    console.error('❌ Error obteniendo animes destacados:', error.message);
    
    // Fallback: CDN -> Jikan
    if (source === 'cdn') {
      console.log('🔄 Fallback a Jikan...');
      try {
        return await getFeaturedAnimeFromJikan();
      } catch (jikanError) {
        console.error('❌ Fallback a Jikan también falló:', jikanError.message);
        throw error;
      }
    }
    
    throw error;
  }
}

// Función para obtener animes recientes de alta calidad para Hero Section
export async function getRecentHighQualityAnimeManager(limit = 20) {
  const source = getDataSource();
  console.log(`🔍 Obteniendo animes recientes de alta calidad para Hero Section desde: ${source} (límite: ${limit})`);

  try {
    switch (source) {
      case 'jikan':
        return await getRecentAnimeFromJikan();
      
      case 'hybrid':
        return await getRecentAnimeHybrid();
      
      case 'cdn':
      default:
        return await getRecentHighQualityAnimes(limit);
    }
  } catch (error) {
    console.error('❌ Error obteniendo animes recientes de alta calidad:', error.message);
    
    // Fallback: CDN -> Jikan
    if (source === 'cdn') {
      console.log('🔄 Fallback a Jikan...');
      try {
        return await getRecentAnimeFromJikan();
      } catch (jikanError) {
        console.error('❌ Fallback a Jikan también falló:', jikanError.message);
        throw error;
      }
    }
    
    throw error;
  }
}

// ===== IMPLEMENTACIONES MONGODB =====

async function getAnimeFromMongoDB(animeId) {
  const cache = await AnimeCache.findOne({ animeId });
  if (!cache) {
    throw new Error('Anime no encontrado en MongoDB');
  }
  return cache.data;
}

async function searchAnimeFromMongoDB(query, page, limit) {
  const filter = { 'data.title': { $regex: query, $options: 'i' } };
  const total = await AnimeCache.countDocuments(filter);
  const animes = await AnimeCache.find(filter)
    .sort({ 'data.title': 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    data: animes.map(a => ({
      ...a.data,
      images: normalizeImages(a.data.images) || a.data.images
    })),
    pagination: {
      current_page: page,
      items: { count: total },
      has_next_page: (page * limit) < total
    }
  };
}

async function getTopAnimeFromMongoDB() {
  const cache = await TopAnimeCache.findOne().sort({ updatedAt: -1 });
  if (!cache) {
    throw new Error('Top anime no encontrado en MongoDB');
  }
  return cache.animes;
}

async function getRecentAnimeFromMongoDB() {
  const cache = await RecentAnimeCache.findOne().sort({ updatedAt: -1 });
  if (!cache) {
    throw new Error('Animes recientes no encontrados en MongoDB');
  }
  return cache.animes;
}

async function getFeaturedAnimeFromMongoDB() {
  const cache = await FeaturedAnimeCache.findOne().sort({ updatedAt: -1 });
  if (!cache) {
    throw new Error('Animes destacados no encontrados en MongoDB');
  }
  return cache.animes;
}

// ===== IMPLEMENTACIONES JIKAN =====

async function getAnimeFromJikan(animeId) {
  const jikanData = await getAnimeById(animeId);
  return {
    ...jikanData,
    images: normalizeImages(jikanData.images) || jikanData.images
  };
}

// Función que usa Jikan + Supabase sin MongoDB
async function getAnimeFromJikanWithSupabase(animeId, userId = null) {
  console.log('🌐 Obteniendo datos de Jikan + Supabase...');
  
  try {
    // 1. Obtener datos básicos de Jikan
    const jikanData = await getAnimeById(animeId);
    const animeBase = {
      ...jikanData,
      images: normalizeImages(jikanData.images) || jikanData.images
    };

    // 2. Enriquecer con datos de Supabase (si está disponible)
    try {
      const { getReviews, getComments, getForums, getFavoritesCount, isAnimeFavorite, getUserReview } = await import('./animeUtils.js');
      
      const [reviews, comments, forums, favoritesCount, isFavorite, userReview] = await Promise.all([
        getReviews(animeId),
        getComments(animeId),
        getForums(animeId),
        getFavoritesCount(animeId),
        userId ? isAnimeFavorite(animeId, userId) : false,
        userId ? getUserReview(animeId, userId) : null
      ]);

      // 3. Combinar datos
      const fullAnimeData = {
        ...animeBase,
        favoritesCount,
        isFavorite,
        userReview,
        reviews,
        comments,
        forums,
      };

      console.log('✅ Datos obtenidos de Jikan + Supabase');
      return fullAnimeData;

    } catch (supabaseError) {
      console.log('⚠️ Error con Supabase, usando solo Jikan:', supabaseError.message);
      return animeBase;
    }

  } catch (jikanError) {
    console.error('❌ Error obteniendo datos de Jikan:', jikanError.message);
    throw jikanError;
  }
}

async function searchAnimeFromJikan(query, page, limit) {
  const jikanData = await searchAnime(query);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = jikanData.slice(startIndex, endIndex);

  return {
    data: paginatedResults.map(anime => ({
      ...anime,
      images: normalizeImages(anime.images) || anime.images
    })),
    pagination: {
      current_page: page,
      items: { count: jikanData.length },
      has_next_page: endIndex < jikanData.length
    }
  };
}

// Función de búsqueda que solo usa Jikan (sin MongoDB)
async function searchAnimeFromJikanOnly(query, page, limit) {
  console.log('🌐 Buscando solo en Jikan...');
  
  try {
    const jikanData = await searchAnime(query);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = jikanData.slice(startIndex, endIndex);

    const results = {
      data: paginatedResults.map(anime => ({
        ...anime,
        images: normalizeImages(anime.images) || anime.images
      })),
      pagination: {
        current_page: page,
        items: { count: jikanData.length },
        has_next_page: endIndex < jikanData.length
      }
    };

    console.log(`✅ Búsqueda en Jikan: ${results.data.length} resultados`);
    return results;

  } catch (error) {
    console.error('❌ Error en búsqueda de Jikan:', error.message);
    throw error;
  }
}

async function getTopAnimeFromJikan() {
  const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=12');
  const data = response.data;
  return data.data.map(anime => ({
    ...anime,
    images: normalizeImages(anime.images) || anime.images
  }));
}

async function getRecentAnimeFromJikan() {
  const response = await axios.get('https://api.jikan.moe/v4/seasons/now?limit=24');
  const data = response.data;
  return data.data.map(anime => ({
    ...anime,
    images: normalizeImages(anime.images) || anime.images
  }));
}

async function getFeaturedAnimeFromJikan() {
  const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=6');
  const data = response.data;
  return data.data.map(anime => ({
    ...anime,
    images: normalizeImages(anime.images) || anime.images
  }));
}

// ===== IMPLEMENTACIONES HYBRID =====

async function getAnimeHybrid(animeId, userId) {
  // 1. Intentar MongoDB primero
  try {
    const mongoData = await getAnimeFromMongoDB(animeId);
    console.log('✅ Anime encontrado en MongoDB');
    return mongoData;
  } catch (error) {
    console.log('⚠️ Anime no encontrado en MongoDB, consultando Jikan...');
  }

  // 2. Si no está en MongoDB, consultar Jikan
  const jikanData = await getAnimeFromJikan(animeId);
  
  // 3. Guardar en MongoDB para futuras consultas (si el cache está habilitado)
  if (CACHE_ENABLED) {
    try {
      await AnimeCache.create({ animeId, data: jikanData });
      console.log('💾 Anime guardado en MongoDB');
    } catch (error) {
      console.log('⚠️ Error guardando en MongoDB:', error.message);
    }
  }

  return jikanData;
}

async function searchAnimeHybrid(query, page, limit) {
  // 1. Intentar MongoDB primero
  try {
    const mongoData = await searchAnimeFromMongoDB(query, page, limit);
    if (mongoData.data.length > 0) {
      console.log('✅ Resultados encontrados en MongoDB');
      return mongoData;
    }
  } catch (error) {
    console.log('⚠️ No se encontraron resultados en MongoDB');
  }

  // 2. Si no hay resultados en MongoDB, consultar Jikan
  const jikanData = await searchAnimeFromJikan(query, page, limit);
  
  // 3. Guardar en MongoDB para futuras consultas (si el cache está habilitado)
  if (CACHE_ENABLED && jikanData.data.length > 0) {
    try {
      for (const anime of jikanData.data) {
        await AnimeCache.findOneAndUpdate(
          { animeId: anime.mal_id },
          { animeId: anime.mal_id, data: anime },
          { upsert: true }
        );
      }
      console.log('💾 Resultados guardados en MongoDB');
    } catch (error) {
      console.log('⚠️ Error guardando en MongoDB:', error.message);
    }
  }

  return jikanData;
}

async function getTopAnimeHybrid() {
  // 1. Intentar MongoDB primero
  try {
    const mongoData = await getTopAnimeFromMongoDB();
    console.log('✅ Top anime encontrado en MongoDB');
    return mongoData;
  } catch (error) {
    console.log('⚠️ Top anime no encontrado en MongoDB, consultando Jikan...');
  }

  // 2. Si no está en MongoDB, consultar Jikan
  const jikanData = await getTopAnimeFromJikan();
  
  // 3. Guardar en MongoDB para futuras consultas
  if (CACHE_ENABLED) {
    try {
      await TopAnimeCache.create({ animes: jikanData });
      console.log('💾 Top anime guardado en MongoDB');
    } catch (error) {
      console.log('⚠️ Error guardando en MongoDB:', error.message);
    }
  }

  return jikanData;
}

async function getRecentAnimeHybrid() {
  // 1. Intentar MongoDB primero
  try {
    const mongoData = await getRecentAnimeFromMongoDB();
    console.log('✅ Animes recientes encontrados en MongoDB');
    return mongoData;
  } catch (error) {
    console.log('⚠️ Animes recientes no encontrados en MongoDB, consultando Jikan...');
  }

  // 2. Si no está en MongoDB, consultar Jikan
  const jikanData = await getRecentAnimeFromJikan();
  
  // 3. Guardar en MongoDB para futuras consultas
  if (CACHE_ENABLED) {
    try {
      await RecentAnimeCache.create({ animes: jikanData });
      console.log('💾 Animes recientes guardados en MongoDB');
    } catch (error) {
      console.log('⚠️ Error guardando en MongoDB:', error.message);
    }
  }

  return jikanData;
}

async function getFeaturedAnimeHybrid() {
  // 1. Intentar MongoDB primero
  try {
    const mongoData = await getFeaturedAnimeFromMongoDB();
    console.log('✅ Animes destacados encontrados en MongoDB');
    return mongoData;
  } catch (error) {
    console.log('⚠️ Animes destacados no encontrados en MongoDB, consultando Jikan...');
  }

  // 2. Si no está en MongoDB, consultar Jikan
  const jikanData = await getFeaturedAnimeFromJikan();
  
  // 3. Guardar en MongoDB para futuras consultas
  if (CACHE_ENABLED) {
    try {
      await FeaturedAnimeCache.create({ animes: jikanData });
      console.log('💾 Animes destacados guardados en MongoDB');
    } catch (error) {
      console.log('⚠️ Error guardando en MongoDB:', error.message);
    }
  }

  return jikanData;
}

// ===== IMPLEMENTACIONES CDN =====

async function getAnimeFromCDN(animeId, userId = null) {
  try {
    const animeData = await getAnimeByIdCDN(animeId);
    
    // Enriquecer con datos de Supabase si el usuario está autenticado
    if (userId) {
      const [favorito, watchlist, rating] = await Promise.all([
        Favorite.findOne({ userId, animeId }),
        Watchlist.findOne({ userId, animeId }),
        Rating.findOne({ userId, animeId })
      ]);
      
      return {
        ...animeData,
        userData: {
          isFavorite: !!favorito,
          inWatchlist: !!watchlist,
          userRating: rating?.rating || null
        }
      };
    }
    
    return animeData;
  } catch (error) {
    console.error('Error obteniendo anime desde CDN:', error.message);
    throw error;
  }
}

async function searchAnimeFromCDN(query, page, limit) {
  try {
    const result = await searchAnimeCDN(query, page, limit);
    return result;
  } catch (error) {
    console.error('Error buscando anime desde CDN:', error.message);
    throw error;
  }
}

async function getTopAnimeFromCDN() {
  try {
    const topAnimes = await getTopAnimes(20);
    return topAnimes;
  } catch (error) {
    console.error('Error obteniendo top anime desde CDN:', error.message);
    throw error;
  }
}

async function getRecentAnimeFromCDN() {
  try {
    const recentAnimes = await getRecentAnimes(20);
    return recentAnimes;
  } catch (error) {
    console.error('Error obteniendo animes recientes desde CDN:', error.message);
    throw error;
  }
}

async function getFeaturedAnimeFromCDN() {
  try {
    const featuredAnimes = await getFeaturedAnimesFromCDN(20);
    return featuredAnimes;
  } catch (error) {
    console.error('Error obteniendo animes destacados desde CDN:', error.message);
    throw error;
  }
}

// ===== FUNCIONES DE EXPORTACIÓN =====

export function getDataSourceInfo() {
  const source = getDataSource();
  const cdnStats = getDataStats();
  
  return {
    currentSource: source,
    availableSources: ['mongodb', 'jikan', 'cdn', 'hybrid'],
    cdnStats: {
      isLoaded: cdnStats.isLoaded,
      totalAnimes: cdnStats.totalAnimes,
      lastLoadTime: cdnStats.lastLoadTime,
      loadError: cdnStats.loadError
    },
    environment: {
      ANIME_DATA_SOURCE: process.env.ANIME_DATA_SOURCE || 'hybrid',
      FORCE_JIKAN: process.env.FORCE_JIKAN === 'true',
      CACHE_ENABLED: process.env.CACHE_ENABLED !== 'false'
    }
  };
}

export async function clearMongoDBCache() {
  try {
    await Promise.all([
      AnimeCache.deleteMany({}),
      SearchCache.deleteMany({}),
      TopAnimeCache.deleteMany({}),
      RecentAnimeCache.deleteMany({}),
      FeaturedAnimeCache.deleteMany({}),
      GenreCache.deleteMany({})
    ]);
    console.log('✅ Cache de MongoDB limpiado');
    return { success: true, message: 'Cache limpiado exitosamente' };
  } catch (error) {
    console.error('❌ Error limpiando cache:', error);
    throw error;
  }
}

// Nueva función para forzar recarga de datos CDN
export async function forceReloadCDN() {
  try {
    await forceReload();
    console.log('✅ Datos CDN recargados exitosamente');
    return { success: true, message: 'Datos CDN recargados exitosamente' };
  } catch (error) {
    console.error('❌ Error recargando datos CDN:', error);
    throw error;
  }
} 