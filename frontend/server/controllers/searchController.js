import Anime from "../models/Anime.js"
import { ForumTopic } from "../models/Forum.js"
import { asyncHandler } from "../middleware/asyncHandler.js"
import { fetchFromJikan } from "../services/jikanService.js"

// @desc    Search anime
// @route   GET /api/search/anime
// @access  Public
export const searchAnime = asyncHandler(async (req, res, next) => {
  const { q, genre, year, season, type, status, sort, page = 1, limit = 20 } = req.query

  // Build query
  const query = {}

  // Text search
  if (q) {
    query.$text = { $search: q }
  }

  // Filter by genre
  if (genre) {
    query.genres = { $regex: new RegExp(genre, "i") }
  }

  // Filter by year
  if (year) {
    query.year = Number.parseInt(year, 10)
  }

  // Filter by season
  if (season) {
    query.season = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()
  }

  // Filter by type
  if (type) {
    query.type = type.toUpperCase()
  }

  // Filter by status
  if (status) {
    query.status = status
  }

  // Pagination
  const pageNum = Number.parseInt(page, 10)
  const limitNum = Number.parseInt(limit, 10)
  const skip = (pageNum - 1) * limitNum

  // Sort options
  let sortOption = {}

  switch (sort) {
    case "score":
      sortOption = { score: -1 }
      break
    case "popularity":
      sortOption = { popularity: -1 }
      break
    case "newest":
      sortOption = { "aired.from": -1 }
      break
    case "oldest":
      sortOption = { "aired.from": 1 }
      break
    default:
      sortOption = { score: -1 }
  }

  // Execute query
  let anime = await Anime.find(query).sort(sortOption).skip(skip).limit(limitNum)

  // If no results or very few results, try to fetch from Jikan API
  if (anime.length < 5 && q) {
    try {
      const jikanData = await fetchFromJikan(`/anime?q=${encodeURIComponent(q)}&page=1`)

      if (jikanData && jikanData.data && jikanData.data.length > 0) {
        // Process and save Jikan data
        const processPromises = jikanData.data.map(async (animeData) => {
          // Check if anime already exists in our database
          const existingAnime = await Anime.findOne({ malId: animeData.mal_id })

          if (!existingAnime) {
            // Map Jikan data to our schema
            const newAnime = new Anime({
              malId: animeData.mal_id,
              title: animeData.title,
              titleEnglish: animeData.title_english,
              titleJapanese: animeData.title_japanese,
              titleSynonyms: animeData.title_synonyms,
              type: animeData.type,
              source: animeData.source,
              episodes: animeData.episodes,
              status: animeData.status,
              airing: animeData.airing,
              aired: {
                from: animeData.aired.from,
                to: animeData.aired.to,
                string: animeData.aired.string,
              },
              duration: animeData.duration,
              rating: animeData.rating,
              score: animeData.score,
              scoredBy: animeData.scored_by,
              rank: animeData.rank,
              popularity: animeData.popularity,
              members: animeData.members,
              favorites: animeData.favorites,
              synopsis: animeData.synopsis,
              background: animeData.background,
              season: animeData.season,
              year: animeData.year,
              broadcast: animeData.broadcast,
              producers: animeData.producers?.map((p) => p.name) || [],
              licensors: animeData.licensors?.map((l) => l.name) || [],
              studios: animeData.studios?.map((s) => s.name) || [],
              genres: animeData.genres?.map((g) => g.name) || [],
              themes: animeData.themes?.map((t) => t.name) || [],
              demographics: animeData.demographics?.map((d) => d.name) || [],
              images: {
                jpg: {
                  imageUrl: animeData.images.jpg.image_url,
                  smallImageUrl: animeData.images.jpg.small_image_url,
                  largeImageUrl: animeData.images.jpg.large_image_url,
                },
                webp: {
                  imageUrl: animeData.images.webp.image_url,
                  smallImageUrl: animeData.images.webp.small_image_url,
                  largeImageUrl: animeData.images.webp.large_image_url,
                },
              },
              trailer: {
                youtubeId: animeData.trailer.youtube_id,
                url: animeData.trailer.url,
                embedUrl: animeData.trailer.embed_url,
              },
            })

            await newAnime.save()
            return newAnime
          }

          return existingAnime
        })

        await Promise.all(processPromises)

        // Re-run the search query to include new data
        anime = await Anime.find(query).sort(sortOption).skip(skip).limit(limitNum)
      }
    } catch (err) {
      console.error("Error fetching from Jikan API:", err)
      // Continue with whatever we have in the database
    }
  }

  // Get total count for pagination
  const total = await Anime.countDocuments(query)

  // Pagination result
  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
  }

  res.status(200).json({
    success: true,
    count: anime.length,
    pagination,
    data: anime,
  })
})

// @desc    Search forums
// @route   GET /api/search/forums
// @access  Public
export const searchForums = asyncHandler(async (req, res, next) => {
  const { q, category, page = 1, limit = 20 } = req.query

  // Build query
  const query = {}

  // Text search
  if (q) {
    query.$text = { $search: q }
  }

  // Filter by category
  if (category) {
    query.category = category
  }

  // Pagination
  const pageNum = Number.parseInt(page, 10)
  const limitNum = Number.parseInt(limit, 10)
  const skip = (pageNum - 1) * limitNum

  // Execute query
  const topics = await ForumTopic.find(query)
    .populate({
      path: "user",
      select: "username avatar",
    })
    .populate({
      path: "category",
      select: "name slug",
    })
    .populate({
      path: "lastReplyUser",
      select: "username avatar",
    })
    .sort({ lastReplyDate: -1 })
    .skip(skip)
    .limit(limitNum)

  // Get total count for pagination
  const total = await ForumTopic.countDocuments(query)

  // Pagination result
  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
  }

  res.status(200).json({
    success: true,
    count: topics.length,
    pagination,
    data: topics,
  })
})

