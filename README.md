# GVSAnime Backend Orquestador

## 📦 Resumen General

| Característica                | Descripción                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| Tipo de backend               | Personalizado, modular y orquestador (Express)                              |
| Autenticación                 | Supabase Auth (email/password + JWT)                                        |
| Base de datos principal       | Supabase PostgreSQL (usuarios, favoritos, comentarios)                      |
| Backup / Cache externo        | MongoDB (anime + trailers desde APIs externas)                              |
| APIs externas                 | Jikan (anime info), YouTube (trailers), opcional Facebook                   |
| Gestión de videos             | Embed de trailers y videos propios (YouTube/Facebook)                       |
| Seguridad                     | JWT verificado con Supabase, middlewares, roles futuros                     |
| Arquitectura                  | Monolito modular (preparado para microservicios)                            |
| Expandible a futuro           | Cron jobs, workers, panel admin, moderación, notificaciones                 |

---

## 📁 Estructura de Carpetas

```
/backend
├── services/
│   ├── auth/          # Registro/login con Supabase
│   ├── anime/         # Orquestación: Jikan + Mongo + trailers
│   ├── trailer/       # Consulta y cacheo de trailers
│   ├── favorites/     # Favoritos (Supabase)
│   ├── reviews/       # Reseñas (Supabase)
│   ├── videos/        # Videos propios (YouTube/Facebook)
│   ├── backup/        # Cron jobs para sincronizar APIs
│   └── shared/        # Clientes, middlewares, utils
├── app.js
└── server.js
```

---

## 🔐 Autenticación

- **Sistema:** Supabase Auth
- **Flujo:** Login / Registro → JWT
- **Seguridad:** Middleware authMiddleware en backend
- **Uso:**
  - Importa el middleware como:
    ```js
    import authMiddleware from '../middleware/auth.js';
    ```
  - Úsalo en las rutas privadas:
    ```js
    router.get('/privada', authMiddleware, controlador);
    ```
  - Si el usuario no envía un JWT válido, recibe 401.
  - El frontend debe enviar el JWT en el header `Authorization: Bearer <token>`.

---

## 🧾 Módulos y Endpoints

