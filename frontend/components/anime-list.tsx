"use client"

import type React from "react"

import { useState, useEffect } from "react"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { RetryButton } from "@/components/ui/retry-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
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
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 10

  const fetchAnimes = async (pageNum: number, query = "", retryCountLocal = 0) => {
    try {
      setLoading(true)
      const response = await api.get(
        `/anime?page=${pageNum}&limit=${initialLimit}${genero ? `&genre=${encodeURIComponent(genero)}` : ""}${season ? `&season=${encodeURIComponent(season)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`
      )
      
      // Verificar si el backend está cargando datos del CDN
      if (response.status === 503 && response.data?.status === 'loading') {
        setError("Cargando datos del CDN... Por favor, espera unos segundos.")
        if (retryCountLocal < maxRetries) {
          setTimeout(() => {
            setRetryCount(retryCountLocal + 1)
            fetchAnimes(pageNum, query, retryCountLocal + 1)
          }, response.data.retryAfter * 1000 || 3000)
        }
        setLoading(false)
        setSearching(false)
        return
      }
      
      const data = response.data
      setTotalAnimes(data.pagination.items.total)
      setTotalPages(data.pagination.last_visible_page || Math.ceil(data.pagination.items.total / initialLimit))
      setAnimes(data.data)
      setError("")
      setRetryCount(0)
    } catch (err: any) {
      // Manejar errores específicos del CDN
      if (err.response?.status === 503) {
        const errorData = err.response.data
        if (errorData?.status === 'loading') {
          setError("Cargando datos del CDN... Por favor, espera unos segundos.")
          if (retryCountLocal < maxRetries) {
            setTimeout(() => {
              setRetryCount(retryCountLocal + 1)
              fetchAnimes(pageNum, query, retryCountLocal + 1)
            }, errorData.retryAfter * 1000 || 3000)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (error) return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">{error}</div>

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto items-center">
          <AnimeSearchAutocomplete
            size="large"
            placeholder="Buscar anime..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
          <Button type="submit" disabled={searching} className="w-full sm:w-auto">
            {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Buscar
          </Button>
        </form>
      </div>

      {totalAnimes > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
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
            <span className="text-xs sm:text-sm font-medium min-w-[48px] sm:min-w-[60px] text-center">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          <LoadingSpinner size="lg" text="Cargando animes..." />
        ) : (
          uniqueAnimes.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              id={anime.mal_id}
              title={anime.title}
              images={anime.images}
              score={anime.score}
              episodes={anime.episodes}
              genres={anime.genres}
              year={anime.year}
              season={anime.season}
            />
          ))
        )}
      </div>
    </div>
  )
}

