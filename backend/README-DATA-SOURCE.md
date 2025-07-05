# 🚀 Data Source Manager - Guía Rápida

## ⚡ Configuración Rápida

### Para usar solo Jikan (Recomendado para desarrollo)
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env y configurar:
ANIME_DATA_SOURCE=jikan
CACHE_ENABLED=false
```

### Para usar MongoDB + Jikan (Producción)
```bash
# Editar .env:
ANIME_DATA_SOURCE=hybrid
CACHE_ENABLED=true
MONGODB_URI=tu_uri_de_mongodb
```

## 🧪 Scripts de Prueba

```bash
# Probar lógica de fuentes de datos
node test-data-source-logic.js

# Probar anime específico
node test-specific-anime.js

# Limpiar cache de MongoDB
node clear-cache.js
```

## 🔧 Variables de Entorno Principales

| Variable | Descripción | Valores |
|----------|-------------|---------|
| `ANIME_DATA_SOURCE` | Fuente principal | `jikan`, `mongodb`, `hybrid` |
| `FORCE_JIKAN` | Forzar solo Jikan | `true`, `false` |
| `CACHE_ENABLED` | Habilitar cache | `true`, `false` |

## 📚 Documentación Completa

Ver: `DOCUMENTACION-DATA-SOURCE-MANAGER.md`

## 🎯 Casos de Uso Comunes

### Desarrollo Local
```bash
ANIME_DATA_SOURCE=jikan
CACHE_ENABLED=false
```

### Producción
```bash
ANIME_DATA_SOURCE=hybrid
CACHE_ENABLED=true
MONGODB_URI=mongodb://...
```

### Emergencia
```bash
FORCE_JIKAN=true
```

## 🔍 Verificar Configuración

```bash
# Endpoint para ver configuración actual
GET /api/anime/data-source-info
```

## 🐛 Problemas Comunes

### Imágenes en null
1. Hard refresh (`Ctrl + F5`)
2. `node clear-cache.js`
3. Verificar variables de entorno

### Error de MongoDB
1. Usar `FORCE_JIKAN=true`
2. O `CACHE_ENABLED=false` 