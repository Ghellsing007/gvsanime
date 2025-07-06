import express from 'express';
import { getSystemStats, getTopUsers } from '../controllers/adminController.js';
import authMiddleware from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authMiddleware);
router.use(requireRole(['admin']));

// Obtener estadísticas generales del sistema
router.get('/stats', getSystemStats);

// Obtener usuarios con más actividad
router.get('/top-users', getTopUsers);

export default router; 