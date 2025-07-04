# Recomendaciones para la implementación y sustitución en el frontend

## 1. Uso de endpoints públicos y datos cacheados
- Los datos públicos (animes populares, recientes, destacados, géneros, etc.) deben consultarse primero desde el backend, que los cachea en MongoDB para evitar solicitar siempre a la API externa.
- El backend se encarga de actualizar estos datos cada cierto tiempo (por ejemplo, cada 24h para géneros, cada X horas para animes recientes/top).
- El frontend debe consumir estos endpoints usando axios y mostrar los datos dinámicamente.

## 2. Sustitución de datos mock en el frontend

| Componente           | Datos mock actuales                                                                 | Endpoint real a usar (axios)                        |
|----------------------|-------------------------------------------------------------------------------------|-----------------------------------------------------|
| FeaturedAnime        | Array de animes destacados (mock)                                                   | `/api/anime/search?featured=true`                   |
| GenreShowcase        | Array de géneros (mock)                                                             | `/api/anime/genres`                                 |
| PopularAnime         | Arrays de animes populares/top por categoría (mock)                                 | `/api/anime/search?sort=top` y/o `?genre=...`       |
| RecentlyUpdated      | Array de animes recientemente actualizados (mock)                                   | `/api/anime/search?sort=recent`                     |

## 3. Recomendaciones de implementación
- Reemplazar los datos mock por llamadas a los endpoints reales usando axios.
- Para datos públicos, el frontend no necesita autenticación.
- Si se requiere paginación, usar los parámetros `page` y `limit` si están disponibles en el backend.
- Si se necesita actualizar los datos públicos con mayor frecuencia, ajustar la lógica de cacheo en el backend.
- Para datos personalizados del usuario (favoritos, comentarios, etc.), seguir usando endpoints protegidos.

## 4. Ejemplo de uso en el frontend (axios)
```js
import axios from 'axios';

// Obtener géneros
const { data } = await axios.get('/api/anime/genres');
const genres = data.genres;

// Obtener animes destacados
const { data } = await axios.get('/api/anime/search?featured=true');
const featured = data.results;

// Obtener animes populares/top
const { data } = await axios.get('/api/anime/search?sort=top');
const top = data.results;

// Obtener animes recientes
const { data } = await axios.get('/api/anime/search?sort=recent');
const recent = data.results;
```

## 5. Notas
- Si el backend detecta que los datos cacheados están desactualizados, los actualizará automáticamente al consultar la API externa.
- El frontend debe mostrar mensajes de carga y error apropiados si la API tarda o falla.
- Mantener la lógica de presentación desacoplada de la fuente de datos (mock o real) para facilitar la migración.

## Variables de entorno de caché en el backend

Estas variables permiten controlar el tiempo de expiración (en horas) de los datos públicos cacheados en MongoDB. Puedes definirlas en tu archivo `.env` o en la configuración de tu entorno de despliegue.

| Variable                      | Propósito                                               | Valor por defecto |
|-------------------------------|--------------------------------------------------------|-------------------|
| GENRES_CACHE_HOURS            | Expiración del caché de géneros                        | 24                |
| TOP_ANIME_CACHE_HOURS         | Expiración del caché de animes top                     | 6                 |
| RECENT_ANIME_CACHE_HOURS      | Expiración del caché de animes recientes               | 3                 |
| FEATURED_ANIME_CACHE_HOURS    | Expiración del caché de animes destacados              | 12                |
| REVIEWS_CACHE_HOURS           | Expiración del caché de reviews externas (Jikan)        | 24                |

### Ejemplo de configuración en `.env`:
```
GENRES_CACHE_HOURS=24
TOP_ANIME_CACHE_HOURS=6
RECENT_ANIME_CACHE_HOURS=3
FEATURED_ANIME_CACHE_HOURS=12
REVIEWS_CACHE_HOURS=24
```

**Recomendaciones:**
- Ajusta los valores según la frecuencia con la que quieras refrescar los datos públicos.
- Si tienes mucho tráfico o los datos cambian poco, puedes aumentar el tiempo para reducir llamadas a la API externa.
- Si necesitas datos más frescos, reduce el tiempo de expiración.
- Puedes cambiar estos valores en cualquier momento y el backend los aplicará automáticamente en la próxima consulta.

## Endpoints de usuario: favoritos, watchlist y vistos

Estos endpoints permiten a cada usuario gestionar su experiencia personalizada. Todos requieren autenticación.

