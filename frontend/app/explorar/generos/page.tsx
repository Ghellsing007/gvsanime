"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"
import api from "../../../lib/api"

export default function AllGenresPage() {
  const [genres, setGenres] = useState<any[]>([])
  const [filteredGenres, setFilteredGenres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    api.get('/anime/genres')
      .then(res => {
        const allGenres = res.data?.genres || []
        // Ordenar por popularidad
        const sortedGenres = allGenres.sort((a: any, b: any) => b.count - a.count)
        setGenres(sortedGenres)
        setFilteredGenres(sortedGenres)
      })
      .catch(() => setError("No se pudieron cargar los géneros"))
      .finally(() => setLoading(false))
  }, [])

  // Filtrar géneros basado en el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredGenres(genres)
    } else {
      const filtered = genres.filter(genre =>
        genre.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredGenres(filtered)
    }
  }, [searchTerm, genres])

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

  if (loading) return <div className="container mx-auto px-4 py-8">Cargando géneros...</div>
  if (error) return <div className="container mx-auto px-4 py-8">{error}</div>

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
        
        <h1 className="text-4xl font-bold mb-4">Todos los Géneros</h1>
        <p className="text-muted-foreground mb-6">
          Explora todos los géneros de anime disponibles. Encuentra tu próximo anime favorito.
        </p>

        {/* Barra de búsqueda */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar géneros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredGenres.length} de {genres.length} géneros
          {searchTerm && ` para "${searchTerm}"`}
        </p>
      </div>

      {/* Grid de géneros */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredGenres.map((genre, index) => (
          <motion.div key={genre.id || genre.mal_id} variants={item}>
            <Link href={`/explorar?genero=${encodeURIComponent(genre.name)}`}>
              <div className="group relative rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors">
                <div className="aspect-[16/9] relative">
                  <Image
                    src={genre.image || "/placeholder.jpg"}
                    alt={genre.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold mb-1">{genre.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {genre.description || `Explora animes del género ${genre.name}`}
                  </p>
                  <div className="text-xs font-medium bg-primary/20 text-primary-foreground px-2 py-1 rounded-full inline-block">
                    {genre.count?.toLocaleString() || 0} anime
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Mensaje si no hay resultados */}
      {filteredGenres.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron géneros que coincidan con "{searchTerm}"
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm("")}
            className="mt-4"
          >
            Limpiar búsqueda
          </Button>
        </div>
      )}
    </div>
  )
} 