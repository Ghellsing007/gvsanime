"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const popularAnimeData = {
  all: [
    {
      id: 1,
      title: "Fullmetal Alchemist: Brotherhood",
      image: "/placeholder.svg?height=400&width=300",
      score: 9.1,
      episodes: 64,
      genres: ["Action", "Adventure", "Drama", "Fantasy"],
      year: 2009,
    },
    {
      id: 2,
      title: "Steins;Gate",
      image: "/placeholder.svg?height=400&width=300",
      score: 9.0,
      episodes: 24,
      genres: ["Sci-Fi", "Thriller", "Drama"],
      year: 2011,
    },
    {
      id: 3,
      title: "Gintama",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.9,
      episodes: 367,
      genres: ["Action", "Comedy", "Sci-Fi"],
      year: 2006,
    },
    {
      id: 4,
      title: "Hunter x Hunter (2011)",
      image: "/placeholder.svg?height=400&width=300",
      score: 9.0,
      episodes: 148,
      genres: ["Action", "Adventure", "Fantasy"],
      year: 2011,
    },
    {
      id: 5,
      title: "Legend of the Galactic Heroes",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.9,
      episodes: 110,
      genres: ["Drama", "Sci-Fi", "Space"],
      year: 1988,
    },
    {
      id: 6,
      title: "Monster",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.8,
      episodes: 74,
      genres: ["Drama", "Horror", "Mystery", "Psychological", "Thriller"],
      year: 2004,
    },
  ],
  action: [
    {
      id: 7,
      title: "One Punch Man",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.7,
      episodes: 12,
      genres: ["Action", "Comedy", "Sci-Fi", "Supernatural"],
      year: 2015,
    },
    {
      id: 8,
      title: "Mob Psycho 100",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.7,
      episodes: 12,
      genres: ["Action", "Comedy", "Supernatural"],
      year: 2016,
    },
    {
      id: 9,
      title: "Vinland Saga",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.8,
      episodes: 24,
      genres: ["Action", "Adventure", "Drama", "Historical"],
      year: 2019,
    },
    {
      id: 10,
      title: "Berserk",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.7,
      episodes: 25,
      genres: ["Action", "Adventure", "Drama", "Fantasy", "Horror"],
      year: 1997,
    },
    {
      id: 11,
      title: "Fate/Zero",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.5,
      episodes: 13,
      genres: ["Action", "Fantasy", "Supernatural"],
      year: 2011,
    },
    {
      id: 12,
      title: "Samurai Champloo",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.5,
      episodes: 26,
      genres: ["Action", "Adventure", "Comedy", "Historical"],
      year: 2004,
    },
  ],
  romance: [
    {
      id: 13,
      title: "Your Lie in April",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.7,
      episodes: 22,
      genres: ["Drama", "Music", "Romance", "School"],
      year: 2014,
    },
    {
      id: 14,
      title: "Clannad: After Story",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.9,
      episodes: 24,
      genres: ["Drama", "Romance", "Slice of Life", "Supernatural"],
      year: 2008,
    },
    {
      id: 15,
      title: "Fruits Basket (2019)",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.6,
      episodes: 25,
      genres: ["Comedy", "Drama", "Romance", "Slice of Life", "Supernatural"],
      year: 2019,
    },
    {
      id: 16,
      title: "Toradora!",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.4,
      episodes: 25,
      genres: ["Comedy", "Drama", "Romance", "School", "Slice of Life"],
      year: 2008,
    },
    {
      id: 17,
      title: "Kaguya-sama: Love is War",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.7,
      episodes: 12,
      genres: ["Comedy", "Psychological", "Romance", "School"],
      year: 2019,
    },
    {
      id: 18,
      title: "Horimiya",
      image: "/placeholder.svg?height=400&width=300",
      score: 8.3,
      episodes: 13,
      genres: ["Comedy", "Romance", "School", "Slice of Life"],
      year: 2021,
    },
  ],
}

export default function PopularAnime() {
  const [activeTab, setActiveTab] = useState("all")

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
        <h2 className="text-2xl font-bold">Popular Anime</h2>
        <Button variant="ghost" className="gap-1 text-muted-foreground">
          View All <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="action">Action</TabsTrigger>
          <TabsTrigger value="romance">Romance</TabsTrigger>
        </TabsList>

        {Object.entries(popularAnimeData).map(([category, animes]) => (
          <TabsContent key={category} value={category}>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
              variants={container}
              initial="hidden"
              animate={activeTab === category ? "show" : "hidden"}
            >
              {animes.map((anime) => (
                <motion.div key={anime.id} variants={item}>
                  <AnimeCard
                    id={anime.id}
                    title={anime.title}
                    image={anime.image}
                    score={anime.score}
                    episodes={anime.episodes}
                    genres={anime.genres}
                    year={anime.year}
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