### Favoritos
- `GET /api/favorites` — Listar favoritos del usuario
- `POST /api/favorites` — Agregar anime a favoritos (body: animeId, title, image)
- `DELETE /api/favorites/:animeId` — Eliminar anime de favoritos

### Watchlist
- `GET /api/watchlist` — Listar watchlist del usuario
- `POST /api/watchlist` — Agregar anime a watchlist (body: animeId, title, image)
- `DELETE /api/watchlist/:animeId` — Eliminar anime de watchlist

### Vistos
- `GET /api/watched` — Listar animes vistos del usuario
- `POST /api/watched` — Marcar anime como visto (body: animeId, title, image)
- `DELETE /api/watched/:animeId` — Quitar anime de la lista de vistos

### Recomendaciones para el frontend
- Usar axios o fetch con el token de autenticación del usuario.
- Mostrar mensajes de éxito/error según la respuesta del backend.
- Actualizar la UI en tiempo real tras agregar o quitar un anime de cada lista.
- Evitar duplicados en la UI (el backend ya los previene, pero es buena práctica en el frontend).
- Permitir al usuario ver, filtrar y gestionar sus listas desde su perfil.

## Endpoints de usuario: ratings (calificación de animes)

Estos endpoints permiten a cada usuario calificar los animes que ha visto. Todos requieren autenticación.

### Ratings
- `GET /api/ratings` — Listar todas las calificaciones del usuario
- `POST /api/ratings` — Calificar un anime (body: animeId, rating, comment opcional)
- `PUT /api/ratings/:animeId` — Actualizar calificación (body: rating, comment opcional)
- `DELETE /api/ratings/:animeId` — Eliminar calificación

### Recomendaciones para el frontend
- Usar axios o fetch con el token de autenticación del usuario.
- Mostrar la calificación personal del usuario en la ficha del anime si existe.
- Permitir al usuario calificar, actualizar o eliminar su calificación desde la UI.
- Validar que el rating esté en el rango permitido (1–10).
- Actualizar la UI en tiempo real tras cualquier cambio.

## Estrategia de respaldo y migración de usuarios a MongoDB (aclaración)

Actualmente, el sistema usa Supabase como base de datos principal de usuarios. El modelo de usuario en MongoDB (`userModel.js`) está preparado principalmente para **respaldo** y como opción para una futura migración, pero **no se usa como backend principal**.

### ¿Cómo funciona?
- Por defecto, los controladores de perfil usan Supabase.
- El modelo de usuario en MongoDB está disponible para respaldos periódicos o sincronización, pero no para operaciones en tiempo real.
- Puedes activar el uso de MongoDB para usuarios cambiando la variable de entorno:

```
USE_MONGO_USERS=true
```

- Si `USE_MONGO_USERS` está en `false` o no definida, se sigue usando Supabase.
- Si está en `true`, los controladores pueden ser adaptados para usar MongoDB (esto es útil para pruebas, migraciones o recuperación ante desastres).

### Recomendaciones
- Usa el modelo de usuario en MongoDB para hacer respaldos periódicos de los datos de usuario (por ejemplo, con un script de sincronización que copie los datos de Supabase a MongoDB).
- No cambies el backend principal de usuarios a MongoDB salvo que sea necesario por migración o contingencia.
- Mantén la lógica desacoplada para facilitar la transición y evitar duplicidad de datos.
- Documenta y automatiza los procesos de respaldo para garantizar la seguridad y disponibilidad de los datos de usuario.

## Protección de rutas privadas con authMiddleware

- Todas las rutas privadas del backend deben usar el middleware de autenticación importado como `authMiddleware`.
- Ejemplo de uso en rutas:
  ```js
  import authMiddleware from '../middleware/auth.js';
  router.get('/privada', authMiddleware, controlador);
  ```
- Si el usuario no envía un JWT válido, recibirá un error 401.
- El frontend debe enviar el JWT en el header `Authorization: Bearer <token>`.
- Ejemplo de llamada protegida con axios:
  ```js
  const { data } = await axios.get('/api/favorites', {
    headers: { Authorization: `Bearer ${token}` }
  });
  ```

## Estado de cobertura del backend respecto a los requerimientos del frontend (actualizado)

### 1. ENDPOINTS DE ANIME
- **/api/anime/search**
  - Soporta todos los filtros requeridos:
    - `?featured=true` o `?sort=featured` → destacados
    - `?sort=top` → top
    - `?sort=recent` → recientes
    - `?season=2024-Spring` → temporada
    - `?genre=nombre` → género
    - `?q=nombre` → búsqueda por texto
  - **Es público** (no requiere autenticación).
