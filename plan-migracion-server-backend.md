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

## 10. Resolución de conflictos y aclaraciones para la migración

### 1. Acceso público a `/anime`
- **Situación:** En el server, la ruta `/anime` es pública para mostrar datos en la página de inicio y exploración.
- **Acción:** El endpoint `/api/anime` en el backend debe ser público (no requerir JWT) para permitir mostrar animes en la home y exploración.

### 2. Filtros y funcionalidades faltantes en `/api/anime`
- **Situación:** El backend actualmente NO soporta filtros de top, temporada, género ni recientes.
- **Acción:** Implementar en `/api/anime` los siguientes filtros:
  - `?sort=top` o `/top` para animes top
  - `?season=year-season` o `/season/:year/:season` para temporada
  - `?genre=nombre` o `/genre/:genre` para género
  - `?sort=recent` o `/recent` para recientes

### 3. Uso de `/anime/:id`
- **Situación:** Esta ruta se usa para mostrar el detalle de un anime específico (ficha completa, sinopsis, imagen, etc.).
- **Acción:** El endpoint `/api/anime/:id` debe devolver todos los datos necesarios para la página de detalle de anime.

### 4. Diferencia entre reviews y comments
- **Situación:**
  - **Reviews:** Son reseñas que pueden venir de la API externa (Jikan) y se muestran como información general del anime.
  - **Comments:** Son comentarios hechos por los usuarios de la página, almacenados en la base de datos propia.
- **Acción:**
  - `/api/reviews/:animeId` debe devolver reseñas externas (Jikan) para mostrar opiniones generales.
  - `/api/comments/:animeId` debe manejar los comentarios de usuarios propios (crear, listar, editar, eliminar, like, etc.).
  - Todas las rutas tipo `/comments/:id` deben operar sobre los comentarios de usuarios, no sobre reviews externos.

### 5. Instrucciones para actualizar el backend
- Hacer público el endpoint `/api/anime`.
- Implementar los filtros de top, temporada, género y recientes en `/api/anime`.
- Asegurar que `/api/anime/:id` devuelva todos los datos necesarios para la ficha de anime.
- Separar claramente los endpoints de reviews (externos) y comments (usuarios):
  - `/api/reviews/:animeId` → reseñas externas (solo lectura)
  - `/api/comments/:animeId` → comentarios de usuarios (CRUD, likes, etc.)
- Actualizar la documentación y la tabla de endpoints en este plan según estos cambios.

---

> Con estas aclaraciones, el siguiente paso es ir al backend y actualizar/implementar los endpoints y filtros necesarios para cubrir las necesidades del frontend y la migración.

---

## 11. Planificación de la implementación en el backend

### 1. Hacer público el endpoint `/api/anime`
- Quitar la protección JWT para permitir acceso público a la lista de animes.

### 2. Implementar filtros en `/api/anime`
- Agregar soporte para:
  - `?sort=top` o `/top` → animes top
  - `?season=year-season` o `/season/:year/:season` → por temporada
  - `?genre=nombre` o `/genre/:genre` → por género
  - `?sort=recent` o `/recent` → recientes

### 3. Mejorar `/api/anime/:id`
- Asegurarse de que devuelva todos los datos necesarios para la ficha de anime (sinopsis, imagen, score, géneros, episodios, año, temporada, etc.).

### 4. Endpoints de reviews y comments
- `/api/reviews/:animeId`: Solo lectura, obtener reseñas externas (Jikan).
- `/api/comments/:animeId`: CRUD y likes de comentarios de usuarios propios.
- `/api/comments/:id`: Editar, eliminar, dar like a comentarios de usuarios.

### 5. Implementar `/api/genres`
- Endpoint para devolver la lista de géneros y conteo de animes por género.

### 6. PopularAnime y RecentlyUpdated
- `/api/anime?sort=popularity` → populares/top (por género si se pasa `genre`)
- `/api/anime?sort=recent` → recientemente actualizados

### 7. FeaturedAnime
- `/api/anime?featured=true` o `/api/anime?sort=featured` → destacados

---

## 12. Datos mock en el frontend y su equivalente necesario en el backend

| Componente           | Datos mock actuales                                                                 | Equivalente necesario en backend (endpoint sugerido)         |
|----------------------|-------------------------------------------------------------------------------------|--------------------------------------------------------------|
| FeaturedAnime        | Array de animes destacados (id, title, image, score, episodes, genres, year, season)| `/api/anime?featured=true` o `/api/anime?sort=featured`      |
| GenreShowcase        | Array de géneros (id, name, description, image, count)                              | `/api/genres`                                                |
| PopularAnime         | Objeto con arrays de animes populares por categoría (all, action, romance, etc.)    | `/api/anime?sort=popularity` y/o `/api/anime?genre=...`      |
| RecentlyUpdated      | Array de animes recientemente actualizados                                          | `/api/anime?sort=recent`                                     |

