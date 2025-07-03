import express from 'express';
import { getAnimeById, searchAnimeController } from '../controllers/animeController.js';

const router = express.Router();

// Ruta para buscar animes por nombre (público)
router.get('/search', searchAnimeController);

// Ruta para obtener un anime por ID (público)
router.get('/:id', getAnimeById);

export default router;

/*
Explicación:
- La ruta /api/anime/search?q=nombre permite buscar animes por nombre usando Jikan.
- La ruta /api/anime/:id obtiene los datos completos de un anime por ID.
*/ 