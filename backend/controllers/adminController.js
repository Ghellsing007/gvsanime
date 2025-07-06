// controllers/adminController.js
// Controlador para obtener estadísticas del sistema para el dashboard de administración

import User from '../services/anime/userModel.js';
import Favorite from '../services/anime/favoriteModel.js';
import Watchlist from '../services/anime/watchlistModel.js';
import Rating from '../services/anime/ratingModel.js';
import Review from '../services/anime/reviewCacheModel.js';
import Comment from '../services/anime/commentModel.js';
import ForumCategory from '../services/anime/forumCategoryModel.js';
import ForumTopic from '../services/anime/forumTopicModel.js';
import ForumPost from '../services/anime/forumPostModel.js';
import { getDataStats } from '../services/anime/cdnAnimeService.js';
import getSupabaseClient from '../services/shared/supabaseClient.js';

// Obtener estadísticas generales del sistema
export async function getSystemStats(req, res) {
  try {
    // Verificar que el usuario sea admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    // Obtener estadísticas en paralelo para mejor rendimiento
    const [
      userStats,
      animeStats,
      forumStats,
      activityStats,
      cdnStats,
      recentActivity
    ] = await Promise.all([
      getUserStats(),
      getAnimeStats(),
      getForumStats(),
      getActivityStats(),
      getCDNStats(),
      getRecentActivity()
    ]);

    res.json({
      success: true,
      data: {
        users: userStats,
        anime: animeStats,
        forums: forumStats,
        activity: activityStats,
        cdn: cdnStats,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del sistema:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Estadísticas de usuarios
async function getUserStats() {
  const supabase = getSupabaseClient();
  
  try {
    // Obtener todos los usuarios
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (allUsersError) {
      console.error('Error obteniendo usuarios:', allUsersError);
      return {
        total: 0,
        thisMonth: 0,
        thisWeek: 0,
        today: 0,
        byRole: {},
        active: 0,
        verified: 0,
        verificationRate: '0'
      };
    }

    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeekLogin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calcular estadísticas
    const totalUsers = allUsers.length;
    const usersThisMonth = allUsers.filter(user => new Date(user.created_at) >= lastMonth).length;
    const usersThisWeek = allUsers.filter(user => new Date(user.created_at) >= lastWeek).length;
    const usersToday = allUsers.filter(user => new Date(user.created_at) >= lastDay).length;
    const activeUsers = allUsers.filter(user => user.last_login && new Date(user.last_login) >= lastWeekLogin).length;
    const verifiedUsers = allUsers.filter(user => user.email_verified).length;

    // Calcular usuarios por rol
    const usersByRole = {};
    allUsers.forEach(user => {
      const role = user.role || 'user';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });

    return {
      total: totalUsers,
      thisMonth: usersThisMonth,
      thisWeek: usersThisWeek,
      today: usersToday,
      byRole: usersByRole,
      active: activeUsers,
      verified: verifiedUsers,
      verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : '0'
    };

  } catch (error) {
    console.error('Error en getUserStats:', error);
    return {
      total: 0,
      thisMonth: 0,
      thisWeek: 0,
      today: 0,
      byRole: {},
      active: 0,
      verified: 0,
      verificationRate: '0'
    };
  }
}

// Estadísticas de anime
async function getAnimeStats() {
  const cdnStats = getDataStats();
  
  const [
    totalFavorites,
    totalWatchlist,
    totalRatings,
    totalReviews,
    totalComments,
    averageRating,
    topGenres
  ] = await Promise.all([
    Favorite.countDocuments(),
    Watchlist.countDocuments(),
    Rating.countDocuments(),
    Review.countDocuments(),
    Comment.countDocuments(),
    Rating.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]),
    // Obtener géneros más populares desde el CDN
    getTopGenresFromCDN()
  ]);

  return {
    total: cdnStats.totalAnimes || 0,
    favorites: totalFavorites,
    watchlist: totalWatchlist,
    ratings: totalRatings,
    reviews: totalReviews,
    comments: totalComments,
    averageRating: averageRating[0]?.avgRating?.toFixed(1) || 0,
    topGenres: topGenres || []
  };
}

// Estadísticas de foros
async function getForumStats() {
  const [
    totalCategories,
    totalTopics,
    totalPosts,
    topicsThisMonth,
    postsThisMonth,
    topCategories
  ] = await Promise.all([
    ForumCategory.countDocuments(),
    ForumTopic.countDocuments(),
    ForumPost.countDocuments(),
    ForumTopic.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ForumPost.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ForumCategory.aggregate([
      {
        $lookup: {
          from: 'forumtopics',
          localField: '_id',
          foreignField: 'category',
          as: 'topics'
        }
      },
      {
        $project: {
          name: 1,
          topicCount: { $size: '$topics' }
        }
      },
      { $sort: { topicCount: -1 } },
      { $limit: 5 }
    ])
  ]);

  return {
    categories: totalCategories,
    topics: totalTopics,
    posts: totalPosts,
    topicsThisMonth,
    postsThisMonth,
    topCategories
  };
}

// Estadísticas de actividad
async function getActivityStats() {
  const supabase = getSupabaseClient();
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    // Obtener usuarios de Supabase
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('created_at');
    
    if (usersError) {
      console.error('Error obteniendo usuarios para actividad:', usersError);
    }

    // Calcular usuarios por período
    const newUsers24h = allUsers ? allUsers.filter(user => new Date(user.created_at) >= last24h).length : 0;
    const newUsers7d = allUsers ? allUsers.filter(user => new Date(user.created_at) >= last7d).length : 0;
    const newUsers30d = allUsers ? allUsers.filter(user => new Date(user.created_at) >= last30d).length : 0;

    // Obtener otras estadísticas de MongoDB
    const [
      newRatings24h,
      newReviews24h,
      newTopics24h,
      newPosts24h,
      newFavorites24h
    ] = await Promise.all([
      Rating.countDocuments({ createdAt: { $gte: last24h } }),
      Review.countDocuments({ createdAt: { $gte: last24h } }),
      ForumTopic.countDocuments({ createdAt: { $gte: last24h } }),
      ForumPost.countDocuments({ createdAt: { $gte: last24h } }),
      Favorite.countDocuments({ createdAt: { $gte: last24h } })
    ]);

    return {
      last24h: {
        users: newUsers24h,
        ratings: newRatings24h,
        reviews: newReviews24h,
        topics: newTopics24h,
        posts: newPosts24h,
        favorites: newFavorites24h
      },
      last7d: {
        users: newUsers7d
      },
      last30d: {
        users: newUsers30d
      }
    };

  } catch (error) {
    console.error('Error en getActivityStats:', error);
    return {
      last24h: { users: 0, ratings: 0, reviews: 0, topics: 0, posts: 0, favorites: 0 },
      last7d: { users: 0 },
      last30d: { users: 0 }
    };
  }
}

// Estadísticas del CDN
async function getCDNStats() {
  const stats = getDataStats();
  return {
    isLoaded: stats.isLoaded,
    totalAnimes: stats.totalAnimes,
    lastLoadTime: stats.lastLoadTime,
    loadError: stats.loadError,
    memoryUsage: stats.memoryUsage
  };
}

// Actividad reciente
async function getRecentActivity() {
  const supabase = getSupabaseClient();
  
  try {
    // Obtener usuarios recientes de Supabase
    const { data: recentUsers, error: usersError } = await supabase
      .from('users')
      .select('username, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('Error obteniendo usuarios recientes:', usersError);
    }

    // Obtener otras actividades de MongoDB
    const [
      recentRatings,
      recentTopics,
      recentPosts
    ] = await Promise.all([
      Rating.find().sort({ createdAt: -1 }).limit(5).select('rating createdAt userId'),
      ForumTopic.find().sort({ createdAt: -1 }).limit(5).select('title createdAt'),
      ForumPost.find().sort({ createdAt: -1 }).limit(5).select('content createdAt')
    ]);

    return {
      users: recentUsers || [],
      ratings: recentRatings,
      topics: recentTopics,
      posts: recentPosts
    };

  } catch (error) {
    console.error('Error en getRecentActivity:', error);
    return {
      users: [],
      ratings: [],
      topics: [],
      posts: []
    };
  }
}

// Obtener géneros más populares desde el CDN
async function getTopGenresFromCDN() {
  try {
    const stats = getDataStats();
    if (!stats.isLoaded || !stats.animeData) {
      return [];
    }

    const genreCount = {};
    stats.animeData.forEach(anime => {
      if (anime.genres) {
        anime.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    return Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([genre, count]) => ({ genre, count }));
  } catch (error) {
    console.error('Error obteniendo géneros populares:', error);
    return [];
  }
}

// Obtener usuarios con más actividad
export async function getTopUsers(req, res) {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const supabase = getSupabaseClient();

    // Obtener usuarios de Supabase
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, role, created_at, last_login');
    
    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
      return res.status(500).json({ error: 'Error obteniendo usuarios' });
    }

    // Obtener estadísticas de actividad para cada usuario
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [ratingCount, favoriteCount, topicCount, postCount] = await Promise.all([
          Rating.countDocuments({ userId: user.id }),
          Favorite.countDocuments({ userId: user.id }),
          ForumTopic.countDocuments({ user: user.id }),
          ForumPost.countDocuments({ user: user.id })
        ]);

        return {
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          ratingCount,
          favoriteCount,
          topicCount,
          postCount,
          totalActivity: ratingCount + favoriteCount + topicCount + postCount
        };
      })
    );

    // Ordenar por actividad total y tomar los top 10
    const topUsers = usersWithStats
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, 10);

    res.json({
      success: true,
      data: topUsers
    });

  } catch (error) {
    console.error('Error obteniendo usuarios top:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 