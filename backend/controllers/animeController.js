import { 
  getAnimeByIdManager, 
  searchAnimeManager, 
  getTopAnimeManager, 
  getRecentAnimeManager, 
  getFeaturedAnimeManager,
  getRecentHighQualityAnimeManager,
  getDataSourceInfo,
  clearMongoDBCache,
  forceReloadCDN
} from '../services/anime/dataSourceManager.js';
import { searchAnime } from '../services/anime/jikanService.js';
import { normalizeImages } from '../services/anime/normalizers/jikanNormalizer.js';
import { enrichGenresWithImages } from '../services/anime/genreImages.js';
import Favorite from '../services/anime/favoriteModel.js';
import Watchlist from '../services/anime/watchlistModel.js';
import Rating from '../services/anime/ratingModel.js';
import mongoose from '../services/shared/mongooseClient.js';
import axios from 'axios';

// Controlador para obtener un anime por ID (usando CDN + interacciones de MongoDB)
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
    // Obtener datos del anime desde CDN
    const animeData = await getAnimeByIdManager(animeId, userId);
    
    // Si el usuario está autenticado, agregar sus interacciones
    if (userId) {
      const [userFavorite, userWatchlist, userRating] = await Promise.all([
        Favorite.findOne({ userId, animeId }),
        Watchlist.findOne({ userId, animeId }),
        Rating.findOne({ userId, animeId })
      ]);
      
      animeData.userInteractions = {
        isFavorite: !!userFavorite,
        inWatchlist: !!userWatchlist,
        userRating: userRating?.rating || null
      };
    }
    
    res.json(animeData);
  } catch (err) {
    console.error('Error obteniendo anime:', err);
    res.status(500).json({ error: 'Error al obtener datos del anime', details: err.message });
  }
}

// Controlador para buscar animes por nombre o filtros (usando CDN)
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
      // Para Hero Section, usar animes recientes de alta calidad (más nuevos primero con buen score)
      const results = await getRecentHighQualityAnimeManager(6); // Límite de 6 para Hero Section
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
      
      try {
        // Usar CDN para temporadas
        const { getAnimesBySeason } = await import('../services/anime/cdnAnimeService.js');
        const results = await getAnimesBySeason(year, seasonName, page, limit);
        return res.json(results);
      } catch (error) {
        console.error('Error obteniendo temporada desde CDN:', error.message);
        // Fallback a Jikan si falla el CDN
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
    }
    if (genre) {
      // Usar CDN para géneros
      try {
        const { getAnimesByGenre } = await import('../services/anime/cdnAnimeService.js');
        const results = await getAnimesByGenre(genre, page, limit);
        return res.json(results);
      } catch (error) {
        console.error('Error obteniendo género desde CDN:', error.message);
        // Fallback a Jikan si falla el CDN
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
    }
    if (!query) return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });
    
    const results = await searchAnimeManager(query, page, limit);
    res.json(results);
  } catch (err) {
    console.error('Error en búsqueda:', err);
    res.status(500).json({ error: 'Error al buscar animes' });
  }
}

// Controlador para obtener la lista de géneros (usando CDN)
export async function getGenresController(req, res) {
  // Headers para evitar cache
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    // Usar CDN para géneros
    const { getGenresFromCDN } = await import('../services/anime/cdnAnimeService.js');
    const genres = await getGenresFromCDN();
    
    if (genres && genres.length > 0) {
      // Enriquecer géneros con imágenes y descripciones
      const enrichedGenres = enrichGenresWithImages(genres);
      res.json({ genres: enrichedGenres });
    } else {
      // Fallback a Jikan si no hay géneros en CDN
      const response = await axios.get('https://api.jikan.moe/v4/genres/anime');
      const data = response.data;
      const enrichedGenres = enrichGenresWithImages(data.data);
      res.json({ genres: enrichedGenres });
    }
  } catch (err) {
    console.error('💥 Error en getGenresController:', err);
    res.status(500).json({ error: 'Error al obtener géneros', details: err.message });
  }
}

// Controlador para obtener reviews externas de Jikan (mantener Jikan para reviews)
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

// Controlador para recomendaciones de anime (usando CDN + interacciones de MongoDB)
export async function getRecommendationsController(req, res) {
  try {
    let recommendations = [];
    const user = req.user;
    
    if (user) {
      // Obtener favoritos, watchlist y ratings del usuario desde MongoDB
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
      
      // Si hay géneros favoritos, recomendar animes por esos géneros desde CDN
      if (generos.size > 0) {
        try {
          const { getAnimesByGenre } = await import('../services/anime/cdnAnimeService.js');
          let animesPorGenero = [];
          
          for (const genero of generos) {
            const animes = await getAnimesByGenre(genero, 1, 5);
            if (animes.data) {
              animesPorGenero.push(...animes.data);
            }
          }
          
          // Mezclar y limitar recomendaciones
          recommendations = animesPorGenero
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);
        } catch (error) {
          console.error('Error obteniendo recomendaciones desde CDN:', error);
          // Fallback a Jikan
          for (const genero of generos) {
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
              const response = await axios.get(`https://api.jikan.moe/v4/anime?genres=${genreId}&limit=5`);
              const data = response.data;
              const results = data.data.map(anime => ({
                ...anime,
                images: normalizeImages(anime.images) || anime.images
              }));
              recommendations.push(...results);
            }
          }
        }
      }
    }
    
    // Si no hay recomendaciones personalizadas, usar populares desde CDN
    if (recommendations.length === 0) {
      try {
        const { getTopAnimesFromCDN } = await import('../services/anime/cdnAnimeService.js');
        recommendations = await getTopAnimesFromCDN(10);
      } catch (error) {
        console.error('Error obteniendo animes populares desde CDN:', error);
        // Fallback a Jikan
        const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=10');
        const data = response.data;
        recommendations = data.data.map(anime => ({
          ...anime,
          images: normalizeImages(anime.images) || anime.images
        }));
      }
    }
    
    res.json({ recommendations: recommendations.slice(0, 10) });
  } catch (err) {
    console.error('Error en recomendaciones:', err);
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
}

