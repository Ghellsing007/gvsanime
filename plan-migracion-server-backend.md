---

## 7. Tabla comparativa de endpoints

| Endpoint `/frontend/server`         | Método | Endpoint `/backend`                | Método | Equivalente | Observaciones |
|-------------------------------------|--------|------------------------------------|--------|-------------|--------------|
| /anime                             | GET    | /api/anime/search                  | GET    | Parcial     | En backend requiere JWT, en server puede ser público |
| /anime/top                         | GET    | /api/anime/search?q=top            | GET    | Parcial     | Confirmar si backend soporta filtro top |
| /anime/season/:year/:season        | GET    | /api/anime/search?q=season         | GET    | Parcial     | Revisar si backend soporta búsqueda por temporada |
| /anime/genre/:genre                | GET    | /api/anime/search?q=genre          | GET    | Parcial     | Revisar si backend soporta búsqueda por género |
| /anime/recent                      | GET    | /api/anime/search?q=recent         | GET    | Parcial     | Revisar si backend soporta recientes |
| /anime/:id                         | GET    | /api/anime/:id                     | GET    | Sí          | Ambos requieren JWT |
| /anime/:animeId/comments           | GET    | /api/reviews/:animeId              | GET    | Parcial     | En backend es "reviews", revisar si cubre comentarios |
| /anime/recommendations             | GET    | -                                  | -      | No          | Falta migrar lógica de recomendaciones |
| /anime/:animeId/comments           | POST   | /api/reviews                       | POST   | Parcial     | En backend es "reviews", revisar si cubre comentarios |
| /auth/register                     | POST   | /api/auth/register                 | POST   | Sí          | Equivalente |
| /auth/login                        | POST   | /api/auth/login                    | POST   | Sí          | Equivalente |
| /auth/logout                       | GET    | -                                  | -      | No          | Falta migrar logout explícito |
| /auth/me                           | GET    | /api/users/profile                 | GET    | Sí          | Equivalente |
| /auth/updatedetails                | PUT    | /api/users/profile                 | PUT    | Sí          | Equivalente |
| /auth/updatepassword               | PUT    | -                                  | -      | No          | Falta migrar cambio de contraseña |
| /auth/forgotpassword               | POST   | /api/auth/recover                  | POST   | Sí          | Equivalente |
| /auth/resetpassword/:resettoken    | PUT    | -                                  | -      | No          | Falta migrar reset con token |
| /auth/verifyemail/:verificationtoken| GET   | -                                  | -      | No          | Falta migrar verificación de email |
| /comments/:id                      | PUT    | /api/reviews/:reviewId             | DELETE | Parcial     | En backend es DELETE, revisar PUT para editar |
| /comments/:id                      | DELETE | /api/reviews/:reviewId             | DELETE | Sí          | Equivalente |
| /comments/:id/like                 | PUT    | -                                  | -      | No          | Falta migrar likes a comentarios |
| /forums/categories                 | GET    | -                                  | -      | No          | Falta migrar foros |
| /forums/categories/:id             | GET    | -                                  | -      | No          | Falta migrar foros |
| /forums/topics/:id                 | GET    | -                                  | -      | No          | Falta migrar foros |
| /forums/... (posts, likes, etc.)    | varios | -                                  | -      | No          | Falta migrar toda la lógica de foros |
| /search/anime                      | GET    | /api/anime/search                  | GET    | Sí          | Equivalente |
| /search/forums                     | GET    | -                                  | -      | No          | Falta migrar búsqueda de foros |
| /users                             | GET    | -                                  | -      | Parcial     | En backend solo perfil, falta CRUD admin |
| /users                             | POST   | -                                  | -      | Parcial     | En backend solo perfil, falta crear usuario admin |
| /users/:id                         | GET    | -                                  | -      | Parcial     | En backend solo perfil, falta obtener usuario por id |
| /users/:id                         | PUT    | -                                  | -      | Parcial     | En backend solo perfil, falta editar usuario por id |
| /users/:id                         | DELETE | -                                  | -      | Parcial     | En backend solo perfil, falta eliminar usuario por id |
| /users/favorites/:animeId          | POST   | /api/favorites                     | POST   | Sí          | Equivalente (agregar favorito) |
| /users/favorites/:animeId          | DELETE | /api/favorites                     | DELETE | Sí          | Equivalente (eliminar favorito) |
| /users/watchlist/:animeId          | POST   | -                                  | -      | No          | Falta migrar watchlist |
| /users/watchlist/:animeId          | DELETE | -                                  | -      | No          | Falta migrar watchlist |
| /users/watched/:animeId            | POST   | -                                  | -      | No          | Falta migrar vistos |
| /users/watched/:animeId            | DELETE | -                                  | -      | No          | Falta migrar vistos |
| /users/rate/:animeId               | POST   | /api/reviews                       | POST   | Parcial     | En backend es reviews, revisar si soporta rating directo |

**Leyenda:**
- "Sí": existe y es equivalente
- "Parcial": existe pero puede requerir ajustes
- "No": no existe, requiere migración

---

## 8. Endpoints y funcionalidades de `/server` que faltan por migrar a `/backend`

