import express from "express"
import { searchAnime, searchForums } from "../controllers/searchController.js"

const router = express.Router()

router.get("/anime", searchAnime)
router.get("/forums", searchForums)

export default router

