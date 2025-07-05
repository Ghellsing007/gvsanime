'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, ArrowRight, Plus } from 'lucide-react';
import AnimeCard from '@/components/anime-card';
import Link from 'next/link';

interface Season {
  id: string;
  name: string;
  year: number;
  season: string;
  animeCount?: number;
  isCurrent?: boolean;
}

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      imageUrl: string;
      smallImageUrl: string;
      largeImageUrl: string;
    };
    webp: {
      imageUrl: string;
      smallImageUrl: string;
      largeImageUrl: string;
    };
  };
  score: number;
  episodes: number;
  status: string;
  type: string;
  year?: number;
  season?: string;
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnimes, setLoadingAnimes] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalAnimes, setTotalAnimes] = useState(0);

  // Generar temporadas disponibles
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Determinar la temporada actual
    let currentSeason = '';
    if (currentMonth >= 2 && currentMonth <= 4) currentSeason = 'Spring';
    else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = 'Summer';
    else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = 'Autumn';
    else currentSeason = 'Winter';

    const seasonNames = ['Winter', 'Spring', 'Summer', 'Autumn'];
    const generatedSeasons: Season[] = [];

    // Generar temporadas desde 2020 hasta la actual
    for (let year = currentYear; year >= 2020; year--) {
      for (const season of seasonNames) {
        const isCurrent = year === currentYear && season === currentSeason;
        generatedSeasons.push({
          id: `${year}-${season.toLowerCase()}`,
          name: `${season} ${year}`,
          year,
          season,
          isCurrent
        });
      }
    }

    setSeasons(generatedSeasons);
    setLoading(false);
  }, []);

  const handleSeasonClick = async (season: Season) => {
    setSelectedSeason(season);
    setLoadingAnimes(true);
    setCurrentPage(1);
    setHasMore(true);
    
    try {
      // Cargar los primeros 12 animes
      const response = await fetch(`/api/anime?season=${season.year}-${season.season}&limit=12&page=1`);
      const data = await response.json();
      setAnimes(data.data || []);
      setTotalAnimes(data.pagination?.total || 0);
      
      // Verificar si hay más animes
      const totalPages = data.pagination?.last_visible_page || 1;
      setHasMore(totalPages > 1);
    } catch (error) {
      console.error('Error cargando animes de la temporada:', error);
      setAnimes([]);
      setHasMore(false);
    } finally {
      setLoadingAnimes(false);
    }
  };

  const loadMoreAnimes = async () => {
    if (!selectedSeason || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const response = await fetch(`/api/anime?season=${selectedSeason.year}-${selectedSeason.season}&limit=12&page=${nextPage}`);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        setAnimes(prev => [...prev, ...data.data]);
        setCurrentPage(nextPage);
        
        // Verificar si hay más páginas
        const totalPages = data.pagination?.last_visible_page || 1;
        setHasMore(nextPage < totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error cargando más animes:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'Spring': return 'bg-green-100 text-green-800 border-green-200';
      case 'Summer': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Autumn': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Winter': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'Spring': return '🌸';
      case 'Summer': return '☀️';
      case 'Autumn': return '🍂';
      case 'Winter': return '❄️';
      default: return '📺';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Temporadas de Anime</h1>
        <p className="text-gray-600">
          Explora animes por temporada de emisión
        </p>
      </div>

      {/* Temporadas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {seasons.map((season) => (
          <Card 
            key={season.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedSeason?.id === season.id ? 'ring-2 ring-blue-500' : ''
            } ${season.isCurrent ? 'border-2 border-green-500' : ''}`}
            onClick={() => handleSeasonClick(season)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {getSeasonIcon(season.season)} {season.name}
                </CardTitle>
                {season.isCurrent && (
                  <Badge className="bg-green-500 text-white">
                    Actual
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{season.year}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getSeasonColor(season.season)}`}
                >
                  {season.season}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Animes de la temporada seleccionada */}
      {selectedSeason && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">
                {getSeasonIcon(selectedSeason.season)} {selectedSeason.name}
              </h2>
              {loadingAnimes && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              )}
            </div>
            
            {/* Botón "Ver todos" */}
            <Link href={`/explorar?season=${selectedSeason.year}-${selectedSeason.season}`}>
              <Button variant="outline" className="gap-2">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {animes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                {animes.map((anime) => (
                  <AnimeCard
                    key={anime.mal_id}
                    id={anime.mal_id}
                    title={anime.title}
                    images={anime.images}
                    score={anime.score}
                    episodes={anime.episodes}
                    year={anime.year}
                    season={anime.season}
                    variant="compact"
                  />
                ))}
              </div>
              
              {/* Información sobre el límite */}
              <div className="text-center text-sm text-gray-500 mb-4">
                Mostrando {animes.length} de {totalAnimes} animes de {selectedSeason.name}
              </div>

              {/* Botón Ver más */}
              {hasMore && (
                <div className="text-center mb-6">
                  <Button 
                    onClick={loadMoreAnimes}
                    disabled={loadingMore}
                    className="gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Cargando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Ver más animes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : !loadingAnimes ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                No se encontraron animes para esta temporada
              </p>
              <Button 
                variant="outline" 
                onClick={() => handleSeasonClick(selectedSeason)}
              >
                Intentar de nuevo
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Sobre las Temporadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium mb-2">Temporadas del Año:</h4>
            <ul className="space-y-1">
              <li>🌸 <strong>Winter:</strong> Enero - Marzo</li>
              <li>☀️ <strong>Spring:</strong> Abril - Junio</li>
              <li>🍂 <strong>Summer:</strong> Julio - Septiembre</li>
              <li>❄️ <strong>Autumn:</strong> Octubre - Diciembre</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Tipos de Anime:</h4>
            <ul className="space-y-1">
              <li><strong>TV:</strong> Serie de televisión</li>
              <li><strong>Movie:</strong> Película</li>
              <li><strong>OVA:</strong> Video animado original</li>
              <li><strong>Special:</strong> Episodio especial</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 