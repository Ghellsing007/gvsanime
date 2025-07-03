import express from "express"
import {
  getAnime,
  getAnimeById,
  getTopAnime,
  getAnimeBySeason,
  getAnimeByGenre,
  getRecentAnime,
  getRecommendations,
} from "../controllers/animeController.js"
import { getComments, addComment } from "../controllers/commentController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.get("/", getAnime)
router.get("/top", getTopAnime)
router.get("/season/:year/:season", getAnimeBySeason)
router.get("/genre/:genre", getAnimeByGenre)
router.get("/recent", getRecentAnime)
router.get("/:id", getAnimeById)
router.get("/:animeId/comments", getComments)

// Protected routes
router.use(protect)
router.get("/recommendations", getRecommendations)
router.post("/:animeId/comments", addComment)

export default router

