// Middleware de autenticación para Express usando JWT de Supabase
// Su función es proteger rutas que requieren usuario autenticado
// y extraer el user id del token para usarlo en los controladores

import jwt from 'jsonwebtoken';
import getSupabaseClient from '../services/shared/supabaseClient.js';

// Middleware principal
export default async function authMiddleware(req, res, next) {
  const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
  // 1. Leer el header Authorization
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No se encontró el header Authorization' });
  }

  // 2. Extraer el token (formato: Bearer <token>)
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    // 4. Extraer el user id (sub) y obtener información completa del usuario
    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase.auth.getUser(token);
    
    if (error || !user.user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Obtener información adicional del usuario desde la tabla users
    const { data: userProfile } = await supabase
      .from('users')
      .select('username, role')
      .eq('id', user.user.id)
      .single();

    req.user = {
      id: user.user.id,
      email: user.user.email,
      username: userProfile?.username || user.user.email?.split('@')[0] || 'Usuario',
      role: userProfile?.role || 'user'
    };
    
    // 5. Continuar con la siguiente función o controlador
    next();
  } catch (err) {
    console.error('Error al verificar JWT:', err);
    // Si el token no es válido o expiró
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/*
Explicación:
- Este middleware se coloca antes de los controladores de rutas protegidas.
- Si el token es válido, el id del usuario estará disponible en req.user.id.
- Si no hay token o es inválido, responde con error 401 (no autorizado).
- Así puedes proteger cualquier endpoint simplemente agregando este middleware.
*/ 