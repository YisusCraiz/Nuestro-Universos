# Organización del universo · 18 octubre 2026

Games reúne los juegos existentes, sopa de letras, laberinto, gato, duelo de varitas, puzle secreto, Verdad o reto y Bombitas. Los accesos llevan a su juego o preparación habitual. Musicas reúne Nuestra música, Playlist y Videoclips. Los controles de visibilidad de las secciones originales se conservan.

Novios desaparece del menú y se convierte en el título gratuito de ambos perfiles. Hay otros tres títulos de 3, 5 y 8 JJ. Las compras usan el saldo disponible después de trajes y apuestas; no se cobran otra vez al equiparlos.

Comics permite que cada uno suba sus propios capítulos, les asigne un orden y reordene sus páginas. Ambos pueden leerlos. El cómic del regalo original se conserva en su regalo; puede subirse también a esta biblioteca. Máximo 100 páginas por capítulo y 50 MB por imagen.

## Instalación

1. Conserva la configuración publicada de Supabase, Spotify y VAPID.
2. Después del SQL 26, ejecuta **supabase/27-universo.sql** una sola vez. No elimina recuerdos ni regalos.
3. Ejecuta **supabase/28-diagnostico-avisos.sql**, que requiere las tablas del SQL 14.
4. Publica los archivos de esta rama. Activa Comics y Noticias desde Perfiles si los habías ocultado.

## Noticias

`news.json` contiene las notas en español e inglés. Esta actualización incluye una traducción revisada. El flujo `Registrar noticias` registra el mensaje del último commit de cada actualización de main. Para notas revisadas, añade `en.title` y `en.body`; de lo contrario, se usa el traductor MyMemory con caché local y un aviso si no está disponible. No se envían archivos ni claves al traductor.

GitHub necesita permitir escritura a GitHub Actions. En GitHub Pages con publicación desde rama, los commits creados por `GITHUB_TOKEN` no disparan una nueva compilación: vuelve a ejecutar la publicación de Pages después de generar las noticias, o integra `node tools/build-news.cjs` en tu propio flujo de publicación antes de subir el artefacto. Las futuras notas deben describir cambios para Julissa; el mensaje del commit es el texto que se registra automáticamente.

## Avisos

Se comprueban permiso, suscripción real y clave VAPID. «Activar o reparar avisos» vuelve a registrar una suscripción ausente o con una clave anterior. «Enviar prueba» comprueba durante 90 segundos si el proveedor acepta la entrega. Permiso concedido, prueba en cola y entrega aceptada se muestran como estados diferentes.

El repositorio actual no incluye el servicio de envío desplegado ni permite comprobar sus secretos. Deben seguir configurados la Edge Function `jj-push`, las claves pública y privada VAPID correspondientes, `JJ_CRON_SECRET`, el secreto en Vault y la tarea `jj-push-every-minute` del SQL 15 de la instalación original. Si la prueba permanece pendiente sin intentos, revisa la tarea y el servicio. Si hay error, revisa los registros de la función y las claves. Nunca publiques claves privadas en GitHub.

No se realizó una entrega a teléfonos reales ni se ejecutaron migraciones contra Supabase de producción.

## Validación

Pruebas en PostgreSQL embebido: descuento de monedas, compra sin duplicados, saldo independiente por perfil, título inválido, autoría del cómic, rutas de imágenes, lectura compartida y bloqueo de edición ajena.

Prueba de navegador móvil (390 × 844): menús agrupados, inicio de sopa de letras, biblioteca de música, formulario de cómic, títulos y noticias en inglés, sin errores de JavaScript. `tests/universe.cjs` requiere instalar las dependencias de `tests/package.json`; `tests/ui.cjs` requiere Playwright y Edge.
