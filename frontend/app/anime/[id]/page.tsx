import type { Metadata } from "next"
import AnimeDetails from "@/components/anime-details"
import { SITE_NAME } from "../../../lib/siteConfig"

interface AnimePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: AnimePageProps): Promise<Metadata> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const response = await fetch(`${backendUrl}/anime/${params.id}`)
    const animeData = await response.json()

    return {
      title: `${animeData.title} - ${SITE_NAME}`,
      description: animeData.synopsis?.substring(0, 160) || `Detalles del anime en ${SITE_NAME}`,
    }
  } catch (error) {
    return {
      title: `Detalles del Anime - ${SITE_NAME}`,
      description: `Información detallada sobre este anime en ${SITE_NAME}`,
    }
  }
}

export default function AnimePage({ params }: AnimePageProps) {
  return <AnimeDetails id={params.id} />
}

