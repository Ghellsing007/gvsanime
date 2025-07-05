# Documentación Técnica: Sistema de Anime

## Arquitectura Técnica

### Stack Tecnológico

```
Frontend: Next.js 14 + TypeScript + Tailwind CSS
Backend: Express.js + Node.js
Base de Datos: MongoDB (caché) + Supabase (datos personalizados)
APIs Externas: Jikan API (MyAnimeList)
```

### Estructura de Archivos

```
gvsanime/
├── frontend/
│   ├── app/
│   │   ├── api/anime/
│   │   │   ├── [id]/route.ts          # Detalles de anime
│   │   │   └── route.ts               # Búsqueda de animes
│   │   └── anime/[id]/page.tsx        # Página de detalles
│   └── components/
│       └── anime-details.tsx          # Componente de detalles
├── backend/
│   ├── controllers/
│   │   └── animeController.js         # Controladores de anime
│   ├── services/anime/
│   │   ├── animeAggregator.js         # Orquestador principal
│   │   ├── jikanService.js            # Servicio Jikan
│   │   └── animeUtils.js              # Utilidades
│   └── routes/
│       └── anime.js                   # Rutas de anime
```

## API Reference

### Frontend API Routes

#### `GET /api/anime/[id]`
Obtiene detalles completos de un anime específico.

**Parámetros:**
- `id` (string): ID del anime (MAL ID)

**Respuesta:**
```typescript
interface AnimeResponse {
  mal_id: number;
  title: string;
  title_japanese: string;
  synopsis: string;
  background: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
      small_image_url: string;
    };
    webp: {
      image_url: string;
      large_image_url: string;
      small_image_url: string;
    };
  };
  score: number;
  scored_by: number;
  popularity: number;
  rank: number;
  members: number;
  favorites: number;
  episodes: number;
  type: string;
  status: string;
  aired: {
    from: string;
    to: string;
    string: string;
  };
  season: string;
  year: number;
  studios: Array<{
    mal_id: number;
    name: string;
  }>;
  source: string;
  duration: string;
  rating: string;
  genres: Array<{
    mal_id: number;
    name: string;
  }>;
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  relations: Array<{
    relation: string;
    entry: Array<{
      mal_id: number;
      type: string;
      name: string;
    }>;
  }>;
  external: Array<{
    name: string;
    url: string;
  }>;
  // Datos enriquecidos desde Supabase
  favoritesCount: number;
  isFavorite: boolean;
  userReview: Review | null;
  reviews: Review[];
  comments: Comment[];
  forums: Forum[];
}
```

#### `GET /api/anime`
Búsqueda de animes con filtros y paginación.

**Parámetros de Query:**
- `q` (string, opcional): Término de búsqueda
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 12)
- `sort` (string, opcional): Ordenamiento ('top', 'recent', 'featured')
- `season` (string, opcional): Temporada ('2024-Spring')
- `genre` (string, opcional): Género específico
- `featured` (boolean, opcional): Solo destacados

**Respuesta:**
```typescript
interface SearchResponse {
  pagination: {
    current_page: number;
    items: {
      count: number;
    };
    has_next_page: boolean;
  };
  data: AnimeResponse[];
}
```

### Backend Endpoints

#### `GET /api/anime/:id`
Detalles completos de un anime con datos enriquecidos.

**Headers:**
- `Authorization: Bearer <token>` (opcional, para datos personalizados)

**Respuesta:** Misma estructura que Frontend API

#### `GET /api/anime/search`
Búsqueda avanzada con caché.

**Parámetros:** Mismos que Frontend API

**Respuesta:** Misma estructura que Frontend API

## Modelos de Datos

### MongoDB Schemas

#### AnimeCache
```javascript
const AnimeCacheSchema = new mongoose.Schema({
  animeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  data: {
    type: Object,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});
```

#### SearchCache
```javascript
const SearchCacheSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    index: true
  },
  results: [{
    type: Object
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    required: true
  },
  animeIds: [{
    type: String
  }]
});
```

### Supabase Models

#### Reviews
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Favorites
```sql
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  anime_id INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(anime_id, user_id)
);
```

## Servicios y Utilidades

### animeAggregator.js

#### `getAnimeFullData(animeId, userId)`
Función principal que orquesta la obtención de datos.

**Flujo:**
1. Busca en caché de MongoDB
2. Si no existe, consulta Jikan API
3. Fusiona datos con `mergeAnimeData`
4. Enriquece con datos de Supabase
5. Guarda en caché
6. Retorna datos completos

**Parámetros:**
- `animeId` (string): ID del anime
- `userId` (string, opcional): ID del usuario para datos personalizados

**Retorna:** Objeto con datos completos del anime

#### `searchAnimeWithCache(query)`
Búsqueda con sistema de caché inteligente.

**Flujo:**
1. Busca en caché de búsquedas
2. Si no existe, consulta APIs externas
3. Guarda cada anime individualmente
4. Guarda resultados de búsqueda
5. Retorna datos con metadatos

**Parámetros:**
- `query` (string): Término de búsqueda

**Retorna:**
```javascript
{
  source: string,
  results: AnimeResponse[],
  animeIds: string[]
}
```

### jikanService.js

#### `getAnimeById(animeId)`
Consulta directa a Jikan API.

**Parámetros:**
- `animeId` (string): MAL ID del anime

**Retorna:** Datos raw de Jikan API

#### `searchAnime(query, page = 1, limit = 25)`
Búsqueda en Jikan API.

