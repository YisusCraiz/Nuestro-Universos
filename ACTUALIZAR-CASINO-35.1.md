# Casino animado — 35.1

Las tragamonedas giran y frenan sus tres rodillos por separado, la ruleta europea gira hasta el número confirmado y los cuatro caballos corren por una pista decorada. Al apostar, la pantalla se desplaza hacia la animación para verla también en móvil.

Los resultados y pagos siguen calculándose en el servidor. La animación solo los representa; los controles quedan bloqueados mientras transcurre. Reintentar una operación pendiente usa el mismo identificador y evita cobros duplicados. Salir cancela la presentación, sin repetir la apuesta ya resuelta. Movimiento reducido muestra el resultado directamente.

## Publicar

Incorpora esta propuesta a main y deja que GitHub Pages publique. No requiere SQL nuevo. La versión visible será `v35.1-casino-animado`. El casino necesita su instalación previa de SQL 32.

## Verificación

`tests/casino-show.cjs` prueba apuestas reales contra SQL local, movimiento y posiciones finales, los 37 números de ruleta, bloqueo de controles, recibos, reintentos sin cobro doble, salida durante animación, movimiento reducido, diseño móvil e inglés. `tests/vs-ui.cjs` comprueba además el intercambio y el póker con recarga. Las capturas `preview-casino-*-mobile.png` y `preview-casino-roulette-desktop.png` permiten revisar los diseños.

