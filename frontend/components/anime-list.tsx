"use client"

import type React from "react"

import { useState, useEffect } from "react"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { RetryButton } from "@/components/ui/retry-button"
import api from "@/lib/api"
import { useSearchParams } from "next/navigation"
import AnimeSearchAutocomplete from "@/components/AnimeSearchAutocomplete"
import { motion } from "framer-motion"

interface Anime {
  mal_id: number
  title: string
  images: {
    jpg: {
      // snake_case (formato original de Jikan)
      image_url?: string
      small_image_url?: string
      large_image_url?: string
      // camelCase (formato normalizado por nuestro backend)
      imageUrl?: string
      smallImageUrl?: string
      largeImageUrl?: string
    }
    webp: {
      // snake_case (formato original de Jikan)
      image_url?: string
      small_image_url?: string
      large_image_url?: string
      // camelCase (formato normalizado por nuestro backend)
      imageUrl?: string
      smallImageUrl?: string
      largeImageUrl?: string
    }
  }
  score: number
  episodes: number
  genres: Array<{ name: string }>
  year: number
  season: string
}

interface AnimeListProps {
  initialPage?: number
  initialLimit?: number
}

export default function AnimeList({ initialPage = 1, initialLimit = 15 }: AnimeListProps) {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [totalAnimes, setTotalAnimes] = useState(0)
  const searchParams = useSearchParams()
  const genero = searchParams.get("genero")
  const season = searchParams.get("season")

  const fetchAnimes = async (pageNum: number, query = "", retryCount = 0) => {
    try {
      setLoading(true)
      const response = await api.get(
        `/anime?page=${pageNum}&limit=${initialLimit}${genero ? `&genre=${encodeURIComponent(genero)}` : ""}${season ? `&season=${encodeURIComponent(season)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`
      )
      
      // Verificar si el backend está cargando datos del CDN
      if (response.status === 503 && response.data?.status === 'loading') {
        console.log('🔄 Backend cargando datos del CDN, reintentando en 3 segundos...')
        if (retryCount < 5) { // Máximo 5 reintentos
          setTimeout(() => {
            fetchAnimes(pageNum, query, retryCount + 1)
          }, 3000)
          return
        } else {
          setError("El servidor está cargando datos. Por favor, espera unos minutos y recarga la página.")
          setLoading(false)
          setSearching(false)
          return
        }
      }
      
      const data = response.data
      setTotalAnimes(data.pagination.items.total)
      setTotalPages(data.pagination.last_visible_page || Math.ceil(data.pagination.items.total / initialLimit))
      setAnimes(data.data)
      setError("")
    } catch (err: any) {
      // Manejar errores específicos del CDN
      if (err.response?.status === 503) {
        const errorData = err.response.data
        if (errorData?.status === 'loading') {
          console.log('🔄 CDN cargando, reintentando...')
          if (retryCount < 5) {
            setTimeout(() => {
              fetchAnimes(pageNum, query, retryCount + 1)
            }, errorData.retryAfter * 1000 || 3000)
            return
          } else {
            setError("El servidor está cargando datos del CDN. Por favor, espera unos minutos.")
          }
        } else if (errorData?.status === 'error') {
          setError("Error en el servidor: " + (errorData.message || "Error desconocido"))
        } else {
          setError("Error al cargar los animes. Por favor, inténtalo de nuevo más tarde.")
        }
      } else {
        setError("Error al cargar los animes. Por favor, inténtalo de nuevo más tarde.")
      }
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  useEffect(() => {
    fetchAnimes(initialPage)
  }, [initialPage])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      fetchAnimes(newPage, searchQuery)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      fetchAnimes(newPage, searchQuery)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setCurrentPage(1)
    setAnimes([])
    fetchAnimes(1, searchQuery)
  }

  // Eliminar duplicados y nulos antes de renderizar
  const uniqueAnimes = Array.from(
    new Map(animes.filter(Boolean).map(a => [a.mal_id, a])).values()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto items-center">
          <AnimeSearchAutocomplete
            size="large"
            placeholder="Buscar anime..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
          <Button type="submit" disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Buscar
          </Button>
        </form>
      </div>

      {totalAnimes > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Mostrando página {currentPage} de {totalPages} ({totalAnimes} animes total)
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6">
          <RetryButton onRetry={() => fetchAnimes(currentPage, searchQuery)} loading={loading}>
            {error}
          </RetryButton>
        </div>
      )}

      {/* Cuadrícula de 3 filas × 5 columnas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {uniqueAnimes.map((anime, index) => (
          <motion.div
            key={anime.mal_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AnimeCard
              id={anime.mal_id}
              title={anime.title}
              images={anime.images}
              score={anime.score}
              episodes={anime.episodes}
              genres={anime.genres.map((g) => g.name)}
              year={anime.year}
              season={anime.season}
              variant="compact"
            />
          </motion.div>
        ))}
      </div>

      {/* Navegación de páginas en la parte inferior */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || loading}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Página {currentPage} de {totalPages}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || loading}
            className="flex items-center gap-2"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}

