# Piano JJ · solo, dúo y apuestas

El menú distingue dos modos:

- **Jugar solo:** seleccionar canción de Nuestra música, dificultad y duración; «Jugar ahora» prepara el audio e inicia la cuenta atrás. Incluye pausa, terminar y recuperación de resultados pendientes.
- **Jugar dos:** crear una sala vacía o entrar con código. El anfitrión puede cambiar canción/dificultad mientras esperan y aplicar su selección. Su pareja ve los mismos ajustes y prepara/confirma ese audio. «Comenzar juntos» se habilita cuando ambos están preparados y conectados.

Los personajes reutilizan las skins equipadas del armario. Su estado procede de la actividad de cada miembro en esa sala; después de 15 segundos sin actualizar se muestra sin conexión. No es un estado global de toda la página. Solo se bloquea la selección del anfitrión durante la preparación/inicio/partida; el invitado ve los ajustes elegidos y la explicación de quién puede cambiarlos. No se reconstruyen los selectores durante el sondeo.

La revancha mantiene el código y los jugadores, pero limpia preparación y apuesta para volver a elegir. «Jugar solo» permite salir de la sala y volver al modo individual; si hay una apuesta en juego, requiere confirmar que se abandona.

## Apuestas JJ

- Opcionales, de 0 a 1,000 JJ por persona. Solo monedas virtuales y solo en dúo.
- El anfitrión reserva su cantidad después de preparar canción e invitar a su pareja. El invitado acepta explícitamente al pulsar el botón que muestra el importe. El saldo disponible lo calcula `bb_shop()`.
- Se comprueban tanto la revisión de canción como el identificador de apuesta; un cambio de cantidad no puede aceptarse con una petición antigua.
- Quien logra mayor puntuación validada gana el bote. La contabilidad transfiere +apuesta al ganador y −apuesta al perdedor; la reserva inicial se libera, así que el bote incluye la apuesta propia sin cobrarla dos veces.
- Empates y cancelaciones antes de empezar devuelven las reservas. Salir después del inicio da la victoria al rival.
- Después de terminar la duración, hay 60 segundos para entregar resultados. Si solo uno terminó, gana ese jugador; si ninguno terminó, ambos recuperan la reserva. Las reservas caducan como protección adicional cinco minutos después de la duración. Las consultas de sala resuelven el resultado, con bloqueo y pago único.
- Modificar la canción o dificultad devuelve una reserva anterior y exige preparar/aceptar de nuevo. Reintentar una configuración idéntica conserva la preparación, partida y aceptación existentes.

Las recompensas normales del piano son independientes del resultado de la apuesta y conservan sus límites diarios. Ni los clientes ni un anfitrión pueden enviar un ganador o escribir transferencias directamente.

## Servidor y compatibilidad

Migración: `supabase/migrations/20261025023700_piano_lobby_wagers.sql`. Añade información del lobby a `jj_piano_rooms`, conserva salas y partidas previas y reutiliza la cartera/reservas existentes. No modifica saldos ni cartas al aplicarse. La API pública `jj_piano_lobby` es SECURITY INVOKER; la implementación privilegiada queda en un esquema privado y comprueba membresía, sala, actor, saldo y consentimiento. Las tablas conservan sus restricciones RLS.

Las salas adoptadas por el menú nuevo redirigen las llamadas de la API antigua a las mismas comprobaciones, para impedir que un cliente anterior omita la apuesta o su liquidación. Las salas anteriores siguen siendo compatibles hasta usar el menú nuevo.

## Verificación

- `tests/piano-lobby50.cjs`: creación vacía e idempotente, permisos, presencia, cambios, consentimiento, cantidades distintas, saldo disponible, pago, empate, cancelación, abandono, resultado ausente, revancha y acceso por API anterior.
- `tests/piano-menu50-ui.cjs`: dos navegadores móviles con WAV real; elección de música/dificultad, juego individual, pausa/terminar, dos personajes, edición del anfitrión, nueva aceptación, partida completa con apuesta, ganador, revancha, cambio a solo e interfaz en inglés/escritorio.
- `tests/piano-ui.cjs`: teclado, efectos, pausa/reanudación, premio pendiente tras respuesta perdida y recuperación única.
- Suite SQL general en `npm test --prefix tests`. El fixture de `cards30` limpia explícitamente la elección de color inicial al sembrar una mano, evitando un fallo aleatorio del test ajeno al piano.

Las partidas de prueba y transferencias se ejecutan exclusivamente en bases aisladas. La comprobación del despliegue usa metadatos y permisos, sin suplantar perfiles reales.
