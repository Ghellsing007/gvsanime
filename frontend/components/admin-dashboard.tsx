"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Film, 
  MessageSquare, 
  Activity, 
  TrendingUp, 
  Database,
  Shield,
  Star,
  Heart,
  Eye,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  BarChart3,
  RefreshCw
} from "lucide-react"
import api from "@/lib/api"
import CDNStatus from "./cdn-status"

interface SystemStats {
  users: {
    total: number
    thisMonth: number
    thisWeek: number
    today: number
    byRole: Record<string, number>
    active: number
    verified: number
    verificationRate: string
  }
  anime: {
    total: number
    favorites: number
    watchlist: number
    ratings: number
    reviews: number
    comments: number
    averageRating: string
    topGenres: Array<{ genre: string; count: number }>
  }
  forums: {
    categories: number
    topics: number
    posts: number
    topicsThisMonth: number
    postsThisMonth: number
    topCategories: Array<{ name: string; topicCount: number }>
  }
  activity: {
    last24h: {
      users: number
      ratings: number
      reviews: number
      topics: number
      posts: number
      favorites: number
    }
    last7d: { users: number }
    last30d: { users: number }
  }
  cdn: {
    isLoaded: boolean
    totalAnimes: number
    lastLoadTime: number | null
    loadError: string | null
    memoryUsage?: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
      arrayBuffers: number
    }
  }
  recentActivity: {
    users: Array<{ username: string; email: string; role: string; createdAt: string }>
    ratings: Array<{ rating: number; createdAt: string; userId: string }>
    topics: Array<{ title: string; createdAt: string }>
    posts: Array<{ content: string; createdAt: string }>
  }
}

