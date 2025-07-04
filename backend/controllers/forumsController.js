import getSupabaseClient from '../services/shared/supabaseClient.js';

// Crear un foro/hilo
export async function addForum(req, res) {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title es requerido' });
    }
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('forums')
      .insert({
        user_id: req.user.id,
        title,
        content,
      })
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ forum: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear foro' });
  }
}

// Listar foros/hilos
export async function getForums(req, res) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('forums')
      .select('*');
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ forums: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener foros' });
  }
}

// Editar un foro/hilo (solo el autor)
export async function updateForum(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' });
    }
    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    // Solo permite editar si el foro es del usuario autenticado
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('forums')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ forum: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el foro' });
  }
}

// Eliminar un foro/hilo (solo el autor)
export async function deleteForum(req, res) {
  try {
    const { id } = req.params;
    // Solo permite borrar si el foro es del usuario autenticado
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('forums')
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
    res.status(500).json({ error: 'Error al eliminar el foro' });
  }
} 