// dataSourceManager.js
// Gestor centralizado de fuentes de datos para anime
// Permite alternar fácilmente entre MongoDB (cache) y Jikan (API externa)

import mongoose from '../../services/shared/mongooseClient.js';
import { getAnimeById, searchAnime, getAllAnimes } from './jikanService.js';
import { normalizeImages } from './normalizers/jikanNormalizer.js';
import axios from 'axios';

// Configuración de fuente de datos desde variables de entorno
const DATA_SOURCE = process.env.ANIME_DATA_SOURCE || 'hybrid'; // 'mongodb', 'jikan', 'hybrid'
const FORCE_JIKAN = process.env.FORCE_JIKAN === 'true';
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false'; // true por defecto

// Modelos de MongoDB para cache
const AnimeCache = mongoose.models.AnimeCache || mongoose.model('AnimeCache', new mongoose.Schema({
  animeId: String,
  data: Object,
  updatedAt: { type: Date, default: Date.now }
}));

const SearchCache = mongoose.models.SearchCache || mongoose.model('SearchCache', new mongoose.Schema({
  query: { type: String, required: true, index: true },
  results: [Object],
  updatedAt: { type: Date, default: Date.now },
  source: String,
  animeIds: [String]
}));

const TopAnimeCache = mongoose.models.TopAnimeCache || mongoose.model('TopAnimeCache', new mongoose.Schema({
  animes: [Object],
  updatedAt: { type: Date, default: Date.now }
}));

const RecentAnimeCache = mongoose.models.RecentAnimeCache || mongoose.model('RecentAnimeCache', new mongoose.Schema({
  animes: [Object],
  updatedAt: { type: Date, default: Date.now }
}));

const FeaturedAnimeCache = mongoose.models.FeaturedAnimeCache || mongoose.model('FeaturedAnimeCache', new mongoose.Schema({
  animes: [Object],
  updatedAt: { type: Date, default: Date.now }
}));

const GenreCache = mongoose.models.GenreCache || mongoose.model('GenreCache', new mongoose.Schema({
  genres: [Object],
  updatedAt: { type: Date, default: Date.now }
}));

// Función para determinar qué fuente usar
function getDataSource() {
  // Leer variables de entorno dinámicamente
  const currentDataSource = process.env.ANIME_DATA_SOURCE || 'hybrid';
  const currentForceJikan = process.env.FORCE_JIKAN === 'true';
  const currentCacheEnabled = process.env.CACHE_ENABLED !== 'false';
  
  // Si FORCE_JIKAN está activado, usar solo Jikan
  if (currentForceJikan) {
    console.log('🔧 FORCE_JIKAN activado, usando solo Jikan');
    return 'jikan';
  }
  
  // Si CACHE_ENABLED está desactivado, usar solo Jikan
  if (!currentCacheEnabled) {
    console.log('🔧 CACHE_ENABLED=false, usando solo Jikan');
    return 'jikan';
  }
  
  // Si ANIME_DATA_SOURCE está configurado específicamente
  if (currentDataSource === 'jikan') {
    console.log('🔧 ANIME_DATA_SOURCE=jikan, usando solo Jikan');
    return 'jikan';
  }
  
  if (currentDataSource === 'mongodb') {
    console.log('🔧 ANIME_DATA_SOURCE=mongodb, usando solo MongoDB');
    return 'mongodb';
  }
  
  // Por defecto usar hybrid
  console.log('🔧 Usando modo hybrid (MongoDB + Jikan)');
  return 'hybrid';
}

