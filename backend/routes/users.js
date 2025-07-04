import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getProfile, updateProfile, deleteProfile } from '../controllers/usersController.js';
import isAdmin from '../middleware/roles.js';
import { listUsers, createUser, getUserById, updateUserById, deleteUserById } from '../controllers/usersController.js';

const router = express.Router();

// Ruta para obtener el perfil del usuario autenticado
// router.get('/me', authMiddleware, getProfile);

// Ruta para actualizar el perfil del usuario autenticado
// router.put('/me', authMiddleware, updateProfile);

// Solo dejamos /profile
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);

// CRUD admin de usuarios
router.get('/', authMiddleware, isAdmin, listUsers);
router.post('/', authMiddleware, isAdmin, createUser);
router.get('/:id', authMiddleware, isAdmin, getUserById);
router.put('/:id', authMiddleware, isAdmin, updateUserById);
router.delete('/:id', authMiddleware, isAdmin, deleteUserById);

export default router; 