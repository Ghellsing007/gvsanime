// test-cdn-integration.js
// Script para probar la integración del CDN JSON

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/anime';

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

async function testEndpoint(endpoint, description) {
  try {
    log(`🔍 Probando: ${description}`, 'blue');
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    log(`✅ Éxito: ${response.status}`, 'green');
    return { success: true, data: response.data };
  } catch (error) {
    log(`❌ Error: ${error.response?.status || error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testPostEndpoint(endpoint, description) {
  try {
    log(`🔍 Probando: ${description}`, 'blue');
    const response = await axios.post(`${BASE_URL}${endpoint}`);
    log(`✅ Éxito: ${response.status}`, 'green');
    return { success: true, data: response.data };
  } catch (error) {
    log(`❌ Error: ${error.response?.status || error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('🚀 Iniciando pruebas de integración CDN...', 'yellow');
  log('', 'reset');

  const tests = [
    // Pruebas de información del sistema
    {
      endpoint: '/datasource/info',
      description: 'Información de fuente de datos',
      method: 'GET'
    },
    {
      endpoint: '/datasource/cdn/stats',
      description: 'Estadísticas del CDN',
      method: 'GET'
    },

    // Pruebas de búsqueda
    {
      endpoint: '/search?q=naruto&limit=5',
      description: 'Búsqueda de anime (Naruto)',
      method: 'GET'
    },
    {
      endpoint: '/search?q=one piece&limit=3',
      description: 'Búsqueda de anime (One Piece)',
      method: 'GET'
    },

    // Pruebas de anime específico
    {
      endpoint: '/1',
      description: 'Anime por ID (1)',
      method: 'GET'
    },
    {
      endpoint: '/21',
      description: 'Anime por ID (21)',
      method: 'GET'
    },

    // Pruebas de listados
    {
      endpoint: '/?page=1&limit=10',
      description: 'Lista de animes paginada',
      method: 'GET'
    },

    // Pruebas de géneros
    {
      endpoint: '/genre/1?page=1&limit=5',
      description: 'Animes por género (Action)',
      method: 'GET'
    },

    // Pruebas de géneros disponibles
    {
      endpoint: '/genres',
      description: 'Lista de géneros',
      method: 'GET'
    }
  ];

  const results = [];
  
  for (const test of tests) {
    const result = test.method === 'POST' 
      ? await testPostEndpoint(test.endpoint, test.description)
      : await testEndpoint(test.endpoint, test.description);
    
    results.push({
      ...test,
      ...result
    });
    
    // Pausa entre pruebas
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Resumen de resultados
  log('', 'reset');
  log('📊 RESUMEN DE PRUEBAS', 'yellow');
  log('', 'reset');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  log(`✅ Exitosas: ${successful}`, 'green');
  log(`❌ Fallidas: ${failed}`, 'red');
  log(`📈 Total: ${results.length}`, 'blue');

  // Mostrar detalles de errores
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    log('', 'reset');
    log('🔍 DETALLES DE ERRORES:', 'red');
    failedTests.forEach(test => {
      log(`- ${test.description}: ${test.error}`, 'red');
    });
  }

  // Mostrar información útil
  log('', 'reset');
  log('💡 INFORMACIÓN ÚTIL:', 'blue');
  log('- Para cambiar a CDN: ANIME_DATA_SOURCE=cdn', 'blue');
  log('- Para ver estadísticas: GET /api/anime/datasource/cdn/stats', 'blue');
  log('- Para recargar datos: POST /api/anime/datasource/cdn/reload (admin)', 'blue');

  return { successful, failed, total: results.length };
}

// Función para probar rendimiento
async function testPerformance() {
  log('', 'reset');
  log('⚡ PRUEBA DE RENDIMIENTO', 'yellow');
  
  const startTime = Date.now();
  
  // Probar múltiples búsquedas simultáneas
  const searchQueries = ['naruto', 'one piece', 'dragon ball', 'bleach', 'attack on titan'];
  const promises = searchQueries.map(query => 
    axios.get(`${BASE_URL}/search?q=${query}&limit=5`)
  );
  
  try {
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    log(`✅ ${results.length} búsquedas completadas en ${duration}ms`, 'green');
    log(`📊 Promedio: ${duration / results.length}ms por búsqueda`, 'blue');
    
    return { success: true, duration, queries: results.length };
  } catch (error) {
    log(`❌ Error en prueba de rendimiento: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Ejecutar pruebas
async function main() {
  try {
    const basicResults = await runTests();
    const performanceResults = await testPerformance();
    
    log('', 'reset');
    log('🎉 PRUEBAS COMPLETADAS', 'green');
    
    if (basicResults.failed === 0 && performanceResults.success) {
      log('✅ Integración CDN funcionando correctamente', 'green');
    } else {
      log('⚠️ Algunas pruebas fallaron, revisar configuración', 'yellow');
    }
    
  } catch (error) {
    log(`💥 Error ejecutando pruebas: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runTests, testPerformance }; 