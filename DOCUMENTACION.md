# GVSAnime: Documentación Unificada

## Índice

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [¿Qué ofrece el proyecto?](#que-ofrece-el-proyecto)
4. [Backend: Arquitectura y Endpoints](#backend-arquitectura-y-endpoints)
    - 4.1 [Autenticación y Seguridad](#autenticacion-y-seguridad)
    - 4.2 [Módulos y Endpoints](#modulos-y-endpoints)
    - 4.3 [Foros](#foros)
    - 4.4 [Usuarios y Administración](#usuarios-y-administracion)
    - 4.5 [Backup y Sincronización](#backup-y-sincronizacion)
5. [Frontend: Consumo de Endpoints y Migración](#frontend-consumo-y-migracion)
    - 5.1 [Checklist de migración de componentes](#checklist-migracion)
    - 5.2 [Ejemplos de uso con Axios](#ejemplos-axios)
6. [Variables de entorno y configuración](#variables-entorno)
7. [Migraciones y consideraciones técnicas](#migraciones-consideraciones)
8. [Conexión Backend-Frontend](#conexion-backend-frontend)
9. [Preguntas frecuentes y buenas prácticas](#faq-buenas-practicas)

---

## 1. Resumen del Proyecto

**GVSAnime** es una plataforma para explorar, calificar, comentar y debatir sobre anime, con integración de Supabase (usuarios, auth, favoritos, ratings) y MongoDB (cache, backup, foros). El frontend consume únicamente el backend, que centraliza toda la lógica y datos.

---

## 2. Estructura de Carpetas

```
/backend
  ├── services/
  │   ├── auth/         # Registro/login con Supabase
  │   ├── anime/        # Orquestación: Jikan + Mongo + trailers
  │   ├── trailer/      # Consulta y cacheo de trailers
  │   ├── favorites/    # Favoritos (Supabase)
  │   ├── reviews/      # Reseñas (Supabase)
  │   ├── videos/       # Videos propios (YouTube/Facebook)
  │   ├── backup/       # Cron jobs para sincronizar APIs
  │   └── shared/       # Clientes, middlewares, utils
  ├── controllers/
  ├── routes/
  ├── middleware/
  ├── app.js
  └── server.js

/frontend
  ├── app/
  ├── components/
  ├── hooks/
  ├── lib/
  ├── pages/
  └── ...
```

---

## 3. ¿Qué ofrece el proyecto?

- **Exploración de anime** (búsqueda, detalles, géneros, populares, recientes, destacados)
- **Favoritos, watchlist, vistos y ratings** personalizados
- **Foros**: categorías, temas, posts, likes
- **Reseñas y comentarios** (usuarios y externas)
- **Gestión de usuarios y administración** (CRUD admin)
- **Backup y cacheo inteligente** (MongoDB)
- **Autenticación robusta** (Supabase Auth + JWT)
- **API RESTful centralizada** para consumo desde frontend moderno

---

## 4. Backend: Arquitectura y Endpoints

### 4.1 Autenticación y Seguridad

- **Supabase Auth**: registro, login, recuperación, verificación de email
- **JWT**: protección de rutas privadas con `authMiddleware`
- **Roles**: middleware `isAdmin` para rutas de administración

**Ejemplo de uso:**
```js
import authMiddleware from '../middleware/auth.js';
router.get('/privada', authMiddleware, controlador);
```
El frontend debe enviar el JWT en el header `Authorization: Bearer <token>`.

---

### 4.2 Módulos y Endpoints

#### Anime
- `/api/anime/search` — búsqueda, filtros (top, recientes, destacados, género, temporada)
- `/api/anime/:id` — detalles completos
- `/api/anime/genres` — lista de géneros
- `/api/anime/recommendations` — recomendaciones generales/personalizadas

#### Favoritos, Watchlist, Vistos, Ratings
- `/api/favorites`, `/api/watchlist`, `/api/watched`, `/api/ratings` — CRUD, todos protegidos

#### Reviews y Comentarios
- `/api/reviews/:animeId` — reseñas externas (Jikan) y de usuarios
- `/api/comments/:animeId` — comentarios de usuarios (CRUD, likes)

#### Usuarios
- `/api/users/profile` — perfil propio (GET, PUT, DELETE)
- `/api/users` — CRUD admin (solo admin)

#### Backup y Sincronización
- `/api/backup/run`, `/api/backup/start`, `/api/backup/stop` — solo admin

---

### 4.3 Foros

- `/api/forums/categories` — CRUD de categorías
- `/api/forums/topics` — CRUD de temas (por categoría)
- `/api/forums/posts` — CRUD de posts (por tema), likes

**Ejemplo de request:**
```js
// Crear tema
await axios.post('/api/forums/topics', { categoryId, title, content }, { headers: { Authorization: `Bearer ${token}` } });
```

---

### 4.4 Usuarios y Administración

- **CRUD admin**: listar, crear, obtener, editar, eliminar usuarios (solo admin)
- **Roles**: campo `role` en usuario, validado por middleware

---

### 4.5 Backup y Sincronización

- **MongoDB**: cache de animes, géneros, reviews externas, backup de usuarios
- **Supabase**: usuarios, favoritos, ratings, comentarios

---

## 5. Frontend: Consumo de Endpoints y Migración

### 5.1 Checklist de migración de componentes

| Componente        | Endpoint real a consumir           | ¿Implementado? | ¿Requiere autenticación? | Notas |
|-------------------|------------------------------------|----------------|-------------------------|-------|
| FeaturedAnime     | /api/anime/search?featured=true    | Sí             | No                      | Migrar de mock a real |
| GenreShowcase     | /api/anime/genres                  | Sí             | No                      | Migrar de mock a real |
| PopularAnime      | /api/anime/search?sort=top         | Sí             | No                      | Tabs por género con ?genre=... |
| RecentlyUpdated   | /api/anime/search?sort=recent      | Sí             | No                      | Migrar de mock a real |
| AnimeList         | /api/anime/search?q=palabra        | Sí             | No                      | Paginación y búsqueda |
| AnimeDetails      | /api/anime/:id                     | Sí             | No                      | Ficha completa |
| Comments          | /api/comments/:animeId             | Sí             | POST/PUT/DELETE/LIKE sí | GET público, resto requiere token |
| Reviews           | /api/reviews/:anime_id             | Sí             | POST/PUT/DELETE sí      | GET público, resto requiere token |
| Favorites         | /api/favorites                     | Sí             | Sí                      | Todas requieren token |
| Watchlist         | /api/watchlist                     | Sí             | Sí                      | Todas requieren token |
| Watched           | /api/watched                       | Sí             | Sí                      | Todas requieren token |
| Ratings           | /api/ratings                       | Sí             | Sí                      | Todas requieren token |
| Perfil de usuario | /api/users/profile                 | Sí             | Sí                      | Solo usuario autenticado |
| Recommendations   | /api/anime/recommendations         | Sí             | No (personaliza si hay) | Generales o personalizadas |

---

### 5.2 Ejemplos de uso con Axios

```js
// Obtener géneros
const { data } = await axios.get('/api/anime/genres');
const genres = data.genres;

// Obtener animes destacados
const { data } = await axios.get('/api/anime/search?featured=true');
const featured = data.results;

// Crear favorito
await axios.post('/api/favorites', { animeId, title, image }, { headers: { Authorization: `Bearer ${token}` } });
```

---

## 6. Variables de entorno y configuración

- `.env` en backend: controla expiración de caché, uso de MongoDB, claves de Supabase, etc.
- Ejemplo:
  ```
  GENRES_CACHE_HOURS=24
  TOP_ANIME_CACHE_HOURS=6
  USE_MONGO_USERS=false
  SUPABASE_URL=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```

---

## 7. Migraciones y consideraciones técnicas

- **Plan de migración**: ver tabla comparativa de endpoints y checklist de migración.
- **Migración de datos mock**: migrar todos los componentes a consumir endpoints reales.
- **Backup de usuarios**: usar script/manual o cron para sincronizar Supabase → MongoDB.
- **Separación clara entre reviews externas y comentarios de usuario.**
- **Foros y CRUD admin**: ya implementados y documentados.

---

## 8. Conexión Backend-Frontend

- El **frontend** debe consumir únicamente los endpoints del backend.
- **No se debe acceder directamente a Supabase desde el frontend** (excepto para flujos de reset/verificación de email).
- El backend expone una API RESTful unificada, protegida por JWT.
- **CORS**: asegúrate de permitir el dominio del frontend en la configuración del backend.
- **Despliegue**: puedes desplegar backend y frontend en servidores separados, pero deben comunicarse por HTTP(S).

---

## 9. Preguntas frecuentes y buenas prácticas

- **¿Cómo agrego un nuevo módulo?**  
  Añade un servicio, controlador y rutas en `/backend`, documenta el endpoint y actualiza el checklist.
- **¿Cómo hago backup de usuarios?**  
  Usa el script de `/backend/services/backup/userBackup.js` o ejecuta el cron job.
- **¿Cómo protejo rutas privadas?**  
  Usa `authMiddleware` y, para admin, el middleware `isAdmin`.
- **¿Cómo manejo errores y logs?**  
  Usa los middlewares de error y logging incluidos en `/backend/middleware/`.

--- 