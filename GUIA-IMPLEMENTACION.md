# Guía de Implementación: Sistema de Anime

## Requisitos Previos

### Software Necesario
- Node.js 18+ 
- MongoDB 6+
- pnpm (recomendado) o npm
- Git

### Cuentas de Servicios
- Supabase (para datos personalizados)
- MyAnimeList (opcional, para API key)

## Instalación y Configuración

### 1. Configuración del Backend

#### Instalar Dependencias
```bash
cd backend
pnpm install
```

#### Configurar Variables de Entorno
Crear archivo `.env` en el directorio `backend`:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/gvsanime

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Cache Configuration
TOP_ANIME_CACHE_HOURS=6
RECENT_ANIME_CACHE_HOURS=2
FEATURED_ANIME_CACHE_HOURS=4
SEARCH_CACHE_DAYS=7

# Server
PORT=5000
NODE_ENV=development
```

#### Inicializar Base de Datos
```bash
# Conectar a MongoDB
mongosh
use gvsanime

# Crear índices (opcional, se crean automáticamente)
db.animecaches.createIndex({ "animeId": 1 })
db.searchcaches.createIndex({ "query": 1 })
```

#### Ejecutar Backend
```bash
# Desarrollo
pnpm dev

# Producción
pnpm start
```

### 2. Configuración del Frontend

#### Instalar Dependencias
```bash
cd frontend
pnpm install
```

#### Configurar Variables de Entorno
Crear archivo `.env.local` en el directorio `frontend`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Supabase (si se usa directamente en frontend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Ejecutar Frontend
```bash
# Desarrollo
pnpm dev

# Producción
pnpm build
pnpm start
```

## Verificación de la Instalación

### 1. Probar Backend

#### Verificar Endpoints
```bash
# Detalles de un anime
curl http://localhost:5000/api/anime/1

# Búsqueda de animes
curl "http://localhost:5000/api/anime/search?q=naruto&page=1&limit=5"

# Estadísticas del caché
curl http://localhost:5000/api/anime/cache/stats
```

#### Respuestas Esperadas
```json
// GET /api/anime/1
{
  "mal_id": 1,
  "title": "Cowboy Bebop",
  "synopsis": "...",
  "score": 8.78,
  // ... más campos
}

// GET /api/anime/search?q=naruto
{
  "pagination": {
    "current_page": 1,
    "items": { "count": 25 },
    "has_next_page": true
  },
  "data": [...]
}
```

### 2. Probar Frontend

#### Verificar Páginas
- Abrir `http://localhost:3000`
- Navegar a `http://localhost:3000/anime/1`
- Verificar que se muestren los datos correctamente

#### Verificar API Routes
```bash
# Detalles de anime
curl http://localhost:3000/api/anime/1

# Búsqueda
curl "http://localhost:3000/api/anime?q=naruto&page=1&limit=5"
```

## Configuración de Supabase

### 1. Crear Proyecto
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Obtener URL y Service Key

### 2. Configurar Tablas
Ejecutar en el SQL Editor de Supabase:

```sql
-- Tabla de reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de favoritos
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(anime_id, user_id)
);

-- Tabla de watchlist
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(anime_id, user_id)
);

-- Tabla de comentarios
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de foros
CREATE TABLE forums (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Configurar Políticas RLS
```sql
-- Habilitar RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;

-- Políticas para reviews
CREATE POLICY "Users can view all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Políticas para favoritos
CREATE POLICY "Users can view all favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Users can insert their own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Políticas similares para otras tablas...
```

## Monitoreo y Mantenimiento

### 1. Verificar Caché
```bash
# Ver estadísticas
curl http://localhost:5000/api/anime/cache/stats

# Listar animes en caché
curl http://localhost:5000/api/anime/cache/animes

# Listar búsquedas en caché
curl http://localhost:5000/api/anime/cache/searches
```

### 2. Limpiar Caché
```bash
# Limpiar anime específico
curl -X DELETE http://localhost:5000/api/anime/cache/anime/1

# Limpiar búsqueda específica
curl -X DELETE http://localhost:5000/api/anime/cache/search/naruto

# Limpiar todo el caché
curl -X DELETE http://localhost:5000/api/anime/cache/clean
```

### 3. Logs del Sistema
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs (en consola del navegador)
# Verificar Network tab para requests
```

## Optimización

### 1. Configurar Índices MongoDB
```javascript
// En MongoDB shell
use gvsanime

// Índices para mejor rendimiento
db.animecaches.createIndex({ "animeId": 1 })
db.animecaches.createIndex({ "updatedAt": 1 })
db.searchcaches.createIndex({ "query": 1 })
db.searchcaches.createIndex({ "updatedAt": 1 })
```

### 2. Configurar Rate Limiting
```javascript
// En backend/app.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por ventana
});

app.use('/api/anime', apiLimiter);
```

### 3. Configurar CORS
```javascript
// En backend/app.js
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión MongoDB
```bash
# Verificar que MongoDB esté ejecutándose
sudo systemctl status mongod

# Reiniciar MongoDB
sudo systemctl restart mongod
```

#### 2. Error de Conexión Supabase
```bash
# Verificar variables de entorno
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# Probar conexión
curl -H "apikey: $SUPABASE_SERVICE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
     "$SUPABASE_URL/rest/v1/"
```

#### 3. Datos No Actualizados
```bash
# Limpiar caché específico
curl -X DELETE http://localhost:5000/api/anime/cache/anime/{anime_id}

# Verificar logs del backend
tail -f backend/logs/app.log
```

#### 4. Error de CORS
```javascript
// Verificar configuración en backend
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

### Logs de Debug
```javascript
// Habilitar logs detallados
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Cache hit for anime:', animeId);
  console.log('Fetching from Jikan API...');
  console.log('Saving to cache...');
}
```

## Escalabilidad

### 1. Configurar Redis (Opcional)
```bash
# Instalar Redis
sudo apt-get install redis-server

# Configurar en backend
npm install redis

# En .env
REDIS_URL=redis://localhost:6379
```

### 2. Configurar Load Balancer
```nginx
# Nginx configuration
upstream backend {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    listen 80;
    server_name api.gvsanime.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Configurar CDN
```javascript
// Configurar Cloudflare o similar
// Agregar headers de caché
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

## Seguridad

### 1. Validación de Input
```javascript
// Instalar express-validator
npm install express-validator

// Validar parámetros
const { param, validationResult } = require('express-validator');

const validateAnimeId = [
  param('id').isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### 2. Rate Limiting
```javascript
// Configurar límites por IP
const rateLimit = require('express-rate-limit');

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiadas peticiones, intenta más tarde'
});

app.use('/api/anime/cache/clean', strictLimiter);
```

### 3. Headers de Seguridad
```javascript
// Instalar helmet
npm install helmet

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
```

Esta guía proporciona todos los pasos necesarios para implementar y configurar el sistema de anime de manera completa y segura. 