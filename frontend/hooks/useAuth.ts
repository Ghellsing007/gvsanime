import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface User {
  id: string
  username: string
  email: string
  role?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  })

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setAuthState({ user: null, loading: false, isAuthenticated: false })
        return
      }

      // Configurar el token en las cabeceras de la API
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      const response = await api.get('/auth/me')
      setAuthState({
        user: response.data,
        loading: false,
        isAuthenticated: true
      })
    } catch (error) {
      // Token inválido o expirado
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setAuthState({ user: null, loading: false, isAuthenticated: false })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token, user } = response.data
      
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      setAuthState({
        user: {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario'
        },
        loading: false,
        isAuthenticated: true
      })
      
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      }
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      const { user } = response.data
      
      // Para registro, el usuario necesita verificar su email primero
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false
      })
      
      return { success: true, message: 'Usuario registrado. Por favor verifica tu email.' }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al registrarse' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setAuthState({ user: null, loading: false, isAuthenticated: false })
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user: authState.user,
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  }
} 