import express from 'express';
import { getAnimeById, searchAnimeController, getGenresController, getExternalReviewsController, getRecommendationsController, getAllAnimeController } from '../controllers/animeController.js';
import {
  cleanOldCache, getCacheStats, clearSearchCache,
  listAnimeCache, listSearchCache, getAnimeCacheById, getSearchCacheByQuery,
  deleteAnimeCacheById, deleteSearchCacheByQuery, cleanAllCache
} from '../services/anime/animeAggregator.js';

const router = express.Router();

// Ruta para buscar animes por nombre (público)
router.get('/search', searchAnimeController);

// Ruta para obtener la lista de géneros (público)
router.get('/genres', getGenresController);

// Ruta para obtener un anime por ID (público)
router.get('/:id', getAnimeById);

// Ruta para obtener reviews externas de Jikan (público)
router.get('/reviews/:animeId', getExternalReviewsController);

// Ruta para recomendaciones de anime (pública/personalizada)
router.get('/recommendations', getRecommendationsController);

// Ruta para obtener todos los animes paginados y con filtro opcional por nombre (público)
router.get('/', getAllAnimeController);

// --- ADMINISTRACIÓN DE CACHÉ ---

// Listar todo el caché de animes
router.get('/cache/animes', async (req, res) => {
  try {
    const animes = await listAnimeCache();
    res.json(animes);
  } catch (error) {
    res.status(500).json({ error: 'Error listando el caché de animes' });
  }
});

// Listar todo el caché de búsquedas
router.get('/cache/searches', async (req, res) => {
  try {
    const searches = await listSearchCache();
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: 'Error listando el caché de búsquedas' });
  }
});

// Obtener detalles de una búsqueda específica
router.get('/cache/search/:query', async (req, res) => {
  try {
    const search = await getSearchCacheByQuery(req.params.query);
    if (!search) return res.status(404).json({ error: 'No se encontró esa búsqueda en caché' });
    res.json(search);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo la búsqueda en caché' });
  }
});

// Obtener detalles de un anime específico
router.get('/cache/anime/:id', async (req, res) => {
  try {
    const anime = await getAnimeCacheById(req.params.id);
    if (!anime) return res.status(404).json({ error: 'No se encontró ese anime en caché' });
    res.json(anime);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo el anime en caché' });
  }
});

// Eliminar una búsqueda del caché
router.delete('/cache/search/:query', async (req, res) => {
  try {
    const result = await deleteSearchCacheByQuery(req.params.query);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'No se encontró esa búsqueda en caché' });
    res.json({ message: 'Búsqueda eliminada del caché' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando la búsqueda en caché' });
  }
});

// Eliminar un anime del caché
router.delete('/cache/anime/:id', async (req, res) => {
  try {
    const result = await deleteAnimeCacheById(req.params.id);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'No se encontró ese anime en caché' });
    res.json({ message: 'Anime eliminado del caché' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando el anime en caché' });
  }
});

// Limpiar todo el caché (animes y búsquedas)
router.delete('/cache/clean', async (req, res) => {
  try {
    const result = await cleanAllCache();
    res.json({ message: 'Caché de animes y búsquedas limpiado', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Error limpiando el caché' });
  }
});

// Obtener estadísticas del caché
router.get('/cache/stats', async (req, res) => {
  try {
    const animeCount = await listAnimeCache();
    const searchCount = await listSearchCache();
    res.json({ animeCache: animeCount.length, searchCache: searchCount.length, total: animeCount.length + searchCount.length });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas del caché' });
  }
});

export default router;

/*
Explicación:
- La ruta /api/anime/search?q=nombre permite buscar animes por nombre usando Jikan.
- La ruta /api/anime/:id obtiene los datos completos de un anime por ID.
- GET /api/anime/cache/stats - Obtiene estadísticas del caché
- DELETE /api/anime/cache/clean - Limpia caché antiguo (más de 7 días)
- DELETE /api/anime/cache/search/:query - Elimina caché específico de una búsqueda
*/ 