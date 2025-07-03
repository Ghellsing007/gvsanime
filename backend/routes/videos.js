import express from 'express';
import { authMiddleware } from '../middleware/index.js';
import { addVideo, getVideos, updateVideo, deleteVideo } from '../controllers/videosController.js';

const router = express.Router();

// Agregar un video (protegido)
router.post('/', authMiddleware, addVideo);

// Listar videos (público, con filtro opcional por anime)
router.get('/', getVideos);

// Editar un video (protegido, solo el autor)
router.put('/:id', authMiddleware, updateVideo);

// Eliminar un video (protegido, solo el autor)
router.delete('/:id', authMiddleware, deleteVideo);

export default router; 