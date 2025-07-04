import getSupabaseClient from '../services/shared/supabaseClient.js';
import ForumCategory from '../services/anime/forumCategoryModel.js';
import ForumTopic from '../services/anime/forumTopicModel.js';
import ForumPost from '../services/anime/forumPostModel.js';

// Crear un foro/hilo
export async function addForum(req, res) {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title es requerido' });
    }
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('forums')
      .insert({
        user_id: req.user.id,
        title,
        content,
      })
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ forum: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear foro' });
  }
}

// Listar foros/hilos
export async function getForums(req, res) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('forums')
      .select('*');
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ forums: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener foros' });
  }
}

// Editar un foro/hilo (solo el autor)
export async function updateForum(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' });
    }
    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    // Solo permite editar si el foro es del usuario autenticado
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('forums')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ forum: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el foro' });
  }
}

// Eliminar un foro/hilo (solo el autor)
export async function deleteForum(req, res) {
  try {
    const { id } = req.params;
    // Solo permite borrar si el foro es del usuario autenticado
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('forums')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ deleted: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el foro' });
  }
}

// Controladores de foros (categorías, temas, posts)

// Categorías
export async function getCategories(req, res) {
  try {
    const categories = await ForumCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar categorías' });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Falta el nombre de la categoría' });
    // Verificar unicidad
    const exists = await ForumCategory.findOne({ name });
    if (exists) return res.status(409).json({ error: 'La categoría ya existe' });
    const category = await ForumCategory.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
}

export async function getCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await ForumCategory.findById(id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await ForumCategory.findById(id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    if (name && name !== category.name) {
      // Verificar unicidad
      const exists = await ForumCategory.findOne({ name });
      if (exists) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
      category.name = name;
    }
    if (description !== undefined) category.description = description;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await ForumCategory.findById(id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    await category.deleteOne();
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
}

// Temas
export async function getTopics(req, res) {
  try {
    const { categoryId, page = 1, limit = 10 } = req.query;
    const filter = categoryId ? { categoryId } : {};
    const topics = await ForumTopic.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar temas' });
  }
}

export async function createTopic(req, res) {
  try {
    const { categoryId, title, content } = req.body;
    const userId = req.user?.id;
    const username = req.user?.username;
    if (!userId || !username) return res.status(401).json({ error: 'No autenticado' });
    if (!categoryId || !title || !content) return res.status(400).json({ error: 'Faltan campos requeridos' });
    const topic = await ForumTopic.create({ categoryId, title, content, userId, username });
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear tema' });
  }
}

export async function getTopic(req, res) {
  try {
    const { id } = req.params;
    const topic = await ForumTopic.findById(id);
    if (!topic) return res.status(404).json({ error: 'Tema no encontrado' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tema' });
  }
}

export async function updateTopic(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user?.id;
    const topic = await ForumTopic.findById(id);
    if (!topic) return res.status(404).json({ error: 'Tema no encontrado' });
    if (topic.userId !== userId) return res.status(403).json({ error: 'No autorizado' });
    if (title) topic.title = title;
    if (content) topic.content = content;
    topic.updatedAt = new Date();
    await topic.save();
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar tema' });
  }
}

export async function deleteTopic(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const topic = await ForumTopic.findById(id);
    if (!topic) return res.status(404).json({ error: 'Tema no encontrado' });
    if (topic.userId !== userId) return res.status(403).json({ error: 'No autorizado' });
    await topic.deleteOne();
    res.json({ message: 'Tema eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar tema' });
  }
}

// Posts
export async function getPosts(req, res) {
  try {
    const { topicId, page = 1, limit = 10 } = req.query;
    if (!topicId) return res.status(400).json({ error: 'Falta topicId' });
    const posts = await ForumPost.find({ topicId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar posts' });
  }
}

export async function createPost(req, res) {
  try {
    const { topicId, content } = req.body;
    const userId = req.user?.id;
    const username = req.user?.username;
    if (!userId || !username) return res.status(401).json({ error: 'No autenticado' });
    if (!topicId || !content) return res.status(400).json({ error: 'Faltan campos requeridos' });
    const post = await ForumPost.create({ topicId, content, userId, username });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear post' });
  }
}

export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const post = await ForumPost.findById(id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    if (post.userId !== userId) return res.status(403).json({ error: 'No autorizado' });
    if (content) post.content = content;
    post.updatedAt = new Date();
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar post' });
  }
}

export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const post = await ForumPost.findById(id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    if (post.userId !== userId) return res.status(403).json({ error: 'No autorizado' });
    await post.deleteOne();
    res.json({ message: 'Post eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar post' });
  }
}

export async function likePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const post = await ForumPost.findById(id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Error al dar like' });
  }
} 