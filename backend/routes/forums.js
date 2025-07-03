import express from 'express';
import { authMiddleware } from '../middleware/index.js';
import { addForum, getForums, updateForum, deleteForum } from '../controllers/forumsController.js';

const router = express.Router();

// Crear un foro/hilo (protegido)
router.post('/', authMiddleware, addForum);

// Listar foros/hilos (público)
router.get('/', getForums);

// Editar un foro/hilo (protegido, solo el autor)
router.put('/:id', authMiddleware, updateForum);

// Eliminar un foro/hilo (protegido, solo el autor)
router.delete('/:id', authMiddleware, deleteForum);

export default router; 