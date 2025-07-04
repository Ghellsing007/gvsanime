// Middleware para requerir uno o varios roles
// Uso: router.post('/ruta', requireRole(['admin', 'moderador']), handler)

export function requireRole(roles = []) {
  return (req, res, next) => {
    // El rol puede venir de req.user.role o req.user.user_metadata.role según cómo se decodifique el JWT
    const userRole = req.user?.role || req.user?.user_metadata?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol adecuado' });
    }
    next();
  };
}

// Sugerencias de uso:
// - requireRole(['admin']) para rutas solo de administradores
// - requireRole(['admin', 'moderador']) para rutas de admin o moderadores
// - Puedes extenderlo para más roles según tu lógica de negocio 