- **/api/anime/:id**
  - Devuelve todos los datos completos de un anime (público).
- **/api/anime/genres**
  - Devuelve la lista de géneros (público).
- **/api/anime/reviews/:animeId**
  - Devuelve reseñas externas de Jikan (solo lectura, público).

### 2. ENDPOINTS DE COMENTARIOS Y REVIEWS
- **/api/comments/:animeId**
  - **GET:** Listar comentarios de usuarios (público).
  - **POST:** Crear comentario (requiere autenticación).
  - **PUT /:id:** Editar comentario (requiere autenticación, solo autor).
  - **DELETE /:id:** Eliminar comentario (requiere autenticación, solo autor o admin).
  - **PUT /:id/like:** Dar o quitar like a un comentario (requiere autenticación).
- **/api/reviews/:anime_id**
  - **GET:** Listar reseñas de usuarios (público).
  - **POST:** Crear reseña (requiere autenticación).
  - **PUT /:id:** Editar reseña (requiere autenticación, solo autor).
  - **DELETE /:id:** Eliminar reseña (requiere autenticación, solo autor).

### 3. ENDPOINTS DE USUARIO (favoritos, watchlist, vistos, ratings)
- Ya implementados y protegidos por autenticación.

### 4. ¿QUÉ FALTA O ESTÁ INCOMPLETO?
- **Endpoint de recomendaciones:**
  - No existe `/api/anime/recommendations` (no hay lógica de recomendaciones).
- **Autenticación avanzada:**
  - Faltan endpoints para logout, cambio/reset de contraseña y verificación de email.
- **Foros:**
  - Todo el módulo de foros está pendiente de migrar.
- **CRUD avanzado de usuarios (admin):**
  - Falta obtener, editar y eliminar usuario por ID (solo existe perfil propio).

### 5. CONCLUSIÓN
**El backend ya cubre todo lo que el frontend necesita para mostrar animes, géneros, destacados, populares, recientes, comentarios y reseñas de usuario.**
Puedes migrar los componentes del frontend a consumir estos endpoints reales.

**Solo faltan:**
- Lógica de recomendaciones (si el frontend la requiere).
- Funcionalidades avanzadas de autenticación y foros (no afectan la visualización principal de animes).
- CRUD admin de usuarios (solo necesario para paneles de administración).

## Checklist de migración de componentes del frontend a endpoints reales

| Componente           | Endpoint real a consumir                      | ¿Implementado? | ¿Requiere autenticación? | Notas |
|----------------------|-----------------------------------------------|----------------|-------------------------|-------|
| FeaturedAnime        | /api/anime/search?featured=true               | Sí             | No                      | Migrar de mock a real |
| GenreShowcase        | /api/anime/genres                             | Sí             | No                      | Migrar de mock a real |
| PopularAnime         | /api/anime/search?sort=top                    | Sí             | No                      | Migrar de mock a real, soporta tabs por género con ?genre=... |
| RecentlyUpdated      | /api/anime/search?sort=recent                 | Sí             | No                      | Migrar de mock a real |
| AnimeList            | /api/anime/search?q=palabra                   | Sí             | No                      | Soporta paginación y búsqueda |
| AnimeDetails         | /api/anime/:id                                | Sí             | No                      | Devuelve ficha completa |
| Comments             | /api/comments/:animeId                        | Sí             | POST/PUT/DELETE/LIKE sí | GET es público, el resto requiere token |
| Reviews              | /api/reviews/:anime_id                        | Sí             | POST/PUT/DELETE sí      | GET es público, el resto requiere token |
| Favorites            | /api/favorites                                | Sí             | Sí                      | Todas las operaciones requieren token |
| Watchlist            | /api/watchlist                                | Sí             | Sí                      | Todas las operaciones requieren token |
| Watched              | /api/watched                                  | Sí             | Sí                      | Todas las operaciones requieren token |
| Ratings              | /api/ratings                                  | Sí             | Sí                      | Todas las operaciones requieren token |
| Perfil de usuario    | /api/users/profile                            | Sí             | Sí                      | Solo para usuario autenticado |
| Recommendations      | /api/anime/recommendations                    | En progreso    | No (personaliza si hay) | Generales o personalizadas según usuario |