### 🔸 Auth
- Registro, login, recuperación
- Verificación de token JWT (con Supabase)
- Middleware para proteger rutas
- **Endpoints:**
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/recover`

### 🔸 Anime
- Buscar anime → primero en Mongo, luego en Jikan API
- Guardar resultado y trailer en Mongo
- Retornar anime + trailer + datos
- **Endpoints:**
  - `GET /api/anime/search?q=naruto` (JWT)
  - `GET /api/anime/:id` (JWT)
- **Ejemplo de respuesta:**
```json
{
  "id": "123",
  "title": "One Piece",
  "episodes": 1000,
  "synopsis": "...",
  "genres": ["Action", "Adventure"],
  "trailer": {
    "platform": "YouTube",
    "videoId": "aBcD1234",
    "embedUrl": "https://youtube.com/embed/aBcD1234"
  },
  "image_url": "...",
  "score": 8.9
}
```

### 🔸 Trailer
- Obtener trailer automáticamente desde YouTube (y Facebook en el futuro)
- Guardar en Mongo como parte del anime
- **Endpoint:**
  - `GET /api/trailer/:anime` (JWT)
- **Ejemplo de respuesta:**
```json
{
  "platform": "YouTube",
  "videoId": "aBcD1234",
  "embedUrl": "https://youtube.com/embed/aBcD1234"
}
```

### 🔸 Favorites
- Guardar un anime como favorito
- Leer los favoritos del usuario autenticado
- Todos los datos van a Supabase (con user_id)
- **Endpoints:**
  - `POST /api/favorites` (JWT)
  - `GET /api/favorites` (JWT)
- **Ejemplo de respuesta:**
```json
[
  {
    "animeId": "123",
    "title": "One Piece",
    "image_url": "..."
  }
]
```

### 🔸 Reviews
- Crear, leer y borrar reseñas (solo el autor)
- Calificación (1–10), comentario, fecha
- Protegido por JWT y vinculado al usuario de Supabase
- **Endpoints:**
  - `POST /api/reviews` (JWT)
  - `GET /api/reviews/:animeId`
  - `DELETE /api/reviews/:reviewId` (JWT)
- **Ejemplo de respuesta:**
```json
[
  {
    "user": "usuario1",
    "rating": 9,
    "comment": "¡Excelente anime!",
    "date": "2024-06-01"
  }
]
```

### 🔸 Videos (tus propios contenidos)
- Agregar video externo de YouTube o Facebook
- Mostrar todos los videos o filtrarlos por anime
- **Endpoints:**
  - `POST /api/videos` (JWT, Admin)
  - `GET /api/videos`
  - `GET /api/videos?anime=One+Piece`
- **Ejemplo de respuesta:**
```json
[
  {
    "title": "Mi top 10",
    "platform": "YouTube",
    "videoId": "xyz123",
    "embedUrl": "https://www.youtube.com/embed/xyz123",
    "type": "reseña",
    "related_anime": ["Naruto", "Bleach"]
  }
]
```

### 🔸 Backup
- Cron job programado para actualizar animes populares de la semana
- Guardarlos en Mongo con trailer
- Usa node-cron, agenda, o bree

### 🔸 Shared
- Cliente Supabase, cliente Mongo, middlewares de seguridad, utilidades

### 🔸 Perfil de Usuario
| Método | Endpoint         | Descripción                        | Body/Params | Respuesta esperada |
|--------|------------------|------------------------------------|-------------|--------------------|
| GET    | /api/users/profile    | Obtener perfil del usuario actual  |             | `{ "user": { ... } }` |
| PUT    | /api/users/profile    | Actualizar perfil del usuario      | `{ username, avatar_url, bio }` | `{ "user": { ... } }` |
| DELETE | /api/users/profile    | Eliminar cuenta del usuario        |             | `{ "message": "..." }` |

**Ejemplo request (DELETE):**
```bash
curl -X DELETE http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <token>"
```
**Ejemplo response:**
```json
{
  "message": "Cuenta eliminada correctamente (debes cerrar sesión en todos los dispositivos)."
}
```

### 🔸 Administración de Backups (solo admin)
| Método | Endpoint             | Descripción                                 | Respuesta esperada |
|--------|----------------------|---------------------------------------------|--------------------|
| POST   | /api/backup/run      | Ejecutar backup manual de animes populares  | `{ success, message }` |
| POST   | /api/backup/stop     | Detener el cron job de backup automático    | `{ message }`      |
| POST   | /api/backup/start    | Activar el cron job de backup automático    | `{ message }`      |

> Todos estos endpoints requieren autenticación y rol `admin`.

**Ejemplo request (ejecutar backup manual):**
```bash
curl -X POST http://localhost:5000/api/backup/run \
  -H "Authorization: Bearer <token_admin>"
```
**Ejemplo response:**
```json
{
  "success": true,
  "message": "Backup completado. Nuevos animes: 10"
}
```

**Ejemplo request (detener cron job):**
```bash
curl -X POST http://localhost:5000/api/backup/stop \
  -H "Authorization: Bearer <token_admin>"
```
**Ejemplo response:**
```json
{
  "message": "Cron job de backup detenido."
}
```

**Ejemplo request (activar cron job):**
```bash
curl -X POST http://localhost:5000/api/backup/start \
  -H "Authorization: Bearer <token_admin>"
