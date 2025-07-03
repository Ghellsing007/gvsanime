import Comment from "../models/Comment.js"
import Anime from "../models/Anime.js"
import ErrorResponse from "../utils/errorResponse.js"
import { asyncHandler } from "../middleware/asyncHandler.js"

// @desc    Get comments for an anime
// @route   GET /api/anime/:animeId/comments
// @access  Public
export const getComments = asyncHandler(async (req, res, next) => {
  const { animeId } = req.params

  // Verify anime exists
  const anime = await Anime.findById(animeId)

  if (!anime) {
    return next(new ErrorResponse(`Anime not found with id of ${animeId}`, 404))
  }

  // Get only top-level comments (no parent)
  const comments = await Comment.find({
    anime: animeId,
    parent: null,
    isDeleted: false,
  })
    .populate({
      path: "user",
      select: "username avatar",
    })
    .populate({
      path: "replies",
      populate: {
        path: "user",
        select: "username avatar",
      },
    })
    .sort("-createdAt")

  res.status(200).json({
    success: true,
    count: comments.length,
    data: comments,
  })
})

// @desc    Add comment
// @route   POST /api/anime/:animeId/comments
// @access  Private
export const addComment = asyncHandler(async (req, res, next) => {
  const { animeId } = req.params
  const { content, parentId } = req.body

  // Verify anime exists
  const anime = await Anime.findById(animeId)

  if (!anime) {
    return next(new ErrorResponse(`Anime not found with id of ${animeId}`, 404))
  }

  // If parentId is provided, verify parent comment exists
  if (parentId) {
    const parentComment = await Comment.findById(parentId)

    if (!parentComment) {
      return next(new ErrorResponse(`Parent comment not found with id of ${parentId}`, 404))
    }

    // Ensure parent comment belongs to the same anime
    if (parentComment.anime.toString() !== animeId) {
      return next(new ErrorResponse(`Parent comment does not belong to this anime`, 400))
    }
  }

  // Create comment
  const comment = await Comment.create({
    content,
    user: req.user.id,
    anime: animeId,
    parent: parentId || null,
  })

  // Populate user data
  await comment.populate({
    path: "user",
    select: "username avatar",
  })

  res.status(201).json({
    success: true,
    data: comment,
  })
})

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body

  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404))
  }

  // Make sure user owns the comment
  if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`User not authorized to update this comment`, 401))
  }

  // Update comment
  comment.content = content
  comment.isEdited = true
  await comment.save()

  // Populate user data
  await comment.populate({
    path: "user",
    select: "username avatar",
  })

  res.status(200).json({
    success: true,
    data: comment,
  })
})

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404))
  }

  // Make sure user owns the comment
  if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`User not authorized to delete this comment`, 401))
  }

  // Soft delete - mark as deleted but keep in database
  comment.isDeleted = true
  comment.content = "[deleted]"
  await comment.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Like comment
// @route   PUT /api/comments/:id/like
// @access  Private
export const likeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404))
  }

  // Check if user already liked the comment
  if (comment.likes.includes(req.user.id)) {
    // Unlike
    comment.likes = comment.likes.filter((id) => id.toString() !== req.user.id)
  } else {
    // Like
    comment.likes.push(req.user.id)
  }

  await comment.save()

  res.status(200).json({
    success: true,
    data: {
      likes: comment.likes.length,
      liked: comment.likes.includes(req.user.id),
    },
  })
})

