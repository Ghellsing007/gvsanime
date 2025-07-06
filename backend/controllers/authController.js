import getSupabaseClient from '../services/shared/supabaseClient.js';
import authMiddleware from '../middleware/auth.js';

// Controlador para registrar un usuario
export async function registerUser(req, res) {
  const { email, password, username } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }
  // 1. Crear usuario en Supabase Auth
  const supabase = getSupabaseClient();
  const { data: user, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // 2. Si se provee username, guardar en la tabla users
  if (username) {
    await supabase.from('users').update({ username }).eq('id', user.user.id);
  }
  return res.status(201).json({ message: 'Usuario registrado correctamente', user: user.user });
}

// Controlador para login de usuario
export async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }
  // Autenticar con Supabase
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(401).json({ error: error.message });
  }
  return res.status(200).json({ access_token: data.session.access_token, user: data.user });
}

// Proxy: Logout (elimina token en frontend)
export async function logout(req, res) {
  res.json({ message: 'Logout exitoso. Elimina el token en el frontend.' });
}

// Proxy: Cambiar contraseña usando Supabase
export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }
    const supabase = getSupabaseClient();
    // Reautenticar usuario (Supabase requiere sesión activa)
    // Cambiar contraseña
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
}

// Proxy: Enviar email de recuperación de contraseña usando Supabase
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Falta el email.' });
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.SUPABASE_RESET_REDIRECT_URL || undefined
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: 'Email de recuperación enviado.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar email de recuperación.' });
  }
}

// Proxy: Resetear contraseña con token usando Supabase
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Faltan datos.' });
    const supabase = getSupabaseClient();
    // El SDK de Supabase no permite resetear contraseña desde backend con token, solo desde frontend.
    // Documentar que este endpoint debe ser manejado desde el frontend usando el link de Supabase.
    return res.status(501).json({ error: 'Esta acción debe completarse desde el frontend usando el link de Supabase.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al resetear la contraseña.' });
  }
}

// Proxy: Verificar email con token usando Supabase
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;
    // El SDK de Supabase no permite verificar email desde backend con token, solo desde frontend.
    // Documentar que este endpoint debe ser manejado desde el frontend usando el link de Supabase.
    return res.status(501).json({ error: 'Esta acción debe completarse desde el frontend usando el link de Supabase.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar el email.' });
  }
}

// Obtener información del usuario autenticado
export async function getMe(req, res) {
  try {
    // El middleware de auth ya verifica el token y agrega req.user
    const { id, email, username } = req.user;
    res.json({ id, email, username });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener información del usuario.' });
  }
} 