**Notas:**
- Todos los endpoints públicos pueden ser consumidos directamente desde el frontend sin token.
- Los endpoints protegidos requieren enviar el JWT en el header `Authorization: Bearer <token>`.
- Si algún endpoint no responde como se espera, revisar la documentación o reportar para ajuste en el backend.
- Los componentes que usaban datos mock ya pueden migrar a consumir datos reales.
- Los endpoints de recomendaciones, foros y autenticación avanzada siguen pendientes. 

### Nuevo endpoint: Recomendaciones de anime

- **Ruta:** `GET /api/anime/recommendations`
- **Acceso:** Público (personalizado si el usuario está autenticado)
- **Lógica:**
  - Si el usuario está autenticado, obtiene sus favoritos, watchlist o ratings y recomienda animes similares (por género, sin excluir animes ya vistos).
  - Si no hay usuario o no hay historial, devuelve una mezcla de populares, destacados y aleatorios.
- **Ejemplo de uso en frontend:**
```js
// Sin autenticación
const { data } = await axios.get('/api/anime/recommendations');
// Con autenticación
const { data } = await axios.get('/api/anime/recommendations', {
  headers: { Authorization: `Bearer ${token}` }
});
```
- **Respuesta esperada:**
```json
{
  "results": [
    { "id": 1, "title": "Naruto", "genres": ["Action"], ... },
    ...
  ]
}
```

## Autenticación avanzada (endpoints proxy a Supabase)

Estos endpoints permiten manejar logout, cambio y recuperación de contraseña, y verificación de email usando la lógica de Supabase pero manteniendo una API unificada.

| Endpoint backend                  | Método | Descripción                                      | Acceso           |
|-----------------------------------|--------|--------------------------------------------------|------------------|
| /api/auth/logout                  | POST   | Logout (elimina token en frontend)                | Requiere token   |
| /api/auth/updatepassword          | PUT    | Cambiar contraseña                               | Requiere token   |
| /api/auth/forgotpassword          | POST   | Enviar email de recuperación de contraseña        | Público          |
| /api/auth/resetpassword/:token    | PUT    | Resetear contraseña con token                     | Público          |
| /api/auth/verifyemail/:token      | GET    | Verificar email con token                         | Público          |

### Ejemplo de uso en frontend

```js
// Logout
await axios.post('/api/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });

// Cambiar contraseña
await axios.put('/api/auth/updatepassword', { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });

// Recuperar contraseña
await axios.post('/api/auth/forgotpassword', { email });

// Resetear contraseña
await axios.put(`/api/auth/resetpassword/${token}`, { newPassword });

// Verificar email
await axios.get(`/api/auth/verifyemail/${token}`);
```

**Nota:** Estos endpoints actuarán como proxy y delegarán la lógica real a Supabase. El frontend no necesita interactuar directamente con Supabase para estas acciones. 

### Limitaciones de Supabase para reset de contraseña y verificación de email

**Importante:**
- Los endpoints `/api/auth/resetpassword/:token` y `/api/auth/verifyemail/:token` en el backend **no pueden completar la acción** porque el SDK de Supabase solo permite hacerlo desde el frontend usando el link especial que llega al email del usuario.
- Estos endpoints devuelven un error 501 y un mensaje explicando que la acción debe completarse desde el frontend.

#### ¿Qué debe hacer el frontend?
- Cuando el usuario haga clic en el link del email de Supabase (para reset o verificación), debe ser redirigido a una página de tu frontend (por ejemplo, `/reset-password?token=...` o `/verify-email?token=...`).
- En esa página, debes usar el SDK de Supabase en el frontend para completar el proceso.

#### Ejemplo de flujo para reset de contraseña en el frontend:
```js
import { supabase } from '../lib/supabaseClient';

// En la página /reset-password
const token = obtenerTokenDeLaURL();
const newPassword = 'nuevaClave123';

// Supabase detecta el token automáticamente si usas el método adecuado
document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    // Mostrar error al usuario
  } else {
    // Mostrar éxito y redirigir
  }
});
```

#### Ejemplo de flujo para verificación de email en el frontend:
Supabase detecta automáticamente el token de verificación cuando el usuario abre el link. Solo debes mostrar un mensaje de éxito o error según el estado de la sesión.

**Advertencia:**
- No intentes completar el reset o la verificación de email desde el backend, ya que Supabase no lo permite por seguridad.
- El resto de endpoints de autenticación avanzada (logout, cambio y recuperación de contraseña) funcionan correctamente desde el backend y pueden ser usados normalmente desde el frontend. 

