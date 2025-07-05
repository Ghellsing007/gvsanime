import { getAllAnimes, getAnimePaginationInfo } from '../anime/jikanService.js';
import mongoose from '../shared/mongooseClient.js';

// Modelo para el cache de anime en MongoDB
const AnimeCache = mongoose.models.AnimeCache || mongoose.model('AnimeCache', new mongoose.Schema({
  animeId: String,
  data: Object,
  updatedAt: { type: Date, default: Date.now }
}));

// Modelo para el progreso del backup
const BackupProgress = mongoose.models.BackupProgress || mongoose.model('BackupProgress', new mongoose.Schema({
  type: String,
  currentPage: Number,
  totalPages: Number,
  totalAnimes: Number,
  processedAnimes: Number,
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  error: String
}));

// Función para preservar todos los datos originales del anime
function preserveAllAnimeData(anime) {
  // Retornar todos los datos exactamente como vienen de la API
  return anime;
}

// Función para ejecutar backup completo de todos los animes
export async function runFullAnimeBackup() {
  try {
    console.log('\n🚀 ========================================');
    console.log('🚀 INICIANDO BACKUP COMPLETO DE ANIMES');
    console.log('🚀 ========================================\n');
    
    // Obtener información de paginación
    console.log('📡 Obteniendo información de paginación...');
    const paginationInfo = await getAnimePaginationInfo();
    const totalPages = paginationInfo.last_visible_page;
    const totalAnimes = paginationInfo.items.total;
    
    console.log(`📊 Total de páginas: ${totalPages.toLocaleString()}`);
    console.log(`📊 Total de animes: ${totalAnimes.toLocaleString()}`);
    console.log(`⏱️  Tiempo estimado: ${Math.ceil(totalPages / 60)} minutos (~${Math.ceil(totalPages / 60 / 60)} horas)\n`);
    
    // Crear o actualizar registro de progreso
    let progress = await BackupProgress.findOne({ type: 'full_anime_backup' });
    if (!progress) {
      progress = new BackupProgress({
        type: 'full_anime_backup',
        currentPage: 0,
        totalPages,
        totalAnimes,
        processedAnimes: 0,
        status: 'running'
      });
    } else {
      progress.currentPage = 0;
      progress.totalPages = totalPages;
      progress.totalAnimes = totalAnimes;
      progress.processedAnimes = 0;
      progress.status = 'running';
      progress.startedAt = new Date();
      progress.completedAt = null;
      progress.error = null;
    }
    await progress.save();
    
    let totalProcessed = 0;
    let totalNew = 0;
    let totalUpdated = 0;
    let totalSizeOptimized = 0;
    let startTime = Date.now();
    
    console.log('🔄 Iniciando procesamiento de páginas...\n');
    
    // Procesar todas las páginas
    for (let page = 1; page <= totalPages; page++) {
      try {
        const pageStartTime = Date.now();
        
        // Mostrar progreso visual
        const percentage = ((page / totalPages) * 100).toFixed(2);
        const progressBar = createProgressBar(percentage);
        console.log(`📄 Página ${page.toString().padStart(4, '0')}/${totalPages} ${progressBar} ${percentage}%`);
        
        // Obtener animes de la página actual
        const { data: animes } = await getAllAnimes(page, 25);
        
        let pageNew = 0;
        let pageUpdated = 0;
        
        // Procesar cada anime de la página
        for (const anime of animes) {
          try {
            // Preservar todos los datos originales
            const completeData = preserveAllAnimeData(anime);
            
            const existingAnime = await AnimeCache.findOne({ animeId: anime.mal_id });
            
            if (existingAnime) {
              // Actualizar anime existente
              existingAnime.data = completeData;
              existingAnime.updatedAt = new Date();
              await existingAnime.save();
              totalUpdated++;
              pageUpdated++;
            } else {
              // Crear nuevo anime
              await AnimeCache.create({ animeId: anime.mal_id, data: completeData });
              totalNew++;
              pageNew++;
            }
            
            totalProcessed++;
            
            // Calcular tamaño completo (aproximado)
            const dataSize = JSON.stringify(completeData).length;
            totalSizeOptimized += dataSize;
            
          } catch (animeError) {
            console.error(`❌ Error procesando anime ${anime.mal_id}:`, animeError.message);
          }
        }
        
        // Mostrar estadísticas de la página
        const pageTime = Date.now() - pageStartTime;
        const avgSize = totalSizeOptimized / totalProcessed;
        const estimatedTotalSize = (avgSize * totalAnimes) / (1024 * 1024); // MB
        
        console.log(`   ✅ Nuevos: ${pageNew}, Actualizados: ${pageUpdated} | Tiempo: ${pageTime}ms | Tamaño: ${(avgSize / 1024).toFixed(1)}KB/anime`);
        
        // Mostrar anime destacado de la página
        if (animes.length > 0) {
          const featuredAnime = animes[0];
          console.log(`   🎬 Ejemplo: "${featuredAnime.title}" (ID: ${featuredAnime.mal_id})`);
        }
        
        // Actualizar progreso
        progress.currentPage = page;
        progress.processedAnimes = totalProcessed;
        await progress.save();
        
        // Mostrar estadísticas detalladas cada 50 páginas
        if (page % 50 === 0) {
          const elapsedTime = Date.now() - startTime;
          const avgTimePerPage = elapsedTime / page;
          const remainingPages = totalPages - page;
          const estimatedRemainingTime = remainingPages * avgTimePerPage;
          
          console.log('\n📈 ========================================');
          console.log(`📈 ESTADÍSTICAS INTERMEDIAS (Página ${page})`);
          console.log('========================================');
          console.log(`📊 Progreso: ${totalProcessed.toLocaleString()}/${totalAnimes.toLocaleString()} animes`);
          console.log(`🆕 Nuevos: ${totalNew.toLocaleString()}`);
          console.log(`🔄 Actualizados: ${totalUpdated.toLocaleString()}`);
          console.log(`📏 Tamaño promedio: ${(avgSize / 1024).toFixed(2)} KB/anime`);
          console.log(`💾 Tamaño total estimado: ${estimatedTotalSize.toFixed(2)} MB`);
          console.log(`⏱️  Tiempo transcurrido: ${formatTime(elapsedTime)}`);
          console.log(`⏱️  Tiempo restante estimado: ${formatTime(estimatedRemainingTime)}`);
          console.log(`🚀 Velocidad: ${(totalProcessed / (elapsedTime / 1000)).toFixed(1)} animes/segundo`);
          console.log('========================================\n');
        }
        
        // Pausa para evitar rate limiting (1 segundo entre páginas)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (pageError) {
        console.error(`❌ Error procesando página ${page}:`, pageError.message);
        // Continuar con la siguiente página
      }
    }
    
    // Marcar como completado
    progress.status = 'completed';
    progress.completedAt = new Date();
    await progress.save();
    
    const finalAvgSize = totalSizeOptimized / totalProcessed;
    const finalTotalSize = (finalAvgSize * totalProcessed) / (1024 * 1024); // MB
    const totalTime = Date.now() - startTime;
    
    console.log('\n🎉 ========================================');
    console.log('🎉 BACKUP COMPLETADO EXITOSAMENTE');
    console.log('========================================');
    console.log(`📊 Total procesados: ${totalProcessed.toLocaleString()}`);
    console.log(`🆕 Nuevos animes: ${totalNew.toLocaleString()}`);
    console.log(`🔄 Animes actualizados: ${totalUpdated.toLocaleString()}`);
    console.log(`📏 Tamaño promedio: ${(finalAvgSize / 1024).toFixed(2)} KB/anime`);
    console.log(`💾 Tamaño total: ${finalTotalSize.toFixed(2)} MB`);
    console.log(`⏱️  Tiempo total: ${formatTime(totalTime)}`);
    console.log(`🚀 Velocidad promedio: ${(totalProcessed / (totalTime / 1000)).toFixed(1)} animes/segundo`);
    console.log(`📄 Páginas procesadas: ${totalPages.toLocaleString()}`);
    console.log('========================================\n');
    
    return {
      success: true,
      message: `Backup completo finalizado exitosamente`,
      stats: {
        totalProcessed,
        totalNew,
        totalUpdated,
        totalPages,
        totalSizeMB: finalTotalSize.toFixed(2),
        averageSizeKB: (finalAvgSize / 1024).toFixed(2),
        totalTimeSeconds: Math.round(totalTime / 1000),
        speedAnimesPerSecond: (totalProcessed / (totalTime / 1000)).toFixed(1)
      }
    };
    
  } catch (error) {
    console.error('❌ Error en el backup completo de animes:', error);
    
    // Marcar como fallido
    const progress = await BackupProgress.findOne({ type: 'full_anime_backup' });
    if (progress) {
      progress.status = 'failed';
      progress.error = error.message;
      await progress.save();
    }
    
    return { success: false, message: error.message };
  }
}

