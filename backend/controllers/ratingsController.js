import Rating from '../services/anime/ratingModel.js';

// Listar todas las calificaciones del usuario autenticado
export async function getRatings(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const ratings = await Rating.find({ userId });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ratings' });
  }
}

// Calificar un anime
export async function addRating(req, res) {
  try {
    const userId = req.user?.id;
    const { animeId, rating, comment } = req.body;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    if (!animeId || !rating) return res.status(400).json({ error: 'Faltan datos' });
    // Evitar duplicados
    const exists = await Rating.findOne({ userId, animeId });
    if (exists) return res.status(409).json({ error: 'Ya calificaste este anime' });
    const newRating = await Rating.create({ userId, animeId, rating, comment });
    res.status(201).json(newRating);
  } catch (err) {
    res.status(500).json({ error: 'Error al calificar anime' });
  }
}

// Actualizar calificación
export async function updateRating(req, res) {
  try {
    const userId = req.user?.id;
    const { animeId } = req.params;
    const { rating, comment } = req.body;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const existing = await Rating.findOne({ userId, animeId });
    if (!existing) return res.status(404).json({ error: 'No existe calificación para este anime' });
    existing.rating = rating;
    existing.comment = comment;
    existing.ratedAt = new Date();
    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar rating' });
  }
}

// Eliminar calificación
export async function deleteRating(req, res) {
  try {
    const userId = req.user?.id;
    const { animeId } = req.params;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const deleted = await Rating.findOneAndDelete({ userId, animeId });
    if (!deleted) return res.status(404).json({ error: 'No existe calificación para este anime' });
    res.json({ message: 'Calificación eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar rating' });
  }
} 