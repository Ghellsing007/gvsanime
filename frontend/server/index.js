import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import dotenv from "dotenv"
import rateLimit from "express-rate-limit"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

// Import routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import animeRoutes from "./routes/anime.js"
import commentRoutes from "./routes/comments.js"
import forumRoutes from "./routes/forums.js"
import searchRoutes from "./routes/search.js"

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js"
import { notFound } from "./middleware/notFound.js"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression())
app.use(limiter)

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/anime", animeRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/forums", forumRoutes)
app.use("/api/search", searchRoutes)

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "../client/build")))

  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "../client/build", "index.html"))
  })
}

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app

