import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoritesController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Listar favoritos del usuario autenticado
router.get('/', authMiddleware, getFavorites);

// Agregar anime a favoritos
router.post('/', authMiddleware, addFavorite);

// Eliminar anime de favoritos
router.delete('/:animeId', authMiddleware, removeFavorite);

export default router; 