---

> Todos estos datos mock deben ser reemplazados por consultas reales al backend usando axios, asegurando que la información mostrada sea dinámica y actualizada.

---

# Plan de Migración: De `/frontend/server` a `/backend`

## Objetivo
Migrar toda la lógica y endpoints del servidor Express ubicado en `/frontend/server` al backend principal en `/backend`, asegurando que el frontend consuma únicamente el backend y que no se pierda ninguna funcionalidad.

---

## 1. Inventario de Funcionalidades y Endpoints

### Endpoints actuales en `/frontend/server`:

- **/anime**: Listar animes, top, por temporada, género, recientes, detalles por ID, comentarios, recomendaciones (requiere auth).
- **/auth**: Registro, login, logout, perfil, actualizar datos y contraseña, recuperación y verificación de email.
- **/comments**: Actualizar, eliminar y dar like a comentarios (requiere auth).
- **/forums**: Categorías, temas, posts, creación, edición, borrado, likes (algunas requieren admin).
- **/search**: Buscar anime y foros.
- **/users**: CRUD de usuarios (admin), favoritos, watchlist, vistos, calificar anime (requiere auth).

---

## 2. Pasos para la Migración

### Paso 1: Auditoría de `/backend`
- [ ] Revisar si existen endpoints equivalentes en `/backend` para cada ruta de `/server`.
- [ ] Documentar diferencias o ausencias.

### Paso 2: Migración de Endpoints
- [ ] Copiar y adaptar controladores, modelos y rutas de `/frontend/server` a `/backend`.
- [ ] Unificar lógica donde ya exista en `/backend` para evitar duplicidad.
- [ ] Adaptar middlewares de autenticación y autorización.

### Paso 3: Pruebas y Validación
- [ ] Probar cada endpoint migrado con el frontend.
- [ ] Validar que el frontend funcione correctamente solo con `/backend`.
- [ ] Eliminar dependencias del frontend hacia `/server`.

### Paso 4: Limpieza y Documentación
- [ ] Eliminar `/frontend/server` una vez validada la migración.
- [ ] Documentar endpoints finales y cambios relevantes.

---

## 3. Consideraciones Técnicas
- Revisar compatibilidad de middlewares y dependencias (por ejemplo, JWT, CORS, manejo de errores).
- Unificar modelos de datos si hay diferencias entre `/server` y `/backend`.
- Asegurar que la autenticación y autorización funcionen igual o mejor.
- Actualizar variables de entorno y configuración si es necesario.

---

## 4. Cambios en el Frontend
- [ ] Actualizar URLs de fetch/axios para que apunten a `/backend`.
- [ ] Eliminar cualquier referencia a `/server` en el código del frontend.
- [ ] Probar flujos completos de usuario (login, registro, comentarios, foros, favoritos, etc.).

---

## 5. Checklist de Migración
- [ ] Todos los endpoints migrados y funcionando en `/backend`.
- [ ] Frontend actualizado y funcionando solo con `/backend`.
- [ ] Documentación actualizada.
- [ ] `/frontend/server` eliminado.

---

## 6. Notas y Riesgos
- Validar bien la lógica de autenticación y autorización.
- Revisar posibles diferencias en modelos de datos.
- Probar exhaustivamente antes de eliminar `/server`.

---

**Responsable:**
**Fecha estimada de migración:**

---

Este documento debe actualizarse conforme avance la migración y se detecten nuevos detalles o necesidades. 

¿Falta algo? Verificar que todos los datos que muestra el frontend estén cubiertos por los endpoints del backend. Si algún dato no está cubierto, agregarlo a la planificación.


Orden sugerido para la implementación en /backend
Hacer público el endpoint /api/anime
Implementar los filtros en /api/anime
Top (?sort=top)
Temporada (?season=year-season)
Género (?genre=nombre)
Recientes (?sort=recent)
Asegurar que /api/anime/:id devuelva todos los datos necesarios
Crear endpoint /api/genres
Listar géneros y conteo de animes por género
Implementar /api/anime?featured=true o /api/anime?sort=featured
Para animes destacados
Endpoints de comentarios y reviews
/api/reviews/:animeId (solo lectura, externo)
/api/comments/:animeId (CRUD, likes, usuarios)
/api/comments/:id (editar, eliminar, like)

--- 