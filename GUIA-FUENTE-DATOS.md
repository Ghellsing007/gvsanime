# Guía de Gestión de Fuentes de Datos para Anime

## Descripción

Este sistema permite alternar fácilmente entre diferentes fuentes de datos para obtener información de anime sin hacer cambios en el código. Puedes elegir entre:

- **MongoDB**: Usar solo datos cacheados en MongoDB
- **Jikan**: Usar solo la API externa de Jikan
- **Híbrido**: Usar MongoDB primero, y si no encuentra datos, consultar Jikan (modo por defecto)

## Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Fuente de datos principal (mongodb, jikan, hybrid)
ANIME_DATA_SOURCE=hybrid

# Forzar uso de Jikan (ignora ANIME_DATA_SOURCE si está en true)
FORCE_JIKAN=false

# Habilitar/deshabilitar cache en MongoDB
CACHE_ENABLED=true
```

### Opciones de Configuración

| Variable | Valores | Descripción |
|----------|---------|-------------|
| `ANIME_DATA_SOURCE` | `mongodb`, `jikan`, `hybrid` | Fuente de datos principal |
| `FORCE_JIKAN` | `true`, `false` | Fuerza el uso de Jikan (prioridad sobre ANIME_DATA_SOURCE) |
| `CACHE_ENABLED` | `true`, `false` | Habilita/deshabilita el guardado en cache |

## Modos de Operación

### 1. Modo MongoDB (`ANIME_DATA_SOURCE=mongodb`)

- **Comportamiento**: Solo consulta datos cacheados en MongoDB
- **Ventajas**: Muy rápido, no depende de APIs externas
- **Desventajas**: Solo datos previamente cacheados
- **Uso**: Ideal para producción con datos completos

### 2. Modo Jikan (`ANIME_DATA_SOURCE=jikan`)

- **Comportamiento**: Solo consulta la API de Jikan
- **Ventajas**: Datos siempre actualizados
- **Desventajas**: Más lento, depende de la disponibilidad de Jikan
- **Uso**: Ideal para desarrollo o cuando necesitas datos frescos

### 3. Modo Híbrido (`ANIME_DATA_SOURCE=hybrid`)

- **Comportamiento**: Primero busca en MongoDB, si no encuentra, consulta Jikan
- **Ventajas**: Balance entre velocidad y datos actualizados
- **Desventajas**: Complejidad adicional
- **Uso**: Modo recomendado para la mayoría de casos

## Endpoints de Gestión

### Obtener Información de la Fuente de Datos

```http
GET /api/anime/datasource/info
```

**Respuesta:**
```json
{
  "currentSource": "hybrid",
  "forceJikan": false,
  "cacheEnabled": true,
  "availableSources": ["mongodb", "jikan", "hybrid"]
}
```

### Limpiar Cache de MongoDB

```http
DELETE /api/anime/datasource/cache
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Cache limpiado exitosamente"
}
```

## Casos de Uso

### Desarrollo y Testing

```env
# Para desarrollo rápido con datos frescos
ANIME_DATA_SOURCE=jikan
FORCE_JIKAN=false
CACHE_ENABLED=true
```

### Producción con Cache

```env
# Para producción con cache optimizado
ANIME_DATA_SOURCE=hybrid
FORCE_JIKAN=false
CACHE_ENABLED=true
```

### Solo Cache Local

```env
# Para usar solo datos locales
ANIME_DATA_SOURCE=mongodb
FORCE_JIKAN=false
CACHE_ENABLED=false
```

### Forzar Jikan (Debugging)

```env
# Para forzar Jikan en cualquier caso
FORCE_JIKAN=true
CACHE_ENABLED=true
```

## Logs y Monitoreo

El sistema genera logs detallados que te permiten monitorear qué fuente está siendo usada:

```
🔍 Obteniendo anime 1 desde: hybrid
✅ Anime encontrado en MongoDB
```

```
🔍 Buscando "Naruto" desde: jikan
⚠️ No se encontraron resultados en MongoDB, consultando Jikan...
💾 Resultados guardados en MongoDB
```

```
🔄 Fallback a Jikan...
```

## Fallbacks Automáticos

El sistema incluye fallbacks automáticos:

1. **Si MongoDB falla**: Automáticamente intenta con Jikan
2. **Si Jikan falla**: Automáticamente intenta con MongoDB
3. **Si ambos fallan**: Devuelve error con detalles

## Migración desde el Sistema Anterior

### Antes (animeAggregator.js)
```javascript
import { getAnimeFullData } from '../services/anime/animeAggregator.js';
const animeData = await getAnimeFullData(animeId, userId);
```

### Después (dataSourceManager.js)
```javascript
import { getAnimeByIdManager } from '../services/anime/dataSourceManager.js';
const animeData = await getAnimeByIdManager(animeId, userId);
```

## Funciones Disponibles

### Gestión de Animes
- `getAnimeByIdManager(animeId, userId)` - Obtener anime por ID
- `searchAnimeManager(query, page, limit)` - Buscar animes
- `getTopAnimeManager()` - Obtener animes top
- `getRecentAnimeManager()` - Obtener animes recientes
- `getFeaturedAnimeManager()` - Obtener animes destacados

### Gestión del Sistema
- `getDataSourceInfo()` - Obtener información de configuración
- `clearMongoDBCache()` - Limpiar cache de MongoDB

## Troubleshooting

### Problema: No se obtienen datos
1. Verifica que las variables de entorno estén configuradas correctamente
2. Revisa los logs para ver qué fuente está siendo usada
3. Si usas MongoDB, verifica que haya datos en el cache
4. Si usas Jikan, verifica la conectividad a internet

### Problema: Datos desactualizados
1. Cambia a modo Jikan temporalmente: `ANIME_DATA_SOURCE=jikan`
2. O limpia el cache: `DELETE /api/anime/datasource/cache`
3. Vuelve al modo híbrido: `ANIME_DATA_SOURCE=hybrid`

### Problema: Errores de conexión
1. El sistema automáticamente intenta fallbacks
2. Revisa los logs para ver qué está fallando
3. Verifica la configuración de red y firewalls

## Ejemplos de Uso

### Cambiar Fuente de Datos en Tiempo Real

```bash
# Cambiar a Jikan
export ANIME_DATA_SOURCE=jikan

# Cambiar a MongoDB
export ANIME_DATA_SOURCE=mongodb

# Cambiar a híbrido
export ANIME_DATA_SOURCE=hybrid
```

### Verificar Configuración Actual

```bash
curl http://localhost:3000/api/anime/datasource/info
```

### Limpiar Cache

```bash
curl -X DELETE http://localhost:3000/api/anime/datasource/cache
```

## Ventajas del Nuevo Sistema

1. **Flexibilidad**: Cambia la fuente de datos sin reiniciar
2. **Robustez**: Fallbacks automáticos
3. **Monitoreo**: Logs detallados
4. **Compatibilidad**: Mantiene la misma API
5. **Escalabilidad**: Fácil agregar nuevas fuentes
6. **Mantenimiento**: Código centralizado y limpio 