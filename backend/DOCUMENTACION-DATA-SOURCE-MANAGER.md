# 📚 Documentación del Data Source Manager

## 🎯 Descripción General

El **Data Source Manager** es un sistema centralizado que permite alternar fácilmente entre diferentes fuentes de datos para anime sin modificar el código del frontend. Actualmente soporta:

- **Jikan API** (MyAnimeList)
- **MongoDB** (Cache local)
- **Modo Híbrido** (Combinación de ambos)
- **Supabase** (Datos personalizados del usuario)

## 🔧 Configuración de Variables de Entorno

### Variables Principales

| Variable | Valores | Descripción | Prioridad |
|----------|---------|-------------|-----------|
| `ANIME_DATA_SOURCE` | `jikan`, `mongodb`, `hybrid` | Fuente de datos principal | 3 |
| `FORCE_JIKAN` | `true`, `false` | Forzar uso exclusivo de Jikan | 1 (Máxima) |
| `CACHE_ENABLED` | `true`, `false` | Habilitar/deshabilitar cache | 2 |

### Variables de Conexión

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `MONGODB_URI` | URI de conexión a MongoDB | Solo si usa MongoDB |
| `SUPABASE_URL` | URL de Supabase | Solo si usa Supabase |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase | Solo si usa Supabase |

## 🎛️ Lógica de Selección de Fuente

### Prioridad de Decisiones

1. **`FORCE_JIKAN=true`** → **Solo Jikan** (Máxima prioridad)
2. **`CACHE_ENABLED=false`** → **Solo Jikan**
3. **`ANIME_DATA_SOURCE=jikan`** → **Solo Jikan**
4. **`ANIME_DATA_SOURCE=mongodb`** → **Solo MongoDB**
5. **Por defecto** → **Modo Híbrido**

### Ejemplos de Configuración

#### 🔴 Solo Jikan (Recomendado para desarrollo)
```bash
ANIME_DATA_SOURCE=jikan
FORCE_JIKAN=false
CACHE_ENABLED=false
```

#### 🟡 Solo MongoDB (Cache local)
```bash
ANIME_DATA_SOURCE=mongodb
FORCE_JIKAN=false
CACHE_ENABLED=true
MONGODB_URI=mongodb://localhost:27017/anime
```

#### 🟢 Modo Híbrido (Producción)
```bash
ANIME_DATA_SOURCE=hybrid
FORCE_JIKAN=false
CACHE_ENABLED=true
MONGODB_URI=mongodb://localhost:27017/anime
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

#### 🔵 Forzar Jikan (Emergencia)
```bash
FORCE_JIKAN=true
# Las otras variables se ignoran
```

## 📁 Estructura del Sistema

### Archivos Principales

```
backend/
├── services/anime/
│   ├── dataSourceManager.js      # Gestor principal
│   ├── jikanService.js          # Servicio de Jikan
│   ├── normalizers/
│   │   └── jikanNormalizer.js   # Normalización de datos
│   └── genreImages.js           # Imágenes de géneros
├── controllers/
│   └── animeController.js       # Controladores de API
└── routes/
    └── anime.js                 # Rutas de API
