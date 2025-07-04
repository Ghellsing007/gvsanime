import Watchlist from '../services/anime/watchlistModel.js';

// Listar watchlist del usuario autenticado
export async function getWatchlist(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const watchlist = await Watchlist.find({ userId });
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener watchlist' });
  }
}

// Agregar anime a watchlist
export async function addToWatchlist(req, res) {
  try {
    const userId = req.user?.id;
    const { animeId, title, image } = req.body;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    if (!animeId) return res.status(400).json({ error: 'Falta animeId' });
    // Evitar duplicados
    const exists = await Watchlist.findOne({ userId, animeId });
    if (exists) return res.status(409).json({ error: 'Ya está en watchlist' });
    const item = await Watchlist.create({ userId, animeId, title, image });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar a watchlist' });
  }
}

// Eliminar anime de watchlist
export async function removeFromWatchlist(req, res) {
  try {
    const userId = req.user?.id;
    const { animeId } = req.params;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const deleted = await Watchlist.findOneAndDelete({ userId, animeId });
    if (!deleted) return res.status(404).json({ error: 'No estaba en watchlist' });
    res.json({ message: 'Eliminado de watchlist' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar de watchlist' });
  }
} 