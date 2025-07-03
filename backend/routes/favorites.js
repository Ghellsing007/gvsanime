import express from 'express';
import { authMiddleware } from '../middleware/index.js';
import { addFavorite, getFavorites, deleteFavorite } from '../controllers/favoritesController.js';

const router = express.Router();

// Agregar un anime a favoritos
router.post('/', authMiddleware, addFavorite);

// Listar favoritos del usuario autenticado
router.get('/', authMiddleware, getFavorites);

// Eliminar un favorito por su id
router.delete('/:id', authMiddleware, deleteFavorite);

export default router; 