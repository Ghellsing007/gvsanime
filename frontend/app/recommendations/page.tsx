"use client";

import { useEffect, useState } from "react";
import AnimeCard from "@/components/anime-card";
import { Loader2 } from "lucide-react";
import AnimeSearchAutocomplete from "@/components/AnimeSearchAutocomplete";
import api from "@/lib/api";

export default function RecommendationsPage() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Obtener recomendaciones al cargar la página
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/anime/recommendations");
      setAnimes(res.data.results || res.data.data || []);
    } catch (err) {
      setError("Error al cargar recomendaciones. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError("");
    try {
      const res = await api.get(`/anime/search?q=${encodeURIComponent(searchQuery)}&limit=24`);
      setAnimes(res.data.data || []);
    } catch (err) {
      setError("Error al buscar animes. Intenta de nuevo más tarde.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Recomendaciones de Anime</h1>
      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8 items-center">
        <AnimeSearchAutocomplete
          size="large"
          placeholder="Buscar anime..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          disabled={searching}
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" /> : null}
          Buscar
        </button>
      </form>

      {error && <p className="text-center text-red-500 mb-6">{error}</p>}

      {loading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : animes.length === 0 ? (
        <p className="text-center text-muted-foreground">No se encontraron recomendaciones.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {animes.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              id={anime.mal_id}
              title={anime.title}
              images={anime.images}
              score={anime.score}
              episodes={anime.episodes}
              year={anime.year}
              season={anime.season}
            />
          ))}
        </div>
      )}
    </div>
  );
} 