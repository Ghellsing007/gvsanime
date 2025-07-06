'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SITE_NAME } from '@/lib/siteConfig';
import { Loader2, Database, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface CDNStatus {
  success: boolean;
  ready: boolean;
  stats: {
    isLoaded: boolean;
    totalAnimes: number;
    lastLoadTime: string;
    loadError: string | null;
    memoryUsage: {
      used: number;
      total: number;
    };
  };
}

export default function CDNLoading({ children }: { children: React.ReactNode }) {
  const [cdnStatus, setCdnStatus] = useState<CDNStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkCDNStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/anime/ready');
      const data: CDNStatus = await response.json();
      
      setCdnStatus(data);
      setError(null);
      
      if (data.ready) {
        setIsLoading(false);
      } else {
        // Si no está listo, reintentar en 2 segundos
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      }
    } catch (err) {
      setError('Error conectando con el servidor');
      // Reintentar en 3 segundos si hay error
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 3000);
    }
  };

  useEffect(() => {
    checkCDNStatus();
  }, [retryCount]);

  // Mostrar loading mientras el CDN no esté listo
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Fondo animado con gradientes del tema */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-background via-transparent to-background"></div>
        
        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <Card className="w-full max-w-lg bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl relative z-10">
          <CardContent className="p-8 text-center">
            {/* Logo y título */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary rounded-2xl animate-pulse"></div>
                <div className="absolute inset-2 bg-background rounded-xl flex items-center justify-center">
                  <Database className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
                {SITE_NAME}
              </h1>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Inicializando Base de Datos
              </h2>
              <p className="text-muted-foreground text-sm">
                Preparando {cdnStatus?.stats?.totalAnimes?.toLocaleString() || '28,000+'} animes para ti...
              </p>
            </div>

            {/* Spinner moderno */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
              </div>
            </div>

            {/* Estado del sistema */}
            {cdnStatus && (
              <div className="space-y-4 text-left bg-muted/30 rounded-lg p-4 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Estado del CDN:
                  </span>
                  <span className={`font-medium text-sm flex items-center gap-1 ${
                    cdnStatus.stats.isLoaded ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {cdnStatus.stats.isLoaded ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Listo
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    )}
                  </span>
                </div>
                
                {cdnStatus.stats.totalAnimes > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Animes cargados:</span>
                    <span className="text-foreground font-medium">
                      {cdnStatus.stats.totalAnimes.toLocaleString()}
                    </span>
                  </div>
                )}

                {cdnStatus.stats.memoryUsage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uso de memoria:</span>
                    <span className="text-foreground font-medium text-sm">
                      {cdnStatus.stats.memoryUsage.used}MB / {cdnStatus.stats.memoryUsage.total}MB
                    </span>
                  </div>
                )}

                {/* Barra de progreso moderna */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progreso de carga</span>
                    <span>{cdnStatus.stats.isLoaded ? '100%' : '75%'}</span>
                  </div>
                  <Progress 
                    value={cdnStatus.stats.isLoaded ? 100 : 75} 
                    className="h-2 bg-muted"
                  />
                </div>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Contador de reintentos */}
            <div className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Reintento {retryCount + 1}...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si el CDN está listo, mostrar la aplicación
  return <>{children}</>;
} 