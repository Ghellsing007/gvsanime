// test-specific-anime.js
// Script para probar específicamente el anime 40747

import { getAnimeByIdManager } from './backend/services/anime/dataSourceManager.js';
import { normalizeImages } from './backend/services/anime/normalizers/jikanNormalizer.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar para usar solo Jikan
process.env.ANIME_DATA_SOURCE = 'jikan';
process.env.FORCE_JIKAN = 'false';
process.env.CACHE_ENABLED = 'false';

async function testSpecificAnime() {
  console.log('🎬 Probando anime específico 40747\n');

  try {
    // 1. Obtener datos directamente de Jikan
    console.log('🔍 Obteniendo datos directamente de Jikan...');
    const jikanResponse = await axios.get('https://api.jikan.moe/v4/anime/40747');
    const jikanData = jikanResponse.data.data;
    
    console.log('📄 Datos originales de Jikan:');
    console.log(`   - Título: ${jikanData.title}`);
    console.log(`   - ID: ${jikanData.mal_id}`);
    console.log(`   - Imágenes originales:`, JSON.stringify(jikanData.images, null, 2));
    
    // 2. Probar normalización
    console.log('\n🔄 Probando normalización...');
    const normalizedImages = normalizeImages(jikanData.images);
    console.log('📄 Imágenes normalizadas:');
    console.log(JSON.stringify(normalizedImages, null, 2));
    
    // 3. Probar con nuestro gestor
    console.log('\n🎯 Probando con nuestro gestor...');
    const animeData = await getAnimeByIdManager('40747');
    
    console.log('📄 Datos del gestor:');
    console.log(`   - Título: ${animeData.title}`);
    console.log(`   - ID: ${animeData.mal_id}`);
    console.log(`   - Imágenes del gestor:`, JSON.stringify(animeData.images, null, 2));
    
    // 4. Verificar si las imágenes son null
    if (animeData.images && animeData.images.jpg) {
      console.log('\n✅ Verificación de imágenes:');
      console.log(`   - imageUrl: ${animeData.images.jpg.imageUrl ? '✅' : '❌'}`);
      console.log(`   - smallImageUrl: ${animeData.images.jpg.smallImageUrl ? '✅' : '❌'}`);
      console.log(`   - largeImageUrl: ${animeData.images.jpg.largeImageUrl ? '✅' : '❌'}`);
    } else {
      console.log('\n❌ No hay imágenes JPG');
    }
    
    if (animeData.images && animeData.images.webp) {
      console.log('\n✅ Verificación de imágenes WebP:');
      console.log(`   - imageUrl: ${animeData.images.webp.imageUrl ? '✅' : '❌'}`);
      console.log(`   - smallImageUrl: ${animeData.images.webp.smallImageUrl ? '✅' : '❌'}`);
      console.log(`   - largeImageUrl: ${animeData.images.webp.largeImageUrl ? '✅' : '❌'}`);
    } else {
      console.log('\n❌ No hay imágenes WebP');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar prueba
testSpecificAnime(); 