// Función para obtener anime por ID
export async function getAnimeByIdManager(animeId, userId = null) {
  const source = getDataSource();
  console.log(`🔍 Obteniendo anime ${animeId} desde: ${source}`);

  try {
    switch (source) {
      case 'mongodb':
        return await getAnimeFromMongoDB(animeId);
      
      case 'jikan':
        return await getAnimeFromJikanWithSupabase(animeId, userId);
      
      case 'hybrid':
      default:
        return await getAnimeHybrid(animeId, userId);
    }
  } catch (error) {
    console.error(`❌ Error obteniendo anime ${animeId}:`, error.message);
    
    // Fallback: si falla la fuente principal, intentar con la otra
    if (source === 'mongodb') {
      console.log('🔄 Fallback a Jikan...');
      return await getAnimeFromJikanWithSupabase(animeId, userId);
    } else if (source === 'jikan') {
      console.log('🔄 Fallback a MongoDB...');
      return await getAnimeFromMongoDB(animeId);
    }
    
    throw error;
  }
}

// Función para buscar anime
export async function searchAnimeManager(query, page = 1, limit = 12) {
  const source = getDataSource();
  console.log(`🔍 Buscando "${query}" desde: ${source}`);

  try {
    switch (source) {
      case 'mongodb':
        return await searchAnimeFromMongoDB(query, page, limit);
      
      case 'jikan':
        return await searchAnimeFromJikanOnly(query, page, limit);
      
      case 'hybrid':
      default:
        return await searchAnimeHybrid(query, page, limit);
    }
  } catch (error) {
    console.error(`❌ Error buscando "${query}":`, error.message);
    
    // Fallback
    if (source === 'mongodb') {
      console.log('🔄 Fallback a Jikan...');
      return await searchAnimeFromJikanOnly(query, page, limit);
    } else if (source === 'jikan') {
      console.log('🔄 Fallback a MongoDB...');
      return await searchAnimeFromMongoDB(query, page, limit);
    }
    
    throw error;
  }
}

// Función para obtener animes top
export async function getTopAnimeManager() {
  const source = getDataSource();
  console.log(`🏆 Obteniendo top anime desde: ${source}`);

  try {
    switch (source) {
      case 'mongodb':
        return await getTopAnimeFromMongoDB();
      
      case 'jikan':
        return await getTopAnimeFromJikan();
      
      case 'hybrid':
      default:
        return await getTopAnimeHybrid();
    }
  } catch (error) {
    console.error('❌ Error obteniendo top anime:', error.message);
    throw error;
  }
}

// Función para obtener animes recientes
export async function getRecentAnimeManager() {
  const source = getDataSource();
  console.log(`🆕 Obteniendo animes recientes desde: ${source}`);

  try {
    switch (source) {
      case 'mongodb':
        return await getRecentAnimeFromMongoDB();
      
      case 'jikan':
        return await getRecentAnimeFromJikan();
      
      case 'hybrid':
      default:
        return await getRecentAnimeHybrid();
    }
  } catch (error) {
    console.error('❌ Error obteniendo animes recientes:', error.message);
    throw error;
  }
}

// Función para obtener animes destacados
export async function getFeaturedAnimeManager() {
  const source = getDataSource();
  console.log(`⭐ Obteniendo animes destacados desde: ${source}`);

  try {
    switch (source) {
      case 'mongodb':
        return await getFeaturedAnimeFromMongoDB();
      
      case 'jikan':
        return await getFeaturedAnimeFromJikan();
      
      case 'hybrid':
      default:
        return await getFeaturedAnimeHybrid();
    }
  } catch (error) {
    console.error('❌ Error obteniendo animes destacados:', error.message);
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

// Función para obtener información de la configuración actual
export function getDataSourceInfo() {
  const currentDataSource = process.env.ANIME_DATA_SOURCE || 'hybrid';
  const currentForceJikan = process.env.FORCE_JIKAN === 'true';
  const currentCacheEnabled = process.env.CACHE_ENABLED !== 'false';
  
  return {
    currentSource: getDataSource(),
    forceJikan: currentForceJikan,
    cacheEnabled: currentCacheEnabled,
    dataSource: currentDataSource,
    availableSources: ['mongodb', 'jikan', 'hybrid']
  };
}

// Función para limpiar cache de MongoDB
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
    console.log('🗑️ Cache de MongoDB limpiado');
    return { success: true, message: 'Cache limpiado exitosamente' };
  } catch (error) {
    console.error('❌ Error limpiando cache:', error);
    throw error;
  }
} 