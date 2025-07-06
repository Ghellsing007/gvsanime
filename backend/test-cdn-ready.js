async function testCDNReady() {
    const baseUrl = 'http://localhost:3001'; // Puerto del backend
    
    console.log('🧪 Probando endpoint de verificación de CDN...\n');
    
    try {
        console.log('📡 Haciendo petición a /api/anime/ready...');
        const response = await fetch(`${baseUrl}/api/anime/ready`);
        const data = await response.json();
        
        console.log('✅ Respuesta recibida:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data.ready) {
            console.log('\n🎉 CDN está listo!');
            console.log(`📊 Total de animes: ${data.stats.totalAnimes.toLocaleString()}`);
            console.log(`💾 Memoria usada: ${data.stats.memoryUsage.used}MB`);
            console.log(`⏰ Última carga: ${data.stats.lastLoadTime}`);
        } else {
            console.log('\n⏳ CDN aún no está listo...');
            console.log(`📊 Estado: ${data.stats.isLoaded ? 'Cargado' : 'Cargando'}`);
            if (data.stats.loadError) {
                console.log(`❌ Error: ${data.stats.loadError}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error al probar el endpoint:', error.message);
    }
}

// Simular comportamiento del frontend - reintentos
async function simulateFrontendBehavior() {
    console.log('\n🔄 Simulando comportamiento del frontend...\n');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        attempts++;
        console.log(`\n📡 Intento ${attempts}/${maxAttempts}...`);
        
        try {
            const response = await fetch('http://localhost:3001/api/anime/ready');
            const data = await response.json();
            
            if (data.ready) {
                console.log('✅ ¡CDN listo! Frontend puede mostrar la aplicación.');
                break;
            } else {
                console.log('⏳ CDN no listo, esperando 2 segundos...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.log('❌ Error de conexión, reintentando en 3 segundos...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    if (attempts >= maxAttempts) {
        console.log('⏰ Tiempo de espera agotado');
    }
}

// Ejecutar pruebas
testCDNReady().then(() => {
    simulateFrontendBehavior();
}); 