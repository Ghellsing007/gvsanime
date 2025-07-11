"use client"

import { motion } from "framer-motion"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { RetryButton } from "@/components/ui/retry-button"

import api from "../lib/api"

export default function FeaturedAnime() {
  const [animes, setAnimes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFeaturedAnime = async (retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/anime/featured')
      
      // Verificar si el backend está cargando datos del CDN
      if (res.status === 503 && res.data?.status === 'loading') {
        console.log('🔄 Backend cargando datos del CDN, reintentando en 3 segundos...')
        if (retryCount < 5) { // Máximo 5 reintentos
          setTimeout(() => {
            fetchFeaturedAnime(retryCount + 1)
          }, 3000)
          return
        } else {
          setError(new Error("El servidor está cargando datos. Por favor, espera unos minutos y recarga la página."))
          setLoading(false)
          return
        }
      }
      
      // Adaptar la respuesta del backend a la estructura esperada
      const results = res.data?.data || res.data?.results || [];
      setAnimes(results)
    } catch (err: any) {
      // Manejar errores específicos del CDN
      if (err.response?.status === 503) {
        const errorData = err.response.data
        if (errorData?.status === 'loading') {
          console.log('🔄 CDN cargando, reintentando...')
          if (retryCount < 5) {
            setTimeout(() => {
              fetchFeaturedAnime(retryCount + 1)
            }, errorData.retryAfter * 1000 || 3000)
            return
          } else {
            setError(new Error("El servidor está cargando datos del CDN. Por favor, espera unos minutos."))
          }
        } else if (errorData?.status === 'error') {
          setError(new Error("Error en el servidor: " + (errorData.message || "Error desconocido")))
        } else {
          setError(err)
        }
      } else {
        setError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeaturedAnime()
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="relative rounded-lg overflow-visible">
            <Skeleton className="aspect-video w-full rounded-lg mb-2" />
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
              <Skeleton className="h-7 w-2/3 mb-2 rounded" />
              <div className="flex gap-1 mb-2">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Skeleton className="h-4 w-12 sm:w-16 rounded" />
                <Skeleton className="h-4 w-12 sm:w-16 rounded" />
                <Skeleton className="h-4 w-12 sm:w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
  
  if (error) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Anime</h2>
        </div>
        <RetryButton onRetry={fetchFeaturedAnime} loading={loading}>
          Error al cargar animes destacados: {error.message}
        </RetryButton>
      </section>
    )
  }
  
  if (!animes || !animes.length) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Anime</h2>
        </div>
        <RetryButton onRetry={fetchFeaturedAnime} loading={loading}>
          No hay animes destacados disponibles
        </RetryButton>
      </section>
    )
  }

  return (
    <section className="mb-6 lg:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Featured Anime</h2>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
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

