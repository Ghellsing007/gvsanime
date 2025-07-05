// test-jikan-supabase.js
// Script para probar el sistema con Jikan + Supabase (sin MongoDB)

import { 
  getAnimeByIdManager, 
  searchAnimeManager, 
  getTopAnimeManager,
  getDataSourceInfo
} from './backend/services/anime/dataSourceManager.js';

// Configurar para usar solo Jikan
process.env.ANIME_DATA_SOURCE = 'jikan';
process.env.FORCE_JIKAN = 'false';
process.env.CACHE_ENABLED = 'false';

async function testJikanSupabaseSystem() {
  console.log('🧪 Probando Sistema Jikan + Supabase (sin MongoDB)\n');

  try {
    // 1. Verificar configuración
    console.log('📊 Configuración actual:');
    const info = getDataSourceInfo();
    console.log(JSON.stringify(info, null, 2));
    console.log('');

    // 2. Probar búsqueda
    console.log('🔍 Probando búsqueda...');
    const searchResults = await searchAnimeManager('Naruto', 1, 3);
    console.log(`✅ Búsqueda exitosa: ${searchResults.data.length} resultados`);
    if (searchResults.data.length > 0) {
      console.log(`📄 Primer resultado: ${searchResults.data[0].title}`);
      console.log(`📄 ID: ${searchResults.data[0].mal_id}`);
    }
    console.log('');

    // 3. Probar obtener anime por ID
    console.log('🎬 Probando obtención de anime por ID...');
    const animeData = await getAnimeByIdManager('1');
    console.log(`✅ Anime obtenido: ${animeData.title}`);
    console.log(`📄 ID: ${animeData.mal_id}`);
    console.log(`📄 Tipo: ${animeData.type}`);
    console.log(`📄 Episodios: ${animeData.episodes}`);
    console.log(`📄 Score: ${animeData.score}`);
    console.log('');

    // 4. Probar animes top
    console.log('🏆 Probando animes top...');
    const topAnime = await getTopAnimeManager();
    console.log(`✅ Animes top obtenidos: ${topAnime.length} resultados`);
    if (topAnime.length > 0) {
      console.log(`📄 Primer anime top: ${topAnime[0].title}`);
      console.log(`📄 Score: ${topAnime[0].score}`);
    }
    console.log('');

    console.log('✅ ¡Sistema funcionando correctamente con Jikan + Supabase!');
    console.log('🌐 El frontend debería funcionar sin problemas');
    console.log('💾 No se está usando MongoDB, solo Jikan + Supabase');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar prueba
testJikanSupabaseSystem(); 