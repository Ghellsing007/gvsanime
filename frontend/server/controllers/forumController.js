import { ForumCategory, ForumTopic, ForumPost } from "../models/Forum.js"
import ErrorResponse from "../utils/errorResponse.js"
import { asyncHandler } from "../middleware/asyncHandler.js"

// @desc    Get all forum categories
// @route   GET /api/forums/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await ForumCategory.find().sort("order")

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  })
})

// @desc    Get single category with topics
// @route   GET /api/forums/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res, next) => {
  const category = await ForumCategory.findById(req.params.id)

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404))
  }

  // Get topics for this category
  const topics = await ForumTopic.find({ category: req.params.id })
    .populate({
      path: "user",
      select: "username avatar",
    })
    .populate({
      path: "lastReplyUser",
      select: "username avatar",
    })
    .sort({ isPinned: -1, lastReplyDate: -1 })

  // Get post count for each topic
  for (const topic of topics) {
    const postCount = await ForumPost.countDocuments({ topic: topic._id })
    topic._doc.postCount = postCount
  }

  res.status(200).json({
    success: true,
    data: {
      category,
      topics,
    },
  })
})

// @desc    Create forum category
// @route   POST /api/forums/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, slug, order } = req.body

  const category = await ForumCategory.create({
    name,
    description,
    slug,
    order: order || 0,
  })

  res.status(201).json({
    success: true,
    data: category,
  })
})

// @desc    Update forum category
// @route   PUT /api/forums/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await ForumCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: category,
  })
})

// @desc    Delete forum category
// @route   DELETE /api/forums/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await ForumCategory.findById(req.params.id)

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404))
  }

  // Check if there are topics in this category
  const topicCount = await ForumTopic.countDocuments({ category: req.params.id })

  if (topicCount > 0) {
    return next(new ErrorResponse(`Cannot delete category with existing topics`, 400))
  }

  await category.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Get single topic with posts
// @route   GET /api/forums/topics/:id
// @access  Public
export const getTopic = asyncHandler(async (req, res, next) => {
  const topic = await ForumTopic.findById(req.params.id)
    .populate({
      path: "user",
      select: "username avatar",
    })
    .populate({
      path: "category",
      select: "name slug",
    })

  if (!topic) {
    return next(new ErrorResponse(`Topic not found with id of ${req.params.id}`, 404))
  }

  // Increment view count
  topic.views += 1
  await topic.save()

  // Get posts for this topic
  const posts = await ForumPost.find({ topic: req.params.id })
    .populate({
      path: "user",
      select: "username avatar role",
    })
    .sort("createdAt")

  res.status(200).json({
    success: true,
    data: {
      topic,
      posts,
    },
  })
})

