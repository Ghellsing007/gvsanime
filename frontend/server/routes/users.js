import express from "express"
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  addToFavorites,
  removeFromFavorites,
  addToWatchlist,
  removeFromWatchlist,
  addToWatched,
  removeFromWatched,
  rateAnime,
} from "../controllers/userController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Admin routes
router.use(protect)
router.use(authorize("admin"))

router.route("/").get(getUsers).post(createUser)

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser)

// User routes (no admin required)
router.use(protect)

router.route("/favorites/:animeId").post(addToFavorites).delete(removeFromFavorites)

router.route("/watchlist/:animeId").post(addToWatchlist).delete(removeFromWatchlist)

router.route("/watched/:animeId").post(addToWatched).delete(removeFromWatched)

router.route("/rate/:animeId").post(rateAnime)

export default router

