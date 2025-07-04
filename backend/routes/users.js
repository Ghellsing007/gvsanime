import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getProfile, updateProfile, deleteProfile } from '../controllers/usersController.js';

const router = express.Router();

// Ruta para obtener el perfil del usuario autenticado
// router.get('/me', authMiddleware, getProfile);

// Ruta para actualizar el perfil del usuario autenticado
// router.put('/me', authMiddleware, updateProfile);

// Solo dejamos /profile
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);

export default router; 