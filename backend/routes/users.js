import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/usersController.js';

const router = express.Router();

// Ruta para obtener el perfil del usuario autenticado
router.get('/me', authMiddleware, getProfile);

// Ruta para actualizar el perfil del usuario autenticado
router.put('/me', authMiddleware, updateProfile);

export default router; 