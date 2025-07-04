import supabase from '../services/shared/supabaseClient.js';

// Controlador para registrar un usuario
export async function registerUser(req, res) {
  const { email, password, username } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }
  // 1. Crear usuario en Supabase Auth
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(401).json({ error: error.message });
  }
  return res.status(200).json({ access_token: data.session.access_token, user: data.user });
} 