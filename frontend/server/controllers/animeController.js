import Anime from "../models/Anime.js"
import ErrorResponse from "../utils/errorResponse.js"
import { asyncHandler } from "../middleware/asyncHandler.js"
import { fetchFromJikan, updateAnimeInDatabase } from "../services/jikanService.js"
import User from "../models/User.js" // Import User model

// @desc    Get all anime with pagination
// @route   GET /api/anime
// @access  Public
export const getAnime = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query }

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"]

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param])

  // Create query string
  let queryStr = JSON.stringify(reqQuery)

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

  // Finding resource
  let query = Anime.find(JSON.parse(queryStr))

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ")
    query = query.select(fields)
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ")
    query = query.sort(sortBy)
  } else {
    query = query.sort("-score")
  }

  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Anime.countDocuments(JSON.parse(queryStr))

  query = query.skip(startIndex).limit(limit)

  // Executing query
  const anime = await query

  // Pagination result
  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  res.status(200).json({
    success: true,
    count: anime.length,
    pagination,
    data: anime,
  })
})

// @desc    Get single anime
// @route   GET /api/anime/:id
// @access  Public
export const getAnimeById = asyncHandler(async (req, res, next) => {
  let anime = await Anime.findById(req.params.id)

  if (!anime) {
    // Try to find by malId
    anime = await Anime.findOne({ malId: req.params.id })

    if (!anime) {
      // If not found in database, try to fetch from Jikan API
      try {
        const jikanData = await fetchFromJikan(`/anime/${req.params.id}`)

        if (jikanData) {
          // Save to database
          anime = await updateAnimeInDatabase(jikanData)
        } else {
          return next(new ErrorResponse(`Anime not found with id of ${req.params.id}`, 404))
        }
      } catch (err) {
        return next(new ErrorResponse(`Anime not found with id of ${req.params.id}`, 404))
      }
    }
  }

  res.status(200).json({
    success: true,
    data: anime,
  })
})

// @desc    Get top anime
// @route   GET /api/anime/top
// @access  Public
export const getTopAnime = asyncHandler(async (req, res, next) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10

  const anime = await Anime.find().sort("-score").limit(limit)

  res.status(200).json({
    success: true,
    count: anime.length,
    data: anime,
  })
})

// @desc    Get anime by season
// @route   GET /api/anime/season/:year/:season
// @access  Public
export const getAnimeBySeason = asyncHandler(async (req, res, next) => {
  const { year, season } = req.params

  // Validate season
  const validSeasons = ["winter", "spring", "summer", "fall"]
  if (!validSeasons.includes(season.toLowerCase())) {
    return next(new ErrorResponse(`Invalid season: ${season}`, 400))
  }

  // Validate year
  const yearNum = Number.parseInt(year, 10)
  if (isNaN(yearNum) || yearNum < 1950 || yearNum > new Date().getFullYear() + 1) {
    return next(new ErrorResponse(`Invalid year: ${year}`, 400))
  }

  // Try to get from database first
  let animeList = await Anime.find({
    year: yearNum,
    season: season.charAt(0).toUpperCase() + season.slice(1).toLowerCase(),
  }).sort("-score")

  // If not enough results, fetch from Jikan API
  if (animeList.length < 10) {
    try {
      const jikanData = await fetchFromJikan(`/seasons/${year}/${season.toLowerCase()}`)

      if (jikanData && jikanData.data && jikanData.data.length > 0) {
        // Save all anime to database
        const savePromises = jikanData.data.map((animeData) => updateAnimeInDatabase(animeData))
        await Promise.all(savePromises)

        // Fetch updated list from database
        animeList = await Anime.find({
          year: yearNum,
          season: season.charAt(0).toUpperCase() + season.slice(1).toLowerCase(),
        }).sort("-score")
      }
    } catch (err) {
      console.error("Error fetching from Jikan API:", err)
      // Continue with whatever we have in the database
    }
  }

  res.status(200).json({
    success: true,
    count: animeList.length,
    data: animeList,
  })
})

// @desc    Get anime by genre
// @route   GET /api/anime/genre/:genre
// @access  Public
export const getAnimeByGenre = asyncHandler(async (req, res, next) => {
  const { genre } = req.params
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit

  // Find anime with the specified genre
  const animeList = await Anime.find({
    genres: { $regex: new RegExp(genre, "i") },
  })
    .sort("-score")
    .skip(startIndex)
    .limit(limit)

  const total = await Anime.countDocuments({
    genres: { $regex: new RegExp(genre, "i") },
  })

  // Pagination
  const pagination = {}

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  res.status(200).json({
    success: true,
    count: animeList.length,
    pagination,
    data: animeList,
  })
})

// @desc    Get recently updated anime
// @route   GET /api/anime/recent
// @access  Public
export const getRecentAnime = asyncHandler(async (req, res, next) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10

  const anime = await Anime.find().sort("-lastUpdated").limit(limit)

  res.status(200).json({
    success: true,
    count: anime.length,
    data: anime,
  })
})

// @desc    Get anime recommendations
// @route   GET /api/anime/recommendations
// @access  Private
export const getRecommendations = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const limit = Number.parseInt(req.query.limit, 10) || 10

  // Get user's favorite genres based on their favorites and watched anime
  const user = await User.findById(userId).populate("favorites").populate("watched")

  if (!user) {
    return next(new ErrorResponse("User not found", 404))
  }

  // Extract genres from user's favorites and watched anime
  const userAnime = [...user.favorites, ...user.watched]
  const genreCounts = {}

  userAnime.forEach((anime) => {
    if (anime.genres) {
      anime.genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1
      })
    }
  })

  // Sort genres by count
  const favoriteGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0])
    .slice(0, 3) // Top 3 genres

  // Get anime IDs that user has already watched or favorited
  const watchedIds = userAnime.map((anime) => anime._id.toString())

  // Find recommendations based on favorite genres
  let recommendations = []

  if (favoriteGenres.length > 0) {
    recommendations = await Anime.find({
      _id: { $nin: watchedIds },
      genres: { $in: favoriteGenres },
    })
      .sort("-score")
      .limit(limit)
  } else {
    // If no favorite genres, just return top anime that user hasn't watched
    recommendations = await Anime.find({
      _id: { $nin: watchedIds },
    })
      .sort("-score")
      .limit(limit)
  }

  res.status(200).json({
    success: true,
    count: recommendations.length,
    data: recommendations,
  })
})

