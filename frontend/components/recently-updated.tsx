"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock data
const recentlyUpdatedData = [
  {
    id: 19,
    title: "One Piece",
    image: "/placeholder.svg?height=400&width=300",
    score: 8.7,
    episodes: 1000,
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    year: 1999,
  },
  {
    id: 20,
    title: "Boruto: Naruto Next Generations",
    image: "/placeholder.svg?height=400&width=300",
    score: 7.1,
    episodes: 220,
    genres: ["Action", "Adventure", "Martial Arts", "Shounen"],
    year: 2017,
  },
  {
    id: 21,
    title: "Dragon Ball Super",
    image: "/placeholder.svg?height=400&width=300",
    score: 7.4,
    episodes: 131,
    genres: ["Action", "Adventure", "Fantasy", "Martial Arts"],
    year: 2015,
  },
  {
    id: 22,
    title: "Detective Conan",
    image: "/placeholder.svg?height=400&width=300",
    score: 8.2,
    episodes: 1000,
    genres: ["Adventure", "Comedy", "Mystery", "Police", "Shounen"],
    year: 1996,
  },
  {
    id: 23,
    title: "Black Clover",
    image: "/placeholder.svg?height=400&width=300",
    score: 7.9,
    episodes: 170,
    genres: ["Action", "Comedy", "Fantasy", "Magic", "Shounen"],
    year: 2017,
  },
  {
    id: 24,
    title: "My Hero Academia",
    image: "/placeholder.svg?height=400&width=300",
    score: 8.3,
    episodes: 113,
    genres: ["Action", "Comedy", "School", "Shounen", "Super Power"],
    year: 2016,
  },
  {
    id: 25,
    title: "Jujutsu Kaisen",
    image: "/placeholder.svg?height=400&width=300",
    score: 8.7,
    episodes: 24,
    genres: ["Action", "Demons", "Horror", "School", "Shounen", "Supernatural"],
    year: 2020,
  },
  {
    id: 26,
    title: "Tokyo Revengers",
    image: "/placeholder.svg?height=400&width=300",
    score: 8.1,
    episodes: 24,
    genres: ["Action", "Drama", "School", "Shounen", "Time Travel"],
    year: 2021,
  },
]

export default function RecentlyUpdated() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Recently Updated</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={scrollLeft}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={scrollRight}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {recentlyUpdatedData.map((anime, index) => (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="min-w-[200px] md:min-w-[220px]"
          >
            <AnimeCard
              id={anime.id}
              title={anime.title}
              image={anime.image}
              score={anime.score}
              episodes={anime.episodes}
              genres={anime.genres}
              year={anime.year}
              variant="compact"
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