```
**Ejemplo response:**
```json
{
  "message": "Cron job de backup activado."
}
```

---

## 🧩 Integración con Frontend Next.js

El frontend **solo debe consumir datos del backend**. Ejemplo de integración:

| Acción                  | Llamada HTTP                  | Requiere JWT |
|-------------------------|-------------------------------|--------------|
| Login/registro          | /api/auth/login               | ❌           |
| Buscar anime            | /api/anime/search?q=naruto    | ✅           |
| Ver detalles de anime   | /api/anime/:id                | ✅           |
| Agregar a favoritos     | POST /api/favorites           | ✅           |
| Ver favoritos           | GET /api/favorites            | ✅           |
| Ver trailer de anime    | /api/trailer/:anime           | ✅           |
| Agregar reseña          | POST /api/reviews             | ✅           |
| Ver reseñas de un anime | GET /api/reviews/:animeId     | ❌           |
| Ver videos propios      | GET /api/videos               | ❌           |
| Agregar nuevo video     | POST /api/videos              | ✅ (Admin)   |

- El frontend debe enviar el JWT en el header `Authorization: Bearer <token>` para rutas protegidas.
- El backend debe devolver los datos en el formato que el frontend espera.

---

## 🔧 Configuraciones Requeridas (.env)

```
PORT=5000
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-key-privada
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/tuDB
YOUTUBE_API_KEY=tu-api-key
```

---

## 🚀 Preparado para el Futuro

| ¿Escalable a microservicios? | ✅ Sí, por carpetas separadas |
|-----------------------------|------------------------------|
| ¿Admite app móvil?          | ✅ Sí, mismo backend         |
| ¿Puedes añadir IA?          | ✅ Con microservicio extra   |
| ¿Panel admin en frontend?   | ✅ Puedes leer Supabase      |

---

## 🛣️ Roadmap Inicial de Desarrollo

1. Configurar base del backend (Express/Fastify, estructura de carpetas, middlewares base)
2. Integrar Supabase Auth (registro, login, JWT, middleware de protección)
3. Servicio de anime (Mongo + Jikan, endpoints de búsqueda y detalles)
4. Servicio de trailers (YouTube API, integración con anime)
5. Favoritos y reseñas (Supabase, endpoints protegidos)
6. Videos propios (estructura y endpoints)
7. Cron jobs de backup (popular anime semanal)
8. Documentar API y probar integración con frontend
9. Preparar para despliegue y escalabilidad

---

## ✅ Conclusión

- El backend es el único proveedor de datos para el frontend.
- Estructura modular y escalable, lista para microservicios.
- Seguridad y buenas prácticas garantizadas.
- Fácil integración con cualquier frontend moderno (Next.js, React, Expo, etc).

# 🛠️ Plan de Desarrollo Backend GVSAnime

## 1. Autenticación y Usuarios
- [x] Integrar Supabase Auth (registro, login, JWT)
- [x] Crear tabla `users` (perfil extendido) y triggers para sincronización con `auth.users`
- [ ] Endpoint para obtener perfil de usuario
- [ ] Endpoint para actualizar perfil de usuario

## 2. Favoritos
- [x] Crear tabla `favorites` en Supabase
- [x] Endpoint para agregar anime a favoritos
- [x] Endpoint para listar favoritos del usuario
- [x] Endpoint para eliminar favorito

## 3. Reseñas
- [x] Crear tabla `reviews` en Supabase
- [x] Endpoint para crear reseña
- [x] Endpoint para listar reseñas de un anime
- [x] Endpoint para eliminar reseña (solo autor)

## 4. Videos Propios
- [x] Crear tabla `videos` en Supabase
- [ ] Endpoint para agregar video
- [ ] Endpoint para listar videos
- [ ] Endpoint para filtrar videos por anime

## 5. Comentarios y Foros
- [x] Crear tablas `comments` y `forums` en Supabase
- [ ] Endpoint para crear comentario
- [ ] Endpoint para listar comentarios
- [ ] Endpoint para crear foro/hilo
- [ ] Endpoint para listar foros

## 6. Integración con APIs externas y MongoDB
- [x] Integrar Jikan API para info de anime
- [x] Integrar YouTube API para trailers
- [x] Integrar MongoDB para cache de anime y trailers

## 7. Seguridad y Middlewares
- [x] Middleware para verificar JWT (proteger rutas)
- [ ] Middleware de roles (admin/moderador)

## 8. Documentación y Pruebas
- [x] Documentar endpoints en README o Swagger
- [ ] Pruebas básicas de endpoints

## 9. Administración de Backups (solo admin)
| Método | Endpoint             | Descripción                                 | Respuesta esperada |
|--------|----------------------|---------------------------------------------|--------------------|
| POST   | /api/backup/run      | Ejecutar backup manual de animes populares  | `{ success, message }` |
| POST   | /api/backup/stop     | Detener el cron job de backup automático    | `{ message }`      |
| POST   | /api/backup/start    | Activar el cron job de backup automático    | `{ message }`      |

> Todos estos endpoints requieren autenticación y rol `admin`.

**Ejemplo request (ejecutar backup manual):**
```bash
curl -X POST http://localhost:5000/api/backup/run \
  -H "Authorization: Bearer <token_admin>"
```
**Ejemplo response:**
```json
{
  "success": true,
  "message": "Backup completado. Nuevos animes: 10"
}
```

**Ejemplo request (detener cron job):**
```bash
curl -X POST http://localhost:5000/api/backup/stop \
  -H "Authorization: Bearer <token_admin>"
```
**Ejemplo response:**
```json
{
  "message": "Cron job de backup detenido."
}
```

**Ejemplo request (activar cron job):**
```bash
curl -X POST http://localhost:5000/api/backup/start \
  -H "Authorization: Bearer <token_admin>"
```
**Ejemplo response:**
```json
{
  "message": "Cron job de backup activado."
}
```

---

# 🧪 Ejemplos de Prueba de Endpoints

## Auth

### Registro
```bash
curl -X POST http://localhost:5001/api/auth/register -H "Content-Type: application/json" -d "{\"email\": \"test@correo.com\", \"password\": \"123456\"}"

