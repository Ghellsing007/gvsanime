import supabase from '../services/shared/supabaseClient.js';

// Crear una reseña
export async function createReview(req, res) {
  try {
    const { anime_id, rating, comment } = req.body;
    if (!anime_id || !rating) {
      return res.status(400).json({ error: 'anime_id y rating son requeridos' });
    }
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'El rating debe estar entre 1 y 10' });
    }
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: req.user.id,
        anime_id,
        rating,
        comment,
      })
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ review: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la reseña' });
  }
}

// Listar reseñas de un anime
export async function getReviewsByAnime(req, res) {
  try {
    const { anime_id } = req.params;
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('anime_id', anime_id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ reviews: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
}

// Eliminar una reseña (solo el autor)
export async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    // Solo permite borrar si la reseña es del usuario autenticado
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ deleted: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la reseña' });
  }
}

// Editar una reseña (solo el autor)
export async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    if (!rating && !comment) {
      return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' });
    }
    if (rating && (rating < 1 || rating > 10)) {
      return res.status(400).json({ error: 'El rating debe estar entre 1 y 10' });
    }
    const updateFields = {};
    if (rating) updateFields.rating = rating;
    if (comment) updateFields.comment = comment;
    // Solo permite editar si la reseña es del usuario autenticado
    const { data, error } = await supabase
      .from('reviews')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ review: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la reseña' });
  }
} 