"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "../../../lib/api"

export default function AllPopularAnimePage() {
  const [activeTab, setActiveTab] = useState("all")
  const [animes, setAnimes] = useState<any[]>([])
  const [filteredAnimes, setFilteredAnimes] = useState<any[]>([])
  const [genres, setGenres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchGenres = async () => {
    const popularGenres = [
      { id: 1, name: 'Action' },
      { id: 2, name: 'Adventure' },
      { id: 4, name: 'Comedy' },
      { id: 8, name: 'Drama' },
      { id: 10, name: 'Fantasy' },
      { id: 14, name: 'Horror' },
      { id: 22, name: 'Romance' },
      { id: 24, name: 'Sci-Fi' },
      { id: 27, name: 'Shounen' },
      { id: 25, name: 'Slice of Life' },
      { id: 5, name: 'Demons' },
      { id: 6, name: 'Mystery' },
      { id: 7, name: 'Psychological' },
    ];
    setGenres(popularGenres)
  }

  const fetchAnimes = async (category: string) => {
    setLoading(true)
    try {
      let endpoint = '/anime/search?sort=top'
      
      if (category !== 'all') {
        const genreMap: { [key: string]: number } = {
          'Action': 1,
          'Adventure': 2,
          'Comedy': 4,
          'Drama': 8,
          'Fantasy': 10,
          'Horror': 14,
          'Romance': 22,
          'Sci-Fi': 24,
          'Shounen': 27,
          'Slice of Life': 25,
          'Avant Garde': 3,
          'Demons': 5,
          'Mystery': 6,
          'Psychological': 7,
          'Ecchi': 9
        };
        
        const genreId = genreMap[category];
        if (genreId) {
          endpoint = `/anime/search?genre=${category}`
        }
      }
      
      const res = await api.get(endpoint)
      const results = res.data?.data || res.data?.results || [];
      setAnimes(results)
      setFilteredAnimes(results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenres()
    fetchAnimes(activeTab)
  }, [activeTab])

  // Filtrar animes basado en el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAnimes(animes)
    } else {
      const filtered = animes.filter(anime =>
        anime.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredAnimes(filtered)
    }
  }, [searchTerm, animes])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Cargando animes populares...</div>
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
        
        <h1 className="text-4xl font-bold mb-4">Animes Populares</h1>
        <p className="text-muted-foreground mb-6">
          Descubre los animes más populares y mejor valorados. Filtra por género o busca por título.
        </p>

        {/* Barra de búsqueda */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar animes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Filtros por género */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
        <TabsList className="overflow-x-auto flex justify-start">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {genres.map((genre) => (
            <TabsTrigger key={genre.id} value={genre.name}>
              {genre.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Estadísticas */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredAnimes.length} de {animes.length} animes
          {searchTerm && ` para "${searchTerm}"`}
          {activeTab !== 'all' && ` en ${activeTab}`}
        </p>
      </div>

      {/* Grid de animes */}
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="all">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredAnimes.map((anime) => (
              <motion.div key={anime.mal_id || anime.id} variants={item}>
                <AnimeCard
                  id={anime.mal_id || anime.id}
                  title={anime.title}
                  images={anime.images}
                  score={anime.score}
                  episodes={anime.episodes}
                  genres={anime.genres}
                  year={anime.year}
                  season={anime.season}
                />
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {genres.map((genre) => (
          <TabsContent key={genre.id} value={genre.name}>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredAnimes.map((anime) => (
                <motion.div key={anime.mal_id || anime.id} variants={item}>
                  <AnimeCard
                    id={anime.mal_id || anime.id}
                    title={anime.title}
                    images={anime.images}
                    score={anime.score}
                    episodes={anime.episodes}
                    genres={anime.genres}
                    year={anime.year}
                    season={anime.season}
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Mensaje si no hay resultados */}
      {filteredAnimes.length === 0 && (searchTerm || activeTab !== 'all') && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron animes que coincidan con los filtros aplicados
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("")
              setActiveTab("all")
            }}
            className="mt-4"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  )
} 