## Foros (estructura y endpoints)

### Entidades principales
- Categoría de foro
- Tema (topic)
- Post
- Like

### Endpoints sugeridos

| Endpoint                        | Método | Descripción                                 | Acceso           |
|----------------------------------|--------|---------------------------------------------|------------------|
| /api/forums/categories           | GET    | Listar categorías de foros                  | Público          |
| /api/forums/categories           | POST   | Crear categoría (admin)                     | Admin            |
| /api/forums/categories/:id       | GET    | Obtener detalles de una categoría           | Público          |
| /api/forums/categories/:id       | PUT    | Editar categoría (admin)                    | Admin            |
| /api/forums/categories/:id       | DELETE | Eliminar categoría (admin)                  | Admin            |
| /api/forums/topics               | GET    | Listar temas (por categoría, paginación)    | Público          |
| /api/forums/topics               | POST   | Crear tema                                  | Autenticado      |
| /api/forums/topics/:id           | GET    | Obtener detalles de un tema                 | Público          |
| /api/forums/topics/:id           | PUT    | Editar tema (autor o admin)                 | Autenticado      |
| /api/forums/topics/:id           | DELETE | Eliminar tema (autor o admin)               | Autenticado      |
| /api/forums/posts                | GET    | Listar posts de un tema                     | Público          |
| /api/forums/posts                | POST   | Crear post en un tema                       | Autenticado      |
| /api/forums/posts/:id            | PUT    | Editar post (autor o admin)                 | Autenticado      |
| /api/forums/posts/:id            | DELETE | Eliminar post (autor o admin)               | Autenticado      |
| /api/forums/posts/:id/like       | PUT    | Dar o quitar like a un post                 | Autenticado      |

### Modelos sugeridos (MongoDB/Mongoose)
- ForumCategory: { name, description, createdAt }
- ForumTopic: { categoryId, title, content, userId, username, createdAt, updatedAt }
- ForumPost: { topicId, content, userId, username, createdAt, updatedAt, likes: [userId] }

### Ejemplo de uso en frontend
```js
// Listar categorías
const { data } = await axios.get('/api/forums/categories');
// Crear tema
await axios.post('/api/forums/topics', { categoryId, title, content }, { headers: { Authorization: `Bearer ${token}` } });
// Crear post
await axios.post('/api/forums/posts', { topicId, content }, { headers: { Authorization: `Bearer ${token}` } });
// Dar like a un post
await axios.put(`/api/forums/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
``` 

### Ejemplos completos de uso y respuesta para foros

#### 1. Categorías

**Listar categorías**
```js
// Request
GET /api/forums/categories

// Response
[
  {
    "_id": "665f1c...",
    "name": "General",
    "description": "Discusión general sobre anime",
    "createdAt": "2024-06-01T12:00:00.000Z"
  },
  ...
]
```

**Crear categoría**
```js
// Request
POST /api/forums/categories
Body: { name: "Noticias", description: "Novedades del mundo anime" }
Headers: { Authorization: Bearer <token> }

// Response
{
  "_id": "665f1c...",
  "name": "Noticias",
  "description": "Novedades del mundo anime",
  "createdAt": "2024-06-01T12:10:00.000Z"
}
```

#### 2. Temas (topics)

**Listar temas de una categoría**
```js
// Request
GET /api/forums/topics?categoryId=665f1c...&page=1&limit=10

// Response
[
  {
    "_id": "666a2b...",
    "categoryId": "665f1c...",
    "title": "¿Cuál es tu opening favorito?",
    "content": "Me encanta el de Naruto...",
    "userId": "user123",
    "username": "otakuFan",
    "createdAt": "2024-06-02T09:00:00.000Z",
    "updatedAt": "2024-06-02T09:00:00.000Z"
  },
  ...
]
```

**Crear tema**
```js
// Request
POST /api/forums/topics
Body: { categoryId: "665f1c...", title: "¿Anime infravalorado?", content: "¿Qué anime crees que merece más reconocimiento?" }
Headers: { Authorization: Bearer <token> }

// Response
{
  "_id": "666a2c...",
  "categoryId": "665f1c...",
  "title": "¿Anime infravalorado?",
  "content": "¿Qué anime crees que merece más reconocimiento?",
  "userId": "user123",
  "username": "otakuFan",
  "createdAt": "2024-06-02T10:00:00.000Z",
  "updatedAt": "2024-06-02T10:00:00.000Z"
}
```

#### 3. Posts

**Listar posts de un tema**
```js
// Request
GET /api/forums/posts?topicId=666a2b...&page=1&limit=10

