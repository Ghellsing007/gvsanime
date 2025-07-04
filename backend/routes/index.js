import express from 'express';
import usersRoutes from './users.js';
import favoritesRoutes from './favorites.js';
import reviewsRoutes from './reviews.js';
import videosRoutes from './videos.js';
import commentsRoutes from './comments.js';
import forumsRoutes from './forums.js';
import animeRoutes from './anime.js';
import authRoutes from './auth.js';
// import reviewsRoutes from './reviews.js';
// ...otros imports

const router = express.Router();

router.use('/users', usersRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/videos', videosRoutes);
router.use('/comments', commentsRoutes);
router.use('/forums', forumsRoutes);
router.use('/anime', animeRoutes);
router.use('/auth', authRoutes);
// router.use('/reviews', reviewsRoutes);
// ...otros recursos

export default router; 