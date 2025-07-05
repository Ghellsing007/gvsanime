"use client"

import { motion } from "framer-motion"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

import api from "../lib/api"
import type { AnimeImages } from "../lib/types"

export default function FeaturedAnime() {
  const [animes, setAnimes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    api.get('/anime/search?featured=true')
      .then((res: any) => setAnimes(res.data.results))
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

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!animes.length) return <div>No hay animes destacados.</div>;

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
        {animes.map((anime) => (
          <motion.div key={anime.id} variants={item}>
            <AnimeCard
              id={anime.id}
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

