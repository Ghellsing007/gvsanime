// Script de prueba para el backup completo de animes
import { runFullAnimeBackup, getBackupProgress, getBackupStats } from './backend/services/backup/animeBackupService.js';
import { getAnimePaginationInfo } from './backend/services/anime/jikanService.js';

async function testBackup() {
  try {
    console.log('=== PRUEBA DE BACKUP COMPLETO DE ANIMES ===\n');
    
    // 1. Verificar información de paginación
    console.log('1. Obteniendo información de paginación...');
    const paginationInfo = await getAnimePaginationInfo();
    console.log(`   Total de páginas: ${paginationInfo.last_visible_page}`);
    console.log(`   Total de animes: ${paginationInfo.items.total}\n`);
    
    // 2. Verificar estadísticas actuales
    console.log('2. Estadísticas actuales del backup...');
    const currentStats = await getBackupStats();
    console.log(`   Animes en cache: ${currentStats?.totalAnimesInCache || 0}`);
    console.log(`   Estado del último backup: ${currentStats?.lastBackupProgress?.status || 'N/A'}\n`);
    
    // 3. Ejecutar backup completo (solo las primeras 5 páginas para prueba)
    console.log('3. Ejecutando backup completo...');
    console.log('   NOTA: Este proceso puede tomar varios minutos...\n');
    
    const result = await runFullAnimeBackup();
    
    if (result.success) {
      console.log('✅ Backup completado exitosamente!');
      console.log(`   Total procesados: ${result.stats.totalProcessed}`);
      console.log(`   Nuevos animes: ${result.stats.totalNew}`);
      console.log(`   Animes actualizados: ${result.stats.totalUpdated}`);
      console.log(`   Total de páginas: ${result.stats.totalPages}`);
    } else {
      console.log('❌ Error en el backup:', result.message);
    }
    
    // 4. Verificar estadísticas finales
    console.log('\n4. Estadísticas finales...');
    const finalStats = await getBackupStats();
    console.log(`   Animes en cache: ${finalStats?.totalAnimesInCache || 0}`);
    console.log(`   Estado del backup: ${finalStats?.lastBackupProgress?.status || 'N/A'}`);
    
    if (finalStats?.lastBackupProgress?.completedAt) {
      console.log(`   Completado en: ${finalStats.lastBackupProgress.completedAt}`);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testBackup(); 