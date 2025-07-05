# 🚀 Guía Rápida de Configuración - Backup de Animes

## 📋 **Variables de Entorno Necesarias**

### **🔴 OBLIGATORIAS (sin estas NO funciona):**

```env
# URL de tu backend
API_BASE_URL=http://localhost:5000/api

# Conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/gvsanime

# API de Jikan
JIKAN_BASE_URL=https://api.jikan.moe/v4

# Clave secreta para backup (generar con el script)
BACKUP_SECRET_KEY=tu_clave_secreta_aqui

# Token de administrador (obtener del login)
ADMIN_TOKEN=tu_token_de_admin_aqui

# Habilitar backup
ENABLE_FULL_BACKUP=true
```

### **🟡 OPCIONALES (valores por defecto):**

```env
# Entorno
NODE_ENV=development

# IPs permitidas (localhost por defecto)
BACKUP_ALLOWED_IPS=127.0.0.1,::1

# Configuración de cache
TOP_ANIME_CACHE_HOURS=6
RECENT_ANIME_CACHE_HOURS=3
```

## ⚡ **Configuración Rápida (3 pasos)**

### **Paso 1: Generar Claves**
```bash
# Generar claves automáticamente
node scripts/generate-keys.js
```

### **Paso 2: Obtener Token de Admin**
```bash
# Hacer login como admin y obtener el token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu_email_admin@ejemplo.com",
    "password": "tu_password"
  }'
```

### **Paso 3: Crear Archivo .env**
```bash
# Copiar el contenido generado por el script
cp env.example .env

# Editar con tus valores reales
nano .env
```

## 🔧 **Verificación de Configuración**

### **1. Verificar Backend**
```bash
# Verificar que el backend responde
curl http://localhost:5000/api/health
```

### **2. Verificar MongoDB**
```bash
# Verificar conexión a MongoDB
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gvsanime')
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.log('❌ Error:', err.message));
"
```

### **3. Verificar API de Jikan**
```bash
# Verificar que la API de Jikan responde
curl https://api.jikan.moe/v4/anime?page=1&limit=1
```

## 🚀 **Ejecutar Backup**

### **Opción 1: Script Automático (Recomendado)**
```bash
# Ejecutar script interactivo
node scripts/run-secure-backup.js
```

### **Opción 2: Manual con cURL**
```bash
# Ejecutar backup
curl -X POST http://localhost:5000/api/backup/run-full-anime \
  -H "Authorization: Bearer TU_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "TU_BACKUP_SECRET_KEY",
    "force": false
  }'
```

### **Opción 3: Monitorear Progreso**
```bash
# Ver progreso
curl -X GET http://localhost:5000/api/backup/progress \
  -H "Authorization: Bearer TU_ADMIN_TOKEN"

# Ver estadísticas
curl -X GET http://localhost:5000/api/backup/stats \
  -H "Authorization: Bearer TU_ADMIN_TOKEN"
```

## 📊 **Monitoreo en Tiempo Real**

### **Logs del Servidor**
```bash
# Ver logs en tiempo real
tail -f logs/backup.log

# O si usas PM2
pm2 logs
```

### **Progreso del Backup**
```bash
# Script de monitoreo
node scripts/run-secure-backup.js
# Selecciona "y" cuando pregunte si quieres monitorear
```

## ⚠️ **Solución de Problemas**

### **Error: "Clave secreta inválida"**
```bash
# Verificar que BACKUP_SECRET_KEY esté en .env
echo $BACKUP_SECRET_KEY

# Regenerar clave
node scripts/generate-keys.js
```

### **Error: "Token de administrador inválido"**
```bash
# Hacer login nuevamente
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ejemplo.com", "password": "password"}'
```

### **Error: "Ya hay un backup en progreso"**
```bash
# Verificar estado
curl -X GET http://localhost:5000/api/backup/progress \
  -H "Authorization: Bearer TU_ADMIN_TOKEN"

# Forzar nuevo backup
curl -X POST http://localhost:5000/api/backup/run-full-anime \
  -H "Authorization: Bearer TU_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "TU_CLAVE", "force": true}'
```

### **Error: "MongoDB no conecta"**
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# O iniciar MongoDB
sudo systemctl start mongod
```

## 📈 **Estadísticas Esperadas**

### **Tiempo de Ejecución**
- **Total de animes**: ~28,000
- **Tiempo estimado**: 2-4 horas
- **Progreso**: ~25 animes por minuto

### **Uso de Recursos**
- **Memoria**: ~200-500 MB
- **Almacenamiento**: ~300-400 MB
- **Red**: ~1 request/segundo

### **Resultado Final**
- **Animes en cache**: ~28,000
- **Tamaño total**: ~300-400 MB
- **Estado**: "completed"

## 🔐 **Seguridad**

### **Verificaciones Automáticas**
- ✅ Solo usuarios admin
- ✅ Solo IPs permitidas
- ✅ Clave secreta requerida
- ✅ Máximo 1 backup por día
- ✅ No backups simultáneos

### **Logs de Seguridad**
```bash
# Ver intentos de acceso
grep "🔐\|⚠️" logs/backup.log
```

## 📞 **Soporte**

### **Comandos de Diagnóstico**
```bash
# Verificar configuración
node scripts/run-secure-backup.js

# Ver logs detallados
tail -f logs/backup.log

# Verificar endpoints
curl http://localhost:5000/api/backup/stats
```

### **Archivos Importantes**
- `.env` - Configuración
- `logs/backup.log` - Logs del sistema
- `scripts/run-secure-backup.js` - Script principal
- `DOCUMENTACION-SEGURIDAD-BACKUP.md` - Documentación completa 