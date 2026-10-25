# Piano JJ · crear y recuperar salas

«Crear sala» antes devolvía un aviso en el apartado de preparación si aún no se había preparado la canción. Ahora «Preparar y crear sala» realiza ambos pasos y muestra progreso/errores también junto al botón. Se deshabilita mientras carga, guarda o recupera un resultado, y cuando no hay canciones con audio. Activar sonido se solicita desde el clic del usuario.

Se elimina el audio preparado si la descarga, decodificación o validación falla. Los selectores permanecen bloqueados dentro de una sala, incluso después de resolver la partida. El botón de audio en dúo dice «Confirmar audio preparado», y se vuelve a «Preparar canción» al salir. El teclado del piano no consume teclas cuando no hay partida activa.

Una respuesta perdida al crear sala antes dejaba ROOM_ACTIVE sin una forma de recuperar el código. La función añade `recover`, que solo devuelve la sala activa alojada por `auth.uid()`. El cliente recupera esa sala y pide preparar su audio. No se cambian partidas, monedas, resultados ni permisos. Las lecturas antiguas de la sala se descartan si entretanto comenzó otra acción del usuario.

Migración: `supabase/migrations/20261025021739_piano_room_recovery.sql`, aplicada al servidor. La publicación del frontend requiere integrar la propuesta.

Verificación:

- `node tests/piano34.cjs`: 83 comprobaciones de motor, validación de transcripciones, límites, permisos y premios.
- `node tests/piano-duo.cjs`: creación, recuperación exclusiva del anfitrión, invitación, confirmación, inicio sincronizado, resultados, reintentos y salida.
- `node tests/rewards-balance.cjs`: 108 comprobaciones del balance vigente, incluido piano y premios únicos.
- `tests/piano-duo-ui.cjs`: dos navegadores móviles aislados con un WAV real de prueba; audio inválido, respuesta perdida al crear, recuperación, preparación con un clic, invitación, inicio conjunto, fin de ronda, resultados y bloqueo de ajustes. Admite `PW_CHROMIUM_PATH` para Chromium local.
- Prueba de interfaz individual con WAV decodificado: teclado, efectos Perfecto/Bien, pausa/reanudación, resultado pendiente tras desconexión, recuperación del premio sin duplicarlo e inglés.

Todas las partidas de verificación se ejecutaron en una base aislada. En producción se comprobó la instalación de la función y sus permisos mediante lectura de metadatos; los asesores de seguridad no añadieron avisos.
