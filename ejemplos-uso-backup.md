# Ejemplos de Uso: Backup Completo de Animes

## Ejemplos con cURL

### 1. Ejecutar Backup Completo
```bash
# Ejecutar el backup completo (requiere token de admin)
curl -X POST http://localhost:3000/api/backup/run-full-anime \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Backup completo finalizado",
  "stats": {
    "totalProcessed": 28815,
    "totalNew": 28000,
    "totalUpdated": 815,
    "totalPages": 1153
  }
}
```

### 2. Verificar Progreso del Backup
```bash
# Obtener el progreso actual del backup
curl -X GET http://localhost:3000/api/backup/progress \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "progress": {
    "type": "full_anime_backup",
    "currentPage": 250,
    "totalPages": 1153,
    "totalAnimes": 28815,
    "processedAnimes": 6250,
    "status": "running",
    "startedAt": "2024-01-15T10:30:00.000Z",
    "completedAt": null,
    "error": null
  }
}
```

### 3. Obtener Estadísticas del Backup
```bash
# Obtener estadísticas generales del backup
curl -X GET http://localhost:3000/api/backup/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "stats": {
    "totalAnimesInCache": 28815,
    "lastBackupProgress": {
      "type": "full_anime_backup",
      "currentPage": 1153,
      "totalPages": 1153,
      "totalAnimes": 28815,
      "processedAnimes": 28815,
      "status": "completed",
      "startedAt": "2024-01-15T10:30:00.000Z",
      "completedAt": "2024-01-15T14:30:00.000Z",
      "error": null
    }
  }
}
```

## Ejemplos con JavaScript/Fetch

### 1. Función para Ejecutar Backup
```javascript
async function ejecutarBackupCompleto(token) {
  try {
    const response = await fetch('/api/backup/run-full-anime', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Backup iniciado exitosamente');
      console.log(`Total de páginas: ${result.stats.totalPages}`);
      console.log(`Total de animes: ${result.stats.totalAnimes}`);
    } else {
      console.error('❌ Error en el backup:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error de red:', error);
    throw error;
  }
}
```

### 2. Función para Monitorear Progreso
```javascript
async function monitorearProgreso(token) {
  try {
    const response = await fetch('/api/backup/progress', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.progress) {
      const progress = result.progress;
      const porcentaje = ((progress.currentPage / progress.totalPages) * 100).toFixed(2);
      
      console.log(`📊 Progreso: ${porcentaje}%`);
      console.log(`Página actual: ${progress.currentPage}/${progress.totalPages}`);
      console.log(`Animes procesados: ${progress.processedAnimes}/${progress.totalAnimes}`);
      console.log(`Estado: ${progress.status}`);
      
      if (progress.status === 'running') {
        // Continuar monitoreando cada 30 segundos
        setTimeout(() => monitorearProgreso(token), 30000);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error monitoreando progreso:', error);
    throw error;
  }
}
```

### 3. Función para Obtener Estadísticas
```javascript
async function obtenerEstadisticas(token) {
  try {
    const response = await fetch('/api/backup/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      const stats = result.stats;
      console.log(`📈 Total de animes en cache: ${stats.totalAnimesInCache}`);
      
      if (stats.lastBackupProgress) {
        const lastBackup = stats.lastBackupProgress;
        console.log(`Último backup: ${lastBackup.status}`);
        
        if (lastBackup.completedAt) {
          const fecha = new Date(lastBackup.completedAt);
          console.log(`Completado: ${fecha.toLocaleString()}`);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
}
```

### 4. Función Completa de Monitoreo
```javascript
async function monitorearBackupCompleto(token) {
  console.log('🚀 Iniciando backup completo de animes...');
  
  // 1. Ejecutar backup
  const backupResult = await ejecutarBackupCompleto(token);
  
  if (!backupResult.success) {
    console.error('❌ No se pudo iniciar el backup');
    return;
  }
  
  console.log('✅ Backup iniciado, comenzando monitoreo...');
  
  // 2. Monitorear progreso
  const interval = setInterval(async () => {
    try {
      const progressResult = await monitorearProgreso(token);
      
      if (progressResult.success && progressResult.progress) {
        const progress = progressResult.progress;
        
        if (progress.status === 'completed') {
          console.log('🎉 ¡Backup completado exitosamente!');
          clearInterval(interval);
          
          // 3. Mostrar estadísticas finales
          await obtenerEstadisticas(token);
        } else if (progress.status === 'failed') {
          console.error('❌ Backup falló:', progress.error);
          clearInterval(interval);
        }
      }
    } catch (error) {
      console.error('Error en monitoreo:', error);
    }
  }, 30000); // Verificar cada 30 segundos
}
```

## Ejemplos con React/Next.js

