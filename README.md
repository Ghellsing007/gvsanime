# GVSAnime Backend Orquestador

## 📦 Resumen General

| Característica                | Descripción                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| Tipo de backend               | Personalizado, modular y orquestador (Express o Fastify)                    |
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
- **Seguridad:** Middleware verifySupabaseJWT en backend
- **Roles futuros:** Soporte para admin/moderador vía Supabase claims

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