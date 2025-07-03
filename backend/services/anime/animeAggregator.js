// animeAggregator.js
// Servicio orquestador para obtener y fusionar datos de anime desde MongoDB (cache), APIs externas y Supabase
// Su propósito es devolver un JSON completo y personalizado para el frontend

import mongoose from '../../services/shared/mongooseClient.js';
import supabase from '../../services/shared/supabaseClient.js';
import { getAnimeById } from './jikanService.js';
import { getReviews, getUserReview, getFavoritesCount, isAnimeFavorite, getComments, getForums } from './animeUtils.js';
// Aquí puedes importar más servicios externos en el futuro

// Modelo de ejemplo para el cache de anime en MongoDB
const AnimeCache = mongoose.models.AnimeCache || mongoose.model('AnimeCache', new mongoose.Schema({
  animeId: String,
  data: Object,
  updatedAt: { type: Date, default: Date.now }
}));

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