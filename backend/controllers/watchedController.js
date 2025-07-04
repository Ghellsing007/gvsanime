import Watched from '../services/anime/watchedModel.js';

// Listar animes vistos del usuario autenticado
export async function getWatched(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const watched = await Watched.find({ userId });
    res.json(watched);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la lista de vistos' });
  }
}

// Marcar anime como visto
export async function addWatched(req, res) {
  try {
    const userId = req.user?.id;
    const { animeId, title, image } = req.body;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    if (!animeId) return res.status(400).json({ error: 'Falta animeId' });
    // Evitar duplicados
    const exists = await Watched.findOne({ userId, animeId });
    if (exists) return res.status(409).json({ error: 'Ya está en vistos' });
    const item = await Watched.create({ userId, animeId, title, image });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar como visto' });
  }
}

// Quitar anime de la lista de vistos
export async function removeWatched(req, res) {
  try {
    const userId = req.user?.id;
    const { animeId } = req.params;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const deleted = await Watched.findOneAndDelete({ userId, animeId });
    if (!deleted) return res.status(404).json({ error: 'No estaba en vistos' });
    res.json({ message: 'Eliminado de la lista de vistos' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar de la lista de vistos' });
  }
} 