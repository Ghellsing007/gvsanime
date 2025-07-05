// test-normalization.mjs
// Script para probar la normalización de imágenes (ES Modules)

import { normalizeImages } from './services/anime/normalizers/jikanNormalizer.js';

// Datos de ejemplo de Jikan (formato snake_case)
const jikanImagesExample = {
  jpg: {
    image_url: "https://cdn.myanimelist.net/images/anime/1141/142503.jpg",
    small_image_url: "https://cdn.myanimelist.net/images/anime/1141/142503t.jpg",
    large_image_url: "https://cdn.myanimelist.net/images/anime/1141/142503l.jpg"
  },
  webp: {
    image_url: "https://cdn.myanimelist.net/images/anime/1141/142503.webp",
    small_image_url: "https://cdn.myanimelist.net/images/anime/1141/142503t.webp",
    large_image_url: "https://cdn.myanimelist.net/images/anime/1141/142503l.webp"
  }
};

console.log('🔍 Probando normalización de imágenes...');
console.log('📥 Datos originales de Jikan:');
console.log(JSON.stringify(jikanImagesExample, null, 2));

const normalizedImages = normalizeImages(jikanImagesExample);

console.log('📤 Datos normalizados:');
console.log(JSON.stringify(normalizedImages, null, 2));

// Verificar que las URLs estén presentes
console.log('✅ Verificación:');
console.log('JPG imageUrl:', normalizedImages.jpg.imageUrl);
console.log('JPG smallImageUrl:', normalizedImages.jpg.smallImageUrl);
console.log('JPG largeImageUrl:', normalizedImages.jpg.largeImageUrl);
console.log('WebP imageUrl:', normalizedImages.webp.imageUrl);
console.log('WebP smallImageUrl:', normalizedImages.webp.smallImageUrl);
console.log('WebP largeImageUrl:', normalizedImages.webp.largeImageUrl);