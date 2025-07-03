import User from "../models/User.js"
import Anime from "../models/Anime.js"
import ErrorResponse from "../utils/errorResponse.js"
import { asyncHandler } from "../middleware/asyncHandler.js"

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body)

  res.status(201).json({
    success: true,
    data: user,
  })
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404))
  }

  await user.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Add anime to favorites
// @route   POST /api/users/favorites/:animeId
// @access  Private
export const addToFavorites = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  const anime = await Anime.findById(req.params.animeId)

  if (!anime) {
    return next(new ErrorResponse(`Anime not found with id of ${req.params.animeId}`, 404))
  }

  // Check if already in favorites
  if (user.favorites.includes(req.params.animeId)) {
    return next(new ErrorResponse("Anime already in favorites", 400))
  }

  // Add to favorites
  user.favorites.push(req.params.animeId)
  await user.save()

  res.status(200).json({
    success: true,
    data: user.favorites,
  })
})

// @desc    Remove anime from favorites
// @route   DELETE /api/users/favorites/:animeId
// @access  Private
export const removeFromFavorites = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  // Check if in favorites
  if (!user.favorites.includes(req.params.animeId)) {
    return next(new ErrorResponse("Anime not in favorites", 400))
  }

  // Remove from favorites
  user.favorites = user.favorites.filter((id) => id.toString() !== req.params.animeId)
  await user.save()

  res.status(200).json({
    success: true,
    data: user.favorites,
  })
})

// @desc    Add anime to watchlist
// @route   POST /api/users/watchlist/:animeId
// @access  Private
export const addToWatchlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  const anime = await Anime.findById(req.params.animeId)

  if (!anime) {
    return next(new ErrorResponse(`Anime not found with id of ${req.params.animeId}`, 404))
  }

  // Check if already in watchlist
  if (user.watchlist.includes(req.params.animeId)) {
    return next(new ErrorResponse("Anime already in watchlist", 400))
  }

  // Add to watchlist
  user.watchlist.push(req.params.animeId)
  await user.save()

  res.status(200).json({
    success: true,
    data: user.watchlist,
  })
})

// @desc    Remove anime from watchlist
// @route   DELETE /api/users/watchlist/:animeId
// @access  Private
export const removeFromWatchlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  // Check if in watchlist
  if (!user.watchlist.includes(req.params.animeId)) {
    return next(new ErrorResponse("Anime not in watchlist", 400))
  }

  // Remove from watchlist
  user.watchlist = user.watchlist.filter((id) => id.toString() !== req.params.animeId)
  await user.save()

  res.status(200).json({
    success: true,
    data: user.watchlist,
  })
})

// @desc    Add anime to watched
// @route   POST /api/users/watched/:animeId
// @access  Private
export const addToWatched = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  const anime = await Anime.findById(req.params.animeId)

  if (!anime) {
    return next(new ErrorResponse(`Anime not found with id of ${req.params.animeId}`, 404))
  }

  // Check if already in watched
  if (user.watched.includes(req.params.animeId)) {
    return next(new ErrorResponse("Anime already in watched list", 400))
  }

  // Add to watched
  user.watched.push(req.params.animeId)

  // Remove from watchlist if present
  if (user.watchlist.includes(req.params.animeId)) {
    user.watchlist = user.watchlist.filter((id) => id.toString() !== req.params.animeId)
  }

  await user.save()

  res.status(200).json({
    success: true,
    data: user.watched,
  })
})

// @desc    Remove anime from watched
// @route   DELETE /api/users/watched/:animeId
// @access  Private
export const removeFromWatched = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  // Check if in watched
  if (!user.watched.includes(req.params.animeId)) {
    return next(new ErrorResponse("Anime not in watched list", 400))
  }

  // Remove from watched
  user.watched = user.watched.filter((id) => id.toString() !== req.params.animeId)
  await user.save()

  res.status(200).json({
    success: true,
    data: user.watched,
  })
})

// @desc    Rate anime
// @route   POST /api/users/rate/:animeId
// @access  Private
export const rateAnime = asyncHandler(async (req, res, next) => {
  const { score } = req.body

  if (!score || score < 1 || score > 10) {
    return next(new ErrorResponse("Please provide a valid score between 1 and 10", 400))
  }

  const user = await User.findById(req.user.id)
  const anime = await Anime.findById(req.params.animeId)

  if (!anime) {
    return next(new ErrorResponse(`Anime not found with id of ${req.params.animeId}`, 404))
  }

  // Check if already rated
  const ratingIndex = user.ratings.findIndex((rating) => rating.anime.toString() === req.params.animeId)

  if (ratingIndex !== -1) {
    // Update existing rating
    user.ratings[ratingIndex].score = score
  } else {
    // Add new rating
    user.ratings.push({
      anime: req.params.animeId,
      score,
    })
  }

  await user.save()

  res.status(200).json({
    success: true,
    data: user.ratings,
  })
})

