"use client"

import { motion } from "framer-motion"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

// Mock data
const featuredAnimeData = [
  {
    id: 1,
    title: "Demon Slayer: Kimetsu no Yaiba",
    image: "/placeholder.svg?height=400&width=600",
    score: 8.9,
    episodes: 26,
    genres: ["Action", "Fantasy", "Historical"],
    year: 2019,
    season: "Spring",
  },
  {
    id: 2,
    title: "Attack on Titan: The Final Season",
    image: "/placeholder.svg?height=400&width=600",
    score: 9.1,
    episodes: 16,
    genres: ["Action", "Drama", "Fantasy"],
    year: 2020,
    season: "Winter",
  },
  {
    id: 3,
    title: "Jujutsu Kaisen",
    image: "/placeholder.svg?height=400&width=600",
    score: 8.7,
    episodes: 24,
    genres: ["Action", "Fantasy", "School"],
    year: 2020,
    season: "Fall",
  },
]

export default function FeaturedAnime() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Anime</h2>
        <Button variant="ghost" className="gap-1 text-muted-foreground">
          View All <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {featuredAnimeData.map((anime) => (
          <motion.div key={anime.id} variants={item}>
            <AnimeCard
              id={anime.id}
              title={anime.title}
              image={anime.image}
              score={anime.score}
              episodes={anime.episodes}
              genres={anime.genres}
              year={anime.year}
              season={anime.season}
              variant="featured"
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

