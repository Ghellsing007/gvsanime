"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import api from "../lib/api"
import { Skeleton } from "@/components/ui/skeleton"

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

  if (loading) return (
    <section className="mb-6 lg:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
        <Skeleton className="h-7 w-40 rounded" />
        <div className="flex items-center gap-1 sm:gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-3 sm:pb-4 scrollbar-hide">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="min-w-[160px] sm:min-w-[200px]">
            <Skeleton className="aspect-[3/4] w-full rounded-md mb-2" />
            <Skeleton className="h-5 w-3/4 mb-1 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <section className="mb-6 lg:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Recently Updated</h2>
        <div className="flex items-center gap-1 sm:gap-2">
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
        className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-3 sm:pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {animes.map((anime, index) => (
          <motion.div
            key={anime.mal_id || anime.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="min-w-[160px] sm:min-w-[200px]"
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

