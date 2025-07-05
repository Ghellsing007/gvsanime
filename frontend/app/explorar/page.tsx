'use client'

import AnimeList from "@/components/anime-list"
import { SITE_NAME } from "../../lib/siteConfig"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Film, Compass, TrendingUp, ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function ExplorePage() {
  const exploreSections = [
    {
      title: "Temporadas",
      description: "Explora animes por temporada de emisión",
      icon: <Calendar className="h-6 w-6" />,
      href: "/explorar/seasons",
      color: "bg-blue-500"
    },
    {
      title: "Géneros",
      description: "Descubre animes por género",
      icon: <Film className="h-6 w-6" />,
      href: "/explorar/generos",
      color: "bg-purple-500"
    },
    {
      title: "Popular",
      description: "Los animes más populares",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/explorar/popular",
      color: "bg-red-500"
    },
    {
      title: "Recomendaciones",
      description: "Animes recomendados para ti",
      icon: <Compass className="h-6 w-6" />,
      href: "/recommendations",
      color: "bg-green-500"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <ExploreHeader />
      
      {/* Solo mostrar secciones si no hay filtros activos */}
      <ExploreSections sections={exploreSections} />

      {/* Búsqueda general */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Búsqueda General</h2>
        <AnimeList />
      </div>
    </div>
  )
}

// Componente para el header que cambia según los filtros
function ExploreHeader() {
  const searchParams = useSearchParams()
  const season = searchParams.get("season")
  const genre = searchParams.get("genero")

  if (season) {
    const [year, seasonName] = season.split('-')
    const seasonDisplayName = seasonName.charAt(0).toUpperCase() + seasonName.slice(1)
    
    return (
      <div className="mb-8">
        <Link href="/explorar">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a Explorar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          Temporada {seasonDisplayName} {year}
        </h1>
        <p className="text-gray-600">
          Todos los animes de la temporada {seasonDisplayName} {year}
        </p>
      </div>
    )
  }

  if (genre) {
    return (
      <div className="mb-8">
        <Link href="/explorar">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a Explorar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          Género: {genre}
        </h1>
        <p className="text-gray-600">
          Todos los animes del género {genre}
        </p>
      </div>
    )
  }

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-4">Explorar Anime</h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Descubre nuevos animes a través de nuestras diferentes categorías y filtros
      </p>
    </div>
  )
}

// Componente para las secciones de exploración
function ExploreSections({ sections }: { sections: any[] }) {
  const searchParams = useSearchParams()
  const season = searchParams.get("season")
  const genre = searchParams.get("genero")

  // No mostrar secciones si hay filtros activos
  if (season || genre) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {sections.map((section) => (
        <Link key={section.title} href={section.href}>
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${section.color} text-white`}>
                  {section.icon}
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{section.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

