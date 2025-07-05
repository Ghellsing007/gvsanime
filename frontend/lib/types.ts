// types.ts
// Tipos TypeScript centralizados para el frontend

// ============================================================================
// TIPOS DE ANIME
// ============================================================================

export interface AnimeImages {
  jpg?: {
    // snake_case (formato original de Jikan)
    image_url?: string;
    small_image_url?: string;
    large_image_url?: string;
    // camelCase (formato normalizado por nuestro backend)
    imageUrl?: string;
    smallImageUrl?: string;
    largeImageUrl?: string;
  };
  webp?: {
    // snake_case (formato original de Jikan)
    image_url?: string;
    small_image_url?: string;
    large_image_url?: string;
    // camelCase (formato normalizado por nuestro backend)
    imageUrl?: string;
    smallImageUrl?: string;
    largeImageUrl?: string;
  };
}

export interface AnimeTrailer {
  youtubeId: string;
  url: string;
  embedUrl: string;
}

export interface AnimeAired {
  from?: string;
  to?: string;
  string?: string;
}

export interface AnimeGenre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface AnimeProducer {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface AnimeStudio {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface AnimeTheme {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface AnimeDemographic {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface Anime {
  // IDs
  mal_id: number;
  anilist_id?: number;
  kitsu_id?: number;
  
  // Información básica
  title: string;
  title_english?: string;
  title_japanese?: string;
  title_synonyms?: string[];
  type?: string;
  source?: string;
  
  // Episodios y duración
  episodes?: number;
  duration?: string;
  
  // Estado y emisión
  status?: string;
  airing?: boolean;
  aired?: AnimeAired;
  season?: string;
  year?: number;
  broadcast?: {
    day?: string;
    time?: string;
    timezone?: string;
    string?: string;
  };
  
  // Clasificación y puntuación
  rating?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  
  // Contenido
  synopsis?: string;
  background?: string;
  
  // Relaciones
  genres?: AnimeGenre[];
  explicit_genres?: AnimeGenre[];
  themes?: AnimeTheme[];
  demographics?: AnimeDemographic[];
  producers?: AnimeProducer[];
  licensors?: AnimeProducer[];
  studios?: AnimeStudio[];
  
  // Media
  images?: AnimeImages;
  trailer: AnimeTrailer;
  
  // URLs
  url?: string;
  
  // Metadatos
  approved?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Datos personalizados (desde nuestro backend)
  favoritesCount?: number;
  isFavorite?: boolean;
  userReview?: AnimeReview;
  reviews?: AnimeReview[];
  comments?: AnimeComment[];
  forums?: AnimeForum[];
}

// ============================================================================
// TIPOS DE USUARIO
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    favorites: boolean;
    comments: boolean;
  };
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  website?: string;
  social?: {
    twitter?: string;
    instagram?: string;
    discord?: string;
  };
  stats?: {
    favoritesCount: number;
    watchlistCount: number;
    reviewsCount: number;
    commentsCount: number;
  };
}

// ============================================================================
// TIPOS DE REVIEWS Y COMENTARIOS
// ============================================================================

export interface AnimeReview {
  id: string;
  animeId: number;
  userId: string;
  user: {
    username: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  content: string;
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnimeComment {
  id: string;
  animeId: number;
  userId: string;
  user: {
    username: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  parentId?: string; // Para respuestas
  replies?: AnimeComment[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TIPOS DE FOROS
// ============================================================================

export interface AnimeForum {
  id: string;
  animeId: number;
  title: string;
  description: string;
  category: string;
  topicsCount: number;
  postsCount: number;
  lastActivity: string;
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  forumId: string;
  title: string;
  content: string;
  userId: string;
  user: {
    username: string;
    avatar?: string;
  };
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  replies: number;
  lastReply?: {
    user: string;
    date: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ForumPost {
  id: string;
  topicId: string;
  content: string;
  userId: string;
  user: {
    username: string;
    avatar?: string;
  };
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TIPOS DE LISTAS Y FAVORITOS
// ============================================================================

export interface UserList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  animeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserListAnime {
  id: string;
  listId: string;
  animeId: number;
  anime: Anime;
  addedAt: string;
  notes?: string;
}

export interface WatchlistEntry {
  id: string;
  userId: string;
  animeId: number;
  anime: Anime;
  status: 'planning' | 'watching' | 'completed' | 'dropped' | 'paused';
  progress?: number; // Episodio actual
  rating?: number;
  notes?: string;
  addedAt: string;
  updatedAt: string;
}

// ============================================================================
// TIPOS DE API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchResponse {
  source: 'jikan' | 'cache' | 'database';
  results: Anime[];
  animeIds?: string[];
}

// ============================================================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ============================================================================

export interface SearchFilters {
  query?: string;
  genre?: string;
  season?: string;
  year?: number;
  type?: string;
  status?: string;
  rating?: string;
  sort?: 'title' | 'score' | 'popularity' | 'date' | 'episodes';
  order?: 'asc' | 'desc';
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// ============================================================================
// TIPOS DE COMPONENTES
// ============================================================================

export interface AnimeCardProps {
  id: number;
  title: string;
  images?: AnimeImages;
  score?: number;
  episodes?: number;
  genres?: string[];
  year?: number;
  season?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export interface AnimeDetailsProps {
  id: string;
}

export interface HeroSectionProps {
  // Por ahora no tiene props, pero se puede extender
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

export interface AnimeEvent {
  type: 'favorite' | 'unfavorite' | 'watchlist' | 'rating' | 'comment';
  animeId: number;
  userId: string;
  data?: any;
  timestamp: string;
}

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  apiUrl: string;
  features: {
    auth: boolean;
    favorites: boolean;
    watchlist: boolean;
    comments: boolean;
    forums: boolean;
    reviews: boolean;
  };
}

// ============================================================================
// TIPOS DE ERRORES
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// TIPOS DE UTILIDADES
// ============================================================================

export interface ImageOptions {
  format?: 'jpg' | 'webp';
  quality?: 'small' | 'medium' | 'large';
  fallback?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  Anime,
  User,
  UserProfile,
  AnimeReview,
  AnimeComment,
  AnimeForum,
  ForumTopic,
  ForumPost,
  UserList,
  WatchlistEntry,
  SearchFilters,
  ApiResponse,
  PaginatedResponse,
  SearchResponse,
  AnimeCardProps,
  AnimeDetailsProps,
  HeroSectionProps,
  SiteConfig,
  ApiError,
  ValidationError,
  ImageOptions,
  PaginationOptions,
}; 