// test-jikan-only.js
// Script para probar el sistema con Jikan como fuente de datos

import { 
  getAnimeByIdManager, 
  searchAnimeManager, 
  getTopAnimeManager,
  getDataSourceInfo
} from './backend/services/anime/dataSourceManager.js';

async function testJikanSystem() {
  console.log('🧪 Probando Sistema con Jikan como Fuente de Datos\n');

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
    }
    console.log('');

    // 3. Probar obtener anime por ID
    console.log('🎬 Probando obtención de anime por ID...');
    const animeData = await getAnimeByIdManager('1');
    console.log(`✅ Anime obtenido: ${animeData.title}`);
    console.log(`📄 ID: ${animeData.mal_id}`);
    console.log(`📄 Tipo: ${animeData.type}`);
    console.log('');

    // 4. Probar animes top
    console.log('🏆 Probando animes top...');
    const topAnime = await getTopAnimeManager();
    console.log(`✅ Animes top obtenidos: ${topAnime.length} resultados`);
    if (topAnime.length > 0) {
      console.log(`📄 Primer anime top: ${topAnime[0].title}`);
    }
    console.log('');

    console.log('✅ ¡Sistema funcionando correctamente con Jikan!');
    console.log('🌐 El frontend debería funcionar sin problemas');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar prueba
testJikanSystem(); 