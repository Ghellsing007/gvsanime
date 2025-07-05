# Documentación: Backup Completo de Animes

## Descripción

Este sistema permite realizar un backup completo de todos los animes disponibles en la API de Jikan (MyAnimeList) y almacenarlos en MongoDB para uso local. El sistema incluye paginación, seguimiento de progreso y manejo de errores.

## Características

- **Backup completo**: Descarga todos los animes disponibles (aproximadamente 28,000+ animes)
- **Paginación inteligente**: Procesa los datos página por página para evitar sobrecarga
- **Seguimiento de progreso**: Monitorea el avance del backup en tiempo real
- **Manejo de errores**: Continúa el proceso incluso si algunas páginas fallan
- **Rate limiting**: Incluye pausas entre requests para respetar los límites de la API
- **Actualización incremental**: Actualiza animes existentes y agrega nuevos

## Estructura de Archivos

```
backend/
├── services/
│   ├── anime/
│   │   └── jikanService.js          # Servicio para API de Jikan
│   └── backup/
│       ├── animeBackupService.js    # Servicio de backup completo
│       ├── backupService.js         # Servicio de backup original
│       └── cron.js                  # Programación de tareas
└── routes/
    └── backup.js                    # Rutas de backup
```

## Modelos de Base de Datos

### AnimeCache
```javascript
{
  animeId: String,           // ID de MyAnimeList
  data: Object,              // Datos completos del anime
  updatedAt: Date            // Fecha de última actualización
}
```

### BackupProgress
```javascript
{
  type: String,              // Tipo de backup ('full_anime_backup')
  currentPage: Number,       // Página actual siendo procesada
  totalPages: Number,        // Total de páginas a procesar
  totalAnimes: Number,       // Total de animes disponibles
  processedAnimes: Number,   // Animes procesados hasta ahora
  status: String,            // 'running', 'completed', 'failed'
  startedAt: Date,           // Fecha de inicio
  completedAt: Date,         // Fecha de finalización
  error: String              // Mensaje de error si falla
}
```

## API Endpoints

### 1. Ejecutar Backup Completo
```http
POST /api/backup/run-full-anime
Authorization: Bearer <token>
Content-Type: application/json
```

**Respuesta:**
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

### 2. Obtener Progreso del Backup
```http
GET /api/backup/progress
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "progress": {
    "type": "full_anime_backup",
    "currentPage": 500,
    "totalPages": 1153,
    "totalAnimes": 28815,
    "processedAnimes": 12500,
    "status": "running",
    "startedAt": "2024-01-15T10:30:00.000Z",
    "completedAt": null,
    "error": null
  }
}
```

### 3. Obtener Estadísticas del Backup
```http
GET /api/backup/stats
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "stats": {
    "totalAnimesInCache": 28815,
    "lastBackupProgress": {
      "status": "completed",
      "completedAt": "2024-01-15T12:45:00.000Z"
    }
  }
}
```

## Uso del Script de Prueba

Para probar el sistema de backup:

```bash
node test-full-anime-backup.js
```

Este script:
1. Verifica la información de paginación
2. Muestra estadísticas actuales
3. Ejecuta el backup completo
4. Muestra estadísticas finales

## Consideraciones Importantes

### Tiempo de Ejecución
- **Tiempo estimado**: 2-4 horas para completar todo el backup
- **Rate limiting**: 1 segundo entre páginas para respetar la API
- **Progreso**: Se puede monitorear en tiempo real

### Recursos del Sistema
- **Memoria**: Requiere suficiente RAM para procesar 25 animes por página
- **Almacenamiento**: Aproximadamente 500MB-1GB para todos los animes
- **Red**: Conexión estable a internet durante todo el proceso

### Manejo de Errores
- Si una página falla, el proceso continúa con la siguiente
- Los errores se registran en el log del servidor
- El progreso se guarda automáticamente

### Seguridad
- Solo usuarios con rol 'admin' pueden ejecutar el backup
- Los datos se almacenan de forma segura en MongoDB
- No se exponen datos sensibles en las respuestas

## Configuración

### Variables de Entorno
```env
JIKAN_BASE_URL=https://api.jikan.moe/v4
MONGODB_URI=mongodb://localhost:27017/gvsanime
```

### Configuración de Rate Limiting
En `animeBackupService.js`, línea 95:
```javascript
// Pausa para evitar rate limiting (1 segundo entre páginas)
await new Promise(resolve => setTimeout(resolve, 1000));
```

Puedes ajustar este valor según las limitaciones de la API.

## Monitoreo y Mantenimiento

### Logs del Sistema
El sistema genera logs detallados:
- Inicio y fin del backup
- Progreso por página
- Errores individuales
- Estadísticas finales

### Limpieza de Datos
Para limpiar datos antiguos:
```javascript
// Eliminar animes con más de 30 días sin actualizar
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
await AnimeCache.deleteMany({ updatedAt: { $lt: thirtyDaysAgo } });
```

## Troubleshooting

### Problemas Comunes

1. **Error de conexión a la API**
   - Verificar conectividad a internet
   - Comprobar que la API de Jikan esté disponible

2. **Error de base de datos**
   - Verificar conexión a MongoDB
   - Comprobar permisos de escritura

3. **Proceso interrumpido**
   - El progreso se guarda automáticamente
   - Se puede reanudar desde donde se quedó

4. **Memoria insuficiente**
   - Reducir el número de animes por página
   - Aumentar la memoria disponible para Node.js

### Comandos de Diagnóstico

```bash
# Verificar conexión a MongoDB
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/gvsanime').then(() => console.log('Conectado')).catch(console.error)"

# Verificar API de Jikan
curl https://api.jikan.moe/v4/anime?page=1&limit=1
``` 