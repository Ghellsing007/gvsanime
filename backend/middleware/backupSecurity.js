// Middleware de seguridad específico para endpoints de backup
import { getBackupProgress } from '../services/backup/animeBackupService.js';

// Middleware para verificar si el backup está permitido
export const validateBackupRequest = async (req, res, next) => {
  try {
    const { secretKey, force } = req.body;
    
    // 1. Verificar clave secreta
    const expectedSecretKey = process.env.BACKUP_SECRET_KEY;
    if (!expectedSecretKey) {
      console.error('BACKUP_SECRET_KEY no está configurada en las variables de entorno');
      return res.status(500).json({
        success: false,
        message: 'Configuración de seguridad incompleta'
      });
    }
    
    if (!secretKey || secretKey !== expectedSecretKey) {
      console.warn(`Intento de acceso no autorizado al backup desde IP: ${req.ip}`);
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: clave secreta inválida'
      });
    }
    
    // 2. Verificar si ya hay un backup en progreso
    const existingProgress = await getBackupProgress();
    if (existingProgress && existingProgress.status === 'running') {
      return res.status(409).json({
        success: false,
        message: 'Ya hay un backup en progreso',
        progress: {
          currentPage: existingProgress.currentPage,
          totalPages: existingProgress.totalPages,
          startedAt: existingProgress.startedAt
        }
      });
    }
    
    // 3. Verificar frecuencia de backups (solo si no se fuerza)
    if (!force) {
      if (existingProgress && existingProgress.status === 'completed') {
        const lastBackupTime = new Date(existingProgress.completedAt);
        const hoursSinceLastBackup = (Date.now() - lastBackupTime.getTime()) / (1000 * 60 * 60);
        
        // Permitir máximo 1 backup por día
        if (hoursSinceLastBackup < 24) {
          return res.status(429).json({
            success: false,
            message: `Backup reciente detectado. Último backup hace ${hoursSinceLastBackup.toFixed(1)} horas`,
            lastBackup: {
              completedAt: existingProgress.completedAt,
              hoursAgo: hoursSinceLastBackup.toFixed(1)
            },
            suggestion: 'Usa force=true para ejecutar de todos modos'
          });
        }
      }
    }
    
    // 4. Log de acceso autorizado
    console.log(`🔐 Acceso autorizado al backup desde IP: ${req.ip}, Usuario: ${req.user?.email || 'N/A'}`);
    
    next();
  } catch (error) {
    console.error('Error en validación de backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno en validación de seguridad'
    });
  }
};

// Middleware para verificar que el servidor esté en modo desarrollo o tenga flag específico
export const validateBackupEnvironment = (req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const backupEnabled = process.env.ENABLE_FULL_BACKUP === 'true';
  
  if (!isDevelopment && !backupEnabled) {
    return res.status(403).json({
      success: false,
      message: 'Backup completo solo disponible en desarrollo o con flag específico'
    });
  }
  
  next();
};

// Middleware para limitar el acceso por IP (opcional)
export const validateBackupIP = (req, res, next) => {
  const allowedIPs = process.env.BACKUP_ALLOWED_IPS?.split(',') || ['127.0.0.1', '::1'];
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (!allowedIPs.includes(clientIP)) {
    console.warn(`Intento de acceso al backup desde IP no permitida: ${clientIP}`);
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado desde esta IP'
    });
  }
  
  next();
}; 