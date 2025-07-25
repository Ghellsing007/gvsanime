"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import api from "../lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { RetryButton } from "@/components/ui/retry-button"

export default function GenreShowcase() {
  const [genres, setGenres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchGenres = () => {
    setLoading(true)
    setError("")
    api.get('/anime/genres')
      .then(res => {
        const allGenres = res.data?.genres || []
        // Mostrar solo los primeros 8 géneros más populares
        const limitedGenres = allGenres
          .sort((a: any, b: any) => b.count - a.count) // Ordenar por popularidad
          .slice(0, 8) // Limitar a 8 géneros
        setGenres(limitedGenres)
      })
      .catch(() => setError("No se pudieron cargar los géneros"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGenres()
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
    <section className="mb-6 lg:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-7 w-20 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="group relative rounded-lg overflow-hidden">
            <Skeleton className="aspect-[16/9] w-full rounded-lg mb-2" />
            <div className="p-2 sm:p-4">
              <Skeleton className="h-5 w-2/3 mb-2 rounded" />
              <Skeleton className="h-4 w-1/2 mb-2 rounded" />
              <Skeleton className="h-4 w-1/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
  if (error) return (
    <section className="mb-6 lg:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Explora Géneros</h2>
        <Link href="/explorar/generos">
          <Button variant="ghost" className="gap-1 text-muted-foreground text-sm sm:text-base">
            Ver todos <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <RetryButton onRetry={fetchGenres} loading={loading}>
        {error}
      </RetryButton>
    </section>
  )

  return (
    <section className="mb-6 lg:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Explora Géneros</h2>
        <Link href="/explorar/generos">
          <Button variant="ghost" className="gap-1 text-muted-foreground text-sm sm:text-base">
            Ver todos <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {genres.map((genre, index) => (
          <motion.div key={genre.id || genre.mal_id} variants={item}>
            <Link href={`/explorar?genero=${encodeURIComponent(genre.name)}`}>
              <div className="group relative rounded-lg overflow-hidden">
                <div className="aspect-[16/9] relative">
                  <Image
                    src={genre.image || "/placeholder.jpg"}
                    alt={genre.name}
                    fill
                    priority={index === 0}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
                  <h3 className="text-base sm:text-xl font-bold mb-1">{genre.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    {genre.description || `Explora animes del género ${genre.name}`}
                  </p>
                  <div className="text-xs font-medium bg-primary/20 text-primary-foreground px-2 py-1 rounded-full inline-block">
                    {genre.count?.toLocaleString() || 0} anime
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

