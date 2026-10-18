# Tienda general y Última carta JJ

La tienda aparece justo después de Inicio. Las skins compradas en Bombitas se conservan: no se mueven archivos ni se vuelven a cobrar. La skin equipada se comparte entre Bombitas y Última carta JJ. Cada juego permite elegir una prenda del armario antes de empezar.

## Para activar esta actualización

1. Incorpora esta propuesta de GitHub a `main` para publicar los archivos nuevos.
2. Si ya ejecutaste el SQL 27 de la actualización anterior, abre Supabase → SQL Editor → New query.
3. Copia el contenido de **supabase/29-cartas-y-armario.sql**, pégalo y pulsa **Run**. Solo hace falta este archivo nuevo. No repitas los SQL antiguos.
4. Actualiza la página. En Perfiles puedes activar u ocultar Tienda y Última carta JJ para Julissa.

Si aún falta SQL 27, completa primero la actualización anterior. La Tienda utiliza las tablas de compras de SQL 25–27. No se han aplicado estos cambios a la base de datos real durante el desarrollo.

## Crear una partida de cartas

- Abre Games → Última carta JJ.
- Una persona pulsa **Crear sala** y después **Compartir invitación**. También puede compartir el código de ocho caracteres.
- La otra abre la invitación, que rellena el código, y pulsa **Unirme**. Si ya inició sesión, la invitación abre el juego; si no, primero debe entrar a su perfil.
- El anfitrión puede guardar reglas distintas. Su pareja las confirma con **Acepto las reglas · Estoy listo**. Cambiar las reglas requiere aceptarlas de nuevo.
- El anfitrión pulsa **Repartir y empezar**.

No hace falta dejar ambos teléfonos en la misma red. La partida se guarda en Supabase; recargar recupera la sala y la mano en el mismo navegador. Si cierras el navegador, la sala sigue disponible por su código hasta que caduque tras cuatro horas sin jugadas. Salir de la sala termina esa partida; cerrar o recargar la página la conserva.

## Reglas

El modo predeterminado utiliza la baraja clásica de 108 cartas, siete cartas por jugador, turnos para dos personas, Salta, Reversa, +2, comodines, desafío del +4, declaración de UNO y puntuación hasta 500. Se puede robar voluntariamente, pero después solo jugar la carta recién robada o pasar. Las penalizaciones de una carta final cuentan antes de puntuar. El servidor resuelve el desafío y muestra al desafiante la mano que existía cuando se jugó el +4.

Puedes elegir 3–15 cartas iniciales, una sola ronda o un objetivo de 100, 300 o 500 puntos, acumular +2, robar hasta poder jugar, penalización de UNO y desafío del +4. Acumular +2 y robar hasta poder jugar son reglas de la casa; comienzan desactivadas. No se acumulan +4. Sin desafíos, el servidor impide jugar un +4 ilegal.

Se utilizan las [instrucciones de Mattel](https://service.mattel.com/instruction_sheets/53641.pdf) como referencia para las reglas clásicas. La interfaz y las cartas se dibujan con los estilos propios del sitio.

## Bombitas

Crear sala y Unirme son dos opciones separadas, con un formulario para pegar el código y un botón para compartir la invitación. La arena aparece al iniciar una partida o practicar. El botón **Iniciar partida** espera a una sala con ambos participantes conectados; **Practicar con bot** inicia la práctica aparte. Las reglas y la apuesta están plegadas para dejar primero la invitación. La tienda antigua se sustituye por el selector del armario general.

## Para los siguientes juegos

`window.JJWardrobe` expone `read()`, `equip(id)`, `picker(element, callback)` y `draw(canvas, handle, skin)`. Así cualquier juego nuevo puede usar las mismas compras y la misma skin equipada. El servidor entrega la skin de ambos participantes en las salas de cartas y de Bombitas. El armario no altera velocidad, cartas, alcance ni resultados.

## Verificación

Se comprobaron las reglas en PostgreSQL embebido, incluidas privacidad de las manos, permisos, turnos, reintentos con revisión antigua, desafíos y puntuación. También se simularon ocho partidas completas y se comprobó que conservan las 108 cartas sin duplicarlas.

La prueba de navegador usa dos sesiones separadas: crear, unirse, aceptar reglas, repartir, jugar, recargar, comprar una skin y volver a la partida. Además comprueba el orden del menú, la entrada de Games y la práctica con bot de Bombitas. Son pruebas locales; no se utilizaron las cuentas reales.

Desde la raíz del repositorio: instala las dependencias de `tests/package.json` y ejecuta `npm --prefix tests test`. Para las pruebas visuales se necesita Microsoft Edge; usa `npm --prefix tests run test:ui`. Las pruebas utilizan una base de datos aislada, sin claves de producción.
