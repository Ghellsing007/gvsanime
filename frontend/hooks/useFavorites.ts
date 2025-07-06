import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'

interface Favorite {
  _id: string
  userId: string
  animeId: string
  title: string
  image: string
  createdAt: string
}

export function useFavorites() {
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar favoritos del usuario
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/favorites')
      setFavorites(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar favoritos')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Verificar si un anime está en favoritos
  const isFavorite = useCallback((animeId: string | number) => {
    return favorites.some(fav => fav.animeId === animeId.toString())
  }, [favorites])

  // Agregar a favoritos
  const addToFavorites = useCallback(async (animeId: string | number, title: string, image: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('Debes iniciar sesión para agregar favoritos')
    }

    try {
      setError(null)
      const response = await api.post('/favorites', {
        animeId: animeId.toString(),
        title,
        image
      })
      
      setFavorites(prev => [...prev, response.data])
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al agregar a favoritos'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isAuthenticated, user])

  // Remover de favoritos
  const removeFromFavorites = useCallback(async (animeId: string | number) => {
    if (!isAuthenticated || !user) {
      throw new Error('Debes iniciar sesión para remover favoritos')
    }

    try {
      setError(null)
      await api.delete(`/favorites/${animeId}`)
      
      setFavorites(prev => prev.filter(fav => fav.animeId !== animeId.toString()))
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al remover de favoritos'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isAuthenticated, user])

  // Toggle favorito
  const toggleFavorite = useCallback(async (animeId: string | number, title: string, image: string) => {
    if (isFavorite(animeId)) {
      await removeFromFavorites(animeId)
    } else {
      await addToFavorites(animeId, title, image)
    }
  }, [isFavorite, addToFavorites, removeFromFavorites])

  // Cargar favoritos al montar el componente
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  return {
    favorites,
    loading,
    error,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    loadFavorites
  }
} 