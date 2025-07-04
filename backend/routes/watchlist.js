import express from 'express';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlistController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Listar watchlist del usuario autenticado
router.get('/', authMiddleware, getWatchlist);

// Agregar anime a watchlist
router.post('/', authMiddleware, addToWatchlist);

// Eliminar anime de watchlist
router.delete('/:animeId', authMiddleware, removeFromWatchlist);

export default router; 