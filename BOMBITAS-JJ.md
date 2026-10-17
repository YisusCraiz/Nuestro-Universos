# Bombitas JJ

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
