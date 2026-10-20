# Actualizar Vs, monedas, casino y billar

Esta propuesta prepara la versión `v33-vs-casino-billar`. No ejecuta cambios en tu Supabase ni publica por sí sola.

## Para activarla

1. Integra la propuesta en `main` desde GitHub.
2. En tu proyecto de Supabase, abre **SQL Editor** y ejecuta el contenido completo de [32-vs-economia.sql](supabase/32-vs-economia.sql). Espera el mensaje de éxito.
3. En otra consulta, ejecuta el contenido completo de [33-billar.sql](supabase/33-billar.sql).
4. Espera a que termine la publicación de GitHub Actions. Abre la página y pulsa **Actualizar página** si aparece una versión anterior.

Los archivos 32 y 33 requieren que ya hayas aplicado las actualizaciones anteriores hasta la 31. No necesitas repetirlas. Estos dos archivos conservan las monedas, skins, récords y partidas anteriores; también permiten reintentar su propia instalación sin borrar esos datos. La fuente de Pages sigue siendo **GitHub Actions**.

## Qué cambia

- **Vs** reúne Bombitas, Última carta JJ (tipo UNO), Baraja inglesa, Billar JJ, Gato, Varitas, Puzle secreto y Verdad o reto. Se conservan los enlaces antiguos y las invitaciones.
- **Games** conserva los juegos individuales, sopas y laberintos.
- Cada partida individual terminada y guardada entrega **1 JJ**. Superar el mejor récord vigente entre ambos entrega **2 JJ adicionales**; un empate o el primer resultado no cuenta como superar un récord. Se respeta si el juego premia más puntos o menos tiempo.
- Hasta **10 partidas premiadas y 20 JJ por día**, según America/Matamoros. Después puedes seguir jugando y guardando récords. Las pruebas sin cuenta no entregan monedas. No hay premios retroactivos por partidas anteriores a esta actualización.
- Bombitas calcula y transmite la partida fuera del ciclo de dibujo, y el invitado anticipa movimientos completos mientras espera la confirmación del anfitrión. El servidor/anfitrión conserva la autoridad sobre el tablero, bombas y ganador. Esto reduce la espera visible, pero no elimina los problemas de una conexión interrumpida o de un teléfono que deja de ejecutar la página.

## Billar JJ

Entra en **Vs → Billar JJ**, crea una sala y copia la invitación. Tu pareja puede pegar su código de ocho caracteres o abrir el enlace.

El anfitrión elige entre **1 y 20 victorias**, la apuesta JJ por persona (0 para jugar gratis) y si hay que anunciar la tronera de la negra. Guarda las reglas, reserva la apuesta, espera la aceptación de tu pareja y pulsa Iniciar. Cambiar las reglas devuelve una reserva previa y exige aceptarlas otra vez.

Toca la mesa para apuntar desde la blanca; ajusta la fuerza y pulsa Tirar. También puedes ajustar la dirección con la barra. Amplía la mesa para jugar en horizontal si el navegador permite pantalla completa. Tras una falta, toca un espacio libre para colocar la blanca y luego apunta.

Es una variante propia de bola 8: primera bola de color legal asigna lisas/rayadas, incluida la apertura. Mete tu grupo y termina con la negra. Meter una propia sin falta conserva el turno. Son faltas meter la blanca, no tocar bola, tocar primero un grupo incorrecto o no meter ni tocar banda después del primer contacto. La negra en el saque se recoloca. Fuera del saque, meterla antes de limpiar tu grupo o en una tronera incorrecta cuando debes anunciarla pierde la ronda.

No incluye efecto lateral, salto, reloj de tiro ni requisito de cuatro bandas en el saque. No replica el juego comercial de Miniclip. Referencias consultadas: [8 Ball Pool en Google Play](https://play.google.com/store/apps/details?hl=es&id=com.miniclip.eightballpool) y [guía oficial de Miniclip](https://support.miniclip.com/hc/en-us/articles/360020665798--How-to-start-playing-8-Ball-Pool).

**Atrás** conserva tu sala. **Abandonar sala** durante una apuesta activa concede la victoria y la apuesta a tu pareja. Las reservas vencen tras cuatro horas sin acciones. El servidor calcula los tiros, faltas, rondas y pago; el navegador anima los resultados y no decide cuántas monedas repartir.

## Casino JXJ

Solo utiliza monedas virtuales del sitio. **1 JXJ cuesta 2 JJ** y vender 1 JXJ devuelve 2 JJ. Se usan JJ disponibles, respetando las reservas de otras partidas. Al vender hay **5 % de probabilidad de +1 JJ extra**, con un máximo de un bonus por día. Una vez recibido ese bonus, los siguientes cambios del día devuelven únicamente el cambio normal. El bonus está limitado para que comprar/vender repetidamente no produzca monedas ilimitadas.

Cada jugada acepta entre **1 y 100 JXJ**. Las tablas muestran el **retorno total**, incluida la apuesta cuando corresponda; la pantalla de resultado también muestra la ganancia o pérdida neta.

| Juego | Reglas y retorno total |
| --- | --- |
| Tragamonedas | 3 rodillos, 6 símbolos equiprobables por rodillo. Tres iguales ×20; exactamente dos iguales ×1; los demás pierden. |
| Ruleta | Europea, 0–36. Rojo/negro/par/impar ×2; número exacto ×36. El cero pierde color y paridad. |
| Póker de cinco cartas | Una mano contra tabla de premios, con un único cambio de cartas. Conserva las que quieras. No es Texas Hold’em multijugador. |
| Caballos | Cometa: 40 % y ×2; Luna: 30 % y ×3; Kitsune: 20 % y ×4; Relámpago: 10 % y ×8. |

Póker: escalera de color ×50, póker ×25, full ×9, color ×6, escalera ×4, trío ×3, dos parejas ×2, pareja de J o superior ×1. El as puede ser alto o bajo en una escalera. Las cartas descartadas no regresan en el cambio.

La mano pendiente de póker reaparece tras recargar. Si se pierde la respuesta de una jugada o cambio, el botón **Confirmar operación pendiente** reutiliza su identificador para no cobrar/pagar dos veces. Conserva esa operación hasta confirmarla antes de iniciar otra desde ese navegador.

## Comprobación antes de jugar

Con dos cuentas, verifica **Vs → Billar**: crear/unirse, guardar reglas, aceptar apuesta, iniciar, tirar y recuperar la sala con Atrás. En Casino, cambia una moneda, juega una mano de póker y cambia JXJ de vuelta a JJ. Termina un minijuego y comprueba el recibo del premio.

Las noticias y las pantallas nuevas tienen texto en español e inglés. Desde Perfiles, Jesús conserva los controles de visibilidad para Julissa. Se añaden `vs`, `casino` y `pool` visibles en la migración; se respetan los ajustes existentes de cada juego.

## Validación local

- PostgreSQL aislado: cambios y bonus, saldo compartido, límites de premios, privacidad, reintentos, póker, reglas y física de billar, apuestas, pago único y abandono.
- Dos navegadores móviles: salas y apuesta de billar, tiro animado, navegación atrás, recuperación, casino, inglés y respuesta perdida después de confirmar el cambio.
- Bombitas con retraso simulado y anfitriona dibujando a 5 FPS: movimiento local previo a la respuesta y envío independiente del dibujo.
- Regresión de UNO, baraja y pantallas existentes. No se han ejecutado estas pruebas con las cuentas o teléfonos reales.
