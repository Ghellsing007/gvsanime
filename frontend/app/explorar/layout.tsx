import { SITE_NAME } from "../../lib/siteConfig"

export const metadata = {
  title: `Explorar Anime - ${SITE_NAME}`,
  description: "Explora nuestra colección de anime con datos reales de la API de Jikan",
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 