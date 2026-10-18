# Bombitas JJ

## v25.2 · Apuesta opcional de monedas JJ

1. Ejecutar **una sola vez** `supabase/26-bombitas-apuestas.sql` después de SQL 25. El archivo también admite reejecución y conserva apuestas/pagos anteriores.
2. Integrar la versión y actualizar ambos celulares a v25.2 antes de crear la sala.
3. En Reglas, el anfitrión elige **Apuesta por persona (JJ)**. Con 0 JJ juegan sin apostar. La práctica contra bot siempre usa 0.
4. Con una cantidad positiva, pulsa **Proponer y reservar**. El otro ve el mismo importe y pulsa **Aceptar apuesta**. El botón de inicio permanece bloqueado hasta que ambas reservas se confirmen en la base de datos. No se permite apostar más que el saldo disponible.
5. El ganador de la partida (no de cada ronda) recibe el bote de ambos. Ejemplo: 3 JJ cada uno → bote de 6 JJ; ganancia neta del ganador +3 JJ y pérdida del otro −3 JJ. Las rondas empatadas no cambian la apuesta.

Las monedas aceptadas se reservan: dejan de estar disponibles para comprar skins o apostar simultáneamente en otra sala. El saldo de toda la página incluye ganancias, pérdidas y reservas. Cambiar las reglas o el importe exige cancelar la oferta y aceptarla de nuevo; cada revancha tiene una apuesta nueva.

Una pausa breve conserva la reserva. Salir/cancelar antes de registrar resultados devuelve las monedas. Al finalizar, ambos clientes comunican el ganador; el reparto se confirma una sola vez cuando coinciden. Si discrepan se libera la reserva sin transferir monedas. Si falta una confirmación, se reintenta; la confirmación pendiente se conserva en el dispositivo. Las reservas pendientes caducan con la sala (máximo cuatro horas) y vuelven a estar disponibles aunque el otro teléfono no regrese. Una cancelación posterior al primer resultado no puede convertir ese resultado pendiente en un pago unilateral.

Se mantiene el modelo de anfitrión de confianza descrito abajo: los resultados provienen de los dos clientes, no de un servidor antitrampas independiente.

Pruebas adicionales: `node tests/bombitas-wagers-sql.cjs` (requiere `@electric-sql/pglite`, o indicar su ruta con `PGLITE_MODULE`). Ejecuta SQL 25 y 26 en un PostgreSQL local con cuentas ficticias, verifica reservas, saldo insuficiente, compras, pagos idempotentes, caducidad y recuperación. La prueba de dos controladores también cubre una oferta que el invitado no puede pagar, aceptación de una oferta menor y pago automático del bote una sola vez.

## Actualización v25.1 · después de probar con dos celulares

Si SQL 25 ya se ejecutó, esta actualización **no requiere otro SQL ni repetirlo**. Integrar los cambios en main y actualizar la página en ambos celulares antes de crear una sala nueva. No mezclar jugadores con v25.0 y v25.1.

- Sala al inicio del apartado: crear, copiar el código y unirse con confirmación visible. Se muestran los dos nombres y si realmente están conectados.
- El anfitrión elige 30–600 segundos **por ronda** y 1–10 victorias para ganar la partida. Ambos reciben las mismas reglas. Se bloquean hasta que termina la partida o salen de la sala.
- El límite de tiempo incluye la fase de cierre de la arena. Los empates no suman victorias; la duración total de la partida depende del número de rondas.
- El inicio/revancha se bloquea durante una partida. Los sondeos de sala ya no borran la simulación. Los estados tienen revisión monotónica para descartar mensajes atrasados.
- Cada toque de bomba se guarda hasta recibir confirmación del anfitrión. Los reenvíos no colocan bombas extra. Se distinguen bomba colocada, casilla ocupada y límite de bombas alcanzado; también se muestra cuántas bombas quedan disponibles.
- Modo horizontal/pantalla completa con cruceta a la izquierda y bomba a la derecha. El bloqueo automático de orientación depende del navegador; si no está disponible se pide girar el celular con rotación automática. Se puede salir con el botón de pantalla completa.
- Nueva ilustración transparente con 16 sprites frontales (dos personajes × ocho atuendos), utilizada tanto en la tienda como en la arena. Tienen animación de balanceo al moverse; aún no son animaciones dibujadas de caminar en cuatro direcciones.

Validación adicional: `node tests/bombitas-session.cjs` y `node tests/bombitas-multiplayer.cjs`. La segunda prueba ejecuta dos instancias reales del controlador con reloj/red simulados: conexión, reglas, segundo inicio, pérdida del primer envío de bomba, confirmación y pausa/reanudación. La calidad de conexión y el bloqueo de orientación todavía deben probarse en los celulares físicos.

## Activar en la página

1. Ejecutar `supabase/25-bombitas.sql` en el editor SQL de su proyecto Supabase existente. No repetir las actualizaciones anteriores. El archivo agrega sus propias tablas; no borra monedas, misiones ni recuerdos.
2. Publicar los archivos nuevos y el `index.html` actualizado en el alojamiento actual.
3. Entrar como Jesús, ir a Perfiles y activar **Bombitas JJ** para Julissa.
4. Abrir el apartado en ambos celulares. Uno crea una sala y comparte el código de ocho caracteres; el otro se une. Quien crea la sala pulsa Iniciar cuando ambos estén conectados.

## Contenido

- Personajes originales dibujados en canvas, con cabello y lentes propios y ropa casual. Ocho atuendos para ambos, incluyendo camisetas, disfraces, pijama, ninja y yukata con katana decorativa.
- Tienda y armario personales; confirmación antes de comprar; compras idempotentes y saldo comprobado bajo bloqueo por usuario en la base de datos.
- El saldo disponible es el total del dashboard existente menos las compras registradas. No se cambia el historial de premios. La interfaz principal muestra ese saldo neto cuando SQL 25 está instalado.
- Arena 13 × 11, mejoras, explosiones en cadena, muerte súbita, empate y partida al primero en cinco victorias.
- Práctica contra bot, controles táctiles y teclado, sonido opcional. Demo sin cuentas en `bombitas-demo.html`.

## Conexión y límites

Las salas usan canales privados de Supabase Realtime autorizados por pertenencia a la sala. El creador ejecuta una única simulación y transmite el estado; el invitado envía controles. No se otorgan monedas por ganar. Es un duelo privado con anfitrión de confianza, no un sistema de competición con servidor antitrampas independiente.

Mantener ambos celulares con la página visible. Al perder la señal la simulación se pausa al detectar cuatro segundos sin mensajes; si no vuelve, salir y crear otra sala. Salir de la sala o cambiar de pestaña interna descarta la partida. No se conserva el marcador entre sesiones. Las salas caducan a las cuatro horas.

Verificar en el proyecto real: permisos SQL, compras con dos sesiones simultáneas, visibilidad de Julie, conexión de los dos celulares, orientación vertical y latencia Wi-Fi/datos. Las pruebas locales no sustituyen esa comprobación.

## Pruebas locales

`node tests/bombitas.cjs`

`node tests/frontend-integration.cjs`

Documentación de la conexión: https://supabase.com/docs/guides/realtime/authorization
