// check-cdn-data.js
// Script para verificar qué datos están disponibles en el CDN

import { preloadAnimeData } from './services/anime/cdnAnimeService.js';

async function checkCDNData() {
  try {
    console.log('🔍 Verificando datos del CDN...');
    
    const animeData = await preloadAnimeData();
    console.log(`✅ Datos cargados: ${animeData.length} animes`);
    
    // Verificar años disponibles
    const years = [...new Set(animeData.map(a => a.year).filter(Boolean))].sort();
    console.log('\n📅 Años disponibles:', years.slice(-10)); // Últimos 10 años
    
    // Verificar temporadas disponibles
    const seasons = [...new Set(animeData.map(a => a.season).filter(Boolean))];
    console.log('🌱 Temporadas disponibles:', seasons);
    
    // Verificar géneros disponibles
    const allGenres = animeData.flatMap(a => a.genres || []).map(g => g.name);
    const uniqueGenres = [...new Set(allGenres)];
    console.log(`🎭 Géneros únicos: ${uniqueGenres.length}`);
    
    // Verificar estructura de datos
    const sampleAnime = animeData[0];
    console.log('\n📋 Estructura de datos de ejemplo:');
    console.log('- mal_id:', sampleAnime.mal_id);
    console.log('- title:', sampleAnime.title);
    console.log('- year:', sampleAnime.year);
    console.log('- season:', sampleAnime.season);
    console.log('- genres:', sampleAnime.genres?.length || 0);
    console.log('- score:', sampleAnime.score);
    
    // Verificar animes por año reciente
    const recentYear = Math.max(...years);
    const animesInRecentYear = animeData.filter(a => a.year === recentYear);
    console.log(`\n📊 Animes en ${recentYear}: ${animesInRecentYear.length}`);
    
    // Verificar animes por temporada
    if (seasons.length > 0) {
      const seasonCounts = {};
      seasons.forEach(season => {
        seasonCounts[season] = animeData.filter(a => a.season === season).length;
      });
      console.log('\n🌱 Animes por temporada:', seasonCounts);
    }
    
    // Verificar si hay datos de temporadas específicas
    const spring2023 = animeData.filter(a => a.year === 2023 && a.season === 'Spring');
    const spring2024 = animeData.filter(a => a.year === 2024 && a.season === 'Spring');
    
    console.log('\n🔍 Verificación específica:');
    console.log('- Spring 2023:', spring2023.length);
    console.log('- Spring 2024:', spring2024.length);
    
    if (spring2023.length > 0) {
      console.log('\n📺 Ejemplos Spring 2023:');
      spring2023.slice(0, 3).forEach(anime => {
        console.log(`  - ${anime.title} (${anime.mal_id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
  }
}

checkCDNData(); 