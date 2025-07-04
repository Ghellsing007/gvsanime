import getSupabaseClient from '../services/shared/supabaseClient.js';
import Comment from '../services/anime/commentModel.js';

// Crear un comentario
export async function addComment(req, res) {
  try {
    const { animeId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const username = req.user?.username;
    if (!userId || !username) return res.status(401).json({ error: 'No autenticado' });
    if (!content) return res.status(400).json({ error: 'Falta el contenido del comentario' });
    const comment = await Comment.create({ animeId, userId, username, content });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear comentario' });
  }
}

// Listar comentarios de un anime
export async function getComments(req, res) {
  try {
    const { animeId } = req.params;
    const comments = await Comment.find({ animeId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
}

// Editar comentario (solo autor)
export async function updateComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    if (comment.userId !== userId) return res.status(403).json({ error: 'No autorizado' });
    comment.content = content;
    comment.updatedAt = new Date();
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Error al editar comentario' });
  }
}

// Eliminar comentario (solo autor o admin)
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    if (comment.userId !== userId && !isAdmin) return res.status(403).json({ error: 'No autorizado' });
    await comment.deleteOne();
    res.json({ message: 'Comentario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
}

// Dar o quitar like a un comentario
export async function likeComment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    const index = comment.likes.indexOf(userId);
    if (index === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(index, 1);
    }
    await comment.save();
    res.json({ likes: comment.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Error al dar like' });
  }
} 