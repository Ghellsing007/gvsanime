"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

// Mock data
const genreData = [
  {
    id: "action",
    name: "Action",
    description: "Fast-paced and full of excitement with battles, fights, and physical feats.",
    image: "/placeholder.svg?height=300&width=500",
    count: 3240,
  },
  {
    id: "romance",
    name: "Romance",
    description: "Focused on the romantic relationships between characters.",
    image: "/placeholder.svg?height=300&width=500",
    count: 1850,
  },
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Set in fictional universes often inspired by mythology and folklore.",
    image: "/placeholder.svg?height=300&width=500",
    count: 2760,
  },
  {
    id: "sci-fi",
    name: "Sci-Fi",
    description: "Centered around futuristic technology, space exploration, and scientific concepts.",
    image: "/placeholder.svg?height=300&width=500",
    count: 1420,
  },
]

export default function GenreShowcase() {
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

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Explore Genres</h2>
        <Button variant="ghost" className="gap-1 text-muted-foreground">
          View All <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {genreData.map((genre) => (
          <motion.div key={genre.id} variants={item}>
            <Link href={`/genres/${genre.id}`}>
              <div className="group relative rounded-lg overflow-hidden">
                <div className="aspect-[16/9] relative">
                  <Image
                    src={genre.image || "/placeholder.svg"}
                    alt={genre.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold mb-1">{genre.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{genre.description}</p>
                  <div className="text-xs font-medium bg-primary/20 text-primary-foreground px-2 py-1 rounded-full inline-block">
                    {genre.count.toLocaleString()} anime
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

