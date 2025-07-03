import express from "express"
import { updateComment, deleteComment, likeComment } from "../controllers/commentController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.route("/:id").put(updateComment).delete(deleteComment)

router.put("/:id/like", likeComment)

export default router

