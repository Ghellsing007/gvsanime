import express from 'express';
import { requireRole } from '../middleware/roles.js';
import { runPopularAnimeBackup } from '../services/backup/backupService.js';
import { startBackupCronJob, stopBackupCronJob } from '../services/backup/cron.js';

const router = express.Router();

// Ejecutar backup manualmente (solo admin)
router.post('/run', requireRole(['admin']), async (req, res) => {
  const result = await runPopularAnimeBackup();
  res.json(result);
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