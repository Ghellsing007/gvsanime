import express from "express"
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  createPost,
  updatePost,
  deletePost,
  likePost,
} from "../controllers/forumController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.get("/categories", getCategories)
router.get("/categories/:id", getCategory)
router.get("/topics/:id", getTopic)

// Protected routes
router.use(protect)

// Admin only routes
router.route("/categories").post(authorize("admin"), createCategory)

router.route("/categories/:id").put(authorize("admin"), updateCategory).delete(authorize("admin"), deleteCategory)

// User routes
router.post("/categories/:categoryId/topics", createTopic)
router.post("/topics/:topicId/posts", createPost)

router.route("/topics/:id").put(updateTopic).delete(deleteTopic)

router.route("/posts/:id").put(updatePost).delete(deletePost)

router.put("/posts/:id/like", likePost)

export default router

