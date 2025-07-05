// test-images.js
// Script para probar que las imágenes llegan correctamente

import { searchAnimeManager, getAnimeByIdManager } from './backend/services/anime/dataSourceManager.js';

// Configurar para usar solo Jikan
process.env.ANIME_DATA_SOURCE = 'jikan';
process.env.FORCE_JIKAN = 'false';
process.env.CACHE_ENABLED = 'false';

async function testImages() {
  console.log('🖼️ Probando que las imágenes llegan correctamente\n');

  try {
    // 1. Probar búsqueda
    console.log('🔍 Probando búsqueda con imágenes...');
    const searchResults = await searchAnimeManager('Naruto', 1, 3);
    
    if (searchResults.data.length > 0) {
      const firstAnime = searchResults.data[0];
      console.log(`✅ Primer anime: ${firstAnime.title}`);
      console.log(`📄 ID: ${firstAnime.mal_id}`);
      console.log(`🖼️ Imágenes:`, JSON.stringify(firstAnime.images, null, 2));
      
      // Verificar estructura de imágenes
      if (firstAnime.images && firstAnime.images.jpg) {
        console.log('✅ Estructura de imágenes JPG correcta');
        console.log(`   - imageUrl: ${firstAnime.images.jpg.imageUrl ? '✅' : '❌'}`);
        console.log(`   - smallImageUrl: ${firstAnime.images.jpg.smallImageUrl ? '✅' : '❌'}`);
        console.log(`   - largeImageUrl: ${firstAnime.images.jpg.largeImageUrl ? '✅' : '❌'}`);
      } else {
        console.log('❌ Estructura de imágenes JPG incorrecta');
      }
      
      if (firstAnime.images && firstAnime.images.webp) {
        console.log('✅ Estructura de imágenes WebP correcta');
        console.log(`   - imageUrl: ${firstAnime.images.webp.imageUrl ? '✅' : '❌'}`);
        console.log(`   - smallImageUrl: ${firstAnime.images.webp.smallImageUrl ? '✅' : '❌'}`);
        console.log(`   - largeImageUrl: ${firstAnime.images.webp.largeImageUrl ? '✅' : '❌'}`);
      } else {
        console.log('❌ Estructura de imágenes WebP incorrecta');
      }
    }
    console.log('');

    // 2. Probar anime por ID
    console.log('🎬 Probando anime por ID con imágenes...');
    const animeData = await getAnimeByIdManager('1');
    
    console.log(`✅ Anime: ${animeData.title}`);
    console.log(`📄 ID: ${animeData.mal_id}`);
    console.log(`🖼️ Imágenes:`, JSON.stringify(animeData.images, null, 2));
    
    // Verificar estructura de imágenes
    if (animeData.images && animeData.images.jpg) {
      console.log('✅ Estructura de imágenes JPG correcta');
      console.log(`   - imageUrl: ${animeData.images.jpg.imageUrl ? '✅' : '❌'}`);
      console.log(`   - smallImageUrl: ${animeData.images.jpg.smallImageUrl ? '✅' : '❌'}`);
      console.log(`   - largeImageUrl: ${animeData.images.jpg.largeImageUrl ? '✅' : '❌'}`);
    } else {
      console.log('❌ Estructura de imágenes JPG incorrecta');
    }
    
    if (animeData.images && animeData.images.webp) {
      console.log('✅ Estructura de imágenes WebP correcta');
      console.log(`   - imageUrl: ${animeData.images.webp.imageUrl ? '✅' : '❌'}`);
      console.log(`   - smallImageUrl: ${animeData.images.webp.smallImageUrl ? '✅' : '❌'}`);
      console.log(`   - largeImageUrl: ${animeData.images.webp.largeImageUrl ? '✅' : '❌'}`);
    } else {
      console.log('❌ Estructura de imágenes WebP incorrecta');
    }
    console.log('');

    console.log('✅ Pruebas de imágenes completadas');
    console.log('🌐 Las imágenes deberían llegar correctamente al frontend');

  } catch (error) {
    console.error('❌ Error en las pruebas de imágenes:', error.message);
  }
}

// Ejecutar prueba
testImages(); 