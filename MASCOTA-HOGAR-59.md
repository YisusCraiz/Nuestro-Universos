# Mascota · Hogar y ganancias JJ

Nueva sección propia con Mi mascota, Ganancias, Mejoras y Colección. Conserva las compras, el acompañante flotante y las frases existentes; la tienda anterior sigue funcionando.

## Economía propuesta

- Producción por hora visible: `max(1, redondear(precio de catálogo / 30, 2)) × (1 + 0.15 × (nivel − 1))`.
- Sin la página visible: 25 % de esa producción. No requiere mantener abierta la aplicación; el servidor calcula el tiempo al volver.
- Solo genera la mascota equipada. Varias pestañas o dispositivos comparten una sola cuenta de producción.
- Cada ausencia acumula como máximo 12 horas. La alcancía admite 24 horas de producción conectada; recoger monedas libera espacio. Se conservan las fracciones.
- Niveles del 1 al 10, individuales y permanentes por mascota. Costo del siguiente nivel: `ceil(precio × 0.35 × 1.6^(nivel − 1))`.
- Cambiar de mascota liquida el tiempo anterior con su tarifa anterior. No borra lo acumulado si la siguiente mascota tiene menor capacidad.
- El tiempo y las tarifas los fija el servidor. La página visible renueva cada 30 segundos una presencia de 65 segundos: al cerrar o esconder la página puede haber hasta 65 segundos de tolerancia antes de pasar al 25 %.
- Confirmación de compras y mejoras, saldo posterior, recuperación de solicitudes pendientes y movimientos idempotentes en el monedero JJ compartido.

Ejemplos en nivel 1: mascota de 60 JJ → 2 JJ/h visible, 0.5 JJ/h desconectado; mascota de 120 JJ → 4 JJ/h visible, 1 JJ/h desconectado. Cada nivel suma el 15 % de la tarifa base; en nivel 10 produce 2.35 veces la tarifa inicial.

## Validación

`node tests/pet-home.cjs`: 22 comprobaciones con PostgreSQL local (PGlite): tarifas, producción online/offline, límite de ausencia, cobro, fracciones, idempotencia, cambios, niveles, saldo, permisos y aislamiento entre cuentas.

`node tests/pets35.cjs`: 87 comprobaciones de regresión del catálogo y compras anteriores.

`node --check jj-pet-home.js`: sintaxis correcta. No se ha validado visualmente en un navegador ni aplicado la actualización en producción.

## Activación autorizada

El propietario autorizó la actualización el 25 de octubre de 2026. Migración aplicada y verificada en producción con una transacción de pruebas revertida al terminar: cobro, monedero, mejoras, repetición de solicitudes y permisos. Los avisos de RLS sin políticas corresponden a tablas privadas sin acceso directo; las funciones autorizadas comprueban pertenencia y usan un search_path vacío.
