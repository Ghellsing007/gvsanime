// test-data-source-logic.js
// Script para probar la lógica de selección de fuente de datos

import { getDataSourceInfo, getAnimeByIdManager } from './services/anime/dataSourceManager.js';

// Función para probar diferentes configuraciones
async function testDataSourceLogic() {
  console.log('🧪 Probando lógica de fuente de datos\n');

  // Configuración 1: Solo Jikan
  console.log('=== CONFIGURACIÓN 1: Solo Jikan ===');
  process.env.ANIME_DATA_SOURCE = 'jikan';
  process.env.FORCE_JIKAN = 'false';
  process.env.CACHE_ENABLED = 'false';
  
  const info1 = getDataSourceInfo();
  console.log('📊 Información de fuente:', info1);
  
  try {
    const anime1 = await getAnimeByIdManager('1');
    console.log('✅ Anime obtenido correctamente');
    console.log(`   - Título: ${anime1.title}`);
    console.log(`   - Imágenes: ${anime1.images?.jpg?.imageUrl ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  // Configuración 2: Solo MongoDB
  console.log('=== CONFIGURACIÓN 2: Solo MongoDB ===');
  process.env.ANIME_DATA_SOURCE = 'mongodb';
  process.env.FORCE_JIKAN = 'false';
  process.env.CACHE_ENABLED = 'true';
  
  const info2 = getDataSourceInfo();
  console.log('📊 Información de fuente:', info2);
  
  try {
    const anime2 = await getAnimeByIdManager('1');
    console.log('✅ Anime obtenido correctamente');
    console.log(`   - Título: ${anime2.title}`);
    console.log(`   - Imágenes: ${anime2.images?.jpg?.imageUrl ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  // Configuración 3: Hybrid
  console.log('=== CONFIGURACIÓN 3: Hybrid ===');
  process.env.ANIME_DATA_SOURCE = 'hybrid';
  process.env.FORCE_JIKAN = 'false';
  process.env.CACHE_ENABLED = 'true';
  
  const info3 = getDataSourceInfo();
  console.log('📊 Información de fuente:', info3);
  
  try {
    const anime3 = await getAnimeByIdManager('1');
    console.log('✅ Anime obtenido correctamente');
    console.log(`   - Título: ${anime3.title}`);
    console.log(`   - Imágenes: ${anime3.images?.jpg?.imageUrl ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  // Configuración 4: FORCE_JIKAN
  console.log('=== CONFIGURACIÓN 4: FORCE_JIKAN ===');
  process.env.ANIME_DATA_SOURCE = 'hybrid';
  process.env.FORCE_JIKAN = 'true';
  process.env.CACHE_ENABLED = 'true';
  
  const info4 = getDataSourceInfo();
  console.log('📊 Información de fuente:', info4);
  
  try {
    const anime4 = await getAnimeByIdManager('1');
    console.log('✅ Anime obtenido correctamente');
    console.log(`   - Título: ${anime4.title}`);
    console.log(`   - Imágenes: ${anime4.images?.jpg?.imageUrl ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  console.log('✅ Pruebas completadas');
}

// Ejecutar pruebas
testDataSourceLogic(); 