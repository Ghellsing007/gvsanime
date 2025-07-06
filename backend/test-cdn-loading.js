// test-cdn-loading.js
// Script para probar el comportamiento del middleware cuando el CDN está cargando

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/anime';

// Colores para console.log
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testCDNLoading() {
  log('🧪 Probando comportamiento del middleware CDN...', 'yellow');
  
  try {
    // 1. Verificar estado actual del CDN
    log('\n📊 Verificando estado actual del CDN...', 'blue');
    const statsResponse = await axios.get(`${BASE_URL}/datasource/cdn/stats`);
    const stats = statsResponse.data;
    
    log(`✅ CDN Status: ${stats.isLoaded ? 'Listo' : 'Cargando'}`, 'green');
    log(`📈 Total Animes: ${stats.totalAnimes}`, 'blue');
    
    if (stats.isLoaded) {
      log('✅ El CDN está listo, probando endpoints protegidos...', 'green');
      
      // Probar endpoints que requieren CDN listo
      const endpoints = [
        '/search?q=naruto&limit=3',
        '/?page=1&limit=5',
        '/1',
        '/genres'
      ];
      
      for (const endpoint of endpoints) {
        try {
          log(`🔍 Probando: ${endpoint}`, 'blue');
          const response = await axios.get(`${BASE_URL}${endpoint}`);
          log(`✅ Éxito: ${response.status}`, 'green');
        } catch (error) {
          if (error.response?.status === 503) {
            log(`❌ Bloqueado por middleware: ${error.response.data.message}`, 'red');
          } else {
            log(`❌ Error: ${error.message}`, 'red');
          }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      log('⚠️ El CDN está cargando, probando bloqueo de endpoints...', 'yellow');
      
      // Probar que los endpoints estén bloqueados
      const endpoints = [
        '/search?q=naruto&limit=3',
        '/?page=1&limit=5'
      ];
      
      for (const endpoint of endpoints) {
        try {
          log(`🔍 Probando: ${endpoint}`, 'blue');
          const response = await axios.get(`${BASE_URL}${endpoint}`);
          log(`❌ ERROR: Debería estar bloqueado pero respondió ${response.status}`, 'red');
        } catch (error) {
          if (error.response?.status === 503) {
            const errorData = error.response.data;
            log(`✅ Correctamente bloqueado: ${errorData.status}`, 'green');
            log(`📝 Mensaje: ${errorData.message}`, 'blue');
            log(`⏱️ Retry After: ${errorData.retryAfter}s`, 'blue');
          } else {
            log(`❌ Error inesperado: ${error.message}`, 'red');
          }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 2. Probar endpoints que NO requieren CDN
    log('\n🔓 Probando endpoints que NO requieren CDN...', 'blue');
    const publicEndpoints = [
      '/datasource/info',
      '/datasource/cdn/stats'
    ];
    
    for (const endpoint of publicEndpoints) {
      try {
        log(`🔍 Probando: ${endpoint}`, 'blue');
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        log(`✅ Éxito: ${response.status}`, 'green');
      } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } catch (error) {
    log(`💥 Error general: ${error.message}`, 'red');
  }
}

// Función para simular carga lenta del CDN (para testing)
async function simulateSlowCDN() {
  log('\n🐌 Simulando carga lenta del CDN...', 'yellow');
  
  // Forzar recarga del CDN
  try {
    log('🔄 Forzando recarga del CDN...', 'blue');
    await axios.post(`${BASE_URL}/datasource/cdn/reload`);
    log('✅ Recarga iniciada', 'green');
    
    // Esperar un poco y probar endpoints
    log('⏳ Esperando 2 segundos...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Probar endpoints mientras carga
    const endpoints = [
      '/search?q=naruto&limit=3',
      '/?page=1&limit=5'
    ];
    
    for (const endpoint of endpoints) {
      try {
        log(`🔍 Probando: ${endpoint}`, 'blue');
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        log(`✅ Éxito: ${response.status}`, 'green');
      } catch (error) {
        if (error.response?.status === 503) {
          const errorData = error.response.data;
          log(`✅ Correctamente bloqueado: ${errorData.status}`, 'green');
          log(`📝 Mensaje: ${errorData.message}`, 'blue');
        } else {
          log(`❌ Error: ${error.message}`, 'red');
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    log(`❌ Error simulando carga lenta: ${error.message}`, 'red');
  }
}

// Ejecutar pruebas
async function main() {
  await testCDNLoading();
  
  // Preguntar si quiere simular carga lenta
  log('\n💡 Para simular carga lenta del CDN, ejecuta: node test-cdn-loading.js --slow', 'blue');
}

main().catch(error => {
  log(`💥 Error ejecutando pruebas: ${error.message}`, 'red');
}); 