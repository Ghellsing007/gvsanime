# Documentación: Seguridad del Backup Completo de Animes

## 🔐 **Sistema de Seguridad Multi-Capa**

El endpoint de backup completo implementa múltiples capas de seguridad para garantizar que solo se ejecute de forma controlada y manual.

### **Capas de Seguridad Implementadas:**

#### **1. Autenticación de Usuario**
```javascript
requireRole(['admin'])  // Solo usuarios con rol de administrador
```

#### **2. Verificación de IP**
```javascript
validateBackupIP  // Solo IPs permitidas pueden acceder
```

#### **3. Verificación de Entorno**
```javascript
validateBackupEnvironment  // Solo en desarrollo o con flag específico
```

#### **4. Clave Secreta**
```javascript
validateBackupRequest  // Requiere clave secreta específica
```

#### **5. Control de Frecuencia**
- Máximo 1 backup por día (configurable)
- Prevención de backups simultáneos
- Verificación de backups recientes

## 🛡️ **Configuración de Seguridad**

### **Variables de Entorno Requeridas:**

```env
# Clave secreta para ejecutar backup (OBLIGATORIA)
BACKUP_SECRET_KEY=tu_clave_secreta_muy_larga_y_compleja_aqui

# Token de administrador (OBLIGATORIO)
ADMIN_TOKEN=tu_token_de_administrador_aqui

# Entorno y flags de control
NODE_ENV=development
ENABLE_FULL_BACKUP=true

# IPs permitidas (separadas por comas)
BACKUP_ALLOWED_IPS=127.0.0.1,::1,192.168.1.100
```

### **Generación de Claves Seguras:**

```bash
# Generar clave secreta (64 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar token de administrador
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 **Uso Seguro del Endpoint**

### **1. Ejecución Manual desde Script**

```bash
# Hacer ejecutable el script
chmod +x scripts/run-secure-backup.js

# Ejecutar backup
node scripts/run-secure-backup.js
```

### **2. Ejecución Manual con cURL**

```bash
# Backup normal
curl -X POST http://localhost:3000/api/backup/run-full-anime \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "YOUR_BACKUP_SECRET_KEY",
    "force": false
  }'

# Backup forzado (ignora restricciones de tiempo)
curl -X POST http://localhost:3000/api/backup/run-full-anime \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "YOUR_BACKUP_SECRET_KEY",
    "force": true
  }'
```

### **3. Ejecución desde Código**

```javascript
const response = await fetch('/api/backup/run-full-anime', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    secretKey: process.env.BACKUP_SECRET_KEY,
    force: false
  })
});
```

## ⚠️ **Restricciones de Seguridad**

### **Restricciones Automáticas:**

1. **Frecuencia**: Máximo 1 backup por día
2. **Simultaneidad**: No se permiten backups simultáneos
3. **IP**: Solo desde IPs configuradas
4. **Entorno**: Solo en desarrollo o con flag específico
5. **Rol**: Solo administradores

### **Códigos de Error:**

| Código | Descripción |
|--------|-------------|
| `403` | Clave secreta inválida o IP no permitida |
| `409` | Ya hay un backup en progreso |
| `429` | Backup reciente detectado (menos de 24h) |
| `500` | Error de configuración |

## 📋 **Checklist de Seguridad**

### **Antes de Ejecutar:**

- [ ] Configurar `BACKUP_SECRET_KEY` en `.env`
- [ ] Configurar `ADMIN_TOKEN` en `.env`
- [ ] Verificar `NODE_ENV` o `ENABLE_FULL_BACKUP`
- [ ] Configurar `BACKUP_ALLOWED_IPS` si es necesario
- [ ] Verificar que no hay backups en progreso
- [ ] Verificar conectividad a MongoDB
- [ ] Verificar conectividad a API de Jikan

### **Durante la Ejecución:**

- [ ] Monitorear logs del servidor
- [ ] Verificar progreso con `/api/backup/progress`
- [ ] No interrumpir el proceso
- [ ] Mantener conexión estable

### **Después de la Ejecución:**

- [ ] Verificar estadísticas con `/api/backup/stats`
- [ ] Revisar logs de finalización
- [ ] Verificar datos en MongoDB
- [ ] Documentar fecha de backup

## 🔍 **Monitoreo y Logs**

### **Logs de Seguridad:**

```javascript
// Acceso autorizado
🔐 Acceso autorizado al backup desde IP: 127.0.0.1, Usuario: admin@example.com

// Intento no autorizado
⚠️ Intento de acceso no autorizado al backup desde IP: 192.168.1.50

// Backup iniciado
🔐 Backup completo iniciado con todas las verificaciones de seguridad
```

### **Monitoreo de Progreso:**

```bash
# Verificar progreso
curl -X GET http://localhost:3000/api/backup/progress \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Verificar estadísticas
curl -X GET http://localhost:3000/api/backup/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🚨 **Procedimientos de Emergencia**

### **Si el Backup se Interrumpe:**

1. Verificar estado actual:
   ```bash
   curl -X GET http://localhost:3000/api/backup/progress
   ```

2. Si está en progreso, esperar o forzar reinicio:
   ```bash
   curl -X POST http://localhost:3000/api/backup/run-full-anime \
     -d '{"secretKey": "YOUR_KEY", "force": true}'
   ```

### **Si Hay Errores de Seguridad:**

1. Verificar variables de entorno
2. Regenerar claves si es necesario
3. Verificar logs del servidor
4. Contactar administrador del sistema

## 📊 **Estadísticas de Seguridad**

### **Métricas a Monitorear:**

- Intentos de acceso no autorizados
- Frecuencia de ejecución de backups
- Tiempo promedio de ejecución
- Tasa de éxito/fallo
- Uso de recursos del sistema

### **Alertas Recomendadas:**

- Múltiples intentos fallidos de acceso
- Backups que tardan más de 6 horas
- Errores de conectividad con APIs externas
- Uso excesivo de memoria o CPU

## 🔧 **Configuración Avanzada**

### **Personalizar Restricciones:**

```javascript
// En middleware/backupSecurity.js

// Cambiar frecuencia máxima (en horas)
const MAX_BACKUP_FREQUENCY_HOURS = 24;

// Cambiar IPs permitidas
const ALLOWED_IPS = ['127.0.0.1', '::1', '192.168.1.100'];

// Agregar restricciones adicionales
const ADDITIONAL_CHECKS = true;
```

### **Logs Personalizados:**

```javascript
// Agregar logs adicionales
console.log(`🔐 Backup ejecutado por: ${req.user.email}`);
console.log(`📊 Tamaño estimado: ${estimatedSize} MB`);
console.log(`⏱️ Tiempo estimado: ${estimatedTime} horas`);
```

## ✅ **Mejores Prácticas**

1. **Nunca compartir claves secretas**
2. **Usar IPs específicas en producción**
3. **Monitorear logs regularmente**
4. **Ejecutar backups en horarios de bajo tráfico**
5. **Tener plan de respaldo para interrupciones**
6. **Documentar cada ejecución**
7. **Verificar integridad de datos después del backup**
8. **Mantener copias de seguridad de la configuración** 