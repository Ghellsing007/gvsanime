import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface AnimeSearchAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (anime: any) => void;
  placeholder?: string;
  size?: "small" | "large";
  className?: string;
  inputClassName?: string;
}

export const AnimeSearchAutocomplete: React.FC<AnimeSearchAutocompleteProps> = ({
  value = "",
  onChange,
  onSelect,
  placeholder = "Buscar anime...",
  size = "large",
  className = "",
  inputClassName = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      setShowSuggestions(false);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/anime/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = res.data?.data || [];
        setSuggestions(data.slice(0, 5));
        setShowSuggestions(true);
      } catch (err) {
        setError("Error buscando sugerencias");
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery]);

  // Cerrar sugerencias al perder foco
  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
    onChange?.(e.target.value);
  };

  const handleSuggestionClick = (anime: any) => {
    setShowSuggestions(false);
    setSearchQuery("");
    onSelect?.(anime);
  };

  // Tamaños
  const inputSizeClass = size === "small"
    ? "w-[200px] lg:w-[300px] text-sm h-9"
    : "w-full max-w-xl text-base h-12";

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        className={cn(inputSizeClass, inputClassName)}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => searchQuery && setShowSuggestions(true)}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {/* Sugerencias de autocompletado */}
      {showSuggestions && (searchQuery || loading) && (
        <div className={cn(
          "absolute left-0 top-full mt-1 w-full bg-background border rounded shadow-lg z-50",
          size === "small" ? "" : "max-w-xl"
        )}>
          {loading ? (
            <div className="p-2 text-sm text-muted-foreground">Buscando...</div>
          ) : error ? (
            <div className="p-2 text-sm text-destructive">{error}</div>
          ) : suggestions.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">No se encontraron resultados</div>
          ) : (
            suggestions.map((anime) => (
              <Link
                key={anime.mal_id || anime.id}
                href={`/anime/${anime.mal_id || anime.id}`}
                className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => handleSuggestionClick(anime)}
              >
                <img
                  src={anime.images?.jpg?.imageUrl || "/placeholder.jpg"}
                  alt={anime.title}
                  className="w-10 h-14 object-cover rounded"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm line-clamp-1">{anime.title}</span>
                  <span className="text-xs text-muted-foreground">{anime.year || "Sin año"}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AnimeSearchAutocomplete; 