// Response
[
  {
    "_id": "666b3d...",
    "topicId": "666a2b...",
    "content": "¡Totalmente de acuerdo!",
    "userId": "user456",
    "username": "animeLover",
    "createdAt": "2024-06-02T11:00:00.000Z",
    "updatedAt": "2024-06-02T11:00:00.000Z",
    "likes": ["user789"]
  },
  ...
]
```

**Crear post**
```js
// Request
POST /api/forums/posts
Body: { topicId: "666a2b...", content: "¡Totalmente de acuerdo!" }
Headers: { Authorization: Bearer <token> }

// Response
{
  "_id": "666b3d...",
  "topicId": "666a2b...",
  "content": "¡Totalmente de acuerdo!",
  "userId": "user456",
  "username": "animeLover",
  "createdAt": "2024-06-02T11:00:00.000Z",
  "updatedAt": "2024-06-02T11:00:00.000Z",
  "likes": []
}
```

**Dar o quitar like a un post**
```js
// Request
PUT /api/forums/posts/666b3d.../like
Headers: { Authorization: Bearer <token> }

// Response
{
  "likes": 2
}
```

---

**Notas:**
- Todos los endpoints de creación, edición y like requieren autenticación (token JWT).
- Los endpoints de listado y obtención son públicos.
- Los IDs son de ejemplo, en producción serán generados por MongoDB.
- Puedes combinar paginación y filtros según lo necesite el frontend. 

## CRUD admin de usuarios (solo para administradores)

### Endpoints

| Endpoint                | Método | Descripción                        | Acceso      |
|-------------------------|--------|------------------------------------|-------------|
| /api/users              | GET    | Listar todos los usuarios          | Solo admin  |
| /api/users              | POST   | Crear usuario (admin)              | Solo admin  |
| /api/users/:id          | GET    | Obtener usuario por ID             | Solo admin  |
| /api/users/:id          | PUT    | Editar usuario por ID              | Solo admin  |
| /api/users/:id          | DELETE | Eliminar usuario por ID            | Solo admin  |

### Ejemplos de uso y respuesta

**Listar usuarios**
```js
// Request
GET /api/users
Headers: { Authorization: Bearer <token_admin> }

// Response
{
  "users": [
    {
      "id": "user123",
      "username": "otakuFan",
      "email": "otaku@anime.com",
      "avatar_url": "...",
      "bio": "...",
      "role": "user",
      "created_at": "2024-06-01T12:00:00.000Z",
      "updated_at": "2024-06-01T12:00:00.000Z"
    },
    ...
  ]
}
```

**Crear usuario**
```js
// Request
POST /api/users
Body: { email: "nuevo@anime.com", password: "clave123", username: "nuevoUser", role: "user" }
Headers: { Authorization: Bearer <token_admin> }

// Response
{
  "user": {
    "id": "user999",
    "email": "nuevo@anime.com",
    "username": "nuevoUser",
    "role": "user"
  }
}
```

**Obtener usuario por ID**
```js
// Request
GET /api/users/user123
Headers: { Authorization: Bearer <token_admin> }

// Response
{
  "user": {
    "id": "user123",
    "username": "otakuFan",
    "email": "otaku@anime.com",
    "avatar_url": "...",
    "bio": "...",
    "role": "user",
    "created_at": "2024-06-01T12:00:00.000Z",
    "updated_at": "2024-06-01T12:00:00.000Z"
  }
}
```

**Editar usuario por ID**
```js
// Request
PUT /api/users/user123
Body: { username: "nuevoNombre", role: "admin" }
Headers: { Authorization: Bearer <token_admin> }

// Response
{
  "user": {
    "id": "user123",
    "username": "nuevoNombre",
    "role": "admin",
    ...
  }
}
```

**Eliminar usuario por ID**
```js
// Request
DELETE /api/users/user123
Headers: { Authorization: Bearer <token_admin> }

// Response
{
  "message": "Usuario eliminado correctamente"
}
```

---

**Notas:**
- Todos los endpoints requieren autenticación y rol admin (`Authorization: Bearer <token_admin>`).
- No se permite modificar ni exponer contraseñas directamente.
- El campo `role` permite distinguir entre usuarios normales y administradores.
- Los IDs y campos son de ejemplo, en producción serán generados por Supabase. 