### 1. Anime
- `/anime/top` (GET): Falta soporte explícito para "top" en el backend.
- `/anime/season/:year/:season` (GET): Falta búsqueda por temporada.
- `/anime/genre/:genre` (GET): Falta búsqueda por género.
- `/anime/recent` (GET): Falta endpoint para recientes.
- `/anime/recommendations` (GET): No existe lógica de recomendaciones.

### 2. Comentarios
- `/anime/:animeId/comments` (GET/POST): En backend se maneja como "reviews", pero hay que revisar si cubre comentarios generales o solo reseñas.
- `/comments/:id/like` (PUT): Falta funcionalidad de "like" a comentarios.

### 3. Autenticación y usuario
- `/auth/logout` (GET): No existe endpoint explícito de logout.
- `/auth/updatepassword` (PUT): Falta endpoint para cambiar contraseña.
- `/auth/resetpassword/:resettoken` (PUT): Falta endpoint para resetear contraseña con token.
- `/auth/verifyemail/:verificationtoken` (GET): Falta verificación de email.

### 4. Foros
- Todos los endpoints de `/forums` (categorías, temas, posts, likes, etc.): No existe lógica de foros en el backend.
- `/search/forums` (GET): Falta búsqueda de foros.

### 5. Usuarios (admin)
- `/users` (GET/POST): Falta CRUD de usuarios para admin.
- `/users/:id` (GET/PUT/DELETE): Falta obtener, editar y eliminar usuario por ID (solo existe perfil propio).
- `/users/watchlist/:animeId` (POST/DELETE): Falta funcionalidad de watchlist.
- `/users/watched/:animeId` (POST/DELETE): Falta funcionalidad de "vistos".
- `/users/rate/:animeId` (POST): Revisar si el backend soporta calificación directa (rating) o solo reseñas.

---

### Resumen

- **Foros**: Todo el módulo falta por migrar.
- **Gestión avanzada de usuarios**: Falta CRUD admin y funcionalidades de listas personales (watchlist, vistos).
- **Autenticación avanzada**: Falta logout, cambio/reset de contraseña y verificación de email.
- **Anime**: Faltan endpoints de top, temporada, género, recientes y recomendaciones.
- **Comentarios**: Falta "like" a comentarios y revisar si reviews cubre comentarios generales.

---

## 9. Componentes del frontend, dependencia de datos y migración de datos mock

| Componente              | ¿Usa datos mock? | ¿Requiere datos del backend? | Datos esperados / Props principales         | Endpoint sugerido (axios)           | Observaciones |
|-------------------------|------------------|------------------------------|---------------------------------------------|-------------------------------------|--------------|
| **AnimeCard**           | No               | Sí (indirecto)               | id, title, image, score, episodes, genres   | `/api/anime` (GET, listado)         | Recibe props, depende de padre (AnimeList, FeaturedAnime, etc.) |
| **AnimeDetails**        | No               | Sí                           | id (prop), datos completos de anime         | `/api/anime/:id` (GET)              | Llama a `/api/anime/:id` para obtener detalles |
| **AnimeList**           | No               | Sí                           | Listado de animes, paginación, búsqueda     | `/api/anime` (GET, con query)       | Llama a `/api/anime?page=...&q=...` |
| **FeaturedAnime**       | Sí               | Sí (debería)                 | Listado de animes destacados                | `/api/anime?featured=true` (GET)    | Migrar de mock a consulta real |
| **GenreShowcase**       | Sí               | Sí (debería)                 | Listado de géneros y conteo                 | `/api/genres` (GET)                 | Migrar de mock a consulta real |
| **PopularAnime**        | Sí               | Sí (debería)                 | Listado de animes populares/top por género  | `/api/anime?sort=popularity` (GET)  | Migrar de mock a consulta real, soportar tabs por género |
| **RecentlyUpdated**     | Sí               | Sí (debería)                 | Listado de animes recientes                 | `/api/anime?sort=recent` (GET)      | Migrar de mock a consulta real |
| **anime-card** (usado en varios) | No      | Sí (indirecto)               | id, title, image, score, etc.               | -                                   | Recibe datos de padres |

### Detalles de los datos mock y migración sugerida

- **FeaturedAnime:**
  - Mock: Array de animes destacados (id, title, image, score, episodes, genres, year, season).
  - Migrar a: Consulta real a `/api/anime?featured=true` o `/api/anime?sort=featured`.

- **GenreShowcase:**
  - Mock: Array de géneros (id, name, description, image, count).
  - Migrar a: Consulta real a `/api/genres` (el backend debe proveer lista de géneros y conteo).

- **PopularAnime:**
  - Mock: Objeto con arrays de animes populares por categoría (all, action, romance, etc.).
  - Migrar a: Consulta real a `/api/anime?sort=popularity` y/o `/api/anime?genre=...`.

- **RecentlyUpdated:**
  - Mock: Array de animes recientemente actualizados.
  - Migrar a: Consulta real a `/api/anime?sort=recent`.

---

> Todos estos componentes deben migrar a usar axios apuntando a los endpoints del backend, eliminando el uso de datos mock y asegurando que la información mostrada sea dinámica y actualizada.

--- 