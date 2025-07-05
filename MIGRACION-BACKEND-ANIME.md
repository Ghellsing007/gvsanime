# Migración: Frontend → Backend para Datos de Anime

## Resumen Ejecutivo

Esta documentación describe la migración completa del frontend para obtener datos de anime desde nuestro backend personalizado en lugar de consultar directamente la API de Jikan. Esta migración aprovecha nuestro sistema de caché en MongoDB y enriquecimiento de datos desde Supabase.

## Objetivos de la Migración

### ✅ Objetivos Cumplidos
- **Caché Inteligente**: Los datos se obtienen desde MongoDB con respaldo automático
- **Mejor Rendimiento**: Respuestas más rápidas al usar caché local
- **Datos Enriquecidos**: El backend agrega datos personalizados (favoritos, reviews, etc.)
- **Control Total**: Capacidad de modificar y optimizar los datos según necesidades
- **Escalabilidad**: Sistema de caché reduce la carga en APIs externas

## Arquitectura del Sistema

### Diagrama de Flujo

```
Frontend (Next.js)
    ↓
API Routes (/api/anime/*)
    ↓
Backend (Express.js)
    ↓
MongoDB (Caché) ←→ Jikan API (Fuente externa)
    ↓
Supabase (Datos personalizados)
```

### Componentes Principales

1. **Frontend API Routes**: Proxies que redirigen peticiones al backend
2. **Backend Controllers**: Manejan la lógica de negocio y caché
3. **Servicios de Agregación**: Orquestan datos de múltiples fuentes
4. **MongoDB**: Almacena caché de animes y búsquedas
5. **Supabase**: Almacena datos personalizados (favoritos, reviews, etc.)

## Cambios Realizados

### 1. API Routes del Frontend

#### `frontend/app/api/anime/[id]/route.ts`
**Antes:**
```typescript
const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`)
const { data } = await response.json()
```

**Después:**
```typescript
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const response = await fetch(`${backendUrl}/anime/${id}`)
const data = await response.json()
```

**Beneficios:**
- Usa el sistema de caché del backend
- Incluye datos enriquecidos desde Supabase
- Respuestas más rápidas

#### `frontend/app/api/anime/route.ts`
**Antes:**
```typescript
let apiUrl = `https://api.jikan.moe/v4/anime?page=${page}&limit=${limit}`
```

**Después:**
```typescript
let apiUrl = `${backendUrl}/anime/search?page=${page}&limit=${limit}`
```

**Beneficios:**
- Soporte completo de paginación
- Caché de búsquedas
- Filtros avanzados (géneros, temporadas, etc.)

### 2. Backend Mejorado

#### `backend/controllers/animeController.js`

**Nuevas Funcionalidades:**
- Soporte de paginación (`page` y `limit`)
- Formato de respuesta estandarizado
- Manejo de errores mejorado

**Estructura de Respuesta:**
```javascript
{
  pagination: {
    current_page: 1,
    items: { count: 25 },
    has_next_page: true
  },
  data: [...animes]
}
```

#### `backend/services/anime/animeAggregator.js`

**Función `mergeAnimeData` Mejorada:**
```javascript
const merged = {
  // Campos básicos
  mal_id: jikanData?.mal_id,
  title: jikanData?.title,
  title_japanese: jikanData?.title_japanese,
  synopsis: jikanData?.synopsis,
  background: jikanData?.background,
  
  // Imágenes
  images: jikanData?.images,
  coverImage: jikanData?.images?.jpg?.image_url,
  
  // Estadísticas
  score: jikanData?.score,
  scored_by: jikanData?.scored_by,
  popularity: jikanData?.popularity,
  rank: jikanData?.rank,
  members: jikanData?.members,
  favorites: jikanData?.favorites,
  
  // Información técnica
  episodes: jikanData?.episodes,
  type: jikanData?.type,
  status: jikanData?.status,
  duration: jikanData?.duration,
  rating: jikanData?.rating,
  
  // Relaciones y enlaces
  trailer: jikanData?.trailer,
  relations: jikanData?.relations,
  external: jikanData?.external
}
```

### 3. Frontend Actualizado

#### `frontend/components/anime-details.tsx`
**Cambios:**
- Manejo directo de respuesta del backend (sin wrapper `{ data: ... }`)
- Compatibilidad con todos los campos del backend
- Mejor manejo de errores

#### `frontend/app/anime/[id]/page.tsx`
**Metadatos:**
- Generación de metadatos usando el backend
- SEO mejorado con datos en tiempo real

## Configuración del Sistema

### Variables de Entorno

#### Frontend (`.env.local`)
```bash
# Configuración del backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Backend (`.env`)
```bash
# Configuración de caché
TOP_ANIME_CACHE_HOURS=6
RECENT_ANIME_CACHE_HOURS=2
FEATURED_ANIME_CACHE_HOURS=4
```

