import { 
  getAnimeByIdManager, 
  searchAnimeManager, 
  getTopAnimeManager, 
  getRecentAnimeManager, 
  getFeaturedAnimeManager,
  getDataSourceInfo,
  clearMongoDBCache
} from '../services/anime/dataSourceManager.js';
import { searchAnime } from '../services/anime/jikanService.js';
import { normalizeImages } from '../services/anime/normalizers/jikanNormalizer.js';
import { enrichGenresWithImages } from '../services/anime/genreImages.js';
import Favorite from '../services/anime/favoriteModel.js';
import Watchlist from '../services/anime/watchlistModel.js';
import Rating from '../services/anime/ratingModel.js';
import mongoose from '../services/shared/mongooseClient.js';
import axios from 'axios';

// Controlador para obtener un anime por ID (usando el gestor de fuentes de datos)
export async function getAnimeById(req, res) {
  const animeId = req.params.id;
  const userId = req.user?.id || null; // Si el usuario está autenticado
  
  // Headers para evitar cache
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    const animeData = await getAnimeByIdManager(animeId, userId);
    res.json(animeData);
  } catch (err) {
    console.error('Error obteniendo anime:', err);
    res.status(500).json({ error: 'Error al obtener datos del anime', details: err.message });
  }
}

// Controlador para buscar animes por nombre o filtros
export async function searchAnimeController(req, res) {
  const query = req.query.q;
  const sort = req.query.sort;
  const season = req.query.season;
  const genre = req.query.genre;
  const featured = req.query.featured;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  
  // Headers para evitar cache
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    if (featured === 'true' || sort === 'featured') {
      const results = await getFeaturedAnimeManager();
      return res.json({ 
        pagination: { current_page: page, items: { count: results.length } },
        data: results 
      });
    }
    if (sort === 'top') {
      const results = await getTopAnimeManager();
      return res.json({ 
        pagination: { current_page: page, items: { count: results.length } },
        data: results 
      });
    }
    if (sort === 'recent') {
      const results = await getRecentAnimeManager();
      return res.json({ 
        pagination: { current_page: page, items: { count: results.length } },
        data: results 
      });
    }
    if (season) {
      // season: "2024-Spring"
      const [year, seasonName] = season.split('-');
      // Por ahora, para temporadas específicas usamos Jikan directamente
      const response = await axios.get(`https://api.jikan.moe/v4/seasons/${year}/${seasonName.toLowerCase()}?limit=24`);
      const data = response.data;
      const results = data.data.map(anime => ({
        ...anime,
        images: normalizeImages(anime.images) || anime.images
      }));
      return res.json({ 
        pagination: { current_page: page, items: { count: results.length } },
        data: results 
      });
    }
    if (genre) {
      // Por ahora, para géneros específicos usamos Jikan directamente
      const genreMap = {
        'action': 1, 'adventure': 2, 'cars': 3, 'comedy': 4, 'dementia': 5,
        'demons': 6, 'mystery': 7, 'drama': 8, 'ecchi': 9, 'fantasy': 10,
        'game': 11, 'hentai': 12, 'historical': 13, 'horror': 14, 'kids': 15,
        'magic': 16, 'martial-arts': 17, 'mecha': 18, 'music': 19, 'parody': 20,
        'samurai': 21, 'romance': 22, 'school': 23, 'sci-fi': 24, 'shoujo': 25,
        'shoujo-ai': 26, 'shounen': 27, 'shounen-ai': 28, 'space': 29, 'sports': 30,
        'super-power': 31, 'vampire': 32, 'yaoi': 33, 'yuri': 34, 'harem': 35,
        'slice-of-life': 36, 'supernatural': 37, 'military': 38, 'police': 39,
        'psychological': 40, 'thriller': 41, 'seinen': 42, 'josei': 43
      };
      const genreId = genreMap[genre.toLowerCase()];
      if (!genreId) {
        return res.status(400).json({ error: 'Género no válido' });
      }
      const response = await axios.get(`https://api.jikan.moe/v4/anime?genres=${genreId}&limit=24`);
      const data = response.data;
      const results = data.data.map(anime => ({
        ...anime,
        images: normalizeImages(anime.images) || anime.images
      }));
      return res.json({ 
        pagination: { current_page: page, items: { count: results.length } },
        data: results 
      });
    }
    if (!query) return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });
    
    const results = await searchAnimeManager(query, page, limit);
    res.json(results);
  } catch (err) {
    console.error('Error en búsqueda:', err);
    res.status(500).json({ error: 'Error al buscar animes' });
  }
}

