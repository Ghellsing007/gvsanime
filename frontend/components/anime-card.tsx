"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Star, Bookmark, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { useFavorites } from "@/hooks/useFavorites"
import { useWatchlist } from "@/hooks/useWatchlist"
import { getCardImage } from "../lib/imageUtils"
import type { AnimeImages } from "../lib/types"

interface AnimeCardProps {
  id: number
  title: string
  images?: AnimeImages
  score?: number
  episodes?: number
  genres?: string[] | Array<{mal_id: number, name: string}>
  year?: number
  season?: string
  variant?: "default" | "compact" | "featured"
}

export default function AnimeCard({
  id,
  title,
  images,
  score,
  episodes,
  genres = [],
  year,
  season,
  variant = "default",
}: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isInWatchlist, toggleWatchlist } = useWatchlist()

  // Función helper para obtener el nombre del género
  const getGenreName = (genre: string | {mal_id: number, name: string}) => {
    return typeof genre === 'string' ? genre : genre.name;
  }

  // Función helper para obtener géneros como strings
  const getGenreNames = () => {
    if (!genres || !Array.isArray(genres)) return [];
    return genres.map(getGenreName);
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const imageUrl = getCardImage(images)
      await toggleFavorite(id, title, imageUrl)
      
      toast({
        title: isFavorite(id) ? "Removido de favoritos" : "Agregado a favoritos",
        description: isFavorite(id) ? `${title} fue removido de tus favoritos` : `${title} fue agregado a tus favoritos`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const imageUrl = getCardImage(images)
      await toggleWatchlist(id, title, imageUrl)
      
      toast({
        title: isInWatchlist(id) ? "Removido de watchlist" : "Agregado a watchlist",
        description: isInWatchlist(id) ? `${title} fue removido de tu watchlist` : `${title} fue agregado a tu watchlist`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (variant === "compact") {
    return (
      <Link href={`/anime/${id}`}>
        <div
          className="group relative rounded-md overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="aspect-[3/4] relative">
            <Image
              src={getCardImage(images)}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
            {score && (
              <div className="flex items-center mt-1">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-xs">{score}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <Link href={`/anime/${id}`}>
        <motion.div
          className="relative rounded-lg overflow-visible"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="aspect-video relative">
            <Image src={getCardImage(images)} alt={title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {getGenreNames().slice(0, 3).map((genreName, index) => (
                    <span key={`${genreName}-${index}`} className="text-xs bg-primary/20 px-2 py-0.5 rounded">
                      {genreName}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  {score && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{score}</span>
                    </div>
                  )}
                  {episodes && <div className="text-sm">{episodes} episodes</div>}
                  {year && <div className="text-sm">{year}</div>}
                  {season && <div className="text-sm">{season}</div>}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                        onClick={handleToggleFavorite}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite(id) ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                        onClick={handleToggleWatchlist}
                      >
                        <Bookmark className={`h-4 w-4 ${isInWatchlist(id) ? "fill-blue-500 text-blue-500" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  if (variant === "default") {
    return (
      <Link href={`/anime/${id}`}>
        <motion.div
          className="group relative rounded-lg overflow-hidden shadow-sm bg-background flex flex-col h-full transition-transform duration-200 hover:-translate-y-1"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="aspect-[3/4] relative">
            <Image
              src={getCardImage(images)}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex-1 flex flex-col justify-between p-2 sm:p-3 lg:p-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1 line-clamp-2">{title}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {getGenreNames().slice(0, 2).map((genreName, index) => (
                <span key={`${genreName}-${index}`} className="text-xs bg-primary/10 px-2 py-0.5 rounded">
                  {genreName}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-auto">
              {score && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-xs sm:text-sm font-medium">{score}</span>
                </div>
              )}
              {episodes && <div className="text-xs sm:text-sm">{episodes} ep</div>}
              {year && <div className="text-xs sm:text-sm">{year}</div>}
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite(id) ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                onClick={handleToggleWatchlist}
              >
                <Bookmark className={`h-4 w-4 ${isInWatchlist(id) ? "fill-blue-500 text-blue-500" : ""}`} />
              </Button>
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/anime/${id}`}>
      <motion.div
        className="group relative rounded-lg overflow-hidden border bg-card"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[3/4] relative">
          <Image
            src={getCardImage(images)}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex flex-col space-y-2 z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(id) ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                    onClick={handleToggleWatchlist}
                  >
                    <Bookmark className={`h-4 w-4 ${isInWatchlist(id) ? "fill-blue-500 text-blue-500" : ""}`} />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <div className="flex items-center justify-between mt-2">
            {score && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm">{score}</span>
              </div>
            )}
            {episodes && <div className="text-xs text-muted-foreground">{episodes} eps</div>}
          </div>
          {getGenreNames().length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {getGenreNames().slice(0, 2).map((genreName, index) => (
                <span key={`${genreName}-${index}`} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {genreName}
                </span>
              ))}
              {getGenreNames().length > 2 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">+{getGenreNames().length - 2}</span>
              )}
            </div>
          )}
        </div>

        <div
          className={`absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"} pointer-events-none`}
        >
          <Button className="pointer-events-auto">
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalles
          </Button>
        </div>
      </motion.div>
    </Link>
  )
}

