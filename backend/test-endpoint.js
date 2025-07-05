import axios from 'axios';

async function testEndpoint() {
  try {
    console.log('🔍 Probando endpoint de anime reciente...');
    const response = await axios.get('http://localhost:5000/api/anime/search?sort=recent');
    const data = response.data;
    
    console.log('📊 Respuesta completa:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      console.log('\n🖼️ Primer anime:');
      const firstAnime = data.data[0];
      console.log('ID:', firstAnime.mal_id);
      console.log('Título:', firstAnime.title);
      console.log('Imágenes:', JSON.stringify(firstAnime.images, null, 2));
      
      if (firstAnime.images) {
        console.log('\n🔍 Detalles de imágenes:');
        console.log('JPG:', firstAnime.images.jpg);
        console.log('WebP:', firstAnime.images.webp);
      } else {
        console.log('❌ No hay imágenes en el primer anime');
      }
    } else {
      console.log('❌ No hay datos de anime en la respuesta');
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
  }
}

testEndpoint(); 