// Controlador para obtener la lista de géneros
export async function getGenresController(req, res) {
  // Headers para evitar cache
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    // Por ahora usamos Jikan directamente para géneros
    const response = await axios.get('https://api.jikan.moe/v4/genres/anime');
    const data = response.data;
    
    // Enriquecer géneros con imágenes y descripciones
    const enrichedGenres = enrichGenresWithImages(data.data);
    
    res.json({ genres: enrichedGenres });
  } catch (err) {
    console.error('💥 Error en getGenresController:', err);
    res.status(500).json({ error: 'Error al obtener géneros', details: err.message });
  }
}

// Controlador para obtener reviews externas de Jikan
export async function getExternalReviewsController(req, res) {
  try {
    const { animeId } = req.params;
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}/reviews?limit=10`);
    const data = response.data;
    res.json({ reviews: data.data });
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
          // Usar Jikan directamente para recomendaciones por género
          const genreMap = {
            'action': 1, 'adventure': 2, 'cars': 3, 'comedy': 4, 'dementia': 5,
            'demons': 6, 'mystery': 7, 'drama': 8, 'ecchi': 9, 'fantasy': 10,
            'game': 11, 'hentai': 12, 'historical': 13, 'horror': 14, 'kids': 15,
            'magic': 16, 'martial-arts': 17, 'mecha': 18, 'music': 19, 'parody': 20,
            'samurai': 21, 'romance': 22, 'school': 23, 'sci-fi': 24, 'shoujo': 25,
            'shoujo-ai': 26, 'shounen': 27, 'shounen-ai': 28, 'space': 29, 'sports': 30,
            'super-power': 31, 'vampire': 32, 'yaoi': 33, 'yuri': 34, 'harem': 35,
            'slice-of-life': 36, 'supernatural': 37, 'military': 38, 'police': 39,
            'psychological': 40, 'thriller': 41, 'seinen': 42, 'josei': 43
          };
          const genreId = genreMap[genero.toLowerCase()];
          if (genreId) {
            try {
              const response = await axios.get(`https://api.jikan.moe/v4/anime?genres=${genreId}&limit=6`);
              const data = response.data;
              animesPorGenero = animesPorGenero.concat(data.data);
            } catch (err) {
              // Omitir el error de este género y continuar
              continue;
            }
          }
        }
        // Quitar duplicados por id
        const vistos = new Set();
        recommendations = animesPorGenero.filter(a => {
          if (vistos.has(a.mal_id)) return false;
          vistos.add(a.mal_id);
          return true;
        });
      }
    }
    // Si no hay usuario o no hay recomendaciones personalizadas, mezclar populares, destacados y recientes
    if (!recommendations || recommendations.length === 0) {
      const [top, featured, recent] = await Promise.all([
        getTopAnimeManager(),
        getFeaturedAnimeManager(),
        getRecentAnimeManager()
      ]);
      // Mezclar y quitar duplicados
      const todos = [...top, ...featured, ...recent];
      const vistos = new Set();
      recommendations = todos.filter(a => {
        if (vistos.has(a.mal_id)) return false;
        vistos.add(a.mal_id);
        return true;
      });
    }
    res.json({ results: recommendations });
  } catch (err) {
    console.error('Error en recomendaciones:', err);
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
}

// Controlador para obtener todos los animes paginados y con filtro opcional por nombre
export async function getAllAnimeController(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const q = req.query.q || '';
    const genre = req.query.genre;
    
    // Usar el gestor de fuentes de datos para búsqueda
    if (q) {
      const results = await searchAnimeManager(q, page, limit);
      res.json(results);
    } else {
      // Si no hay query, obtener animes top
      const results = await getTopAnimeManager();
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      res.json({
        data: paginatedResults,
        pagination: {
          current_page: page,
          items: { count: results.length },
          has_next_page: endIndex < results.length
        }
      });
    }
  } catch (err) {
    console.error('Error obteniendo todos los animes:', err);
    res.status(500).json({ error: 'Error al obtener animes' });
  }
}

// Controlador para obtener información de la fuente de datos actual
export async function getDataSourceInfoController(req, res) {
  try {
    const info = getDataSourceInfo();
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener información de la fuente de datos' });
  }
}

// Controlador para limpiar cache de MongoDB
export async function clearCacheController(req, res) {
  try {
    const result = await clearMongoDBCache();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al limpiar cache' });
  }
}

/*
Explicación de los cambios:
- Ahora usa el dataSourceManager en lugar del animeAggregator directamente
- Permite alternar fácilmente entre MongoDB, Jikan y modo híbrido
- Mantiene la misma API para el frontend
- Agrega endpoints para gestionar la fuente de datos y limpiar cache
*/