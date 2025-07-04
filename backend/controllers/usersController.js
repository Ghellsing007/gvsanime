import getSupabaseClient from '../services/shared/supabaseClient.js';
import User from '../services/anime/userModel.js';

const useMongoUsers = process.env.USE_MONGO_USERS === 'true';

// Controlador para obtener el perfil del usuario autenticado
export async function getProfile(req, res) {
  try {
    if (useMongoUsers) {
      const user = await User.findOne({ id: req.user.id });
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.json({ user });
    } else {
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
    }
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
    if (useMongoUsers) {
      const updateFields = {};
      if (username) updateFields.username = username;
      if (avatar_url) updateFields.avatar_url = avatar_url;
      if (bio) updateFields.bio = bio;
      const user = await User.findOneAndUpdate(
        { id: req.user.id },
        { $set: updateFields, updatedAt: new Date() },
        { new: true }
      );
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.json({ user });
    } else {
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
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
}

// Controlador para eliminar el perfil del usuario autenticado
export async function deleteProfile(req, res) {
  try {
    if (useMongoUsers) {
      const deleted = await User.findOneAndDelete({ id: req.user.id });
      if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.json({ message: 'Cuenta eliminada correctamente (MongoDB).' });
    } else {
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
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el perfil' });
  }
}

// Listar todos los usuarios (solo admin)
export async function listUsers(req, res) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('id, username, email, avatar_url, bio, role, created_at, updated_at');
    if (error) return res.status(400).json({ error: error.message });
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}

// Crear usuario (solo admin)
export async function createUser(req, res) {
  try {
    const { email, password, username, role } = req.body;
    if (!email || !password || !username) return res.status(400).json({ error: 'Faltan campos requeridos' });
    const supabase = getSupabaseClient();
    // Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({ email, password, user_metadata: { username, role: role || 'user' } });
    if (authError) return res.status(400).json({ error: authError.message });
    // Crear usuario en tabla 'users'
    const { data, error } = await supabase.from('users').insert([{ id: authData.user.id, email, username, role: role || 'user' }]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ user: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
}

// Obtener usuario por ID (solo admin)
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('id, username, email, avatar_url, bio, role, created_at, updated_at').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
}

// Editar usuario por ID (solo admin)
export async function updateUserById(req, res) {
  try {
    const { id } = req.params;
    const { username, avatar_url, bio, role } = req.body;
    const updateFields = {};
    if (username) updateFields.username = username;
    if (avatar_url) updateFields.avatar_url = avatar_url;
    if (bio) updateFields.bio = bio;
    if (role) updateFields.role = role;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').update(updateFields).eq('id', id).select('id, username, email, avatar_url, bio, role, created_at, updated_at').single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}

// Eliminar usuario por ID (solo admin)
export async function deleteUserById(req, res) {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    // Eliminar de tabla 'users'
    const { error: userError } = await supabase.from('users').delete().eq('id', id);
    if (userError) return res.status(400).json({ error: userError.message });
    // Eliminar de Auth (requiere Service Role Key)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) return res.status(400).json({ error: authError.message });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
} 