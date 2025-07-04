import express from 'express';
import { getRatings, addRating, updateRating, deleteRating } from '../controllers/ratingsController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Listar ratings del usuario autenticado
router.get('/', authMiddleware, getRatings);

// Calificar un anime
router.post('/', authMiddleware, addRating);

// Actualizar calificación
router.put('/:animeId', authMiddleware, updateRating);

// Eliminar calificación
router.delete('/:animeId', authMiddleware, deleteRating);

export default router; 