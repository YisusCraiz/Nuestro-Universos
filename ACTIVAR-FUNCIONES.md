# Activar las dos funciones

El aviso de actualización se activa al publicar estos archivos y muestra v18-funciones-conectadas.

## Activación de la playlist
1. Abre tu proyecto Supabase y entra en SQL Editor.
2. Ejecuta completo supabase/23-playlist-romantica.sql después de la actualización 22 del cómic. Conserva regalos y progreso; las pruebas verificaron que repetirlo conserva los datos.
3. Recarga la aplicación, entra como Jesús y abre Nueve regalos → regalo 2 → Preparar / editar.
4. Activa el reto, revisa las 15 canciones y guarda el regalo. Sus iniciales forman I LOVE YOU JULISSA. Puedes dejar los enlaces vacíos para abrir búsquedas de Spotify.

Julissa descubrirá el mensaje al abrir el regalo. La respuesta correcta se valida en Supabase, guarda el progreso y habilita reclamar la pieza. Las playlists normales siguen usando su apartado habitual.

Si los regalos ya fueron publicados, el bloqueo de edición existente se mantiene. No se reinicia la sorpresa ni se cambian contenidos automáticamente.

Mientras no se ejecute el SQL 23, el editor indica que el reto está pendiente de activar y permite guardar los demás contenidos sin enviar campos que la base de datos antigua ignoraría.

## Verificación realizada
- Prueba del frontend: carga y orden de scripts, archivos, versión, canciones, errores de guardado, cambio de sesión y actualización.
- PostgreSQL local: migración repetible, permisos, canciones inválidas, respuestas, privacidad antes de abrir, bloqueo de pieza y persistencia al repetir la migración.
- Pruebas anteriores del frontend: archivos, traducción, idiomas/PWA, eliminación de música, avisos, juegos/Spotify, puzles y recuperación.

No se ejecutó la migración en el Supabase real ni se probaron cuentas reales.
