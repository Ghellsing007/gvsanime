import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'

interface WatchlistItem {
  _id: string
  userId: string
  animeId: string
  title: string
  image: string
  createdAt: string
}

export function useWatchlist() {
  const { user, isAuthenticated } = useAuth()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar watchlist del usuario
  const loadWatchlist = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/watchlist')
      setWatchlist(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar watchlist')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Verificar si un anime está en watchlist
  const isInWatchlist = useCallback((animeId: string | number) => {
    return watchlist.some(item => item.animeId === animeId.toString())
  }, [watchlist])

  // Agregar a watchlist
  const addToWatchlist = useCallback(async (animeId: string | number, title: string, image: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('Debes iniciar sesión para agregar a watchlist')
    }

    try {
      setError(null)
      const response = await api.post('/watchlist', {
        animeId: animeId.toString(),
        title,
        image
      })
      
      setWatchlist(prev => [...prev, response.data])
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al agregar a watchlist'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isAuthenticated, user])

  // Remover de watchlist
  const removeFromWatchlist = useCallback(async (animeId: string | number) => {
    if (!isAuthenticated || !user) {
      throw new Error('Debes iniciar sesión para remover de watchlist')
    }

    try {
      setError(null)
      await api.delete(`/watchlist/${animeId}`)
      
      setWatchlist(prev => prev.filter(item => item.animeId !== animeId.toString()))
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al remover de watchlist'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isAuthenticated, user])

  // Toggle watchlist
  const toggleWatchlist = useCallback(async (animeId: string | number, title: string, image: string) => {
    if (isInWatchlist(animeId)) {
      await removeFromWatchlist(animeId)
    } else {
      await addToWatchlist(animeId, title, image)
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist])

  // Cargar watchlist al montar el componente
  useEffect(() => {
    loadWatchlist()
  }, [loadWatchlist])

  return {
    watchlist,
    loading,
    error,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    loadWatchlist
  }
} 