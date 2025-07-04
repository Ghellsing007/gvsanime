import express from 'express';
import { getCategories, createCategory, getCategory, updateCategory, deleteCategory, getTopics, createTopic, getTopic, updateTopic, deleteTopic, getPosts, createPost, updatePost, deletePost, likePost } from '../controllers/forumsController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Categorías
router.get('/categories', getCategories);
router.post('/categories', authMiddleware, createCategory);
router.get('/categories/:id', getCategory);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);

// Temas
router.get('/topics', getTopics);
router.post('/topics', authMiddleware, createTopic);
router.get('/topics/:id', getTopic);
router.put('/topics/:id', authMiddleware, updateTopic);
router.delete('/topics/:id', authMiddleware, deleteTopic);

// Posts
router.get('/posts', getPosts);
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:id', authMiddleware, updatePost);
router.delete('/posts/:id', authMiddleware, deletePost);
router.put('/posts/:id/like', authMiddleware, likePost);

export default router; 