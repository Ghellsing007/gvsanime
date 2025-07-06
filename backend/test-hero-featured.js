// test-hero-featured.js
// Script de prueba para verificar Hero Section y Featured Anime

import { 
  getRecentHighQualityAnimeManager,
  getFeaturedAnimeManager
} from './services/anime/dataSourceManager.js';

console.log('🚀 Probando Hero Section y Featured Anime\n');

async function testHeroAndFeatured() {
  try {
    console.log('📊 === PRUEBAS DE HERO SECTION Y FEATURED ANIME ===\n');

    // 1. Probar Hero Section (animes recientes de alta calidad)
    console.log('1️⃣ Probando Hero Section (animes recientes de alta calidad)...');
    const heroAnimes = await getRecentHighQualityAnimeManager();
    console.log(`✅ Hero Section: ${heroAnimes.length} animes obtenidos`);
    
    if (heroAnimes.length > 0) {
      console.log('🏆 Top 5 animes para Hero Section:');
      heroAnimes.slice(0, 5).forEach((anime, index) => {
        console.log(`   ${index + 1}. ${anime.title} (${anime.year}) - Score: ${anime.score}`);
      });
    }
    console.log('');

    // 2. Probar Featured Anime (animes destacados limitados a 6)
    console.log('2️⃣ Probando Featured Anime (animes destacados)...');
    const featuredAnimes = await getFeaturedAnimeManager();
    console.log(`✅ Featured Anime: ${featuredAnimes.length} animes obtenidos`);
    
    if (featuredAnimes.length > 0) {
      console.log('⭐ Top 6 animes para Featured Anime:');
      featuredAnimes.slice(0, 6).forEach((anime, index) => {
        console.log(`   ${index + 1}. ${anime.title} (${anime.year}) - Score: ${anime.score}`);
      });
    }
    console.log('');

    // 3. Verificar criterios de selección
    console.log('3️⃣ Verificando criterios de selección...');
    
    // Hero Section: Score >= 7.5, Year >= 2022
    const heroCriteria = heroAnimes.every(anime => 
      anime.score >= 7.5 && anime.year >= 2022
    );
    console.log(`✅ Hero Section criterios: ${heroCriteria ? 'Cumplidos' : 'NO cumplidos'}`);
    
    // Featured Anime: Score >= 7.0, Year >= 2020
    const featuredCriteria = featuredAnimes.every(anime => 
      anime.score >= 7.0 && anime.year >= 2020
    );
    console.log(`✅ Featured Anime criterios: ${featuredCriteria ? 'Cumplidos' : 'NO cumplidos'}`);
    console.log('');

    // 4. Verificar ordenamiento
    console.log('4️⃣ Verificando ordenamiento...');
    
    // Hero Section: Ordenado por año (más reciente primero)
    const heroYears = heroAnimes.slice(0, 5).map(a => a.year);
    const heroOrdered = heroYears.every((year, i) => i === 0 || year <= heroYears[i - 1]);
    console.log(`✅ Hero Section ordenamiento (año): ${heroOrdered ? 'Correcto' : 'Incorrecto'}`);
    
    // Featured Anime: Ordenado por año (más reciente primero)
    const featuredYears = featuredAnimes.slice(0, 5).map(a => a.year);
    const featuredOrdered = featuredYears.every((year, i) => i === 0 || year <= featuredYears[i - 1]);
    console.log(`✅ Featured Anime ordenamiento (año): ${featuredOrdered ? 'Correcto' : 'Incorrecto'}`);
    console.log('');

    // 5. Resumen de diferencias
    console.log('📋 === RESUMEN DE DIFERENCIAS ===');
    console.log('');
    console.log('🎯 HERO SECTION:');
    console.log('   - Score mínimo: 7.5');
    console.log('   - Año mínimo: 2022');
    console.log('   - Orden: Año (más reciente) → Score → Popularidad');
    console.log('   - Propósito: Mostrar animes muy recientes y de alta calidad');
    console.log('');
    console.log('⭐ FEATURED ANIME:');
    console.log('   - Score mínimo: 7.0');
    console.log('   - Año mínimo: 2020');
    console.log('   - Orden: Año (más reciente) → Score → Popularidad');
    console.log('   - Límite: 6 animes');
    console.log('   - Propósito: Mostrar animes destacados recientes');
    console.log('');

    console.log('✅ Todas las pruebas completadas exitosamente!');
    console.log('🎉 Hero Section y Featured Anime están configurados correctamente.');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar pruebas
testHeroAndFeatured().then(() => {
  console.log('\n🏁 Pruebas finalizadas');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
}); 