"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Bookmark, Share2, Star, Calendar, Clock, Film, Users, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface AnimeDetailsProps {
  id: string
}

export default function AnimeDetails({ id }: AnimeDetailsProps) {
  const [anime, setAnime] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        setLoading(true)
        // Añadimos un pequeño retraso para respetar los límites de la API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const response = await fetch(`${backendUrl}/anime/${id}`)

        if (!response.ok) {
          throw new Error("Error al obtener datos del anime")
        }

        const animeData = await response.json()
        setAnime(animeData)
      } catch (err) {
        console.error(err)
        setError("No se pudo cargar la información del anime. Por favor, inténtalo de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnimeDetails()
  }, [id])

  const toggleFavorite = () => setIsFavorite(!isFavorite)
  const toggleBookmark = () => setIsBookmarked(!isBookmarked)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground">{error || "No se pudo cargar la información del anime"}</p>
          <Button asChild className="mt-4">
            <Link href="/explorar">Volver a Explorar</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/explorar" className="hover:text-foreground">
          Explorar
        </Link>
        <span className="mx-2">/</span>
        <span>{anime.title}</span>
      </div>

      {/* Banner */}
      <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden mb-8">
        <Image
          src={anime.images?.jpg?.imageUrl || "/placeholder.svg?height=500&width=1200"}
          alt={anime.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Anime Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Image and Stats */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <div className="relative rounded-lg overflow-hidden mb-4">
              <Image
                src={anime.images?.webp?.image_url|| "/placeholder.svg?height=600&width=400"}
                alt={anime.title}
                width={400}
                height={600}
                className="w-full object-cover"
              />
            </div>

            <div className="flex justify-between mb-4">
              <Button
                variant="outline"
                className={`flex-1 mr-2 ${isFavorite ? "bg-primary/10 text-primary" : ""}`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-primary text-primary" : ""}`} />
                {isFavorite ? "Favorito" : "Favorito"}
              </Button>
              <Button
                variant="outline"
                className={`flex-1 ${isBookmarked ? "bg-primary/10 text-primary" : ""}`}
                onClick={toggleBookmark}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                {isBookmarked ? "En lista" : "Añadir a lista"}
              </Button>
            </div>

            <Button variant="outline" className="w-full mb-6">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>

            <div className="bg-card rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{anime.score || "N/A"}</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round((anime.score || 0) / 2)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Basado en {anime.scored_by?.toLocaleString() || 0} valoraciones
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Popularidad:</span>
                  <span className="text-muted-foreground">#{anime.popularity || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ranking:</span>
                  <span className="text-muted-foreground">#{anime.rank || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Miembros:</span>
                  <span className="text-muted-foreground">{anime.members?.toLocaleString() || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Favoritos:</span>
                  <span className="text-muted-foreground">{anime.favorites?.toLocaleString() || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-4">
              <h3 className="font-medium mb-3">Información</h3>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-muted-foreground w-24">Tipo:</span>
                  <span>{anime.type || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">Episodios:</span>
                  <span>{anime.episodes || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">Estado:</span>
                  <span>{anime.status || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">Emitido:</span>
                  <span>{anime.aired?.string || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">Temporada:</span>
                  <span>
                    {anime.season
                      ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year || ""}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">Estudios:</span>
                  <span>{anime.studios?.map((s: any) => s.name).join(", ") || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">Fuente:</span>
                  <span>{anime.source || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">Géneros:</span>
                  <div className="flex flex-wrap gap-1">
                    {anime.genres?.map((genre: any) => (
                      <Badge key={genre.mal_id} variant="secondary" className="text-xs">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">Duración:</span>
                  <span>{anime.duration || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">Clasificación:</span>
                  <span>{anime.rating || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{anime.title}</h1>
            <h2 className="text-xl text-muted-foreground mb-4">{anime.title_japanese}</h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres?.map((genre: any) => (
                <Link
                  key={genre.mal_id}
                  href={`/explorar?genero=${genre.name}`}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/20 transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-lg p-4 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-sm text-muted-foreground">Emitido</div>
                <div className="font-medium">
                  {anime.aired?.from ? new Date(anime.aired.from).getFullYear() : "N/A"}
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 text-center">
                <Film className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-sm text-muted-foreground">Episodios</div>
                <div className="font-medium">{anime.episodes || "N/A"}</div>
              </div>
              <div className="bg-card rounded-lg p-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-sm text-muted-foreground">Duración</div>
                <div className="font-medium">{anime.duration?.split(" per ")[0] || "N/A"}</div>
              </div>
              <div className="bg-card rounded-lg p-4 text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-sm text-muted-foreground">Favoritos</div>
                <div className="font-medium">{anime.favorites?.toLocaleString() || "0"}</div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Sinopsis</TabsTrigger>
                <TabsTrigger value="characters">Personajes</TabsTrigger>
                <TabsTrigger value="trailer">Tráiler</TabsTrigger>
                <TabsTrigger value="related">Relacionados</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3">Sinopsis</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {anime.synopsis || "No hay sinopsis disponible."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">Información Adicional</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {anime.background || "No hay información adicional disponible."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="characters">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    La información de personajes está disponible en la API de Jikan, pero requiere una llamada
                    adicional.
                  </p>
                  <Button asChild className="mt-4">
                    <a href={`https://myanimelist.net/anime/${anime.mal_id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver en MyAnimeList
                    </a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="trailer">
                <div>
                  <h3 className="text-xl font-bold mb-3">Tráiler</h3>
                  {anime.trailer?.youtube_id ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-card">
                      <iframe
                        src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                        title={`${anime.title} trailer`}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-card rounded-lg">
                      <p className="text-muted-foreground">No hay tráiler disponible para este anime.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="related">
                {anime.relations && anime.relations.length > 0 ? (
                  <div className="space-y-4">
                    {anime.relations.map((relation: any) => (
                      <div key={relation.relation} className="bg-card rounded-lg p-4">
                        <h4 className="font-medium mb-2">{relation.relation}</h4>
                        <ul className="space-y-2">
                          {relation.entry.map((entry: any) => (
                            <li key={entry.mal_id} className="flex items-center">
                              <span className="text-muted-foreground mr-2">{entry.type}:</span>
                              {entry.type === "anime" ? (
                                <Link href={`/anime/${entry.mal_id}`} className="text-primary hover:underline">
                                  {entry.name}
                                </Link>
                              ) : (
                                <span>{entry.name}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No hay información de anime relacionado disponible.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {anime.external && anime.external.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Enlaces Externos</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.external.map((link: any) => (
                    <Button key={link.name} variant="outline" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {link.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