```
**Respuesta esperada:**
```json
{
  "user": { "id": "...", "email": "test@correo.com" },
  "token": "..."
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@correo.com", "password": "123456"}'
```
**Respuesta esperada:**
```json
{
  "user": { "id": "...", "email": "test@correo.com" },
  "token": "..."
}
```

## Anime

### Buscar anime
```bash
curl -X GET "http://localhost:5000/api/anime/search?q=naruto" \
  -H "Authorization: Bearer <token>"
```
**Respuesta esperada:**
```json
[
  {
    "id": "20",
    "title": "Naruto",
    "image_url": "...",
    "score": 7.9,
    ...
  },
  ...
]
```

### Obtener detalles de anime
```bash
curl -X GET http://localhost:5000/api/anime/20 \
  -H "Authorization: Bearer <token>"
```
**Respuesta esperada:**
```json
{
  "id": "20",
  "title": "Naruto",
  "episodes": 220,
  "synopsis": "...",
  "genres": ["Action", "Adventure"],
  "trailer": { ... },
  "image_url": "...",
  "score": 7.9,
  "favorites_count": 5,
  "reviews": [ ... ],
  "comments": [ ... ],
  "forums": [ ... ]
}
```

## Favoritos

### Agregar a favoritos
```bash
curl -X POST http://localhost:5000/api/favorites \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"anime_id": "20"}'
```
**Respuesta esperada:**
```json
{
  "message": "Anime agregado a favoritos"
}
```

### Listar favoritos
```bash
curl -X GET http://localhost:5000/api/favorites \
  -H "Authorization: Bearer <token>"
```
**Respuesta esperada:**
```json
[
  {
    "animeId": "20",
    "title": "Naruto",
    "image_url": "..."
  },
  ...
]
```

### Eliminar favorito
```bash
curl -X DELETE http://localhost:5000/api/favorites/20 \
  -H "Authorization: Bearer <token>"
```
**Respuesta esperada:**
```json
{
  "message": "Favorito eliminado"
}
```

## Reseñas

### Crear reseña
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"anime_id": "20", "rating": 9, "comment": "¡Excelente!"}'
```
**Respuesta esperada:**
```json
{
  "message": "Reseña creada"
}
```

### Listar reseñas de un anime
```bash
curl -X GET http://localhost:5000/api/reviews/20
```
**Respuesta esperada:**
```json
[
  {
    "user": "usuario1",
    "rating": 9,
    "comment": "¡Excelente!",
    "date": "2024-06-01"
  },
  ...
]
```

### Eliminar reseña
```bash
curl -X DELETE http://localhost:5000/api/reviews/123 \
  -H "Authorization: Bearer <token>"
```
**Respuesta esperada:**
```json
{
  "message": "Reseña eliminada"
}
```

// ... Puedes seguir este formato para videos, comentarios y foros cuando estén implementados ...

---

**Trabajaremos siguiendo este plan, sección por sección.**

---

## 🆕 Registro de Usuario vía Backend

Ahora puedes registrar usuarios directamente desde el backend usando Supabase.

### Endpoint
- **POST** `/api/auth/register`

### Body (JSON)
- `email` (obligatorio)
- `password` (obligatorio)
- `username` (opcional)

### Ejemplo con curl
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@correo.com", "password":"123456", "username":"opcional"}'
```

Si no quieres enviar username:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@correo.com", "password":"123456"}'
```

### Respuesta exitosa
```json
{
  "message": "Usuario registrado correctamente",
  "user": {
    "id": "...",
    "email": "test@correo.com",
    ...
  }
}
```

# 📚 Endpoints Disponibles y Documentación Actualizada

## 1. Autenticación
| Método | Endpoint           | Descripción         | Body/Query | Respuesta esperada |
|--------|--------------------|---------------------|------------|--------------------|
| POST   | /api/auth/register | Registrar usuario   | `{ "email", "password" }` | `{ "user": { ... }, "token": "..." }` |
| POST   | /api/auth/login    | Iniciar sesión      | `{ "email", "password" }` | `{ "user": { ... }, "token": "..." }` |

**Ejemplo request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@correo.com", "password":"123456"}'
```
**Ejemplo response:**
```json
{
  "user": { "id": "...", "email": "test@correo.com" },
  "token": "..."
}
```

---

## 2. Anime
| Método | Endpoint                        | Descripción                        | Query/Params | Respuesta esperada |
|--------|----------------------------------|------------------------------------|--------------|--------------------|
| GET    | /api/anime/search               | Buscar anime por nombre            | `q=nombre`   | `[ { ...anime } ]` |
| GET    | /api/anime/:id                  | Obtener detalles de anime          | `:id`        | `{ ...anime }`     |
| GET    | /api/anime/cache/animes         | Listar caché de animes (admin/dev) |              | `[ { ... } ]`      |
| GET    | /api/anime/cache/searches       | Listar caché de búsquedas          |              | `[ { ... } ]`      |
| GET    | /api/anime/cache/search/:query  | Detalle de búsqueda en caché       | `:query`     | `{ ... }`          |
| GET    | /api/anime/cache/anime/:id      | Detalle de anime en caché          | `:id`        | `{ ... }`          |
| DELETE | /api/anime/cache/search/:query  | Eliminar búsqueda del caché        | `:query`     | `{ message }`      |
| DELETE | /api/anime/cache/anime/:id      | Eliminar anime del caché           | `:id`        | `{ message }`      |
| DELETE | /api/anime/cache/clean          | Limpiar todo el caché              |              | `{ message }`      |
| GET    | /api/anime/cache/stats          | Estadísticas del caché             |              | `{ animeCache, searchCache, total }` |

> **Nota:** Los endpoints de administración de caché pueden ser usados en un dashboard de administración, no solo para desarrollo.

**Ejemplo request:**
```bash
curl -X GET "http://localhost:5000/api/anime/search?q=naruto"
```
**Ejemplo response:**
```json
[
  {
    "id": "20",
    "title": "Naruto",
    "image_url": "...",
    "score": 7.9,
    ...
  },
  ...
]
```

---

## 3. Favoritos
| Método | Endpoint           | Descripción         | Body/Params | Respuesta esperada |
|--------|--------------------|---------------------|-------------|--------------------|
| POST   | /api/favorites     | Agregar a favoritos | `{ "anime_id", "anime_title", "anime_image_url" }` | `{ "favorite": { ... } }` |
| GET    | /api/favorites     | Listar favoritos    |             | `{ "favorites": [ ... ] }` |
| DELETE | /api/favorites/:id | Eliminar favorito   | `:id`       | `{ "deleted": { ... } }` |

**Ejemplo request:**
```bash
curl -X POST http://localhost:5000/api/favorites \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"anime_id": "20", "anime_title": "Naruto", "anime_image_url": "..."}'
```
**Ejemplo response:**
```json
{
  "favorite": {
    "id": "...",
    "user_id": "...",
    "anime_id": "20",
    "anime_title": "Naruto",
    "anime_image_url": "..."
  }
}
```

---

## 4. Reseñas
| Método | Endpoint                | Descripción                | Body/Params | Respuesta esperada |
|--------|-------------------------|----------------------------|-------------|--------------------|
| POST   | /api/reviews            | Crear reseña               | `{ "anime_id", "rating", "comment" }` | `{ "review": { ... } }` |
| GET    | /api/reviews/:anime_id  | Listar reseñas de un anime | `:anime_id` | `{ "reviews": [ ... ] }` |
| PUT    | /api/reviews/:id        | Editar reseña (autor)      | `:id`, campos editables | `{ "review": { ... } }` |
| DELETE | /api/reviews/:id        | Eliminar reseña (autor)    | `:id`       | `{ "deleted": { ... } }` |

**Ejemplo request:**
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"anime_id": "20", "rating": 9, "comment": "¡Excelente!"}'
```
**Ejemplo response:**
```json
{
  "review": {
    "id": "...",
    "user_id": "...",
    "anime_id": "20",
    "rating": 9,
    "comment": "¡Excelente!",
    "date": "2024-06-01"
  }
}
```

---

## 5. Videos
| Método | Endpoint           | Descripción         | Body/Params | Respuesta esperada |
|--------|--------------------|---------------------|-------------|--------------------|
| POST   | /api/videos        | Agregar video       | `{ "title", "platform", "video_id", ... }` | `{ "video": { ... } }` |
| GET    | /api/videos        | Listar videos (filtro opc.)| `?anime=nombre` | `{ "videos": [ ... ] }` |
| PUT    | /api/videos/:id    | Editar video (autor)| `:id`, campos editables | `{ "video": { ... } }` |
| DELETE | /api/videos/:id    | Eliminar video (autor)| `:id`       | `{ "deleted": { ... } }` |

**Ejemplo request:**
```bash
curl -X POST http://localhost:5000/api/videos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi top 10", "platform": "YouTube", "video_id": "xyz123", "embed_url": "https://www.youtube.com/embed/xyz123", "type": "reseña", "related_anime": ["Naruto", "Bleach"]}'
```
**Ejemplo response:**
```json
{
  "video": {
    "id": "...",
    "user_id": "...",
    "title": "Mi top 10",
    "platform": "YouTube",
    "video_id": "xyz123",
    "embed_url": "https://www.youtube.com/embed/xyz123",
    "type": "reseña",
    "related_anime": ["Naruto", "Bleach"]
  }
}
```

---

## 6. Comentarios
| Método | Endpoint           | Descripción         | Body/Params | Respuesta esperada |
|--------|--------------------|---------------------|-------------|--------------------|
| POST   | /api/comments      | Crear comentario    | `{ ... }`   | `{ "comment": { ... } }` |
| GET    | /api/comments      | Listar comentarios  | `?anime=...`/`?video=...` | `{ "comments": [ ... ] }` |
| PUT    | /api/comments/:id  | Editar comentario (autor) | `:id`, campos editables | `{ "comment": { ... } }` |
| DELETE | /api/comments/:id  | Eliminar comentario (autor) | `:id` | `{ "deleted": { ... } }` |

**Ejemplo request:**
```bash
curl -X POST http://localhost:5000/api/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"anime_id": "20", "comment": "¡Muy bueno!"}'
```
**Ejemplo response:**
```json
{
  "comment": {
    "id": "...",
    "user_id": "...",
    "anime_id": "20",
    "comment": "¡Muy bueno!",
    "date": "2024-06-01"
  }
}
```

---

## 7. Foros
| Método | Endpoint           | Descripción         | Body/Params | Respuesta esperada |
|--------|--------------------|---------------------|-------------|--------------------|
| POST   | /api/forums        | Crear foro/hilo     | `{ ... }`   | `{ "forum": { ... } }` |
| GET    | /api/forums        | Listar foros/hilos  |             | `{ "forums": [ ... ] }` |
| PUT    | /api/forums/:id    | Editar foro/hilo (autor) | `:id`, campos editables | `{ "forum": { ... } }` |
| DELETE | /api/forums/:id    | Eliminar foro/hilo (autor) | `:id` | `{ "deleted": { ... } }` |

**Ejemplo request:**
```bash
curl -X POST http://localhost:5000/api/forums \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Foro de Naruto", "description": "¡Hablemos de Naruto!"}'
```
**Ejemplo response:**
```json
{
  "forum": {
    "id": "...",
    "user_id": "...",
    "title": "Foro de Naruto",
    "description": "¡Hablemos de Naruto!",
    "date": "2024-06-01"
  }
}
```

---

## Notas generales
- Los endpoints protegidos requieren JWT en el header:
  `Authorization: Bearer <token>`
- Las respuestas de error siguen el formato:
  `{ "error": "mensaje" }`
- Los endpoints de administración de caché pueden ser usados en un dashboard de administración, no solo para desarrollo. 

## 🟡 Pendiente: Middleware de roles
- Ya existe un middleware `requireRole([roles])` para restringir rutas a usuarios con rol 'admin', 'moderador', etc.
- Ejemplo de uso futuro:
  - `router.post('/videos', requireRole(['admin']), handler)`
  - `router.delete('/forums/:id', requireRole(['admin', 'moderador']), handler)`
- El middleware lee el rol desde el JWT (por ejemplo, `req.user.role` o `req.user.user_metadata.role`).
- Puedes extenderlo para más roles según la lógica de tu negocio.
- **Por ahora no está aplicado a ningún endpoint, pero está listo para usarse.** 

## 🟢 Buenas prácticas: Manejo de instancias de Mongoose y Supabase
- Usa siempre una sola instancia (singleton) de conexión a MongoDB y Supabase en toda la app.
- Importa y reutiliza los clientes desde los archivos centralizados (`mongooseClient.js` y `supabaseClient.js`).
- No crees nuevas instancias de conexión en cada controlador o servicio.
- Define modelos de Mongoose solo si no existen (`mongoose.models.ModelName || mongoose.model(...)`).
- Lee las variables de entorno para las credenciales, nunca las hardcodees.
- Si agregas nuevos servicios, workers o scripts, aplica la misma lógica de singleton.
- Esto evita fugas de memoria, conexiones duplicadas y mejora el rendimiento y la estabilidad de la app. 