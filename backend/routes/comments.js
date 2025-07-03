import express from 'express';
import { authMiddleware } from '../middleware/index.js';
import { addComment, getComments, updateComment, deleteComment } from '../controllers/commentsController.js';

const router = express.Router();

// Crear un comentario (protegido)
router.post('/', authMiddleware, addComment);

// Listar comentarios (público, con filtro opcional por anime o video)
router.get('/', getComments);

// Editar un comentario (protegido, solo el autor)
router.put('/:id', authMiddleware, updateComment);

// Eliminar un comentario (protegido, solo el autor)
router.delete('/:id', authMiddleware, deleteComment);

export default router; 