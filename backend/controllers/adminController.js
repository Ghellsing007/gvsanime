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
  const [
    totalUsers,
    usersThisMonth,
    usersThisWeek,
    usersToday,
    usersByRole,
    activeUsers,
    verifiedUsers
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    User.countDocuments({ emailVerified: true })
  ]);

  return {
    total: totalUsers,
    thisMonth: usersThisMonth,
    thisWeek: usersThisWeek,
    today: usersToday,
    byRole: usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    active: activeUsers,
    verified: verifiedUsers,
    verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0
  };
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
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    newUsers24h,
    newUsers7d,
    newUsers30d,
    newRatings24h,
    newReviews24h,
    newTopics24h,
    newPosts24h,
    newFavorites24h
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: last24h } }),
    User.countDocuments({ createdAt: { $gte: last7d } }),
    User.countDocuments({ createdAt: { $gte: last30d } }),
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
  const [
    recentUsers,
    recentRatings,
    recentTopics,
    recentPosts
  ] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(5).select('username email role createdAt'),
    Rating.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'username'),
    ForumTopic.find().sort({ createdAt: -1 }).limit(5).populate('user', 'username'),
    ForumPost.find().sort({ createdAt: -1 }).limit(5).populate('user', 'username')
  ]);

  return {
    users: recentUsers,
    ratings: recentRatings,
    topics: recentTopics,
    posts: recentPosts
  };
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

    const topUsers = await User.aggregate([
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'userId',
          as: 'ratings'
        }
      },
      {
        $lookup: {
          from: 'favorites',
          localField: '_id',
          foreignField: 'userId',
          as: 'favorites'
        }
      },
      {
        $lookup: {
          from: 'forumtopics',
          localField: '_id',
          foreignField: 'user',
          as: 'topics'
        }
      },
      {
        $lookup: {
          from: 'forumposts',
          localField: '_id',
          foreignField: 'user',
          as: 'posts'
        }
      },
      {
        $project: {
          username: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          lastLogin: 1,
          ratingCount: { $size: '$ratings' },
          favoriteCount: { $size: '$favorites' },
          topicCount: { $size: '$topics' },
          postCount: { $size: '$posts' },
          totalActivity: {
            $add: [
              { $size: '$ratings' },
              { $size: '$favorites' },
              { $size: '$topics' },
              { $size: '$posts' }
            ]
          }
        }
      },
      { $sort: { totalActivity: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: topUsers
    });

  } catch (error) {
    console.error('Error obteniendo usuarios top:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 