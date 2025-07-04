import express from 'express';
import { getComments, addComment, updateComment, deleteComment, likeComment } from '../controllers/commentsController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Listar comentarios de un anime (público)
router.get('/:animeId', getComments);

// Crear comentario (requiere autenticación)
router.post('/:animeId', authMiddleware, addComment);

// Editar comentario (requiere autenticación)
router.put('/:id', authMiddleware, updateComment);

// Eliminar comentario (requiere autenticación)
router.delete('/:id', authMiddleware, deleteComment);

// Dar o quitar like a un comentario (requiere autenticación)
router.put('/:id/like', authMiddleware, likeComment);

export default router; 