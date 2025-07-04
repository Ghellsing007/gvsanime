// jikanNormalizer.js
// Normaliza los resultados de Jikan a un formato estándar para el frontend (valor por valor)

export function normalizeJikanResults(results) {
  return results.map(anime => ({
    mal_id: anime.mal_id,
    url: anime.url,
    images: anime.images,
    trailer: anime.trailer,
    approved: anime.approved,
    titles: anime.titles,
    title: anime.title,
    title_english: anime.title_english,
    title_japanese: anime.title_japanese,
    title_synonyms: anime.title_synonyms,
    type: anime.type,
    source: anime.source,
    episodes: anime.episodes,
    status: anime.status,
    airing: anime.airing,
    aired: anime.aired,
    duration: anime.duration,
    rating: anime.rating,
    score: anime.score,
    scored_by: anime.scored_by,
    rank: anime.rank,
    popularity: anime.popularity,
    members: anime.members,
    favorites: anime.favorites,
    synopsis: anime.synopsis,
    background: anime.background,
    season: anime.season,
    year: anime.year,
    broadcast: anime.broadcast,
    producers: anime.producers,
    licensors: anime.licensors,
    studios: anime.studios,
    genres: anime.genres,
    explicit_genres: anime.explicit_genres,
    themes: anime.themes,
    demographics: anime.demographics
    // Si Jikan agrega más campos en el futuro, aquí los puedes añadir explícitamente
  }));
} 