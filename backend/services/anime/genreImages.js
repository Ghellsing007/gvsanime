// genreImages.js
// Imágenes por defecto para los géneros de anime

export const genreImages = {
  "Action": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Adventure": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Comedy": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Drama": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Fantasy": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Horror": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Mystery": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Romance": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Sci-Fi": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Slice of Life": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Sports": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Supernatural": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Thriller": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Psychological": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Demons": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Magic": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Martial Arts": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Mecha": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Music": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Parody": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Samurai": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "School": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Shoujo": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Shounen": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Space": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Super Power": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Vampire": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Yaoi": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Yuri": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Harem": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Military": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Police": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Seinen": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Josei": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Cars": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Dementia": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Ecchi": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Game": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Hentai": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Historical": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Kids": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Shoujo Ai": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  "Shounen Ai": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop"
};

// Función para obtener la imagen de un género
export function getGenreImage(genreName) {
  return genreImages[genreName] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop";
}

// Función para enriquecer géneros con imágenes
export function enrichGenresWithImages(genres) {
  return genres.map(genre => ({
    ...genre,
    image: getGenreImage(genre.name),
    description: `Explora animes del género ${genre.name}`
  }));
} 