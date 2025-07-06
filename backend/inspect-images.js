import { getAllAnimes } from './services/anime/cdnAnimeService.js';

async function inspectImages() {
    try {
        console.log('🔍 Inspeccionando estructura de imágenes en animes del CDN...\n');
        
        // Obtener los primeros 50 animes para inspeccionar
        const { data: animes } = await getAllAnimes(1, 50);
        
        if (!animes || animes.length === 0) {
            console.log('❌ No se encontraron animes en el CDN');
            return;
        }
        
        console.log(`📊 Total de animes inspeccionados: ${animes.length}\n`);
        
        // Inspeccionar los primeros 5 animes
        const sampleAnimes = animes.slice(0, 5);
        
        sampleAnimes.forEach((anime, index) => {
            console.log(`\n🎬 Anime ${index + 1}: ${anime.title || anime.title_english || 'Sin título'}`);
            console.log(`   MAL ID: ${anime.mal_id}`);
            console.log(`   Tipo: ${anime.type}`);
            console.log(`   Estado: ${anime.status}`);
            
            // Inspeccionar campo images
            console.log(`   📸 Campo 'images':`);
            if (anime.images) {
                console.log(`      Tipo: ${typeof anime.images}`);
                console.log(`      Es objeto: ${typeof anime.images === 'object'}`);
                console.log(`      Es null: ${anime.images === null}`);
                console.log(`      Es array: ${Array.isArray(anime.images)}`);
                
                if (typeof anime.images === 'object' && anime.images !== null) {
                    console.log(`      Propiedades: ${Object.keys(anime.images).join(', ')}`);
                    
                    // Mostrar estructura completa
                    console.log(`      Estructura completa:`);
                    console.log(JSON.stringify(anime.images, null, 6));
                }
            } else {
                console.log(`      ❌ Campo 'images' no existe o es undefined`);
            }
            
            // También revisar si hay otros campos de imagen
            const imageFields = Object.keys(anime).filter(key => 
                key.toLowerCase().includes('image') || 
                key.toLowerCase().includes('img') ||
                key.toLowerCase().includes('poster') ||
                key.toLowerCase().includes('cover')
            );
            
            if (imageFields.length > 0) {
                console.log(`   🔍 Otros campos de imagen encontrados: ${imageFields.join(', ')}`);
                imageFields.forEach(field => {
                    console.log(`      ${field}: ${anime[field]}`);
                });
            }
        });
        
        // Buscar animes con imágenes válidas
        console.log('\n🔍 Buscando animes con imágenes válidas...');
        const animesWithImages = animes.filter(anime => 
            anime.images && 
            typeof anime.images === 'object' && 
            anime.images !== null &&
            Object.keys(anime.images).length > 0
        );
        
        console.log(`📊 Animes con campo 'images' válido: ${animesWithImages.length}`);
        
        if (animesWithImages.length > 0) {
            console.log('\n🎯 Ejemplos de animes con imágenes:');
            animesWithImages.slice(0, 3).forEach((anime, index) => {
                console.log(`\n   ${index + 1}. ${anime.title || anime.title_english}`);
                console.log(`      MAL ID: ${anime.mal_id}`);
                console.log(`      Images: ${JSON.stringify(anime.images, null, 8)}`);
            });
        }
        
        // Buscar patrones en las URLs de imágenes
        console.log('\n🔍 Analizando patrones de URLs de imágenes...');
        const imageUrls = [];
        
        animesWithImages.slice(0, 10).forEach(anime => {
            if (anime.images) {
                Object.values(anime.images).forEach(value => {
                    if (typeof value === 'string' && value.includes('http')) {
                        imageUrls.push(value);
                    } else if (typeof value === 'object' && value !== null) {
                        Object.values(value).forEach(subValue => {
                            if (typeof subValue === 'string' && subValue.includes('http')) {
                                imageUrls.push(subValue);
                            }
                        });
                    }
                });
            }
        });
        
        if (imageUrls.length > 0) {
            console.log(`📊 URLs de imágenes encontradas: ${imageUrls.length}`);
            console.log('\n🌐 Ejemplos de URLs:');
            imageUrls.slice(0, 5).forEach((url, index) => {
                console.log(`   ${index + 1}. ${url}`);
            });
        } else {
            console.log('❌ No se encontraron URLs de imágenes válidas');
        }
        
    } catch (error) {
        console.error('❌ Error al inspeccionar imágenes:', error);
    }
}

// Ejecutar la inspección
inspectImages(); 