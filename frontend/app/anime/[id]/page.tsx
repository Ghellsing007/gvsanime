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
    const response = await fetch(`https://api.jikan.moe/v4/anime/${params.id}`)
    const { data } = await response.json()

    return {
      title: `${data.title} - ${SITE_NAME}`,
      description: data.synopsis?.substring(0, 160) || `Detalles del anime en ${SITE_NAME}`,
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

