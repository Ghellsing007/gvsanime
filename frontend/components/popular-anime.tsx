"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "../lib/api"

// Datos mock como fallback (ya no se usan, pero mantenemos por si acaso)

export default function PopularAnime() {
  const [activeTab, setActiveTab] = useState("all")
  const [animes, setAnimes] = useState<any[]>([])
  const [genres, setGenres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGenres = async () => {
    // Usar directamente los 10 géneros más populares
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
      { id: 25, name: 'Slice of Life' }
    ];
    setGenres(popularGenres)
  }

  const fetchAnimes = async (category: string) => {
    setLoading(true)
    try {
      let endpoint = '/anime/search?sort=top'
      
      if (category !== 'all') {
        // Mapear el nombre del género a su ID para la API
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
          'Slice of Life': 25
        };
        
        const genreId = genreMap[category];
        if (genreId) {
          endpoint = `/anime/search?genre=${category}`
        }
      }
      
      const res = await api.get(endpoint)
      const results = res.data?.data || res.data?.results || [];
      setAnimes(results)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenres()
    fetchAnimes(activeTab)
  }, [activeTab])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) return <div>Cargando animes populares...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Popular Anime</h2>
        <Button variant="ghost" className="gap-1 text-muted-foreground">
          View All <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6 overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {genres.map((genre) => (
            <TabsTrigger key={genre.id} value={genre.name}>
              {genre.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={container}
            initial="hidden"
            animate={activeTab === "all" ? "show" : "hidden"}
          >
            {animes.map((anime) => (
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
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
              variants={container}
              initial="hidden"
              animate={activeTab === genre.name ? "show" : "hidden"}
            >
              {animes.map((anime) => (
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
    </section>
  )
}

