// test-jikan.js
// Script para probar directamente la API de Jikan

import { searchAnime } from './services/anime/jikanService.js';

async function testJikan() {
  try {
    console.log('🔍 Probando API de Jikan directamente...');
    const results = await searchAnime('naruto');
    
    if (results && results.length > 0) {
      const anime = results[0];
      console.log('🎬 Anime encontrado:', anime.title);
      console.log('🖼️ Estructura de imágenes original de Jikan:');
      console.log(JSON.stringify(anime.images, null, 2));
      
      // Verificar formato
      if (anime.images?.jpg?.image_url) {
        console.log('✅ Tiene formato snake_case (image_url)');
        console.log('📷 URL de imagen JPG:', anime.images.jpg.image_url);
      } else {
        console.log('❌ No tiene URLs de imágenes');
      }
    } else {
      console.log('❌ No se encontraron resultados');
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testJikan(); 