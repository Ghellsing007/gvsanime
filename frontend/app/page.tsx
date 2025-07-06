import CDNLoading from "@/components/cdn-loading"
import HeroSection from "@/components/hero-section"
import FeaturedAnime from "@/components/featured-anime"
import PopularAnime from "@/components/popular-anime"
import RecentlyUpdated from "@/components/recently-updated"
import GenreShowcase from "@/components/genre-showcase"

export default function HomePage() {
  return (
    <CDNLoading>
      <div className="space-y-12">
        <HeroSection />
        <FeaturedAnime />
        <PopularAnime />
        <RecentlyUpdated />
        <GenreShowcase />
      </div>
    </CDNLoading>
  )
}

