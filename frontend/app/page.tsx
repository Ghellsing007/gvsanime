import HeroSection from "@/components/hero-section"
import FeaturedAnime from "@/components/featured-anime"
import PopularAnime from "@/components/popular-anime"
import RecentlyUpdated from "@/components/recently-updated"
import GenreShowcase from "@/components/genre-showcase"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <FeaturedAnime />
      <PopularAnime />
      <RecentlyUpdated />
      <GenreShowcase />
    </div>
  )
}

