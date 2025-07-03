import AnimeList from "@/components/anime-list"
import { SITE_NAME } from "../../lib/siteConfig"

export const metadata = {
  title: `Explorar Anime - ${SITE_NAME}`,
  description: "Explora nuestra colección de anime con datos reales de la API de Jikan",
}

export default function ExplorePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Explorar Anime</h1>
      <AnimeList />
    </div>
  )
}

