import express from 'express';
import { getWatched, addWatched, removeWatched } from '../controllers/watchedController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Listar animes vistos del usuario autenticado
router.get('/', authMiddleware, getWatched);

// Marcar anime como visto
router.post('/', authMiddleware, addWatched);

// Quitar anime de la lista de vistos
router.delete('/:animeId', authMiddleware, removeWatched);

export default router; 