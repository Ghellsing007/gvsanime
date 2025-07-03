import { getAnimeFullData } from '../services/anime/animeAggregator.js';
import { searchAnime } from '../services/anime/jikanService.js';

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

// Controlador para buscar animes por nombre (usando Jikan)
export async function searchAnimeController(req, res) {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });
  try {
    const results = await searchAnime(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar animes' });
  }
}

/*
Explicación:
- searchAnimeController recibe el parámetro de búsqueda, llama al servicio de Jikan y devuelve los resultados al frontend.
*/ 