// animeAggregator.js
// Servicio orquestador para obtener y fusionar datos de anime desde MongoDB (cache), APIs externas y Supabase
// Su propósito es devolver un JSON completo y personalizado para el frontend

import mongoose from '../../services/shared/mongooseClient.js';
import getSupabaseClient from '../../services/shared/supabaseClient.js';
import { getAnimeById, searchAnime } from './jikanService.js';
import { getReviews, getUserReview, getFavoritesCount, isAnimeFavorite, getComments, getForums } from './animeUtils.js';
import { unifiedAnimeSearch } from './unifiedSearchService.js';
import ReviewCache from './reviewCacheModel.js';
import { normalizeJikanAnime } from './normalizers/jikanNormalizer.js';
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
  updatedAt: { type: Date, default: Date.now },
  source: String,
  animeIds: [String] // Relación explícita con los mal_id de los animes
}));

// Modelo para el cache de géneros en MongoDB
const GenreCache = mongoose.models.GenreCache || mongoose.model('GenreCache', new mongoose.Schema({
  genres: [Object],
  updatedAt: { type: Date, default: Date.now }
}));

// Modelo para el cache de animes top en MongoDB
const TopAnimeCache = mongoose.models.TopAnimeCache || mongoose.model('TopAnimeCache', new mongoose.Schema({
  animes: [Object],
  updatedAt: { type: Date, default: Date.now }
}));

// Modelo para el cache de animes recientes en MongoDB
const RecentAnimeCache = mongoose.models.RecentAnimeCache || mongoose.model('RecentAnimeCache', new mongoose.Schema({
  animes: [Object],
  updatedAt: { type: Date, default: Date.now }
}));

// Modelo para el cache de animes destacados en MongoDB
const FeaturedAnimeCache = mongoose.models.FeaturedAnimeCache || mongoose.model('FeaturedAnimeCache', new mongoose.Schema({
  animes: [Object],
  updatedAt: { type: Date, default: Date.now }
}));

