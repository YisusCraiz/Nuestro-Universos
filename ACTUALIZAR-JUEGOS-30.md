# Correcciones de Bombitas y Última carta · 19 octubre 2026

## Para instalar

1. Incorpora esta propuesta a `main` para publicar los archivos nuevos.
2. Después del SQL 29 de la actualización anterior, abre Supabase → SQL Editor → New query.
3. Copia **supabase/30-juegos-fluidos-y-apuestas.sql** y pulsa **Run**. No repitas los SQL antiguos.
4. Actualiza la página en ambos teléfonos. La versión indicada debe ser **v30-juegos-fluidos**.

No se ha ejecutado SQL contra la base de datos real durante el desarrollo. Se conservan monedas, compras, títulos, recuerdos y cómics. Las salas de cartas que todavía no han empezado se actualizan para ganar tres rondas por defecto; deben volver a confirmar las reglas. Las partidas de cartas ya empezadas conservan su modo anterior hasta terminarlas.

## Bombitas

Se corrigieron varias causas de lentitud y de movimiento a saltos:

- El invitado envía los cambios de dirección sin esperar el siguiente envío periódico. Los avisos de bomba siguen esperando la confirmación del motor, no se pierden al pulsar brevemente.
- Los mensajes de movimiento no esperan un acuse adicional del servicio de difusión. Las posiciones conservan su revisión y las bombas su confirmación propia.
- La pantalla interpola las posiciones. El invitado recibe una pequeña anticipación visual de su movimiento que respeta las paredes conocidas. Esta representación no decide colisiones, bombas ni ganadores: el anfitrión sigue validándolos.
- El suelo y las paredes se dibujan en una imagen reutilizable y solo se reconstruyen cuando cambia la arena.
- Los marcadores y los textos no se reescriben en cada fotograma ni en cada paquete si su contenido es el mismo.
- La simulación avanza en pasos pequeños y recupera hasta 250 ms por fotograma, para que bajar de fotogramas no convierta el juego en cámara lenta. Bloquear o abandonar la aplicación sigue pausando la conexión.

Se verificó con dos navegadores y una latencia simulada de 75 ms por trayecto, y se comparó el avance de la simulación a 5 y a 60 fotogramas por segundo. Esto no garantiza eliminar el retraso de cualquier conexión: conviene probar de nuevo los dos papeles de anfitrión e invitado en sus teléfonos.

## Acumular +2

El caso confirmado era la última carta: un +2 final cerraba inmediatamente la ronda y no dejaba responder. Ahora la ronda espera a que se resuelva toda la cadena. Con acumular activado, cualquier color de +2 puede responder a otro +2, incluido el que se juega como última carta.

Si alguien ya pulsó Robar para empezar a pagar la penalización, debe terminar de pagarla; no puede cambiar de decisión y acumular después. +4 sigue sin acumularse. El estado de la opción guardada aparece en la preparación. Los cambios sin guardar quedan señalados y bloquean el inicio hasta aplicarlos.

## Una carta por pulsación

Robar toma una carta. Con «Robar hasta poder jugar», si aún no coincide, vuelves a pulsar para tomar la siguiente; ya no se entregan varias de golpe. Tampoco puedes jugar otra carta de tu mano después de empezar a robar.

Las penalizaciones de +2, +4 y desafío se pagan también de una en una. El botón muestra cuántas faltan. Cuando aceptas la primera carta de una penalización, deja de estar disponible el desafío o la acumulación.

## Ganar por rondas

La opción predeterminada es **Por rondas ganadas**. El anfitrión elige de 1 a 20 rondas: gana la partida quien alcanza primero esa cantidad, sin depender de los puntos de las cartas. Cada ronda ganada suma una victoria. El modo por puntos permanece como alternativa en la configuración.

## Apuestas

1. En las reglas, el anfitrión elige la apuesta por persona; **0 JJ** permite jugar sin apuesta.
2. Guarda y aplica las reglas, y pulsa **Reservar mi apuesta**.
3. Su pareja revisa la cantidad y pulsa **Acepto las reglas y apuesto X JJ**.
4. Solo entonces se puede repartir. El bote se entrega al ganador de la partida completa, no después de cada ronda.

Las reservas usan el mismo saldo que Bombitas, la tienda y los títulos, y no se pueden gastar mientras están comprometidas. El servidor calcula el ganador y entrega el premio una sola vez; ningún jugador debe enviar un resultado por su cuenta.

Cambiar las reglas antes de empezar devuelve la reserva anterior y exige aceptarla de nuevo. **Salir de una partida de cartas con apuesta en curso cuenta como derrota y entrega el bote a la pareja.** Cerrar o recargar el navegador no es una salida explícita y permite recuperar la sala. Si no se juega durante cuatro horas y caduca la sala, la reserva deja de bloquear esas monedas.

## Pruebas

- Reglas y privacidad del juego de cartas; acumulación de cada color y carta final; cobro por pulsaciones; desafíos y puntuación.
- Ocho partidas completas con reglas clásicas y personalizadas, conservando las 108 cartas sin duplicarlas.
- Apuestas: reservas de ambos, fondos insuficientes, bloqueo del gasto reservado, entrega al ganar las rondas configuradas, reintento sin doble premio y derrota por salida. La función de apuestas de Bombitas no puede cancelar ni entregar premios de cartas.
- Dos sesiones de navegador: guardar reglas, reservar y aceptar una apuesta, jugar, recargar y mantener el armario compartido; pantalla móvil e inglés.
- Bombitas: prueba de dos navegadores con retraso de red y prueba de simulación con baja frecuencia de fotogramas. No se utilizaron cuentas ni saldos de producción.