// @desc    Create forum topic
// @route   POST /api/forums/categories/:categoryId/topics
// @access  Private
export const createTopic = asyncHandler(async (req, res, next) => {
  const { title, content, tags } = req.body
  const { categoryId } = req.params

  // Check if category exists
  const category = await ForumCategory.findById(categoryId)

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${categoryId}`, 404))
  }

  // Create topic
  const topic = await ForumTopic.create({
    title,
    content,
    user: req.user.id,
    category: categoryId,
    tags: tags || [],
    lastReplyUser: req.user.id,
    lastReplyDate: Date.now(),
  })

  // Populate user and category
  await topic.populate([
    {
      path: "user",
      select: "username avatar",
    },
    {
      path: "category",
      select: "name slug",
    },
  ])

  res.status(201).json({
    success: true,
    data: topic,
  })
})

// @desc    Update forum topic
// @route   PUT /api/forums/topics/:id
// @access  Private
export const updateTopic = asyncHandler(async (req, res, next) => {
  const { title, content, tags } = req.body

  const topic = await ForumTopic.findById(req.params.id)

  if (!topic) {
    return next(new ErrorResponse(`Topic not found with id of ${req.params.id}`, 404))
  }

  // Make sure user owns the topic or is admin
  if (topic.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`User not authorized to update this topic`, 401))
  }

  // Update topic
  topic.title = title || topic.title
  topic.content = content || topic.content
  topic.tags = tags || topic.tags

  await topic.save()

  // Populate user and category
  await topic.populate([
    {
      path: "user",
      select: "username avatar",
    },
    {
      path: "category",
      select: "name slug",
    },
  ])

  res.status(200).json({
    success: true,
    data: topic,
  })
})

// @desc    Delete forum topic
// @route   DELETE /api/forums/topics/:id
// @access  Private
export const deleteTopic = asyncHandler(async (req, res, next) => {
  const topic = await ForumTopic.findById(req.params.id)

  if (!topic) {
    return next(new ErrorResponse(`Topic not found with id of ${req.params.id}`, 404))
  }

  // Make sure user owns the topic or is admin
  if (topic.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`User not authorized to delete this topic`, 401))
  }

  // Delete all posts in this topic
  await ForumPost.deleteMany({ topic: req.params.id })

  // Delete the topic
  await topic.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Create forum post (reply to topic)
// @route   POST /api/forums/topics/:topicId/posts
// @access  Private
export const createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body
  const { topicId } = req.params

  // Check if topic exists and is not locked
  const topic = await ForumTopic.findById(topicId)

  if (!topic) {
    return next(new ErrorResponse(`Topic not found with id of ${topicId}`, 404))
  }

  if (topic.isLocked && req.user.role !== "admin" && req.user.role !== "moderator") {
    return next(new ErrorResponse(`Topic is locked`, 403))
  }

  // Create post
  const post = await ForumPost.create({
    content,
    user: req.user.id,
    topic: topicId,
  })

  // Update topic's last reply info
  topic.lastReplyUser = req.user.id
  topic.lastReplyDate = Date.now()
  await topic.save()

  // Populate user
  await post.populate({
    path: "user",
    select: "username avatar role",
  })

  res.status(201).json({
    success: true,
    data: post,
  })
})

// @desc    Update forum post
// @route   PUT /api/forums/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req, res, next) => {
  const { content } = req.body

  const post = await ForumPost.findById(req.params.id)

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404))
  }

  // Make sure user owns the post or is admin
  if (post.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`User not authorized to update this post`, 401))
  }

  // Check if topic is locked
  const topic = await ForumTopic.findById(post.topic)
  if (topic.isLocked && req.user.role !== "admin" && req.user.role !== "moderator") {
    return next(new ErrorResponse(`Topic is locked`, 403))
  }

  // Update post
  post.content = content
  post.isEdited = true
  await post.save()

  // Populate user
  await post.populate({
    path: "user",
    select: "username avatar role",
  })

  res.status(200).json({
    success: true,
    data: post,
  })
})

// @desc    Delete forum post
// @route   DELETE /api/forums/posts/:id
// @access  Private
export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await ForumPost.findById(req.params.id)

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404))
  }

  // Make sure user owns the post or is admin
  if (post.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`User not authorized to delete this post`, 401))
  }

  // Check if topic is locked
  const topic = await ForumTopic.findById(post.topic)
  if (topic.isLocked && req.user.role !== "admin" && req.user.role !== "moderator") {
    return next(new ErrorResponse(`Topic is locked`, 403))
  }

  await post.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Like forum post
// @route   PUT /api/forums/posts/:id/like
// @access  Private
export const likePost = asyncHandler(async (req, res, next) => {
  const post = await ForumPost.findById(req.params.id)

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404))
  }

  // Check if user already liked the post
  if (post.likes.includes(req.user.id)) {
    // Unlike
    post.likes = post.likes.filter((id) => id.toString() !== req.user.id)
  } else {
    // Like
    post.likes.push(req.user.id)
  }

  await post.save()

  res.status(200).json({
    success: true,
    data: {
      likes: post.likes.length,
      liked: post.likes.includes(req.user.id),
    },
  })
})

