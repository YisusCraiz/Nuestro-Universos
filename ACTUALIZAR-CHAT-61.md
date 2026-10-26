# Mini chat y premios del casino · v61

El botón Chat aparece encima de la mascota, también sin mascota equipada. Abre una conversación flotante sin cambiar el apartado actual. El panel y el borrador se conservan al navegar; cambiar de cuenta los limpia.

Permite mensajes, códigos de sala, enlaces seguros en otra pestaña, los 12 stickers originales, los stickers personalizados ya subidos, fotos de hasta 10 MB y audios de hasta 25 MB. También ofrece grabación de voz con permiso de micrófono, hasta dos minutos. Al detenerla, pulsa Enviar. Los dispositivos sin grabación pueden adjuntar un archivo de audio.

El historial guarda los mensajes en el servidor y muestra los últimos 80. Se consulta cada cuatro segundos mientras la aplicación está visible. El punto del botón indica mensajes nuevos recibidos durante esta sesión con el panel cerrado. Se puede enviar aunque la otra persona esté desconectada. Los archivos usan el almacenamiento privado existente. Un envío sin respuesta conserva su identificador para comprobarlo antes de repetirlo.

Los pagos ganadores de tragamonedas, ruleta, póker y caballos aumentan un 25 % sobre las tablas base, redondeados hacia arriba a JXJ enteros. Ejemplos: 1 → 2, 2 → 3, 20 → 25. El redondeo beneficia especialmente a apuestas pequeñas. La pantalla aclara el bonus junto a las tablas base. Se conservan sorteos, reglas ganadoras, probabilidades, apuestas, bonus diario de hasta tres premios +1, cambio de moneda, saldos previos y recibos ya liquidados. Los pagos anteriores conservan su importe al reconsultarlos.

## Instalar

1. En la base de datos del proyecto, ejecutar `supabase/61-mini-chat-premios.sql` sobre la base de datos de la versión 60. El archivo es repetible y no borra datos. Incluye permisos del chat y permite audio WebM en el almacén existente.
2. Actualizar juntos `index.html`, `jj-mini-chat.js`, `jj-mini-chat.css`, `jj-casino.js`, `release.json` y `sw.js` en el sitio habitual. El paquete contiene solo estos archivos y el SQL.
3. Abrir con ambas cuentas y verificar un mensaje, un sticker y un audio. La versión será `v61-mini-chat-premios`.

## Comprobaciones realizadas

`tests/chat36.cjs`: base PostgreSQL local, permisos de miembros, aislamiento de terceros, rechazo de remitentes falsificados, texto, stickers, imágenes, audio, historial inmutable, premios aumentados, sorteos intactos y operaciones repetidas sin doble cobro.

`tests/chat36-ui.cjs`: navegador en tamaños móvil y escritorio, enlaces, conservación de panel y borrador al navegar, envío de stickers personalizados, fotos y audio adjunto, recuperación de un envío cuya respuesta se perdió sin duplicarlo y limpieza al cambiar de cuenta.

La prueba del navegador usa datos simulados; las políticas y pagos se prueban por separado sobre PostgreSQL local. No se ha probado un micrófono físico ni el intercambio entre dos dispositivos reales. La migración mini_chat_premios_v61 fue aplicada y verificada en el proyecto Supabase de Nuestro Universo. Los pagos se adaptan a la función actual y conservan el bonus diario existente.
