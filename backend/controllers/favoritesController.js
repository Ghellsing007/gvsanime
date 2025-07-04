import Favorite from '../services/anime/favoriteModel.js';

// Listar favoritos del usuario autenticado
export async function getFavorites(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const favorites = await Favorite.find({ userId });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
}

// Agregar anime a favoritos
export async function addFavorite(req, res) {
  try {
    const userId = req.user?.id;
    const { animeId, title, image } = req.body;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    if (!animeId) return res.status(400).json({ error: 'Falta animeId' });
    // Evitar duplicados
    const exists = await Favorite.findOne({ userId, animeId });
    if (exists) return res.status(409).json({ error: 'Ya está en favoritos' });
    const favorite = await Favorite.create({ userId, animeId, title, image });
    res.status(201).json(favorite);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar a favoritos' });
  }
}

// Eliminar anime de favoritos
export async function removeFavorite(req, res) {
  try {
    const userId = req.user?.id;
    const { animeId } = req.params;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const deleted = await Favorite.findOneAndDelete({ userId, animeId });
    if (!deleted) return res.status(404).json({ error: 'No estaba en favoritos' });
    res.json({ message: 'Eliminado de favoritos' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar de favoritos' });
  }
} 