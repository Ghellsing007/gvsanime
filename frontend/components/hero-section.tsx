"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Play, Info } from "lucide-react"
import api from "../lib/api"
import { getHeroImage, debugImageUrls } from "../lib/imageUtils"
import type { AnimeImages } from "../lib/types"
import { Slot } from "@radix-ui/react-slot"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { RetryButton } from "@/components/ui/retry-button"

type Anime = {
  mal_id?: number;
  id?: number;
  title: string;
  images?: AnimeImages;
  score?: number;
  rating?: number;
  genres?: Array<{mal_id: number, name: string}> | string[];
  synopsis?: string;
  description?: string;
  trailer?: {
    youtube_id?: string;
    youtubeId?: string;
    url: string;
    embed_url?: string;
    embedUrl?: string;
  };
};

export default function HeroSection() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const router = useRouter();

  const fetchAnimes = () => {
    setLoading(true)
    setError(null)
    api.get('/anime/search?featured=true')
      .then((res: any) => {
        // Adaptar la respuesta del backend a la estructura esperada
        const results = res.data?.data || res.data?.results || [];
        setAnimes(results)
      })
      .catch((err: any) => setError(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAnimes()
  }, [])

  useEffect(() => {
    if (!animes.length || showTrailer) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % animes.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [animes.length, showTrailer])

  if (loading) return (
    <section className="relative h-64 sm:h-80 lg:h-[500px] overflow-hidden rounded-lg lg:rounded-xl mb-6 lg:mb-12">
      <Skeleton className="absolute inset-0 w-full h-full rounded-lg lg:rounded-xl" />
      <div className="relative z-20 h-full flex flex-col justify-center px-3 sm:px-6 lg:px-12 max-w-full lg:max-w-3xl">
        <Skeleton className="h-8 w-2/3 mb-3 lg:h-12 lg:mb-4 rounded" />
        <div className="flex items-center mb-3 lg:mb-4 space-x-2">
          <Skeleton className="h-5 w-16 rounded lg:h-6" />
          <Skeleton className="h-5 w-16 rounded lg:h-6" />
          <Skeleton className="h-5 w-16 rounded lg:h-6" />
        </div>
        <Skeleton className="h-5 w-1/2 mb-4 lg:h-6 lg:mb-6 rounded" />
        <div className="flex space-x-3 lg:space-x-4">
          <Skeleton className="h-9 w-24 rounded lg:h-10 lg:w-32" />
          <Skeleton className="h-9 w-24 rounded lg:h-10 lg:w-32" />
        </div>
      </div>
      <div className="absolute bottom-3 lg:bottom-6 left-0 right-0 z-20 flex justify-center space-x-1 lg:space-x-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-4 h-2 rounded-full lg:w-6 lg:h-3" />
        ))}
      </div>
    </section>
  );
  if (error) return (
    <section className="relative h-64 sm:h-80 lg:h-[500px] overflow-hidden rounded-lg lg:rounded-xl mb-6 lg:mb-12">
      <RetryButton onRetry={fetchAnimes} loading={loading}>
        No se pudieron cargar los animes destacados
      </RetryButton>
    </section>
  );
  if (!animes.length) return (
    <section className="relative h-64 sm:h-80 lg:h-[500px] overflow-hidden rounded-lg lg:rounded-xl mb-6 lg:mb-12">
      <RetryButton onRetry={fetchAnimes} loading={loading}>
        No hay animes destacados disponibles
      </RetryButton>
    </section>
  );

  const anime = animes[currentSlide]

  return (
    <section className="relative h-64 sm:h-80 lg:h-[500px] overflow-hidden rounded-lg lg:rounded-xl mb-6 lg:mb-12">
      {/* Modal para el tráiler */}
      {showTrailer && (anime.trailer?.embed_url || anime.trailer?.embedUrl) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative w-full max-w-md lg:max-w-2xl p-2 sm:p-4">
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={() => setShowTrailer(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="aspect-w-16 aspect-h-9 w-full">
              <iframe
                src={anime.trailer.embed_url || anime.trailer.embedUrl}
                title={`${anime.title} trailer`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-48 sm:h-64 lg:h-96 rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-background/10 z-10" />

      <motion.div
        key={anime.mal_id || anime.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <Image src={getHeroImage(anime.images)} alt={anime.title} fill className="object-cover" priority />
      </motion.div>

      <div className="relative z-20 h-full flex flex-col justify-center px-3 sm:px-6 lg:px-12 max-w-full lg:max-w-3xl">
        <motion.div
          key={`text-${anime.mal_id || anime.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 lg:mb-4">{anime.title}</h1>
          <div className="flex flex-wrap items-center mb-3 lg:mb-4 space-x-2">
            <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs sm:text-sm font-medium">
              {anime.score || anime.rating} ★
            </div>
            {anime.genres?.map((genre, index) => {
              const genreName = typeof genre === 'string' ? genre : genre.name;
              const genreKey = typeof genre === 'string' ? `${genre}-${index}` : genre.mal_id;
              return (
                <div key={genreKey} className="bg-background/50 backdrop-blur-sm px-2 py-1 rounded text-xs sm:text-sm">
                  {genreName}
                </div>
              );
            })}
          </div>
          <p className="text-sm sm:text-base lg:text-lg mb-4 lg:mb-6 max-w-full lg:max-w-2xl line-clamp-4 lg:line-clamp-5">{anime.synopsis || anime.description}</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setShowTrailer(true)}
              disabled={!(anime.trailer?.embed_url || anime.trailer?.embedUrl)}
            >
              <Play className="h-4 w-4" />
              Ver Tráiler
            </Button>
            <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => router.push(`/anime/${anime.mal_id || anime.id}`)} >
              <Info className="h-4 w-4" />
              Más Info
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-3 lg:bottom-6 left-0 right-0 z-20 flex justify-center space-x-1 lg:space-x-2">
        {animes.map((anime, index) => (
          <button
            key={`slide-${anime.mal_id || anime.id}-${index}`}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-2 rounded-full transition-all lg:w-6 lg:h-3 ${
              currentSlide === index ? "bg-primary w-6 lg:w-6" : "bg-background/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

