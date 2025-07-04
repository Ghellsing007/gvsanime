// animeAggregator.js
// Servicio orquestador para obtener y fusionar datos de anime desde MongoDB (cache), APIs externas y Supabase
// Su propósito es devolver un JSON completo y personalizado para el frontend

import mongoose from '../../services/shared/mongooseClient.js';
import getSupabaseClient from '../../services/shared/supabaseClient.js';
import { getAnimeById, searchAnime } from './jikanService.js';
import { getReviews, getUserReview, getFavoritesCount, isAnimeFavorite, getComments, getForums } from './animeUtils.js';
// Aquí puedes importar más servicios externos en el futuro

// Modelo para el cache de anime en MongoDB
const AnimeCache = mongoose.models.AnimeCache || mongoose.model('AnimeCache', new mongoose.Schema({
  animeId: String,
  data: Object,
  updatedAt: { type: Date, default: Date.now }
}));

// Modelo para el cache de búsquedas en MongoDB
const SearchCache = mongoose.models.SearchCache || mongoose.model('SearchCache', new mongoose.Schema({
  query: { type: String, required: true, index: true },
  results: [Object],
  updatedAt: { type: Date, default: Date.now }
}));

// Función para buscar anime con caché
export async function searchAnimeWithCache(query) {
  // 1. Buscar en el cache de búsquedas
  let cache = await SearchCache.findOne({ query: query.toLowerCase() });
  if (cache) {
    console.log(`Resultados de búsqueda encontrados en caché para: ${query}`);
    return cache.results;
  }

  // 2. Si no está en caché, buscar en APIs externas
  console.log(`Buscando en APIs externas para: ${query}`);
  const results = await searchAnime(query);

  // 3. Guardar en cache para futuras consultas
  if (results && results.length > 0) {
    await SearchCache.create({ 
      query: query.toLowerCase(), 
      results: results 
    });
    console.log(`Resultados guardados en caché para: ${query}`);
  }

  return results;
}

// Función principal para obtener los datos completos de un anime
export async function getAnimeFullData(animeId, userId = null) {
  // 1. Buscar en el cache de MongoDB
  let cache = await AnimeCache.findOne({ animeId });
  if (cache) {
    return cache.data;
  }

  // 2. Consultar fuentes externas (por ahora solo Jikan)
  const jikanData = await getAnimeById(animeId);
  // const anilistData = ... // futuro
  // const kitsuData = ...   // futuro

  // 3. Fusionar datos básicos
  const animeBase = mergeAnimeData(jikanData /*, anilistData, kitsuData */);

  // 4. Enriquecer con datos personalizados desde Supabase
  const [reviews, comments, forums, favoritesCount, isFavorite, userReview] = await Promise.all([
    getReviews(animeId),
    getComments(animeId),
    getForums(animeId),
    getFavoritesCount(animeId),
    userId ? isAnimeFavorite(animeId, userId) : false,
    userId ? getUserReview(animeId, userId) : null
  ]);

  // 5. Armar el JSON final
  const fullAnimeData = {
    ...animeBase,
    favoritesCount,
    isFavorite,
    userReview,
    reviews,
    comments,
    forums,
    // related: ... // puedes agregar lógica para animes relacionados
  };

  // 6. Guardar en cache para futuras consultas
  await AnimeCache.create({ animeId, data: fullAnimeData });

  // 7. Devolver el JSON final
  return fullAnimeData;
}


// Función para fusionar datos de múltiples fuentes externas
export function mergeAnimeData(jikanData, anilistData = null, kitsuData = null) {
  // Estructura base del anime fusionado
  const merged = {
    // IDs de cada fuente
    mal_id: jikanData?.mal_id || null,
    anilist_id: anilistData?.id || null,
    kitsu_id: kitsuData?.id || null,
    // Título (prioridad: Jikan > Anilist > Kitsu)
    title: jikanData?.title || anilistData?.title?.romaji || kitsuData?.attributes?.canonicalTitle || '',
    // Sinopsis
    synopsis: jikanData?.synopsis || anilistData?.description || kitsuData?.attributes?.synopsis || '',
    // Imágenes
    coverImage: jikanData?.images?.jpg?.image_url || anilistData?.coverImage?.large || kitsuData?.attributes?.posterImage?.original || '',
    // Géneros (fusiona y elimina duplicados)
    genres: Array.from(new Set([
      ...(jikanData?.genres?.map(g => g.name) || []),
      ...(anilistData?.genres || []),
      ...(kitsuData?.attributes?.genres || [])
    ])),
    // Otros campos relevantes (puedes expandir según tus necesidades)
    episodes: jikanData?.episodes || anilistData?.episodes || kitsuData?.attributes?.episodeCount || null,
    score: jikanData?.score || anilistData?.averageScore || null,
    trailerUrl: jikanData?.trailer?.url || anilistData?.trailer || '',
    // ...agrega más campos fusionados aquí
  };
  return merged;
}

/*
Explicación:
- El orquestador ahora enriquece el JSON de anime con reviews, favoritos, comentarios y foros usando las funciones auxiliares.
- Todos los datos personalizados se obtienen de Supabase.
- El JSON final está listo para el frontend.
*/ 

// Funciones adicionales para el manejo del caché

// Limpiar caché antiguo (más de 7 días)
export async function cleanOldCache() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  try {
    const deletedAnimeCache = await AnimeCache.deleteMany({ 
      updatedAt: { $lt: sevenDaysAgo } 
    });
    const deletedSearchCache = await SearchCache.deleteMany({ 
      updatedAt: { $lt: sevenDaysAgo } 
    });
    
    console.log(`Caché limpiado: ${deletedAnimeCache.deletedCount} animes, ${deletedSearchCache.deletedCount} búsquedas`);
    return { animeCache: deletedAnimeCache.deletedCount, searchCache: deletedSearchCache.deletedCount };
  } catch (error) {
    console.error('Error limpiando caché:', error);
    throw error;
  }
}

// Obtener estadísticas del caché
export async function getCacheStats() {
  try {
    const animeCacheCount = await AnimeCache.countDocuments();
    const searchCacheCount = await SearchCache.countDocuments();
    
    return {
      animeCache: animeCacheCount,
      searchCache: searchCacheCount,
      total: animeCacheCount + searchCacheCount
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas del caché:', error);
    throw error;
  }
}

// Limpiar caché específico por query
export async function clearSearchCache(query) {
  try {
    const result = await SearchCache.deleteOne({ query: query.toLowerCase() });
    console.log(`Caché de búsqueda eliminado para: ${query}`);
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error eliminando caché de búsqueda:', error);
    throw error;
  }
} 