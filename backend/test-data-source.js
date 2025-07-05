// test-data-source.js
// Script para probar el nuevo sistema de gestión de fuentes de datos

import { 
  getAnimeByIdManager, 
  searchAnimeManager, 
  getTopAnimeManager,
  getDataSourceInfo,
  clearMongoDBCache
} from './backend/services/anime/dataSourceManager.js';

// Función para probar diferentes configuraciones
async function testDataSource() {
  console.log('🧪 Probando Sistema de Gestión de Fuentes de Datos\n');

  // 1. Mostrar información actual
  console.log('📊 Información de la fuente de datos actual:');
  const info = getDataSourceInfo();
  console.log(JSON.stringify(info, null, 2));
  console.log('');

  // 2. Probar búsqueda
  console.log('🔍 Probando búsqueda de anime...');
  try {
    const searchResults = await searchAnimeManager('Naruto', 1, 5);
    console.log(`✅ Búsqueda exitosa: ${searchResults.data.length} resultados encontrados`);
    console.log(`📄 Fuente: ${searchResults.data.length > 0 ? 'Datos obtenidos correctamente' : 'Sin resultados'}`);
  } catch (error) {
    console.error('❌ Error en búsqueda:', error.message);
  }
  console.log('');

  // 3. Probar obtener anime por ID
  console.log('🎬 Probando obtención de anime por ID...');
  try {
    const animeData = await getAnimeByIdManager('1');
    console.log(`✅ Anime obtenido: ${animeData.title || 'Sin título'}`);
    console.log(`📄 ID: ${animeData.mal_id || 'N/A'}`);
    console.log(`📄 Tipo: ${animeData.type || 'N/A'}`);
  } catch (error) {
    console.error('❌ Error obteniendo anime:', error.message);
  }
  console.log('');

  // 4. Probar obtener animes top
  console.log('🏆 Probando obtención de animes top...');
  try {
    const topAnime = await getTopAnimeManager();
    console.log(`✅ Animes top obtenidos: ${topAnime.length} resultados`);
    if (topAnime.length > 0) {
      console.log(`📄 Primer anime: ${topAnime[0].title || 'Sin título'}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo animes top:', error.message);
  }
  console.log('');

  // 5. Probar limpiar cache
  console.log('🗑️ Probando limpieza de cache...');
  try {
    const clearResult = await clearMongoDBCache();
    console.log(`✅ Cache limpiado: ${clearResult.message}`);
  } catch (error) {
    console.error('❌ Error limpiando cache:', error.message);
  }
  console.log('');

  console.log('✅ Pruebas completadas');
}

// Función para probar diferentes configuraciones
async function testDifferentConfigurations() {
  console.log('🔄 Probando diferentes configuraciones\n');

  const configs = [
    { name: 'MongoDB', env: { ANIME_DATA_SOURCE: 'mongodb' } },
    { name: 'Jikan', env: { ANIME_DATA_SOURCE: 'jikan' } },
    { name: 'Híbrido', env: { ANIME_DATA_SOURCE: 'hybrid' } },
    { name: 'Forzar Jikan', env: { FORCE_JIKAN: 'true' } }
  ];

  for (const config of configs) {
    console.log(`📋 Probando configuración: ${config.name}`);
    
    // Simular cambio de configuración
    Object.assign(process.env, config.env);
    
    try {
      const info = getDataSourceInfo();
      console.log(`   Fuente actual: ${info.currentSource}`);
      
      const searchResults = await searchAnimeManager('One Piece', 1, 3);
      console.log(`   Búsqueda: ${searchResults.data.length} resultados`);
      
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('');
  }
}

// Función principal
async function main() {
  try {
    await testDataSource();
    console.log('\n' + '='.repeat(50) + '\n');
    await testDifferentConfigurations();
  } catch (error) {
    console.error('💥 Error en las pruebas:', error);
  }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testDataSource, testDifferentConfigurations }; 