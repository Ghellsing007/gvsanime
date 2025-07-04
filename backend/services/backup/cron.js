import cron from 'node-cron';
import { runPopularAnimeBackup } from './backupService.js';

// Configuración: puedes cambiar el cron pattern por variable de entorno o parámetro
const CRON_PATTERN = process.env.BACKUP_CRON_PATTERN || '0 3 * * *'; // Por defecto: todos los días a las 3am
const CRON_ENABLED = process.env.BACKUP_CRON_ENABLED !== 'false'; // true por defecto

let backupJob = null;

export function startBackupCronJob() {
  if (!CRON_ENABLED) {
    console.log('Cron job de backup deshabilitado por configuración.');
    return;
  }
  if (backupJob) {
    backupJob.stop();
  }
  backupJob = cron.schedule(CRON_PATTERN, async () => {
    console.log('Ejecutando backup automático de animes populares...');
    await runPopularAnimeBackup();
  });
  console.log(`Cron job de backup programado con patrón: ${CRON_PATTERN}`);
}

export function stopBackupCronJob() {
  if (backupJob) {
    backupJob.stop();
    backupJob = null;
    console.log('Cron job de backup detenido manualmente.');
  } else {
    console.log('No hay cron job de backup activo para detener.');
  }
} 