### Componente de Control de Backup
```jsx
import { useState, useEffect } from 'react';

export default function BackupControl({ token }) {
  const [backupStatus, setBackupStatus] = useState('idle');
  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);
  
  const iniciarBackup = async () => {
    try {
      setBackupStatus('starting');
      
      const response = await fetch('/api/backup/run-full-anime', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBackupStatus('running');
        console.log('Backup iniciado:', result.stats);
      } else {
        setBackupStatus('error');
        console.error('Error:', result.message);
      }
    } catch (error) {
      setBackupStatus('error');
      console.error('Error:', error);
    }
  };
  
  const obtenerProgreso = async () => {
    try {
      const response = await fetch('/api/backup/progress', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setProgress(result.progress);
        
        if (result.progress?.status === 'completed') {
          setBackupStatus('completed');
        } else if (result.progress?.status === 'failed') {
          setBackupStatus('failed');
        }
      }
    } catch (error) {
      console.error('Error obteniendo progreso:', error);
    }
  };
  
  const obtenerEstadisticas = async () => {
    try {
      const response = await fetch('/api/backup/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }
  };
  
  useEffect(() => {
    if (backupStatus === 'running') {
      const interval = setInterval(obtenerProgreso, 30000);
      return () => clearInterval(interval);
    }
  }, [backupStatus]);
  
  useEffect(() => {
    obtenerEstadisticas();
  }, []);
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Control de Backup de Animes</h2>
      
      {/* Estadísticas */}
      {stats && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Estadísticas</h3>
          <p>Animes en cache: {stats.totalAnimesInCache}</p>
          {stats.lastBackupProgress && (
            <p>Último backup: {stats.lastBackupProgress.status}</p>
          )}
        </div>
      )}
      
      {/* Progreso */}
      {progress && (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Progreso Actual</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(progress.currentPage / progress.totalPages) * 100}%` }}
            ></div>
          </div>
          <p>Página {progress.currentPage} de {progress.totalPages}</p>
          <p>Animes procesados: {progress.processedAnimes}</p>
          <p>Estado: {progress.status}</p>
        </div>
      )}
      
      {/* Controles */}
      <div className="space-x-4">
        <button
          onClick={iniciarBackup}
          disabled={backupStatus === 'running'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {backupStatus === 'running' ? 'Ejecutando...' : 'Iniciar Backup'}
        </button>
        
        <button
          onClick={obtenerProgreso}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Actualizar Progreso
        </button>
        
        <button
          onClick={obtenerEstadisticas}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Actualizar Estadísticas
        </button>
      </div>
      
      {/* Estado */}
      <div className="mt-4 p-2 rounded">
        {backupStatus === 'idle' && <span className="text-gray-600">Listo para iniciar</span>}
        {backupStatus === 'starting' && <span className="text-blue-600">Iniciando...</span>}
        {backupStatus === 'running' && <span className="text-green-600">Ejecutándose</span>}
        {backupStatus === 'completed' && <span className="text-green-600">Completado</span>}
        {backupStatus === 'failed' && <span className="text-red-600">Falló</span>}
        {backupStatus === 'error' && <span className="text-red-600">Error</span>}
      </div>
    </div>
  );
}
```

## Script de Automatización

### Script para Backup Automático
```bash
#!/bin/bash
# backup-automatico.sh

# Configuración
API_URL="http://localhost:3000/api"
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"
LOG_FILE="backup.log"

echo "$(date): Iniciando backup automático" >> $LOG_FILE

# 1. Verificar si ya hay un backup en progreso
PROGRESS_RESPONSE=$(curl -s -X GET "$API_URL/backup/progress" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

PROGRESS_STATUS=$(echo $PROGRESS_RESPONSE | jq -r '.progress.status')

if [ "$PROGRESS_STATUS" = "running" ]; then
  echo "$(date): Ya hay un backup en progreso" >> $LOG_FILE
  exit 0
fi

# 2. Ejecutar backup
echo "$(date): Ejecutando backup completo..." >> $LOG_FILE

BACKUP_RESPONSE=$(curl -s -X POST "$API_URL/backup/run-full-anime" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")

SUCCESS=$(echo $BACKUP_RESPONSE | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
  echo "$(date): Backup iniciado exitosamente" >> $LOG_FILE
  
  # 3. Monitorear progreso
  while true; do
    sleep 60  # Esperar 1 minuto
    
    PROGRESS_RESPONSE=$(curl -s -X GET "$API_URL/backup/progress" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    PROGRESS_STATUS=$(echo $PROGRESS_RESPONSE | jq -r '.progress.status')
    CURRENT_PAGE=$(echo $PROGRESS_RESPONSE | jq -r '.progress.currentPage')
    TOTAL_PAGES=$(echo $PROGRESS_RESPONSE | jq -r '.progress.totalPages')
    
    echo "$(date): Página $CURRENT_PAGE/$TOTAL_PAGES - Estado: $PROGRESS_STATUS" >> $LOG_FILE
    
    if [ "$PROGRESS_STATUS" = "completed" ]; then
      echo "$(date): Backup completado exitosamente" >> $LOG_FILE
      break
    elif [ "$PROGRESS_STATUS" = "failed" ]; then
      echo "$(date): Backup falló" >> $LOG_FILE
      break
    fi
  done
else
  echo "$(date): Error iniciando backup" >> $LOG_FILE
  exit 1
fi

echo "$(date): Proceso de backup finalizado" >> $LOG_FILE
```

Para usar este script:
```bash
chmod +x backup-automatico.sh
./backup-automatico.sh
```

## Notas Importantes

1. **Autenticación**: Todas las rutas requieren un token de administrador válido
2. **Rate Limiting**: El sistema incluye pausas automáticas para respetar la API
3. **Monitoreo**: Se recomienda monitorear el progreso cada 30-60 segundos
4. **Logs**: Todos los eventos se registran en los logs del servidor
5. **Recuperación**: Si el proceso se interrumpe, se puede reanudar desde donde se quedó 