// Función para buscar anime con caché
export async function searchAnimeWithCache(query) {
  // 1. Buscar en el cache de búsquedas
  let cache = await SearchCache.findOne({ query: query.toLowerCase() });
  if (cache) {
    console.log(`Resultados de búsqueda encontrados en caché para: ${query}`);
    return { source: cache.source, results: cache.results, animeIds: cache.animeIds };
  }

  // 2. Si no está en caché, buscar en APIs externas (servicio unificado)
  console.log(`Buscando en APIs externas para: ${query}`);
  const { source, results } = await unifiedAnimeSearch(query);

  // 3. Guardar cada anime individualmente en AnimeCache solo si no existe
  const animeIds = [];
  for (const anime of results) {
    animeIds.push(anime.mal_id);
    const exists = await AnimeCache.findOne({ animeId: anime.mal_id });
    if (!exists) {
      await AnimeCache.create({ animeId: anime.mal_id, data: anime });
    }
  }

  // 4. Guardar en cache de búsquedas para futuras consultas, incluyendo la relación de IDs
  if (results && results.length > 0) {
    await SearchCache.create({ 
      query: query.toLowerCase(), 
      results: results,
      source: source,
      animeIds: animeIds
    });
    console.log(`Resultados guardados en caché para: ${query}`);
  }

  return { source, results, animeIds };
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
    title_japanese: jikanData?.title_japanese || anilistData?.title?.native || '',
    // Sinopsis
    synopsis: jikanData?.synopsis || anilistData?.description || kitsuData?.attributes?.synopsis || '',
    background: jikanData?.background || '',
    // Imágenes
    images: jikanData?.images || {},
    coverImage: jikanData?.images?.jpg?.image_url || anilistData?.coverImage?.large || kitsuData?.attributes?.posterImage?.original || '',
    // Géneros (mantener estructura original de Jikan para compatibilidad)
    genres: jikanData?.genres || [],
    // Otros campos relevantes
    episodes: jikanData?.episodes || anilistData?.episodes || kitsuData?.attributes?.episodeCount || null,
    score: jikanData?.score || anilistData?.averageScore || null,
    scored_by: jikanData?.scored_by || 0,
    popularity: jikanData?.popularity || null,
    rank: jikanData?.rank || null,
    members: jikanData?.members || 0,
    favorites: jikanData?.favorites || 0,
    type: jikanData?.type || null,
    status: jikanData?.status || null,
    aired: jikanData?.aired || {},
    season: jikanData?.season || null,
    year: jikanData?.year || null,
    studios: jikanData?.studios || [],
    source: jikanData?.source || null,
    duration: jikanData?.duration || null,
    rating: jikanData?.rating || null,
    trailer: jikanData?.trailer ? {
      youtube_id: jikanData.trailer.youtube_id || '',
      url: jikanData.trailer.url || '',
      embed_url: jikanData.trailer.embed_url || ''
    } : (anilistData?.trailer ? {
      youtube_id: '',
      url: anilistData.trailer,
      embed_url: ''
    } : { youtube_id: '', url: '', embed_url: '' }),
    relations: jikanData?.relations || [],
    external: jikanData?.external || []
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

// --- Funciones de administración de caché ---

// Listar todos los animes en caché
export async function listAnimeCache() {
  return await AnimeCache.find({}, { _id: 0 });
}

// Listar todas las búsquedas en caché
export async function listSearchCache() {
  return await SearchCache.find({}, { _id: 0 });
}

// Obtener detalles de un anime específico
export async function getAnimeCacheById(animeId) {
  return await AnimeCache.findOne({ animeId }, { _id: 0 });
}

// Obtener detalles de una búsqueda específica
export async function getSearchCacheByQuery(query) {
  return await SearchCache.findOne({ query: query.toLowerCase() }, { _id: 0 });
}

// Eliminar un anime del caché
export async function deleteAnimeCacheById(animeId) {
  return await AnimeCache.deleteOne({ animeId });
}

// Eliminar una búsqueda del caché
export async function deleteSearchCacheByQuery(query) {
  return await SearchCache.deleteOne({ query: query.toLowerCase() });
}

// Limpiar todo el caché (animes y búsquedas)
export async function cleanAllCache() {
  const animes = await AnimeCache.deleteMany({});
  const searches = await SearchCache.deleteMany({});
  return { animes: animes.deletedCount, searches: searches.deletedCount };
}

// Obtener animes top con cache configurable
export async function getTopAnime() {
  const hours = parseInt(process.env.TOP_ANIME_CACHE_HOURS || '6', 10);
  const expiration = new Date(Date.now() - hours * 60 * 60 * 1000);
  let cache = await TopAnimeCache.findOne({ updatedAt: { $gte: expiration } });
  if (cache) {
    return cache.animes;
  }
  const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=24');
  if (!response.ok) throw new Error('Error obteniendo animes top');
  const data = await response.json();
  const animes = data.data.map(anime => ({
    mal_id: anime.mal_id,
    title: anime.title,
    images: anime.images,
    score: anime.score,
    episodes: anime.episodes,
    genres: anime.genres || [], // Mantener estructura original de Jikan
    year: anime.year,
    season: anime.season,
  }));
  await TopAnimeCache.deleteMany({});
  await TopAnimeCache.create({ animes });
  return animes;
}

// Obtener animes recientes con cache configurable
export async function getRecentAnime() {
  const hours = parseInt(process.env.RECENT_ANIME_CACHE_HOURS || '3', 10);
  const expiration = new Date(Date.now() - hours * 60 * 60 * 1000);
  let cache = await RecentAnimeCache.findOne({ updatedAt: { $gte: expiration } });
  if (cache) {
    return cache.animes;
  }
  const response = await fetch('https://api.jikan.moe/v4/seasons/now?limit=24');
  if (!response.ok) throw new Error('Error obteniendo animes recientes');
  const data = await response.json();
  const animes = data.data.map(anime => ({
    mal_id: anime.mal_id,
    title: anime.title,
    images: anime.images,
    score: anime.score,
    episodes: anime.episodes,
    genres: anime.genres || [], // Mantener estructura original de Jikan
    year: anime.year,
    season: anime.season,
  }));
  await RecentAnimeCache.deleteMany({});
  await RecentAnimeCache.create({ animes });
  return animes;
}

// Obtener animes destacados con cache configurable
export async function getFeaturedAnime() {
  const hours = parseInt(process.env.FEATURED_ANIME_CACHE_HOURS || '12', 10);
  const expiration = new Date(Date.now() - hours * 60 * 60 * 1000);
  let cache = await FeaturedAnimeCache.findOne({ updatedAt: { $gte: expiration } });
  if (cache) {
    return cache.animes;
  }
  const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=6');
  if (!response.ok) throw new Error('Error obteniendo animes destacados');
  const data = await response.json();
  const animes = data.data.map(anime => ({
    mal_id: anime.mal_id,
    title: anime.title,
    images: anime.images,
    score: anime.score,
    episodes: anime.episodes,
    genres: anime.genres || [], // Mantener estructura original de Jikan
    year: anime.year,
    season: anime.season,
    trailer: anime.trailer ? {
      youtube_id: anime.trailer.youtube_id || '',
      url: anime.trailer.url || '',
      embed_url: anime.trailer.embed_url || ''
    } : { youtube_id: '', url: '', embed_url: '' },
    synopsis: anime.synopsis,
  }));
  await FeaturedAnimeCache.deleteMany({});
  await FeaturedAnimeCache.create({ animes });
  return animes;
}

// Obtener animes por temporada
export async function getAnimeBySeason(year, season) {
  const response = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season.toLowerCase()}?limit=24`);
  if (!response.ok) throw new Error('Error obteniendo animes por temporada');
  const data = await response.json();
  return data.data.map(anime => ({
    mal_id: anime.mal_id,
    title: anime.title,
    images: anime.images,
    score: anime.score,
    episodes: anime.episodes,
    genres: anime.genres || [], // Mantener estructura original de Jikan
    year: anime.year,
    season: anime.season,
  }));
}

// Obtener animes por género
export async function getAnimeByGenre(genre) {
  // Jikan requiere el id numérico del género, aquí deberías mapear el nombre a id
  // Por simplicidad, ejemplo con Action (id=1)
  const genreMap = {
    'Action': 1,
    'Adventure': 2,
    'Comedy': 4,
    'Drama': 8,
    'Fantasy': 10,
    'Horror': 14,
    'Romance': 22,
    'Sci-Fi': 24,
    // ...agrega más según la documentación de Jikan
  };
  const genreId = genreMap[genre] || 1;
  const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&limit=24`);
  if (!response.ok) throw new Error('Error obteniendo animes por género');
  const data = await response.json();
  return data.data.map(anime => ({
    mal_id: anime.mal_id,
    title: anime.title,
    images: anime.images,
    score: anime.score,
    episodes: anime.episodes,
    genres: anime.genres || [], // Mantener estructura original de Jikan
    year: anime.year,
    season: anime.season,
  }));
}