// Función para crear barra de progreso visual
function createProgressBar(percentage) {
  const width = 20;
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Función para formatear tiempo
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Función para obtener el progreso del backup
export async function getBackupProgress() {
  try {
    const progress = await BackupProgress.findOne({ type: 'full_anime_backup' });
    return progress || null;
  } catch (error) {
    console.error('Error obteniendo progreso del backup:', error);
    return null;
  }
}

// Función para obtener estadísticas del backup
export async function getBackupStats() {
  try {
    const totalAnimes = await AnimeCache.countDocuments();
    const progress = await getBackupProgress();
    
    // Calcular tamaño total aproximado
    const sampleAnimes = await AnimeCache.find().limit(100);
    let totalSize = 0;
    sampleAnimes.forEach(anime => {
      totalSize += JSON.stringify(anime.data).length;
    });
    const avgSize = sampleAnimes.length > 0 ? totalSize / sampleAnimes.length : 0;
    const estimatedTotalSize = (avgSize * totalAnimes) / (1024 * 1024); // MB
    
    return {
      totalAnimesInCache: totalAnimes,
      lastBackupProgress: progress,
      estimatedSizeMB: estimatedTotalSize.toFixed(2),
      averageSizeKB: (avgSize / 1024).toFixed(2)
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas del backup:', error);
    return null;
  }
} 