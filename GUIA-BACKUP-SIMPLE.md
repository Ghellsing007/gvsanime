# 🚀 Guía: Backup Simple SIN Seguridad

## ⚡ **Uso Rápido (Sin Configuración)**

### **1. Ejecutar Backup Simple**
```bash
# Script automático (recomendado)
node scripts/run-simple-backup.js

# O manualmente con cURL
curl -X POST http://localhost:5000/api/backup/run-full-anime-simple \
  -H "Content-Type: application/json"
```

### **2. Ver Estadísticas**
```bash
# Ver estadísticas actuales
curl -X GET http://localhost:5000/api/backup/stats

# Ver progreso (si hay backup en curso)
curl -X GET http://localhost:5000/api/backup/progress
```

## 📊 **Visualización en Consola**

El backup mostrará información detallada en tiempo real:

```
🚀 ========================================
🚀 INICIANDO BACKUP COMPLETO DE ANIMES
🚀 ========================================

📡 Obteniendo información de paginación...
📊 Total de páginas: 1,153
📊 Total de animes: 28,815
⏱️  Tiempo estimado: 19 minutos (~0 horas)

🔄 Iniciando procesamiento de páginas...

📄 Página 0001/1153 ████████████████████ 0.09%
   ✅ Nuevos: 25, Actualizados: 0 | Tiempo: 1250ms | Tamaño: 8.2KB/anime
   🎬 Ejemplo: "Cowboy Bebop" (ID: 1)

📄 Página 0002/1153 ██░░░░░░░░░░░░░░░░░░ 0.17%
   ✅ Nuevos: 25, Actualizados: 0 | Tiempo: 1180ms | Tamaño: 8.1KB/anime
   🎬 Ejemplo: "Cowboy Bebop: Tengoku no Tobira" (ID: 5)

...

📈 ========================================
📈 ESTADÍSTICAS INTERMEDIAS (Página 50)
========================================
📊 Progreso: 1,250/28,815 animes
🆕 Nuevos: 1,250
🔄 Actualizados: 0
📏 Tamaño promedio: 8.15 KB/anime
💾 Tamaño total estimado: 234.52 MB
⏱️  Tiempo transcurrido: 1m 2s
⏱️  Tiempo restante estimado: 18m 45s
🚀 Velocidad: 20.2 animes/segundo
========================================

...

🎉 ========================================
🎉 BACKUP COMPLETADO EXITOSAMENTE
========================================
📊 Total procesados: 28,815
🆕 Nuevos animes: 28,815
🔄 Animes actualizados: 0
📏 Tamaño promedio: 8.15 KB/anime
💾 Tamaño total: 234.52 MB
⏱️  Tiempo total: 19m 45s
🚀 Velocidad promedio: 24.5 animes/segundo
📄 Páginas procesadas: 1,153
========================================
```

## 🔧 **Configuración Mínima**

### **Variables de Entorno Necesarias:**
```env
# Solo estas 3 variables son obligatorias
MONGODB_URI=mongodb://localhost:27017/gvsanime
JIKAN_BASE_URL=https://api.jikan.moe/v4
API_BASE_URL=http://localhost:5000/api
```

### **Verificar que esté corriendo:**
```bash
# 1. Backend en puerto 5000
curl http://localhost:5000/api/health

# 2. MongoDB
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gvsanime')
  .then(() => console.log('✅ MongoDB OK'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));
"

# 3. API de Jikan
curl https://api.jikan.moe/v4/anime?page=1&limit=1
```

## 📈 **Estadísticas Esperadas**

### **Tiempo de Ejecución:**
- **Total de animes**: ~28,000
- **Tiempo estimado**: 15-25 minutos
- **Velocidad**: ~20-25 animes/segundo

### **Uso de Recursos:**
- **Memoria**: ~200-500 MB
- **Almacenamiento**: ~300-400 MB
- **Red**: ~1 request/segundo

### **Resultado Final:**
- **Animes en cache**: ~28,000
- **Tamaño total**: ~300-400 MB
- **Estado**: "completed"

## 🎯 **Características del Backup Simple**

### **✅ Ventajas:**
- **Sin configuración compleja**
- **Sin claves secretas**
- **Sin verificaciones de seguridad**
- **Visualización en tiempo real**
- **Todos los datos originales**
- **Progreso visual con barras**
- **Estadísticas detalladas**

### **⚠️ Consideraciones:**
- **Solo para uso interno**
- **NO exponer públicamente**
- **Sin protección contra ejecuciones múltiples**
- **Sin control de frecuencia**

## 🚀 **Comandos Útiles**

### **Ejecutar Backup:**
```bash
# Opción 1: Script interactivo
node scripts/run-simple-backup.js

# Opción 2: Directo con cURL
curl -X POST http://localhost:5000/api/backup/run-full-anime-simple

# Opción 3: Con respuesta detallada
curl -X POST http://localhost:5000/api/backup/run-full-anime-simple | jq
```

### **Monitorear Progreso:**
```bash
# Ver estadísticas en tiempo real
watch -n 5 'curl -s http://localhost:5000/api/backup/stats | jq'

# Ver progreso
curl -s http://localhost:5000/api/backup/progress | jq
```

### **Verificar Resultados:**
```bash
# Contar animes en MongoDB
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gvsanime')
  .then(async () => {
    const count = await mongoose.model('AnimeCache').countDocuments();
    console.log('Animes en cache:', count.toLocaleString());
    process.exit(0);
  });
"
```

## 🔍 **Solución de Problemas**

### **Error: "Backend no responde"**
```bash
# Verificar que el backend esté corriendo
ps aux | grep node
# O
lsof -i :5000
```

### **Error: "MongoDB no conecta"**
```bash
# Verificar MongoDB
sudo systemctl status mongod
# O iniciar
sudo systemctl start mongod
```

### **Error: "API de Jikan no responde"**
```bash
# Verificar conectividad
curl https://api.jikan.moe/v4/anime?page=1&limit=1
```

### **Backup Interrumpido:**
```bash
# Verificar estado
curl -s http://localhost:5000/api/backup/progress | jq

# Si está en progreso, esperar o reiniciar
curl -X POST http://localhost:5000/api/backup/run-full-anime-simple
```

## 📝 **Logs y Monitoreo**

### **Ver Logs del Backend:**
```bash
# Si usas PM2
pm2 logs

# Si usas nodemon
# Los logs aparecen en la consola

# Si usas systemd
sudo journalctl -u tu-servicio -f
```

### **Monitorear Recursos:**
```bash
# Memoria y CPU
htop

# Disco
df -h

# Red
iftop
```

## 🎉 **¡Listo para Usar!**

Con esta configuración simple puedes:

1. **Ejecutar backup completo** sin configuración compleja
2. **Ver progreso en tiempo real** con barras visuales
3. **Obtener estadísticas detalladas** de rendimiento
4. **Guardar todos los datos** sin optimizaciones
5. **Monitorear el proceso** paso a paso

¡El backup estará listo en ~20 minutos con toda la información visual que necesitas! 