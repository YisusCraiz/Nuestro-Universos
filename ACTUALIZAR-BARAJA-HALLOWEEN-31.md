# Atrás, Halloween y baraja inglesa

## Instalar

1. Incorpora esta propuesta a `main` para publicar los archivos.
2. Después del SQL 30 anterior, abre Supabase → SQL Editor → New query.
3. Copia **supabase/31-baraja-y-halloween.sql** y pulsa **Run**. No repitas los archivos antiguos.
4. Actualiza la página en ambos dispositivos. Debe indicar **v31-baraja-halloween**.

No se han aplicado cambios a Supabase de producción durante el desarrollo. Se conservan compras, monedas, títulos y partidas existentes.

## Volver sin cerrar sesión

**← Atrás**, en la cabecera, vuelve a la pantalla anterior de la navegación interna. Desde un juego vuelve a su selección; desde la selección vuelve al apartado anterior. Al inicio se desactiva si no existe una pantalla anterior. Los diálogos también tienen un botón Atrás para cerrarlos sin salir del perfil.

El antiguo botón ambiguo «Salir» del encabezado ahora dice **Cerrar sesión**. Esa acción sí cierra la cuenta. «Salir de esta sala» termina una partida, y sigue siendo una acción distinta.

La nueva baraja y Última carta conservan la sala al navegar a otro apartado o recargar; se recupera al abrir el modo en el mismo navegador. Bombitas conserva su comportamiento anterior de salir de la sala al abandonar el juego. En una partida de cartas con apuesta, una salida explícita de la sala cuenta como derrota; navegar Atrás no es una salida explícita.

## Skins de Halloween

Hay nueve prendas nuevas, cada una con versión de Jesús y Julissa: fantasma y calabaza (6 JJ), esqueleto y zombi (7 JJ), vampiro, Frankenstein, brujería y diablillo (8 JJ), y kitsune (10 JJ).

Son ilustraciones nuevas creadas con la herramienta de imágenes integrada, usando como referencia sus personajes existentes. Se conservan sus rostros, lentes y estilo. Se compran en Tienda y se equipan en el armario compartido de los juegos compatibles. No cambian las reglas ni dan ventajas. Las compras anteriores no se sustituyen.

Arte final: **assets/bombitas/halloween-characters-v1.png**. La referencia y los prompts de generación se documentan en **ARTE-HALLOWEEN-31.md**.

## Games → Baraja inglesa

Se usa la baraja de 52 cartas, sin comodines adicionales. Los tres modos tienen salas de dos personas, código de invitación y enlace para compartir. Uno crea la sala, guarda las reglas y reserva su apuesta si la hay; el otro se une y confirma. El anfitrión reparte cuando ambos están listos.

- **Ochos locos:** combina palo o valor y usa el ocho para cambiar el palo. Se reparten cinco cartas por defecto, configurable de tres a diez. Robas una por pulsación. Se reciclan los descartes al agotarse el mazo. Si ambos quedan bloqueados, gana la mano más corta o empatan si tienen igual cantidad. Gana la ronda quien vacía su mano.
- **Veintiuno en duelo:** variante de la casa para competir entre ustedes, sin crupier. Empiezan con dos cartas y pueden pedir o plantarse. El as vale uno u once y las figuras diez. Gana el mayor total sin pasar de 21; valores iguales o dos manos pasadas empatan. No hay dividir manos, doblar ni pagos especiales por un 21 inicial. Las manos se muestran al terminar ambos.
- **Carta alta:** ambos destapan una carta; el as supera a K, Q, J y las cartas numéricas. Los valores iguales empatan. Se baraja de nuevo cada ronda. Se aceptan las dos pulsaciones simultáneas sin hacer repetir al segundo jugador por una revisión desactualizada.

Referencias de las reglas: [Ochos locos de Bicycle](https://bicyclecards.com/how-to-play/crazy-eights) y [valores de Veintiuno de Bicycle](https://bicyclecards.com/how-to-play/blackjack). El duelo sin crupier y la resolución de bloqueos son las variantes descritas arriba.

## Rondas y monedas

El anfitrión elige de **1 a 20 rondas ganadas**. Un empate no suma victorias. La apuesta es por persona y por partida completa, no por cada ronda. **0 JJ** permite jugar sin apostar.

Las reservas comparten el saldo de la tienda, los títulos, Bombitas y Última carta. No se pueden gastar las monedas reservadas. Ambos aceptan antes de comenzar; el servidor determina el resultado y entrega el bote una vez. Cambiar reglas antes de empezar devuelve la reserva anterior. Salir de una partida con apuesta en curso da la victoria a la pareja. La sala caduca después de cuatro horas sin jugadas y la reserva deja de bloquear las monedas.

Las cartas ajenas y el mazo quedan privados en Supabase. Recargar recupera la partida, y los movimientos antiguos no se aplican dos veces.

## Validación

Pruebas en PostgreSQL embebido de los tres modos, valores de ases, ocho comodín, cartas ocultas, empates, rondas y apuestas; pruebas de dos navegadores con reservas, partida, pago, reconexión y skin compartida; navegación Atrás conservando el perfil y cierre de diálogos. También se revisan las 18 figuras del atlas y sus miniaturas de tienda. No se utilizaron cuentas reales.
