# GVSanime Backend - Despliegue en Render

## 📋 Requisitos Previos

- Cuenta en [Render.com](https://render.com)
- Repositorio en GitHub/GitLab/Bitbucket
- Variables de entorno configuradas

## 🚀 Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio contenga:
- ✅ `package.json` con scripts correctos
- ✅ `app.js` como punto de entrada
- ✅ Variables de entorno en `.env.example`
- ✅ `.gitignore` configurado

### 2. Crear Servicio en Render

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `gvsanime`

### 3. Configurar el Servicio

**Configuración básica:**
- **Name:** `gvsanime-backend`
- **Environment:** `Node`
- **Region:** `Oregon (US West)` (o la más cercana)
- **Branch:** `main` (o tu rama principal)
- **Root Directory:** `backend` (si el backend está en una subcarpeta)

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 4. Variables de Entorno

Agrega estas variables en la sección **"Environment Variables"**:

```env
NODE_ENV=production
PORT=10000
HOST=0.0.0.0

# MongoDB Atlas
MONGODB_URI=tu_uri_de_mongodb_atlas

# Supabase
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# JWT
JWT_SECRET=tu_secreto_jwt_super_seguro

# Frontend URL (para CORS)
FRONTEND_URL=https://tu-frontend.vercel.app

# Jikan API (opcional)
JIKAN_API_URL=https://api.jikan.moe/v4

# CDN (opcional)
CDN_URL=tu_url_del_cdn
```

### 5. Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará el despliegue automáticamente
3. Espera a que termine el build (puede tomar 5-10 minutos)

### 6. Verificar el Despliegue

Una vez desplegado, deberías ver:
- ✅ Status: **Live**
- ✅ URL: `https://tu-servicio.onrender.com`
- ✅ Logs sin errores

## 🔧 Configuración Adicional

### Auto-Deploy
- Render despliega automáticamente cuando haces push a la rama principal
- Puedes deshabilitarlo en **Settings** → **Build & Deploy**

### Health Check
- Render verifica automáticamente que tu app responda en `/`
- Si falla, reinicia el servicio

### Logs
- Ve a **"Logs"** para ver logs en tiempo real
- Útil para debugging

## 🚨 Solución de Problemas

### Error: "Build failed"
- Verifica que `package.json` tenga los scripts correctos
- Revisa que todas las dependencias estén en `dependencies` (no `devDependencies`)

### Error: "Service failed to start"
- Verifica que `PORT` esté configurado correctamente
- Revisa los logs para errores específicos

### Error: "CORS blocked"
- Asegúrate de que `FRONTEND_URL` esté en las variables de entorno
- Verifica que la URL del frontend esté en la lista de orígenes permitidos

### Error: "Database connection failed"
- Verifica que `MONGODB_URI` sea correcta
- Asegúrate de que la IP de Render esté permitida en MongoDB Atlas

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica las variables de entorno
3. Prueba localmente con las mismas variables
4. Contacta soporte de Render si es necesario

## 🔗 URLs Importantes

- **Render Dashboard:** https://dashboard.render.com
- **Documentación Render:** https://render.com/docs
- **Estado del Servicio:** https://status.render.com 