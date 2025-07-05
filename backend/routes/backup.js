import express from 'express';
import { requireRole } from '../middleware/roles.js';
import { 
  validateBackupRequest, 
  validateBackupEnvironment, 
  validateBackupIP 
} from '../middleware/backupSecurity.js';
import { runPopularAnimeBackup } from '../services/backup/backupService.js';
import { 
  runFullAnimeBackup, 
  getBackupProgress, 
  getBackupStats 
} from '../services/backup/animeBackupService.js';
import { startBackupCronJob, stopBackupCronJob } from '../services/backup/cron.js';

const router = express.Router();

// Ejecutar backup manualmente (solo admin)
router.post('/run', requireRole(['admin']), async (req, res) => {
  const result = await runPopularAnimeBackup();
  res.json(result);
});

// Ejecutar backup completo de todos los animes (múltiples capas de seguridad)
router.post('/run-full-anime', 
  requireRole(['admin']),           // 1. Solo administradores
  validateBackupIP,                 // 2. Verificar IP permitida
  validateBackupEnvironment,        // 3. Verificar entorno
  validateBackupRequest,            // 4. Verificar clave secreta y frecuencia
  async (req, res) => {
    try {
      console.log(`🔐 Backup completo iniciado con todas las verificaciones de seguridad`);
      const result = await runFullAnimeBackup();
      res.json(result);
    } catch (error) {
      console.error('Error ejecutando backup completo:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error ejecutando backup completo de animes',
        error: error.message 
      });
    }
  }
);

// Ejecutar backup completo SIN SEGURIDAD (solo para uso interno)
router.post('/run-full-anime-simple', async (req, res) => {
  try {
    console.log('🚀 Iniciando backup completo SIN SEGURIDAD...');
    console.log('⚠️  ADVERTENCIA: Este endpoint no tiene verificaciones de seguridad');
    
    const result = await runFullAnimeBackup();
    res.json(result);
  } catch (error) {
    console.error('Error ejecutando backup completo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error ejecutando backup completo de animes',
      error: error.message 
    });
  }
});

// Obtener progreso del backup completo (solo admin)
router.get('/progress', requireRole(['admin']), async (req, res) => {
  try {
    const progress = await getBackupProgress();
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error obteniendo progreso del backup',
      error: error.message 
    });
  }
});

// Obtener estadísticas del backup (solo admin)
router.get('/stats', requireRole(['admin']), async (req, res) => {
  try {
    const stats = await getBackupStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error obteniendo estadísticas del backup',
      error: error.message 
    });
  }
});

// Detener el cron job de backup (solo admin)
router.post('/stop', requireRole(['admin']), (req, res) => {
  stopBackupCronJob();
  res.json({ message: 'Cron job de backup detenido.' });
});

// Activar el cron job de backup (solo admin)
router.post('/start', requireRole(['admin']), (req, res) => {
  startBackupCronJob();
  res.json({ message: 'Cron job de backup activado.' });
});

export default router; 