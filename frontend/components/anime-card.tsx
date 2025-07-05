"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Star, Bookmark, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getCardImage } from "../lib/imageUtils"
import type { AnimeImages } from "../lib/types"

interface AnimeCardProps {
  id: number
  title: string
  images?: AnimeImages
  score?: number
  episodes?: number
  genres?: string[]
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
  const [isFavorite, setIsFavorite] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
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
                  {genres.slice(0, 3).map((genre) => (
                    <span key={genre} className="text-xs bg-primary/20 px-2 py-0.5 rounded">
                      {genre}
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
                        onClick={toggleFavorite}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">
                      <p>{isFavorite ? "Unfav" : "Fav"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                        onClick={toggleBookmark}
                      >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">
                      <p>{isBookmarked ? "Unwatch" : "Watch"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
                    onClick={toggleFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">
                  <p>{isFavorite ? "Unfav" : "Fav"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                    onClick={toggleBookmark}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">
                  <p>{isBookmarked ? "Unwatch" : "Watch"}</p>
                </TooltipContent>
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
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {genres.slice(0, 2).map((genre) => (
                <span key={genre} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {genre}
                </span>
              ))}
              {genres.length > 2 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">+{genres.length - 2}</span>
              )}
            </div>
          )}
        </div>

        <div
          className={`absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"} pointer-events-none`}
        >
          <Button className="pointer-events-auto">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </motion.div>
    </Link>
  )
}