// Controlador para obtener todos los animes paginados y con filtro opcional por nombre
export async function getAllAnimeController(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const q = req.query.q || '';
    const genre = req.query.genre;
    
    // Usar el gestor de fuentes de datos para búsqueda
    if (q) {
      const results = await searchAnimeManager(q, page, limit);
      res.json(results);
    } else {
      // Si no hay query, obtener TODOS los animes disponibles
      try {
        const { getAllAnimes } = await import('../services/anime/cdnAnimeService.js');
        const results = await getAllAnimes(page, limit);
        res.json(results);
      } catch (error) {
        console.error('Error obteniendo todos los animes desde CDN:', error);
        // Fallback a animes top si falla
        const results = await getTopAnimeManager();
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = results.slice(startIndex, endIndex);
        
        res.json({
          data: paginatedResults,
          pagination: {
            current_page: page,
            items: { 
              count: paginatedResults.length,
              total: results.length 
            },
            last_visible_page: Math.ceil(results.length / limit),
            has_next_page: endIndex < results.length
          }
        });
      }
    }
  } catch (err) {
    console.error('Error obteniendo todos los animes:', err);
    res.status(500).json({ error: 'Error al obtener animes' });
  }
}

// Controlador para obtener información de la fuente de datos
export async function getDataSourceInfoController(req, res) {
  try {
    const info = getDataSourceInfo();
    res.json(info);
  } catch (err) {
    console.error('Error obteniendo info de fuente de datos:', err);
    res.status(500).json({ error: 'Error al obtener información de fuente de datos' });
  }
}

// Controlador para limpiar cache
export async function clearCacheController(req, res) {
  try {
    const result = await clearMongoDBCache();
    res.json(result);
  } catch (err) {
    console.error('Error limpiando cache:', err);
    res.status(500).json({ error: 'Error al limpiar cache' });
  }
}

// Controlador para forzar recarga de datos CDN
export async function forceReloadCDNController(req, res) {
  try {
    const result = await forceReloadCDN();
    res.json(result);
  } catch (err) {
    console.error('Error recargando datos CDN:', err);
    res.status(500).json({ error: 'Error al recargar datos CDN' });
  }
}

// Controlador para obtener animes por género usando CDN
export async function getAnimesByGenreController(req, res) {
  const { genreId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 24;
  
  try {
    const { getAnimesByGenre } = await import('../services/anime/cdnAnimeService.js');
    const result = await getAnimesByGenre(genreId, page, limit);
    res.json(result);
  } catch (err) {
    console.error('Error obteniendo animes por género:', err);
    res.status(500).json({ error: 'Error al obtener animes por género' });
  }
}

// Controlador para obtener estadísticas de datos CDN
export async function getCDNStatsController(req, res) {
  try {
    const { getDataStats } = await import('../services/anime/cdnAnimeService.js');
    const stats = getDataStats();
    res.json(stats);
  } catch (err) {
    console.error('Error obteniendo estadísticas CDN:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas CDN' });
  }
}

// Controlador para obtener animes destacados limitados a 6
export async function getFeaturedAnimeLimitedController(req, res) {
  // Headers para evitar cache
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    // Usar CDN para animes destacados limitados a 6
    const { getFeaturedAnimesFromCDN } = await import('../services/anime/cdnAnimeService.js');
    const results = await getFeaturedAnimesFromCDN(6);
    
    return res.json({ 
      pagination: { current_page: 1, items: { count: results.length } },
      data: results 
    });
  } catch (error) {
    console.error('Error obteniendo animes destacados:', error.message);
    // Fallback a Jikan si falla el CDN
    try {
      const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=6');
      const data = response.data;
      const results = data.data.map(anime => ({
        ...anime,
        images: normalizeImages(anime.images) || anime.images
      }));
      return res.json({ 
        pagination: { current_page: 1, items: { count: results.length } },
        data: results 
      });
    } catch (jikanError) {
      res.status(500).json({ error: 'Error al obtener animes destacados' });
    }
  }
}

/*
Explicación de los cambios:
- Ahora usa el dataSourceManager en lugar del animeAggregator directamente
- Permite alternar fácilmente entre MongoDB, Jikan y modo híbrido
- Mantiene la misma API para el frontend
- Agrega endpoints para gestionar la fuente de datos y limpiar cache
*/