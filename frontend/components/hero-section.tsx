"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Play, Info } from "lucide-react"

// Mock featured anime data
const featuredAnime = [
  {
    id: 1,
    title: "Demon Slayer: Kimetsu no Yaiba",
    description: "A boy raised by a family of demons hunts down the demons who slaughtered his family.",
    image: "/placeholder.svg?height=600&width=1200",
    genres: ["Action", "Fantasy", "Historical"],
    rating: 8.9,
  },
  {
    id: 2,
    title: "Attack on Titan",
    description:
      "In a world where humanity lives within cities surrounded by enormous walls due to the Titans, giant humanoid beings who devour humans seemingly without reason.",
    image: "/placeholder.svg?height=600&width=1200",
    genres: ["Action", "Drama", "Fantasy"],
    rating: 9.1,
  },
  {
    id: 3,
    title: "My Hero Academia",
    description:
      "A superhero-loving boy without any powers is determined to enroll in a prestigious hero academy and learn what it really means to be a hero.",
    image: "/placeholder.svg?height=600&width=1200",
    genres: ["Action", "Comedy", "Superhero"],
    rating: 8.5,
  },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredAnime.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const anime = featuredAnime[currentSlide]

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden rounded-xl mb-12">
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-background/20 z-10" />

      <motion.div
        key={anime.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <Image src={anime.image || "/placeholder.svg"} alt={anime.title} fill className="object-cover" priority />
      </motion.div>

      <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-12 max-w-3xl">
        <motion.div
          key={`text-${anime.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{anime.title}</h1>
          <div className="flex items-center mb-4 space-x-2">
            <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm font-medium">
              {anime.rating} ★
            </div>
            {anime.genres.map((genre) => (
              <div key={genre} className="bg-background/50 backdrop-blur-sm px-2 py-1 rounded text-sm">
                {genre}
              </div>
            ))}
          </div>
          <p className="text-lg mb-6 max-w-2xl">{anime.description}</p>
          <div className="flex space-x-4">
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Watch Trailer
            </Button>
            <Button variant="outline" className="gap-2">
              <Info className="h-4 w-4" />
              More Info
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
        {featuredAnime.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index ? "bg-primary w-6" : "bg-background/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

