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