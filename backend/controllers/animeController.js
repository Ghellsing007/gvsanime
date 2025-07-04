import { getAnimeFullData, searchAnimeWithCache, getTopAnime, getRecentAnime, getFeaturedAnime, getAnimeBySeason, getAnimeByGenre, getGenres, getExternalReviews } from '../services/anime/animeAggregator.js';
import { searchAnime } from '../services/anime/jikanService.js';
import Favorite from '../services/anime/favoriteModel.js';
import Watchlist from '../services/anime/watchlistModel.js';
import Rating from '../services/anime/ratingModel.js';

// Controlador para obtener un anime por ID (usando el orquestador)
export async function getAnimeById(req, res) {
  const animeId = req.params.id;
  const userId = req.user?.id || null; // Si el usuario está autenticado
  try {
    const animeData = await getAnimeFullData(animeId, userId);
    res.json(animeData);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener datos del anime' });
  }
}

// Controlador para buscar animes por nombre o filtros
export async function searchAnimeController(req, res) {
  const query = req.query.q;
  const sort = req.query.sort;
  const season = req.query.season;
  const genre = req.query.genre;
  const featured = req.query.featured;
  try {
    if (featured === 'true' || sort === 'featured') {
      const results = await getFeaturedAnime();
      return res.json({ source: 'jikan', results });
    }
    if (sort === 'top') {
      const results = await getTopAnime();
      return res.json({ source: 'jikan', results });
    }
    if (sort === 'recent') {
      const results = await getRecentAnime();
      return res.json({ source: 'jikan', results });
    }
    if (season) {
      // season: "2024-Spring"
      const [year, seasonName] = season.split('-');
      const results = await getAnimeBySeason(year, seasonName);
      return res.json({ source: 'jikan', results });
    }
    if (genre) {
      const results = await getAnimeByGenre(genre);
      return res.json({ source: 'jikan', results });
    }
    if (!query) return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });
    const results = await searchAnimeWithCache(query);
    res.json(results);
  } catch (err) {
    console.error('Error en búsqueda:', err);
    res.status(500).json({ error: 'Error al buscar animes' });
  }
}

// Controlador para obtener la lista de géneros
export async function getGenresController(req, res) {
  try {
    const genres = await getGenres();
    res.json({ genres });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener géneros' });
  }
}

// Controlador para obtener reviews externas de Jikan
export async function getExternalReviewsController(req, res) {
  try {
    const { animeId } = req.params;
    const reviews = await getExternalReviews(animeId);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reviews externas' });
  }
}

// Controlador para recomendaciones de anime
export async function getRecommendationsController(req, res) {
  try {
    let recommendations = [];
    const user = req.user;
    if (user) {
      // Obtener favoritos, watchlist y ratings del usuario
      const [favoritos, watchlist, ratings] = await Promise.all([
        Favorite.find({ userId: user.id }),
        Watchlist.find({ userId: user.id }),
        Rating.find({ userId: user.id })
      ]);
      // Extraer géneros de todos los animes
      const generos = new Set();
      favoritos.forEach(a => a.genres?.forEach(g => generos.add(g)));
      watchlist.forEach(a => a.genres?.forEach(g => generos.add(g)));
      ratings.forEach(a => a.genres?.forEach(g => generos.add(g)));
      // Si hay géneros favoritos, recomendar animes por esos géneros
      if (generos.size > 0) {
        let animesPorGenero = [];
        for (const genero of generos) {
          const animes = await getAnimeByGenre(genero);
          animesPorGenero = animesPorGenero.concat(animes);
        }
        // Quitar duplicados por id
        const vistos = new Set();
        recommendations = animesPorGenero.filter(a => {
          if (vistos.has(a.id)) return false;
          vistos.add(a.id);
          return true;
        });
      }
    }
    // Si no hay usuario o no hay recomendaciones personalizadas, mezclar populares, destacados y recientes
    if (!recommendations || recommendations.length === 0) {
      const [top, featured, recent] = await Promise.all([
        getTopAnime(),
        getFeaturedAnime(),
        getRecentAnime()
      ]);
      // Mezclar y quitar duplicados
      const todos = [...top, ...featured, ...recent];
      const vistos = new Set();
      recommendations = todos.filter(a => {
        if (vistos.has(a.id)) return false;
        vistos.add(a.id);
        return true;
      });
    }
    res.json({ results: recommendations });
  } catch (err) {
    console.error('Error en recomendaciones:', err);
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
}

/*
Explicación:
- searchAnimeController ahora usa searchAnimeWithCache que primero busca en MongoDB y si no encuentra, consulta las APIs externas y guarda los resultados.
- Los resultados de búsqueda se cachean para futuras consultas, mejorando el rendimiento.
*/ 