```

### Funciones Principales

#### `getDataSource()`
Determina qué fuente usar basándose en las variables de entorno.

#### `getAnimeByIdManager(animeId, userId)`
Obtiene un anime por ID desde la fuente configurada.

#### `searchAnimeManager(query, page, limit)`
Busca animes por nombre o filtros.

#### `getTopAnimeManager()`
Obtiene los animes más populares.

#### `getRecentAnimeManager()`
Obtiene animes de la temporada actual.

#### `getFeaturedAnimeManager()`
Obtiene animes destacados.

## 🔄 Flujos de Datos

### Modo Solo Jikan
```
Frontend → API → dataSourceManager → jikanService → Jikan API → Frontend
```

### Modo Solo MongoDB
```
Frontend → API → dataSourceManager → MongoDB → Frontend
```

### Modo Híbrido
```
Frontend → API → dataSourceManager → MongoDB (si existe) → Jikan API (si no existe) → MongoDB (guardar) → Frontend
```

## 🧪 Scripts de Prueba

### `test-data-source-logic.js`
Prueba todas las configuraciones posibles del sistema.

```bash
cd backend
node test-data-source-logic.js
```

### `test-specific-anime.js`
Prueba un anime específico para verificar imágenes y datos.

```bash
cd backend
node test-specific-anime.js
```

### `clear-cache.js`
Limpia el cache de MongoDB.

```bash
cd backend
node clear-cache.js
```

## 🎨 Normalización de Datos

### Estructura de Imágenes
```javascript
{
  jpg: {
    imageUrl: "https://cdn.myanimelist.net/images/anime/...",
    smallImageUrl: "https://cdn.myanimelist.net/images/anime/...",
    largeImageUrl: "https://cdn.myanimelist.net/images/anime/..."
  },
  webp: {
    imageUrl: "https://cdn.myanimelist.net/images/anime/...",
    smallImageUrl: "https://cdn.myanimelist.net/images/anime/...",
    largeImageUrl: "https://cdn.myanimelist.net/images/anime/..."
  }
}
```

### Campos Normalizados
- `mal_id` → `id`
- `image_url` → `imageUrl`
- `small_image_url` → `smallImageUrl`
- `large_image_url` → `largeImageUrl`

## 🚀 Casos de Uso

### Desarrollo Local
```bash
# Solo Jikan, sin cache
ANIME_DATA_SOURCE=jikan
CACHE_ENABLED=false
```

### Producción con Cache
```bash
# Híbrido con cache
ANIME_DATA_SOURCE=hybrid
CACHE_ENABLED=true
MONGODB_URI=mongodb://prod-server:27017/anime
```

### Emergencia (Jikan caído)
```bash
# Solo MongoDB
ANIME_DATA_SOURCE=mongodb
CACHE_ENABLED=true
```

### Migración de API
```bash
# Cambiar a nueva API
ANIME_DATA_SOURCE=newapi
# Modificar dataSourceManager.js para agregar soporte
```

## 🔧 Agregar Nueva Fuente de Datos

### 1. Agregar en `dataSourceManager.js`
```javascript
// Nueva función
async function getAnimeFromNewAPI(animeId) {
  // Implementar lógica
}

// Agregar al switch
switch (source) {
  case 'newapi':
    return await getAnimeFromNewAPI(animeId);
  // ... otros casos
}
```

### 2. Actualizar `getDataSource()`
```javascript
if (currentDataSource === 'newapi') {
  console.log('🔧 ANIME_DATA_SOURCE=newapi, usando nueva API');
  return 'newapi';
}
```

### 3. Agregar a `availableSources`
```javascript
availableSources: ['mongodb', 'jikan', 'hybrid', 'newapi']
```

## 🐛 Troubleshooting

### Problema: Imágenes en null
**Causa:** Cache del navegador o MongoDB con datos viejos
**Solución:**
1. Hard refresh (`Ctrl + F5`)
2. Limpiar cache de MongoDB: `node clear-cache.js`
3. Verificar variables de entorno

### Problema: Error de conexión a MongoDB
**Causa:** MongoDB no disponible
**Solución:**
1. Usar `FORCE_JIKAN=true`
2. O `CACHE_ENABLED=false`

### Problema: Datos inconsistentes
**Causa:** Cache desactualizado
**Solución:**
1. Limpiar cache: `node clear-cache.js`
2. Reiniciar servidor

## 📊 Monitoreo

### Logs del Sistema
- `🔧` - Configuración de fuente
- `🔍` - Consulta iniciada
- `✅` - Operación exitosa
- `⚠️` - Advertencia (no crítico)
- `❌` - Error
- `🔄` - Fallback activado

### Endpoint de Información
```bash
GET /api/anime/data-source-info
```
Devuelve la configuración actual del sistema.

## 🔒 Seguridad

### Variables Sensibles
- `MONGODB_URI` - Contiene credenciales
- `SUPABASE_ANON_KEY` - Clave de API

### Validaciones
- Verificación de variables de entorno
- Fallbacks automáticos
- Manejo de errores de conexión

## 📈 Performance

### Optimizaciones
- Cache en MongoDB para consultas frecuentes
- Normalización de datos para consistencia
- Fallbacks automáticos para alta disponibilidad

### Métricas
- Tiempo de respuesta por fuente
- Hit rate del cache
- Errores de conexión

---

## 🎯 Resumen

El **Data Source Manager** proporciona:

✅ **Flexibilidad total** para cambiar fuentes de datos
✅ **Configuración simple** mediante variables de entorno
✅ **Fallbacks automáticos** para alta disponibilidad
✅ **Cache inteligente** para mejor performance
✅ **API consistente** para el frontend
✅ **Fácil extensibilidad** para nuevas fuentes

**Para usar solo Jikan:**
```bash
ANIME_DATA_SOURCE=jikan
CACHE_ENABLED=false
```

**Para agregar nueva API:**
1. Implementar funciones en `dataSourceManager.js`
2. Agregar al switch de selección
3. Configurar variables de entorno 