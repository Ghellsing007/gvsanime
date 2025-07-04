import express from 'express';
import { getAnimeById, searchAnimeController } from '../controllers/animeController.js';
import { cleanOldCache, getCacheStats, clearSearchCache } from '../services/anime/animeAggregator.js';

const router = express.Router();

// Ruta para buscar animes por nombre (público)
router.get('/search', searchAnimeController);

// Ruta para obtener un anime por ID (público)
router.get('/:id', getAnimeById);

// Rutas para administrar el caché
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas del caché' });
  }
});

router.delete('/cache/clean', async (req, res) => {
  try {
    const result = await cleanOldCache();
    res.json({ message: 'Caché limpiado exitosamente', deleted: result });
  } catch (error) {
    res.status(500).json({ error: 'Error limpiando el caché' });
  }
});

router.delete('/cache/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const deleted = await clearSearchCache(query);
    if (deleted) {
      res.json({ message: `Caché de búsqueda eliminado para: ${query}` });
    } else {
      res.status(404).json({ error: 'No se encontró caché para esa búsqueda' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando caché de búsqueda' });
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