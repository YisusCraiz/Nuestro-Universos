# Bombitas JJ

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
