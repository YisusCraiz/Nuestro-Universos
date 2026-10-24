# Juegos 36

- UNO: los registros del servidor mostraron ROOM_NOT_FOUND. Una sala eliminada o caducada ahora se descarta también en pantalla y almacenamiento; vuelve el formulario para crear/unirse. Los errores de sesión y función ausente tienen mensajes específicos y los demás incluyen código de diagnóstico.
- Billar: halo blanco translúcido para objetivos legales en tu turno, mesa abierta, y negra al terminar el grupo. Se oculta durante el tiro y turno contrario. Se puede arrastrar para apuntar.
- Piano: prepara audio, crea sala, comparte código, el invitado prepara y confirma; el anfitrión inicia. Mismo arreglo y comienzo programado por servidor para ambos. Compara resultados validados por el servidor. Usa los premios y límites existentes, sin apuestas nuevas. Ocultar la pestaña o salir cancela el dúo; no hay pausa individual.

## Base de datos

Aplicar después de SQL 34 la migración `supabase/migrations/20261024063503_piano_duo.sql`. No necesita cambios manuales si ya se aplicó desde la conexión del proyecto.

## Spotify

La configuración Client ID y OAuth PKCE ya existen. Los tokens se conservan solo en la pestaña del perfil. No se han consultado cuentas ni tokens personales de los usuarios. Spotify no autoriza integrar su catálogo en juegos ni sincronizarlo con notas visuales; piano usa archivos propios o autorizados subidos a Nuestra música. La conexión Spotify continúa destinada a la sección musical, recuerdos y playlists.

## Validación

`npm install --prefix tests`, `npm test --prefix tests`. También `node tests/piano-duo.cjs`, `node tests/cards-ui.cjs`, `node tests/piano-ui.cjs` con el navegador de Playwright disponible. Las pruebas utilizan una base aislada.
