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

type Anime = {
  mal_id: number;
  title: string;
  images?: AnimeImages;
  score?: number;
  rating?: number;
  genres?: Array<{mal_id: number, name: string}>;
  synopsis?: string;
  description?: string;
  trailer?: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
};

export default function HeroSection() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const router = useRouter();

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

  useEffect(() => {
    if (!animes.length || showTrailer) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % animes.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [animes.length, showTrailer])

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!animes.length) return <div>No hay animes destacados.</div>;

  const anime = animes[currentSlide]

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden rounded-xl mb-12">
      {/* Modal para el tráiler */}
      {showTrailer && anime.trailer?.embed_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative w-full max-w-2xl p-4">
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={() => setShowTrailer(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="aspect-w-16 aspect-h-9 w-full">
              <iframe
                src={anime.trailer.embed_url}
                title={`${anime.title} trailer`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-96 rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-background/20 z-10" />

      <motion.div
        key={anime.mal_id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <Image src={getHeroImage(anime.images)} alt={anime.title} fill className="object-cover" priority />
      </motion.div>

      <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-12 max-w-3xl">
        <motion.div
          key={`text-${anime.mal_id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{anime.title}</h1>
          <div className="flex items-center mb-4 space-x-2">
            <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm font-medium">
              {anime.score || anime.rating} ★
            </div>
            {anime.genres?.map((genre) => (
              <div key={genre.mal_id} className="bg-background/50 backdrop-blur-sm px-2 py-1 rounded text-sm">
                {genre.name}
              </div>
            ))}
          </div>
          <p className="text-lg mb-6 max-w-2xl"></p>
          <div className="flex space-x-4">
            <Button 
              className="gap-2" 
              onClick={() => setShowTrailer(true)}
              disabled={!anime.trailer?.embed_url}
            >
              <Play className="h-4 w-4" />
              Ver Tráiler
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => router.push(`/anime/${anime.mal_id}`)} >
              <Info className="h-4 w-4" />
              More Info
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
        {animes.map((anime, index) => (
          <button
            key={`slide-${anime.mal_id}-${index}`}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index ? "bg-primary w-6" : "bg-background/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

