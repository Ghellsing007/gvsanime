import supabase from '../services/shared/supabaseClient.js';

// Agregar un anime a favoritos
export async function addFavorite(req, res) {
  try {
    const { anime_id, anime_title, anime_image_url } = req.body;
    if (!anime_id || !anime_title) {
      return res.status(400).json({ error: 'anime_id y anime_title son requeridos' });
    }
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: req.user.id,
        anime_id,
        anime_title,
        anime_image_url,
      })
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ favorite: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar favorito' });
  }
}

// Listar favoritos del usuario autenticado
export async function getFavorites(req, res) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ favorites: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
}

// Eliminar un favorito por su id
export async function deleteFavorite(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('favorites')
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
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
} 