"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  HardDrive,
  Activity
} from "lucide-react"
import api from "@/lib/api"

interface CDNStats {
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

export default function CDNStatus() {
  const [stats, setStats] = useState<CDNStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/anime/datasource/cdn/stats')
      setStats(response.data)
    } catch (err: any) {
      setError(err.message || 'Error al obtener estadísticas del CDN')
    } finally {
      setLoading(false)
    }
  }

  const forceReload = async () => {
    try {
      setRefreshing(true)
      await api.post('/anime/datasource/cdn/reload')
      // Esperar un poco y luego refrescar stats
      setTimeout(() => {
        fetchStats()
        setRefreshing(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Error al recargar datos del CDN')
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refrescar cada 30 segundos
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusColor = () => {
    if (!stats) return 'bg-gray-500'
    if (stats.loadError) return 'bg-red-500'
    if (stats.isLoaded) return 'bg-green-500'
    return 'bg-yellow-500'
  }

  const getStatusText = () => {
    if (!stats) return 'Desconocido'
    if (stats.loadError) return 'Error'
    if (stats.isLoaded) return 'Listo'
    return 'Cargando'
  }

  const getStatusIcon = () => {
    if (!stats) return <Activity className="h-4 w-4" />
    if (stats.loadError) return <AlertCircle className="h-4 w-4" />
    if (stats.isLoaded) return <CheckCircle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado del CDN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando estadísticas...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado del CDN
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={stats?.loadError ? "destructive" : stats?.isLoaded ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={forceReload}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Recargar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {stats && (
          <>
            {/* Estadísticas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalAnimes?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Animes</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.isLoaded ? 'Sí' : 'No'}
                </div>
                <div className="text-sm text-muted-foreground">Cargado</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.lastLoadTime ? formatDate(stats.lastLoadTime) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Última Carga</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.memoryUsage ? formatBytes(stats.memoryUsage.heapUsed) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Memoria Usada</div>
              </div>
            </div>

            {/* Uso de memoria */}
            {stats.memoryUsage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uso de Memoria</span>
                  <span className="text-muted-foreground">
                    {formatBytes(stats.memoryUsage.heapUsed)} / {formatBytes(stats.memoryUsage.heapTotal)}
                  </span>
                </div>
                <Progress 
                  value={(stats.memoryUsage.heapUsed / stats.memoryUsage.heapTotal) * 100} 
                  className="h-2"
                />
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>Heap: {formatBytes(stats.memoryUsage.heapUsed)}</div>
                  <div>RSS: {formatBytes(stats.memoryUsage.rss)}</div>
                  <div>External: {formatBytes(stats.memoryUsage.external)}</div>
                </div>
              </div>
            )}

            {/* Error de carga */}
            {stats.loadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error de Carga:</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{stats.loadError}</p>
              </div>
            )}

            {/* Información adicional */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Los datos se recargan automáticamente cada 6 horas</div>
              <div>• El CDN contiene 28,000+ animes precargados en memoria</div>
              <div>• Acceso instantáneo a todos los datos</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 