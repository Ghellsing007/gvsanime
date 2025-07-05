"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import api from "../lib/api"

// Datos mock como fallback (ya no se usan, pero mantenemos por si acaso)

export default function RecentlyUpdated() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [animes, setAnimes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    api.get('/anime/search?sort=recent')
      .then((res: any) => {
        const results = res.data?.data || res.data?.results || [];
        setAnimes(results)
      })
      .catch((err: any) => setError(err))
      .finally(() => setLoading(false))
  }, [])

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

  if (loading) return <div>Cargando animes recientes...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
        {animes.map((anime, index) => (
          <motion.div
            key={anime.mal_id || anime.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="min-w-[200px] md:min-w-[220px]"
          >
            <AnimeCard
              id={anime.mal_id || anime.id}
              title={anime.title}
              images={anime.images}
              score={anime.score}
              episodes={anime.episodes}
              genres={anime.genres}
              year={anime.year}
              season={anime.season}
              variant="compact"
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