interface TopUser {
  username: string
  email: string
  role: string
  ratingCount: number
  favoriteCount: number
  topicCount: number
  postCount: number
  totalActivity: number
  lastLogin?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/admin/stats')
      setStats(response.data.data)
    } catch (err: any) {
      setError(err.message || 'Error al obtener estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const fetchTopUsers = async () => {
    try {
      const response = await api.get('/admin/top-users')
      setTopUsers(response.data.data)
    } catch (err: any) {
      console.error('Error obteniendo usuarios top:', err)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([fetchStats(), fetchTopUsers()])
    setRefreshing(false)
  }

  useEffect(() => {
    fetchStats()
    fetchTopUsers()
    // Refrescar cada 5 minutos
    const interval = setInterval(() => {
      fetchStats()
      fetchTopUsers()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        <Button onClick={fetchStats} className="mt-2">Reintentar</Button>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Header con botón de refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Dashboard de Administración
        </h2>
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.users.total)}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.users.today} hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Animes</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.anime.total)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.anime.averageRating}⭐ promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Foros</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.forums.topics)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.forums.posts)} posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad 24h</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.activity.last24h.users + stats.activity.last24h.ratings + stats.activity.last24h.topics)}
            </div>
            <p className="text-xs text-muted-foreground">
              acciones totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="anime">Anime</TabsTrigger>
          <TabsTrigger value="forums">Foros</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        {/* Vista General */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estadísticas de usuarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estadísticas de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.users.thisMonth)}</div>
                    <div className="text-sm text-muted-foreground">Este mes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(stats.users.thisWeek)}</div>
                    <div className="text-sm text-muted-foreground">Esta semana</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usuarios activos (7d)</span>
                    <span className="font-medium">{formatNumber(stats.users.active)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Verificados</span>
                    <span className="font-medium">{stats.users.verificationRate}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Por rol:</h4>
                  {Object.entries(stats.users.byRole).map(([role, count]) => (
                    <div key={role} className="flex justify-between text-sm">
                      <span className="capitalize">{role}</span>
                      <span className="font-medium">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de anime */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Estadísticas de Anime
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.anime.favorites)}</div>
                    <div className="text-sm text-muted-foreground">Favoritos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{formatNumber(stats.anime.watchlist)}</div>
                    <div className="text-sm text-muted-foreground">Watchlist</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Calificaciones</span>
                    <span className="font-medium">{formatNumber(stats.anime.ratings)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Reviews</span>
                    <span className="font-medium">{formatNumber(stats.anime.reviews)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Comentarios</span>
                    <span className="font-medium">{formatNumber(stats.anime.comments)}</span>
                  </div>
                </div>

                {stats.anime.topGenres.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Géneros más populares:</h4>
                    {stats.anime.topGenres.slice(0, 5).map((genre, index) => (
                      <div key={genre.genre} className="flex justify-between text-sm">
                        <span>{genre.genre}</span>
                        <span className="font-medium">{formatNumber(genre.count)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usuarios */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuarios Más Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Usuario</th>
                      <th className="text-left py-2">Rol</th>
                      <th className="text-left py-2">Calificaciones</th>
                      <th className="text-left py-2">Favoritos</th>
                      <th className="text-left py-2">Temas</th>
                      <th className="text-left py-2">Posts</th>
                      <th className="text-left py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((user, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-2">
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-2">{formatNumber(user.ratingCount)}</td>
                        <td className="py-2">{formatNumber(user.favoriteCount)}</td>
                        <td className="py-2">{formatNumber(user.topicCount)}</td>
                        <td className="py-2">{formatNumber(user.postCount)}</td>
                        <td className="py-2 font-bold">{formatNumber(user.totalActivity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anime */}
        <TabsContent value="anime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Actividad de Anime (24h)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.activity.last24h.ratings)}</div>
                    <div className="text-sm text-muted-foreground">Calificaciones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(stats.activity.last24h.reviews)}</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.activity.last24h.favorites)}</div>
                  <div className="text-sm text-muted-foreground">Favoritos</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Géneros Más Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.anime.topGenres.length > 0 ? (
                  <div className="space-y-3">
                    {stats.anime.topGenres.slice(0, 8).map((genre, index) => (
                      <div key={genre.genre} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{genre.genre}</span>
                          <span className="font-medium">{formatNumber(genre.count)}</span>
                        </div>
                        <Progress 
                          value={(genre.count / stats.anime.topGenres[0].count) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay datos disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Foros */}
        <TabsContent value="forums" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Actividad de Foros (24h)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.activity.last24h.topics)}</div>
                    <div className="text-sm text-muted-foreground">Nuevos temas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(stats.activity.last24h.posts)}</div>
                    <div className="text-sm text-muted-foreground">Nuevos posts</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total categorías</span>
                    <span className="font-medium">{formatNumber(stats.forums.categories)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total temas</span>
                    <span className="font-medium">{formatNumber(stats.forums.topics)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total posts</span>
                    <span className="font-medium">{formatNumber(stats.forums.posts)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Categorías Más Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.forums.topCategories.length > 0 ? (
                  <div className="space-y-3">
                    {stats.forums.topCategories.map((category, index) => (
                      <div key={category.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="font-medium">{formatNumber(category.topicCount)}</span>
                        </div>
                        <Progress 
                          value={(category.topicCount / stats.forums.topCategories[0].topicCount) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay datos disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Actividad */}
        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="users" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="users">Usuarios</TabsTrigger>
                    <TabsTrigger value="ratings">Ratings</TabsTrigger>
                    <TabsTrigger value="topics">Temas</TabsTrigger>
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="users" className="space-y-2">
                    {stats.recentActivity.users.map((user, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="ratings" className="space-y-2">
                    {stats.recentActivity.ratings.map((rating, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div>
                          <div className="font-medium">Rating: {rating.rating}⭐</div>
                          <div className="text-xs text-muted-foreground">ID: {rating.userId}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(rating.createdAt)}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="topics" className="space-y-2">
                    {stats.recentActivity.topics.map((topic, index) => (
                      <div key={index} className="p-2 bg-muted rounded">
                        <div className="font-medium">{topic.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(topic.createdAt)}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="posts" className="space-y-2">
                    {stats.recentActivity.posts.map((post, index) => (
                      <div key={index} className="p-2 bg-muted rounded">
                        <div className="text-sm">{post.content.substring(0, 100)}...</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nuevos usuarios (7d)</span>
                    <span className="font-medium">{formatNumber(stats.activity.last7d.users)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nuevos usuarios (30d)</span>
                    <span className="font-medium">{formatNumber(stats.activity.last30d.users)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Temas este mes</span>
                    <span className="font-medium">{formatNumber(stats.forums.topicsThisMonth)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Posts este mes</span>
                    <span className="font-medium">{formatNumber(stats.forums.postsThisMonth)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.cdn.isLoaded ? 'Activo' : 'Inactivo'}
                    </div>
                    <div className="text-sm text-muted-foreground">CDN</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(stats.cdn.totalAnimes)}
                    </div>
                    <div className="text-sm text-muted-foreground">Animes Cargados</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estado CDN</span>
                    <Badge variant={stats.cdn.isLoaded ? "default" : "destructive"}>
                      {stats.cdn.isLoaded ? 'Listo' : 'Error'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Última actualización</span>
                    <span className="font-medium">
                      {stats.cdn.lastLoadTime ? formatDate(new Date(stats.cdn.lastLoadTime).toISOString()) : 'N/A'}
                    </span>
                  </div>
                  {stats.cdn.loadError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                      Error: {stats.cdn.loadError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Información del Servidor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Modo de datos</span>
                    <Badge variant="outline">CDN Optimizado</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fuente principal</span>
                    <span className="font-medium">CDN JSON</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fallback</span>
                    <span className="font-medium">Jikan API</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Usuarios</span>
                    <span className="font-medium">Supabase</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Interacciones</span>
                    <span className="font-medium">MongoDB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sección CDN Status al final del dashboard */}
      <div className="mt-8">
        <CDNStatus />
      </div>
    </div>
  )
} 