import mongoose from "mongoose"

const AnimeSchema = new mongoose.Schema(
  {
    malId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleEnglish: {
      type: String,
      trim: true,
    },
    titleJapanese: {
      type: String,
      trim: true,
    },
    titleSynonyms: [String],
    type: {
      type: String,
      enum: ["TV", "Movie", "OVA", "Special", "ONA", "Music"],
      required: true,
    },
    source: {
      type: String,
      default: "Unknown",
    },
    episodes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Airing", "Finished Airing", "Not yet aired"],
      default: "Not yet aired",
    },
    airing: {
      type: Boolean,
      default: false,
    },
    aired: {
      from: Date,
      to: Date,
      string: String,
    },
    duration: {
      type: String,
      default: "Unknown",
    },
    rating: {
      type: String,
      default: "Unknown",
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    scoredBy: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    members: {
      type: Number,
      default: 0,
    },
    favorites: {
      type: Number,
      default: 0,
    },
    synopsis: {
      type: String,
      default: "No synopsis available.",
    },
    background: {
      type: String,
      default: "",
    },
    season: {
      type: String,
      enum: ["Winter", "Spring", "Summer", "Fall", ""],
      default: "",
    },
    year: {
      type: Number,
      default: null,
    },
    broadcast: {
      day: String,
      time: String,
      timezone: String,
      string: String,
    },
    producers: [
      {
        type: String,
      },
    ],
    licensors: [
      {
        type: String,
      },
    ],
    studios: [
      {
        type: String,
      },
    ],
    genres: [
      {
        type: String,
      },
    ],
    themes: [
      {
        type: String,
      },
    ],
    demographics: [
      {
        type: String,
      },
    ],
    images: {
      jpg: {
        imageUrl: String,
        smallImageUrl: String,
        largeImageUrl: String,
      },
      webp: {
        imageUrl: String,
        smallImageUrl: String,
        largeImageUrl: String,
      },
    },
    trailer: {
      youtubeId: String,
      url: String,
      embedUrl: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Create index for search functionality
AnimeSchema.index({
  title: "text",
  titleEnglish: "text",
  titleJapanese: "text",
  synopsis: "text",
  genres: "text",
})

const Anime = mongoose.model("Anime", AnimeSchema)

export default Anime

