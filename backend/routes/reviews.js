import express from 'express';
import { authMiddleware } from '../middleware/index.js';
import { createReview, getReviewsByAnime, deleteReview, updateReview } from '../controllers/reviewsController.js';

const router = express.Router();

// Crear una reseña (protegido)
router.post('/', authMiddleware, createReview);

// Listar reseñas de un anime (público)
router.get('/:anime_id', getReviewsByAnime);

// Editar una reseña (protegido, solo el autor)
router.put('/:id', authMiddleware, updateReview);

// Eliminar una reseña (protegido, solo el autor)
router.delete('/:id', authMiddleware, deleteReview);

export default router; 