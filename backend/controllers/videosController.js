import supabase from '../services/shared/supabaseClient.js';

// Agregar un video
export async function addVideo(req, res) {
  try {
    const { title, platform, video_id, embed_url, type, related_anime } = req.body;
    if (!title || !platform || !video_id) {
      return res.status(400).json({ error: 'title, platform y video_id son requeridos' });
    }
    const { data, error } = await supabase
      .from('videos')
      .insert({
        user_id: req.user.id,
        title,
        platform,
        video_id,
        embed_url,
        type,
        related_anime,
      })
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ video: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar video' });
  }
}

// Listar videos (con filtro opcional por anime)
export async function getVideos(req, res) {
  try {
    const { anime } = req.query;
    let query = supabase.from('videos').select('*');
    if (anime) {
      query = query.contains('related_anime', [anime]);
    }
    const { data, error } = await query;
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ videos: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener videos' });
  }
}

// Editar un video (solo el autor)
export async function updateVideo(req, res) {
  try {
    const { id } = req.params;
    const { title, platform, video_id, embed_url, type, related_anime } = req.body;
    if (!title && !platform && !video_id && !embed_url && !type && !related_anime) {
      return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' });
    }
    const updateFields = {};
    if (title) updateFields.title = title;
    if (platform) updateFields.platform = platform;
    if (video_id) updateFields.video_id = video_id;
    if (embed_url) updateFields.embed_url = embed_url;
    if (type) updateFields.type = type;
    if (related_anime) updateFields.related_anime = related_anime;
    // Solo permite editar si el video es del usuario autenticado
    const { data, error } = await supabase
      .from('videos')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ video: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el video' });
  }
}

// Eliminar un video (solo el autor)
export async function deleteVideo(req, res) {
  try {
    const { id } = req.params;
    // Solo permite borrar si el video es del usuario autenticado
    const { data, error } = await supabase
      .from('videos')
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
    res.status(500).json({ error: 'Error al eliminar el video' });
  }
} 