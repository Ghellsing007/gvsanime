import getSupabaseClient from '../services/shared/supabaseClient.js';

// Crear un comentario
export async function addComment(req, res) {
  try {
    const { anime_id, video_id, content } = req.body;
    if (!content || (!anime_id && !video_id)) {
      return res.status(400).json({ error: 'content y anime_id o video_id son requeridos' });
    }
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: req.user.id,
        anime_id,
        video_id,
        content,
      })
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ comment: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar comentario' });
  }
}

// Listar comentarios (con filtro opcional por anime o video)
export async function getComments(req, res) {
  try {
    const { anime_id, video_id } = req.query;
    const supabase = getSupabaseClient();
    let query = supabase.from('comments').select('*');
    if (anime_id) {
      query = query.eq('anime_id', anime_id);
    }
    if (video_id) {
      query = query.eq('video_id', video_id);
    }
    const { data, error } = await query;
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ comments: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
}

// Editar un comentario (solo el autor)
export async function updateComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Debes enviar el contenido actualizado' });
    }
    // Solo permite editar si el comentario es del usuario autenticado
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ comment: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el comentario' });
  }
}

// Eliminar un comentario (solo el autor)
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    // Solo permite borrar si el comentario es del usuario autenticado
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
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
    res.status(500).json({ error: 'Error al eliminar el comentario' });
  }
} 