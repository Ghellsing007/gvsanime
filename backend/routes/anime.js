import express from 'express';
import { 
  getAnimeById, 
  searchAnimeController, 
  getGenresController, 
  getExternalReviewsController, 
  getRecommendationsController, 
  getAllAnimeController,
  getDataSourceInfoController,
  clearCacheController,
  forceReloadCDNController,
  getAnimesByGenreController,
  getCDNStatsController,
  getFeaturedAnimeLimitedController
} from '../controllers/animeController.js';
import authMiddleware from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import cdnReady from '../middleware/cdnReady.js';

const router = express.Router();

// Ruta para buscar animes por nombre (público) - Requiere CDN listo
router.get('/search', cdnReady, searchAnimeController);

// Ruta para obtener animes destacados limitados a 6 (público) - Requiere CDN listo
router.get('/featured', cdnReady, getFeaturedAnimeLimitedController);

// Ruta para obtener la lista de géneros (público) - Requiere CDN listo
router.get('/genres', cdnReady, getGenresController);

// Ruta para obtener un anime por ID (público) - Requiere CDN listo
router.get('/:id', cdnReady, getAnimeById);

// Ruta para obtener reviews externas de Jikan (público) - No requiere CDN
router.get('/reviews/:animeId', getExternalReviewsController);

// Ruta para recomendaciones de anime (pública/personalizada) - Requiere CDN listo
router.get('/recommendations', cdnReady, getRecommendationsController);

// Ruta para obtener todos los animes paginados y con filtro opcional por nombre (público) - Requiere CDN listo
router.get('/', cdnReady, getAllAnimeController);

// --- GESTIÓN DE FUENTE DE DATOS ---

// Obtener información de la fuente de datos actual - No requiere CDN
router.get('/datasource/info', getDataSourceInfoController);

// Limpiar cache de MongoDB (solo admin) - No requiere CDN
router.delete('/datasource/cache', authMiddleware, requireRole(['admin']), clearCacheController);

// Forzar recarga de datos CDN (solo admin) - No requiere CDN
router.post('/datasource/cdn/reload', authMiddleware, requireRole(['admin']), forceReloadCDNController);

// Obtener estadísticas de datos CDN (público) - No requiere CDN
router.get('/datasource/cdn/stats', getCDNStatsController);

// Obtener animes por género usando CDN (público) - Requiere CDN listo
router.get('/genre/:genreId', cdnReady, getAnimesByGenreController);

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

// Eliminar una búsqueda del caché (solo admin)
router.delete('/cache/search/:query', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const result = await deleteSearchCacheByQuery(req.params.query);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'No se encontró esa búsqueda en caché' });
    res.json({ message: 'Búsqueda eliminada del caché' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando la búsqueda en caché' });
  }
});

// Eliminar un anime del caché (solo admin)
router.delete('/cache/anime/:id', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const result = await deleteAnimeCacheById(req.params.id);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'No se encontró ese anime en caché' });
    res.json({ message: 'Anime eliminado del caché' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando el anime en caché' });
  }
});

// Limpiar todo el caché (solo admin)
router.delete('/cache/clean', authMiddleware, requireRole(['admin']), async (req, res) => {
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