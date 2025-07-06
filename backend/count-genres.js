import { getAllAnimes } from './services/anime/cdnAnimeService.js';

async function countGenres() {
    try {
        console.log('🔍 Contando géneros únicos en el CDN...\n');
        
        // Obtener todos los animes para analizar géneros
        const { data: animes } = await getAllAnimes(1, 1000); // Primeros 1000 para análisis
        
        if (!animes || animes.length === 0) {
            console.log('❌ No se encontraron animes en el CDN');
            return;
        }
        
        console.log(`📊 Analizando ${animes.length} animes...\n`);
        
        // Extraer todos los géneros únicos
        const allGenres = new Set();
        const genreCounts = {};
        
        animes.forEach(anime => {
            if (anime.genres && Array.isArray(anime.genres)) {
                anime.genres.forEach(genre => {
                    if (genre.name) {
                        allGenres.add(genre.name);
                        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
                    }
                });
            }
        });
        
        const uniqueGenres = Array.from(allGenres).sort();
        
        console.log(`🎯 Total de géneros únicos encontrados: ${uniqueGenres.length}\n`);
        
        console.log('📋 Lista completa de géneros:');
        uniqueGenres.forEach((genre, index) => {
            const count = genreCounts[genre];
            console.log(`   ${index + 1}. ${genre} (${count} animes)`);
        });
        
        // Mostrar los géneros más populares
        console.log('\n🔥 Top 10 géneros más populares:');
        const sortedGenres = Object.entries(genreCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
            
        sortedGenres.forEach(([genre, count], index) => {
            console.log(`   ${index + 1}. ${genre}: ${count} animes`);
        });
        
        // Verificar si hay géneros que no están en el archivo de imágenes por defecto
        console.log('\n🔍 Verificando géneros sin imagen por defecto...');
        const { genreImages } = await import('./services/anime/genreImages.js');
        const missingGenres = uniqueGenres.filter(genre => !genreImages[genre]);
        
        if (missingGenres.length > 0) {
            console.log(`⚠️  Géneros sin imagen por defecto (${missingGenres.length}):`);
            missingGenres.forEach(genre => {
                console.log(`   - ${genre}`);
            });
        } else {
            console.log('✅ Todos los géneros tienen imagen por defecto');
        }
        
    } catch (error) {
        console.error('❌ Error al contar géneros:', error);
    }
}

// Ejecutar el conteo
countGenres(); 