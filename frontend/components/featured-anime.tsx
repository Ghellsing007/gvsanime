"use client"

import { motion } from "framer-motion"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import api from "../lib/api"

export default function FeaturedAnime() {
  const [animes, setAnimes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    api.get('/anime/search?featured=true')
      .then((res: any) => {
        // Adaptar la respuesta del backend a la estructura esperada
        const results = res.data?.data || res.data?.results || [];
        setAnimes(results)
      })
      .catch((err: any) => setError(err))
      .finally(() => setLoading(false))
  }, [])

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

  if (loading) return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative rounded-lg overflow-visible">
            <Skeleton className="aspect-video w-full rounded-lg mb-2" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Skeleton className="h-8 w-2/3 mb-2 rounded" />
              <div className="flex gap-1 mb-2">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
  if (error) return <div>Error: {error.message}</div>;
  if (!animes || !animes.length) return <div>No hay animes destacados.</div>;

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Anime</h2>
        {/* <Button variant="ghost" className="gap-1 text-muted-foreground">
          View All <ChevronRight className="h-4 w-4" />
        </Button> */}
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {animes.map((anime) => (
          <motion.div key={anime.mal_id || anime.id} variants={item}>
            <AnimeCard
              id={anime.mal_id || anime.id}
              title={anime.title}
              images={anime.images}
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

