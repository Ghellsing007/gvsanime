"use client"

import type React from "react"

import { useState, useEffect } from "react"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"

interface Anime {
  mal_id: number
  title: string
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
      large_image_url: string
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

export default function AnimeList({ initialPage = 1, initialLimit = 12 }: AnimeListProps) {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [totalAnimes, setTotalAnimes] = useState(0)

  const fetchAnimes = async (pageNum: number, query = "") => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/anime?page=${pageNum}&limit=${initialLimit}${query ? `&q=${encodeURIComponent(query)}` : ""}`,
      )

      if (!response.ok) {
        throw new Error("Error al obtener datos")
      }

      const data = await response.json()

      setTotalAnimes(data.pagination.items.total)
      setHasMore(pageNum < data.pagination.last_visible_page)

      if (pageNum === 1) {
        setAnimes(data.data)
      } else {
        setAnimes((prev) => [...prev, ...data.data])
      }

      setError("")
    } catch (err) {
      setError("Error al cargar los animes. Por favor, inténtalo de nuevo más tarde.")
      console.error(err)
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  useEffect(() => {
    fetchAnimes(initialPage)
  }, [initialPage])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchAnimes(nextPage, searchQuery)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setPage(1)
    setAnimes([])
    fetchAnimes(1, searchQuery)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <Input
            type="search"
            placeholder="Buscar anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Buscar
          </Button>
        </form>
      </div>

      {totalAnimes > 0 && (
        <p className="text-center text-muted-foreground mb-6">
          Mostrando {animes.length} de {totalAnimes} resultados
        </p>
      )}

      {error && <p className="text-center text-red-500 mb-6">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {animes.map((anime) => (
          <AnimeCard
            key={anime.mal_id}
            id={anime.mal_id}
            title={anime.title}
            image={anime.images.jpg.image_url}
            score={anime.score}
            episodes={anime.episodes}
            genres={anime.genres.map((g) => g.name)}
            year={anime.year}
            season={anime.season}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} variant="outline" size="lg">
            Cargar más
          </Button>
        </div>
      )}
    </div>
  )
}

