'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Cargando Anime Database
              </h2>
              <p className="text-white/80 text-sm">
                Preparando {cdnStatus?.stats?.totalAnimes?.toLocaleString() || '28,000+'} animes...
              </p>
            </div>

            {cdnStatus && (
              <div className="space-y-3 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Estado:</span>
                  <span className={`font-medium ${cdnStatus.stats.isLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
                    {cdnStatus.stats.isLoaded ? 'Cargado' : 'Cargando...'}
                  </span>
                </div>
                
                {cdnStatus.stats.totalAnimes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Animes cargados:</span>
                    <span className="text-white font-medium">
                      {cdnStatus.stats.totalAnimes.toLocaleString()}
                    </span>
                  </div>
                )}

                {cdnStatus.stats.memoryUsage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Memoria:</span>
                    <span className="text-white font-medium">
                      {cdnStatus.stats.memoryUsage.used}MB / {cdnStatus.stats.memoryUsage.total}MB
                    </span>
                  </div>
                )}

                <Progress 
                  value={cdnStatus.stats.isLoaded ? 100 : 75} 
                  className="w-full h-2 bg-white/20"
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="mt-4 text-xs text-white/60">
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