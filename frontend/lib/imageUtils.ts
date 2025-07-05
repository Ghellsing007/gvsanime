// imageUtils.ts
// Utilidades para manejar las diferentes calidades de imágenes de la API de Jikan

import type { AnimeImages, ImageOptions } from './types';

/**
 * Obtiene la URL de imagen optimizada para diferentes contextos
 */
export function getAnimeImage(
  images: AnimeImages | undefined,
  options: ImageOptions = {}
): string {
  const { format = 'jpg', quality = 'medium', fallback = '/placeholder.svg' } = options;

  if (!images) {
    return fallback;
  }

  const formatImages = images[format];
  
  if (!formatImages) {
    return fallback;
  }

  // Seleccionar calidad según el contexto
  let imageUrl: string | undefined;
  
  switch (quality) {
    case 'small':
      imageUrl = formatImages.smallImageUrl || formatImages.small_image_url;
      break;
    case 'large':
      imageUrl = formatImages.largeImageUrl || formatImages.large_image_url;
      break;
    case 'medium':
    default:
      imageUrl = formatImages.imageUrl || formatImages.image_url;
      break;
  }

  return imageUrl || fallback;
}

/**
 * Obtiene la imagen optimizada para hero/banner (alta calidad)
 * Prioriza WebP large, fallback a JPG large
 */
export function getHeroImage(images: AnimeImages | undefined): string {
  // Intentar WebP large primero
  const webpLarge = getAnimeImage(images, { quality: 'large', format: 'webp' });
  if (webpLarge !== '/placeholder.svg') {
    return webpLarge;
  }
  
  // Fallback a JPG large
  return getAnimeImage(images, { quality: 'large', format: 'jpg' });
}

/**
 * Obtiene la imagen optimizada para cards (calidad media)
 * Prioriza WebP medium, fallback a JPG medium
 */
export function getCardImage(images: AnimeImages | undefined): string {
  
  // Intentar WebP medium primero
  const webpMedium = getAnimeImage(images, { quality: 'medium', format: 'webp' });
  
  if (webpMedium !== '/placeholder.svg') {
    return webpMedium;
  }
  
  // Fallback a JPG medium
  const jpgMedium = getAnimeImage(images, { quality: 'medium', format: 'jpg' });
  return jpgMedium;
}

/**
 * Obtiene la imagen optimizada para thumbnails (baja calidad)
 * Prioriza WebP small, fallback a JPG small
 */
export function getThumbnailImage(images: AnimeImages | undefined): string {
  // Intentar WebP small primero
  const webpSmall = getAnimeImage(images, { quality: 'small', format: 'webp' });
  if (webpSmall !== '/placeholder.svg') {
    return webpSmall;
  }
  
  // Fallback a JPG small
  return getAnimeImage(images, { quality: 'small', format: 'jpg' });
}

/**
 * Obtiene la imagen en formato WebP si está disponible
 */
export function getWebPImage(images: AnimeImages | undefined, quality: 'small' | 'medium' | 'large' = 'medium'): string {
  return getAnimeImage(images, { format: 'webp', quality });
}

/**
 * Verifica si una imagen existe
 */
export function hasImage(images: AnimeImages | undefined): boolean {
  if (!images) return false;
  return !!(images.jpg?.imageUrl || images.jpg?.image_url || images.webp?.imageUrl || images.webp?.image_url);
}

/**
 * Función de debug para mostrar todas las URLs de imágenes disponibles
 */
export function debugImageUrls(images: AnimeImages | undefined): void {
  if (!images) {
    return;
  }

  // Mostrar qué imagen se seleccionaría para hero
  const heroImage = getHeroImage(images);
} 