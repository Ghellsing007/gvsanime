import supabase from '../../services/shared/supabaseClient.js';

// Obtener todas las reviews de un anime (con paginación, join de usuario y orden descendente)
export async function getReviews(animeId, { limit = 10, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      user_id,
      rating,
      comment,
      created_at,
      users (
        username,
        avatar_url
      )
    `)
    .eq('anime_id', animeId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error('Error obteniendo reviews:', error.message);
    return [];
  }
  return data;
}

// Obtener la review de un usuario específico para un anime
export async function getUserReview(animeId, userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, user_id, rating, comment, created_at')
    .eq('anime_id', animeId)
    .eq('user_id', userId)
    .single();
  if (error) {
    return null;
  }
  return data;
}

// Obtener el número de favoritos de un anime
export async function getFavoritesCount(animeId) {
  const { count, error } = await supabase
    .from('favorites')
    .select('id', { count: 'exact', head: true })
    .eq('anime_id', animeId);
  if (error) {
    console.error('Error obteniendo favoritos:', error.message);
    return 0;
  }
  return count || 0;
}

// Saber si un anime es favorito del usuario
export async function isAnimeFavorite(animeId, userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('anime_id', animeId)
    .eq('user_id', userId)
    .single();
  return !!data;
}

// Obtener comentarios de un anime, incluyendo datos del usuario, paginación y orden descendente
export async function getComments(animeId, { limit = 10, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      user_id,
      content,
      created_at,
      users (
        username,
        avatar_url
      )
    `)
    .eq('anime_id', animeId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error('Error obteniendo comentarios:', error.message);
    return [];
  }
  return data;
}

// Obtener foros relacionados a un anime, incluyendo datos del usuario, paginación y orden descendente
export async function getForums(animeId, { limit = 10, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('forums')
    .select(`
      id,
      title,
      created_at,
      user_id,
      users (
        username,
        avatar_url
      )
    `)
    .contains('related_anime', [animeId])
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error('Error obteniendo foros:', error.message);
    return [];
  }
  return data;
}

/*
Explicación:
- Ahora getReviews, getComments y getForums incluyen datos del usuario (username, avatar) usando join.
- Todas permiten paginación usando los parámetros limit y offset.
- Todas ordenan los resultados por fecha de creación descendente (más recientes primero).
*/ 