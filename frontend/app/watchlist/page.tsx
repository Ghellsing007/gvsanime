"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Bookmark, Search, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useWatchlist } from "@/hooks/useWatchlist"
import { useToast } from "@/hooks/use-toast"
import AnimeCard from "@/components/anime-card"
import CDNLoading from "@/components/cdn-loading"
import api from "@/lib/api"
import Link from "next/link"

interface WatchlistItem {
  _id: string
  userId: string
  animeId: string
  title: string
  image: string
  createdAt: string
  anime?: {
    mal_id: number
    title: string
    images: any
    score: number
    episodes: number
    genres: Array<{mal_id: number, name: string}>
    year: number
    season: string
  }
}

export default function WatchlistPage() {
  const { user, isAuthenticated } = useAuth()
  const { watchlist, loading, error, removeFromWatchlist } = useWatchlist()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [animeDetails, setAnimeDetails] = useState<{[key: string]: any}>({})
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Cargar detalles de los animes en watchlist
  const loadAnimeDetails = async () => {
    if (watchlist.length === 0) return

    try {
      setLoadingDetails(true)
      const promises = watchlist.map(async (item) => {
        try {
          const response = await api.get(`/anime/${item.animeId}`)
          return { [item.animeId]: response.data }
        } catch (error) {
          console.error(`Error loading anime ${item.animeId}:`, error)
          return { [item.animeId]: null }
        }
      })

      const results = await Promise.all(promises)
      const details = results.reduce((acc, result) => ({ ...acc, ...result }), {})
      setAnimeDetails(details)
    } catch (error) {
      console.error('Error loading anime details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    if (watchlist.length > 0) {
      loadAnimeDetails()
    }
  }, [watchlist])

  const handleRemoveFromWatchlist = async (animeId: string, title: string) => {
    try {
      await removeFromWatchlist(animeId)
      toast({
        title: "Removido de watchlist",
        description: `${title} fue removido de tu watchlist`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredWatchlist = watchlist.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acceso Requerido</h1>
          <p className="text-muted-foreground mb-4">
            Debes iniciar sesión para ver tu watchlist
          </p>
          <Button asChild>
            <Link href="/auth/login">
              Iniciar Sesión
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CDNLoading>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bookmark className="h-8 w-8 text-primary" />
              Mi Watchlist
            </h1>
            <p className="text-muted-foreground">
              {watchlist.length} anime{watchlist.length !== 1 ? 's' : ''} en tu lista de seguimiento
            </p>
          </div>
        </div>

        {/* Search */}
        {watchlist.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar en watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {watchlist.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Tu watchlist está vacía</h2>
              <p className="text-muted-foreground mb-4">
                Agrega animes a tu watchlist para verlos aquí
              </p>
              <Button asChild>
                <Link href="/explorar">
                  Explorar Animes
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredWatchlist.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No se encontraron animes que coincidan con tu búsqueda
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredWatchlist.map((item) => {
                  const anime = animeDetails[item.animeId]
                  
                  return (
                    <div key={item._id} className="relative group">
                      <AnimeCard
                        id={parseInt(item.animeId)}
                        title={item.title}
                        images={anime?.images}
                        score={anime?.score}
                        episodes={anime?.episodes}
                        genres={anime?.genres}
                        year={anime?.year}
                        season={anime?.season}
                      />
                      
                      {/* Botón de remover */}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        onClick={() => handleRemoveFromWatchlist(item.animeId, item.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Loading indicator for anime details */}
        {loadingDetails && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Cargando detalles...</span>
            </div>
          </div>
        )}
      </div>
    </CDNLoading>
  )
} 