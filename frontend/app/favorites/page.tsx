"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Heart, Search, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useFavorites } from "@/hooks/useFavorites"
import { useToast } from "@/hooks/use-toast"
import AnimeCard from "@/components/anime-card"
import api from "@/lib/api"
import Link from "next/link"

interface FavoriteAnime {
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

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth()
  const { favorites, loading, error, removeFromFavorites } = useFavorites()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [animeDetails, setAnimeDetails] = useState<{[key: string]: any}>({})
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Cargar detalles de los animes favoritos
  const loadAnimeDetails = async () => {
    if (favorites.length === 0) return

    try {
      setLoadingDetails(true)
      const promises = favorites.map(async (favorite) => {
        try {
          const response = await api.get(`/anime/${favorite.animeId}`)
          return { [favorite.animeId]: response.data }
        } catch (error) {
          console.error(`Error loading anime ${favorite.animeId}:`, error)
          return { [favorite.animeId]: null }
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
    if (favorites.length > 0) {
      loadAnimeDetails()
    }
  }, [favorites])

  const handleRemoveFavorite = async (animeId: string, title: string) => {
    try {
      await removeFromFavorites(animeId)
      toast({
        title: "Removido de favoritos",
        description: `${title} fue removido de tus favoritos`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredFavorites = favorites.filter(favorite =>
    favorite.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acceso Requerido</h1>
          <p className="text-muted-foreground mb-4">
            Debes iniciar sesión para ver tus favoritos
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Mis Favoritos
          </h1>
          <p className="text-muted-foreground">
            {favorites.length} anime{favorites.length !== 1 ? 's' : ''} en tu lista de favoritos
          </p>
        </div>
      </div>

      {/* Search */}
      {favorites.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar en favoritos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {favorites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No tienes favoritos</h2>
            <p className="text-muted-foreground mb-4">
              Agrega animes a tus favoritos para verlos aquí
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
          {filteredFavorites.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No se encontraron favoritos que coincidan con tu búsqueda
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredFavorites.map((favorite) => {
                const anime = animeDetails[favorite.animeId]
                
                return (
                  <div key={favorite._id} className="relative group">
                    <AnimeCard
                      id={parseInt(favorite.animeId)}
                      title={favorite.title}
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
                      onClick={() => handleRemoveFavorite(favorite.animeId, favorite.title)}
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
  )
} 