// Obtener la lista de géneros (con cache en MongoDB y tiempo configurable)
export async function getGenres() {
  // Permitir controlar el tiempo de expiración por variable de entorno (por defecto 24h)
  const hours = parseInt(process.env.GENRES_CACHE_HOURS || '24', 10);
  const expiration = new Date(Date.now() - hours * 60 * 60 * 1000);
  let cache = await GenreCache.findOne({ updatedAt: { $gte: expiration } });
  if (cache) {
    return cache.genres;
  }
  // 2. Si no está en cache, obtener desde Jikan
  const response = await fetch('https://api.jikan.moe/v4/genres/anime');
  if (!response.ok) throw new Error('Error obteniendo géneros desde Jikan');
  const data = await response.json();
  const genres = data.data.map(g => ({
    id: g.mal_id,
    name: g.name,
    count: g.count,
    description: g.description,
  }));
  // 3. Guardar en cache
  await GenreCache.deleteMany({}); // Limpiar cache anterior
  await GenreCache.create({ genres });
  return genres;
}

// Obtener reviews externas de Jikan con cache configurable
export async function getExternalReviews(animeId) {
  const hours = parseInt(process.env.REVIEWS_CACHE_HOURS || '24', 10);
  const expiration = new Date(Date.now() - hours * 60 * 60 * 1000);
  let cache = await ReviewCache.findOne({ animeId, updatedAt: { $gte: expiration } });
  if (cache) {
    return cache.reviews;
  }
  // Consultar Jikan
  const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/reviews?limit=10`);
  if (!response.ok) throw new Error('Error obteniendo reviews externas');
  const data = await response.json();
  const reviews = data.data.map(r => ({
    user: r.user?.username,
    score: r.score,
    comment: r.review,
    date: r.date,
  }));
  // Guardar en cache
  await ReviewCache.deleteMany({ animeId });
  await ReviewCache.create({ animeId, reviews });
  return reviews;
}

// Ejemplo para otros caches:
// const hours = parseInt(process.env.TOP_ANIME_CACHE_HOURS || '6', 10);
// const expiration = new Date(Date.now() - hours * 60 * 60 * 1000);
// let cache = await TopAnimeCache.findOne({ updatedAt: { $gte: expiration } });
// ...
// Así puedes controlar el tiempo de cada cache por separado.
// ... código existente ... 