**Parámetros:**
- `query` (string): Término de búsqueda
- `page` (number): Página
- `limit` (number): Elementos por página

**Retorna:** Respuesta de Jikan API

## Configuración y Variables de Entorno

### Frontend (.env.local)
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Supabase (si se usa directamente)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env)
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/gvsanime

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Cache Configuration
TOP_ANIME_CACHE_HOURS=6
RECENT_ANIME_CACHE_HOURS=2
FEATURED_ANIME_CACHE_HOURS=4
SEARCH_CACHE_DAYS=7

# Jikan API (rate limiting)
JIKAN_RATE_LIMIT=1000
JIKAN_RATE_LIMIT_WINDOW=60000
```

## Optimizaciones y Performance

### Estrategias de Caché

#### 1. Caché en Capas
```javascript
// Nivel 1: Caché de memoria (Redis recomendado)
// Nivel 2: Caché de MongoDB
// Nivel 3: APIs externas
```

#### 2. TTL Configurable
```javascript
const CACHE_TTL = {
  ANIME_DETAILS: 24 * 60 * 60 * 1000, // 24 horas
  SEARCH_RESULTS: 6 * 60 * 60 * 1000,  // 6 horas
  TOP_ANIME: 2 * 60 * 60 * 1000,       // 2 horas
  GENRES: 7 * 24 * 60 * 60 * 1000      // 7 días
};
```

#### 3. Cache Warming
```javascript
// Precargar datos populares
async function warmCache() {
  const popularAnimes = [1, 5, 6, 8, 15]; // MAL IDs populares
  for (const id of popularAnimes) {
    await getAnimeFullData(id);
  }
}
```

### Rate Limiting

#### Jikan API
```javascript
const rateLimiter = {
  requests: 0,
  windowStart: Date.now(),
  limit: 1000,
  window: 60000
};

function checkRateLimit() {
  const now = Date.now();
  if (now - rateLimiter.windowStart > rateLimiter.window) {
    rateLimiter.requests = 0;
    rateLimiter.windowStart = now;
  }
  
  if (rateLimiter.requests >= rateLimiter.limit) {
    throw new Error('Rate limit exceeded');
  }
  
  rateLimiter.requests++;
}
```

## Manejo de Errores

### Estrategia de Fallback
```javascript
async function getAnimeWithFallback(animeId) {
  try {
    // Intento 1: Caché
    const cached = await getFromCache(animeId);
    if (cached) return cached;
    
    // Intento 2: API externa
    const fresh = await getFromAPI(animeId);
    await saveToCache(animeId, fresh);
    return fresh;
    
  } catch (error) {
    // Intento 3: Datos básicos desde caché
    const basic = await getBasicFromCache(animeId);
    if (basic) return basic;
    
    // Error final
    throw new Error(`No se pudo obtener datos para anime ${animeId}`);
  }
}
```

### Logging Estructurado
```javascript
const logger = {
  info: (message, data) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      data
    }));
  },
  error: (message, error) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error.message,
      stack: error.stack
    }));
  }
};
```

## Testing

### Unit Tests
```javascript
// tests/animeAggregator.test.js
describe('getAnimeFullData', () => {
  it('should return cached data if available', async () => {
    const mockCache = { data: { title: 'Test Anime' } };
    jest.spyOn(AnimeCache, 'findOne').mockResolvedValue(mockCache);
    
    const result = await getAnimeFullData('1');
    expect(result.title).toBe('Test Anime');
  });
  
  it('should fetch from API if not cached', async () => {
    jest.spyOn(AnimeCache, 'findOne').mockResolvedValue(null);
    jest.spyOn(jikanService, 'getAnimeById').mockResolvedValue({
      mal_id: 1,
      title: 'Test Anime'
    });
    
    const result = await getAnimeFullData('1');
    expect(result.title).toBe('Test Anime');
  });
});
```

### Integration Tests
```javascript
// tests/api/anime.test.js
describe('GET /api/anime/:id', () => {
  it('should return anime details', async () => {
    const response = await request(app)
      .get('/api/anime/1')
      .expect(200);
    
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('mal_id');
  });
});
```

## Monitoreo y Métricas

### Métricas Clave
```javascript
const metrics = {
  cacheHitRate: 0,
  averageResponseTime: 0,
  errorRate: 0,
  requestsPerMinute: 0
};

function updateMetrics(type, value) {
  switch (type) {
    case 'cache_hit':
      metrics.cacheHitRate = (metrics.cacheHitRate + value) / 2;
      break;
    case 'response_time':
      metrics.averageResponseTime = (metrics.averageResponseTime + value) / 2;
      break;
    // ... más métricas
  }
}
```

### Health Checks
```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: await checkMongoConnection(),
      supabase: await checkSupabaseConnection(),
      jikan: await checkJikanAPI()
    },
    metrics
  };
  
  res.json(health);
});
```

## Deployment

### Docker Configuration
```dockerfile
# Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables (Production)
```bash
# Production
NEXT_PUBLIC_API_URL=https://api.gvsanime.com
MONGODB_URI=mongodb://production-db:27017/gvsanime
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_production_key
```

## Seguridad

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas peticiones desde esta IP'
});

app.use('/api/anime', apiLimiter);
```

### Validación de Input
```javascript
const { body, param, query, validationResult } = require('express-validator');

const validateAnimeId = [
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número positivo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

Esta documentación técnica proporciona una guía completa para desarrolladores que trabajen con el sistema de anime, incluyendo todos los aspectos técnicos, configuraciones y mejores prácticas. 