import fetch from "node-fetch"
import Anime from "../models/Anime.js"

const JIKAN_BASE_URL = "https://api.jikan.moe/v4"
const RATE_LIMIT_DELAY = 1000 // 1 second delay between requests to respect rate limits

// Helper function to add delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Fetch data from Jikan API
export const fetchFromJikan = async (endpoint) => {
  try {
    const response = await fetch(`${JIKAN_BASE_URL}${endpoint}`)

    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Add delay to respect rate limits
    await delay(RATE_LIMIT_DELAY)

    return data
  } catch (error) {
    console.error("Error fetching from Jikan API:", error)
    throw error
  }
}

// Update or create anime in database from Jikan data
export const updateAnimeInDatabase = async (animeData) => {
  try {
    // Check if anime already exists
    let anime = await Anime.findOne({ malId: animeData.mal_id })

    if (anime) {
      // Update existing anime
      anime.title = animeData.title
      anime.titleEnglish = animeData.title_english
      anime.titleJapanese = animeData.title_japanese
      anime.titleSynonyms = animeData.title_synonyms
      anime.type = animeData.type
      anime.source = animeData.source
      anime.episodes = animeData.episodes
      anime.status = animeData.status
      anime.airing = animeData.airing
      anime.aired = {
        from: animeData.aired.from,
        to: animeData.aired.to,
        string: animeData.aired.string,
      }
      anime.duration = animeData.duration
      anime.rating = animeData.rating
      anime.score = animeData.score
      anime.scoredBy = animeData.scored_by
      anime.rank = animeData.rank
      anime.popularity = animeData.popularity
      anime.members = animeData.members
      anime.favorites = animeData.favorites
      anime.synopsis = animeData.synopsis
      anime.background = animeData.background
      anime.season = animeData.season
      anime.year = animeData.year
      anime.broadcast = animeData.broadcast
      anime.producers = animeData.producers?.map((p) => p.name) || []
      anime.licensors = animeData.licensors?.map((l) => l.name) || []
      anime.studios = animeData.studios?.map((s) => s.name) || []
      anime.genres = animeData.genres?.map((g) => g.name) || []
      anime.themes = animeData.themes?.map((t) => t.name) || []
      anime.demographics = animeData.demographics?.map((d) => d.name) || []
      anime.images = {
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
      }
      anime.trailer = {
        youtubeId: animeData.trailer.youtube_id,
        url: animeData.trailer.url,
        embedUrl: animeData.trailer.embed_url,
      }
      anime.lastUpdated = Date.now()

      await anime.save()
    } else {
      // Create new anime
      anime = new Anime({
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

      await anime.save()
    }

    return anime
  } catch (error) {
    console.error("Error updating anime in database:", error)
    throw error
  }
}

