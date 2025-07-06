import axios from 'axios';

async function testGenres() {
  console.log('🧪 Probando endpoint /anime/genres...\n');

  try {
    const response = await axios.get('http://localhost:5000/api/anime/genres');
    const data = response.data;
    
    console.log('✅ Géneros obtenidos exitosamente');
    console.log(`📊 Total de géneros: ${data.genres.length}`);
    
    // Mostrar los primeros 5 géneros con más detalle
    console.log('\n🎬 Primeros 5 géneros con detalles:');
    data.genres.slice(0, 5).forEach((genre, index) => {
      console.log(`   ${index + 1}. ${genre.name} (ID: ${genre.mal_id})`);
      console.log(`      Contador: ${genre.count?.toLocaleString()} animes`);
      console.log(`      Imagen: ${genre.image}`);
      console.log(`      Descripción: ${genre.description}`);
      console.log('');
    });
    
    // Verificar si hay géneros con count
    const genresWithCount = data.genres.filter(g => g.count !== undefined);
    console.log(`📈 Géneros con contador: ${genresWithCount.length}`);
    
    if (genresWithCount.length > 0) {
      console.log('\n📊 Top 5 géneros por cantidad:');
      genresWithCount
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 5)
        .forEach((genre, index) => {
          console.log(`   ${index + 1}. ${genre.name}: ${genre.count?.toLocaleString()} animes`);
        });
    }
    
    // Verificar imágenes únicas
    const uniqueImages = new Set(data.genres.map(g => g.image));
    console.log(`\n🖼️ Imágenes únicas encontradas: ${uniqueImages.size}`);
    console.log('🖼️ URLs de imágenes:');
    Array.from(uniqueImages).slice(0, 3).forEach((img, index) => {
      console.log(`   ${index + 1}. ${img}`);
    });
    
    // Verificar si todos los géneros tienen imagen
    const genresWithoutImage = data.genres.filter(g => !g.image);
    console.log(`\n🖼️ Géneros sin imagen: ${genresWithoutImage.length}`);
    
    // Verificar si todos los géneros tienen descripción
    const genresWithoutDescription = data.genres.filter(g => !g.description);
    console.log(`📝 Géneros sin descripción: ${genresWithoutDescription.length}`);
    
    console.log('\n🎉 ¡Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
    }
  }
}

testGenres(); 