### Endpoints Disponibles

#### Frontend API Routes
- `GET /api/anime/[id]` - Detalles de un anime específico
- `GET /api/anime?q=query&page=1&limit=12` - Búsqueda de animes

#### Backend Endpoints
- `GET /api/anime/:id` - Detalles completos de un anime
- `GET /api/anime/search` - Búsqueda con filtros y paginación
- `GET /api/anime/genres` - Lista de géneros disponibles
- `GET /api/anime/recommendations` - Recomendaciones personalizadas

## Sistema de Caché

### Modelos de MongoDB

#### AnimeCache
```javascript
{
  animeId: String,
  data: Object,
  updatedAt: Date
}
```

#### SearchCache
```javascript
{
  query: String,
  results: [Object],
  updatedAt: Date,
  source: String,
  animeIds: [String]
}
```

### Estrategia de Caché

1. **Primera Consulta**: 
   - Backend consulta Jikan
   - Guarda datos en MongoDB
   - Enriquece con datos de Supabase

2. **Consultas Posteriores**:
   - Sirve datos desde MongoDB
   - Actualiza datos personalizados desde Supabase
   - Respuesta instantánea

3. **Limpieza Automática**:
   - Caché se limpia cada 7 días
   - Configuración por tipo de datos

## Datos Enriquecidos

### Información Personalizada (Supabase)
- **Favoritos**: Estado de favorito por usuario
- **Reviews**: Reseñas de usuarios
- **Comentarios**: Sistema de comentarios
- **Foros**: Discusiones relacionadas
- **Watchlist**: Listas de seguimiento

### Información Externa (Jikan)
- **Datos básicos**: Título, sinopsis, imágenes
- **Estadísticas**: Puntuación, popularidad, ranking
- **Metadatos**: Géneros, estudios, temporadas
- **Relaciones**: Animes relacionados, spin-offs
- **Enlaces**: Tráilers, enlaces externos

## Optimizaciones Implementadas

### 1. Paginación Inteligente
- Soporte completo de `page` y `limit`
- Cálculo automático de `has_next_page`
- Respuestas optimizadas

### 2. Caché Estratégico
- Diferentes tiempos de expiración por tipo
- Limpieza automática de datos antiguos
- Relaciones entre búsquedas y animes

### 3. Manejo de Errores
- Fallback a datos en caché
- Respuestas de error informativas
- Logging detallado para debugging

## Monitoreo y Mantenimiento

### Endpoints de Administración
```bash
# Estadísticas del caché
GET /api/anime/cache/stats

# Listar caché de animes
GET /api/anime/cache/animes

# Listar caché de búsquedas
GET /api/anime/cache/searches

# Limpiar caché específico
DELETE /api/anime/cache/anime/:id
DELETE /api/anime/cache/search/:query

# Limpiar todo el caché
DELETE /api/anime/cache/clean
```

### Métricas Importantes
- **Tiempo de respuesta**: < 100ms para datos en caché
- **Hit rate**: Porcentaje de consultas servidas desde caché
- **Uso de memoria**: Tamaño del caché en MongoDB
- **Errores**: Tasa de fallos en consultas externas

## Próximos Pasos

### Mejoras Planificadas
1. **Cache Warming**: Precargar datos populares
2. **CDN Integration**: Distribución global de caché
3. **Analytics**: Tracking de consultas más populares
4. **Rate Limiting**: Protección contra abuso
5. **Webhooks**: Notificaciones de actualizaciones

### Escalabilidad
1. **Sharding**: Distribuir caché en múltiples instancias
2. **Redis**: Caché en memoria para datos frecuentes
3. **Queue System**: Procesamiento asíncrono de actualizaciones
4. **Load Balancing**: Distribución de carga

## Troubleshooting

### Problemas Comunes

#### 1. Datos No Actualizados
```bash
# Limpiar caché específico
DELETE /api/anime/cache/anime/{anime_id}
```

#### 2. Errores de Conexión
- Verificar `NEXT_PUBLIC_API_URL`
- Comprobar que el backend esté ejecutándose
- Revisar logs del backend

#### 3. Rendimiento Lento
- Verificar estadísticas del caché
- Revisar consultas a MongoDB
- Optimizar índices de base de datos

### Logs Importantes
```javascript
// Backend logs
console.log(`Resultados de búsqueda encontrados en caché para: ${query}`)
console.log(`Buscando en APIs externas para: ${query}`)
console.log(`Resultados guardados en caché para: ${query}`)
```

## Conclusión

La migración ha sido exitosa y proporciona:

- **Mejor rendimiento** con sistema de caché inteligente
- **Datos enriquecidos** con información personalizada
- **Escalabilidad** para manejar mayor tráfico
- **Control total** sobre los datos y su presentación
- **Mantenibilidad** con documentación completa

El sistema ahora está preparado para crecer y adaptarse a las necesidades futuras del proyecto. 