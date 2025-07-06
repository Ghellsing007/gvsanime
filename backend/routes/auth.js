import express from 'express';
import { registerUser, loginUser, logout, updatePassword, forgotPassword, resetPassword, verifyEmail, getMe } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Ruta para registrar usuario
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

// Ruta para obtener información del usuario autenticado
router.get('/me', authMiddleware, getMe);

router.post('/logout', authMiddleware, logout);
router.put('/updatepassword', authMiddleware, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/verifyemail/:token', verifyEmail);

export default router; 