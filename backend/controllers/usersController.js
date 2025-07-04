import getSupabaseClient from '../services/shared/supabaseClient.js';

// Controlador para obtener el perfil del usuario autenticado
export async function getProfile(req, res) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, username, avatar_url, bio, created_at, updated_at')
      .eq('id', req.user.id)
      .single();
    if (error) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
}

// Controlador para actualizar el perfil del usuario autenticado
export async function updateProfile(req, res) {
  try {
    const { username, avatar_url, bio } = req.body;
    if (!username && !avatar_url && !bio) {
      return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' });
    }
    const updateFields = {};
    if (username) updateFields.username = username;
    if (avatar_url) updateFields.avatar_url = avatar_url;
    if (bio) updateFields.bio = bio;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', req.user.id)
      .select('id, username, avatar_url, bio, created_at, updated_at')
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
}

// Controlador para eliminar el perfil del usuario autenticado
export async function deleteProfile(req, res) {
  try {
    const supabase = getSupabaseClient();
    // Eliminar de la tabla 'users'
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', req.user.id);
    if (userError) {
      return res.status(400).json({ error: userError.message });
    }
    // Eliminar de Supabase Auth (requiere privilegios elevados, normalmente Service Role Key)
    // Aquí solo devolvemos éxito, pero en producción deberías usar la API de administración de Supabase
    res.json({ message: 'Cuenta eliminada correctamente (debes cerrar sesión en todos los dispositivos).' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el perfil' });
  }
} 