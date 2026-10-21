# Actualizar mascotas — versión 35

Esta versión añade 19 mascotas (23 en total) y búsqueda, filtros por familia/propiedad, orden por precio y carga por grupos de ocho en Tienda → Mascotas. Los nombres y controles están disponibles en español e inglés.

## Publicar

1. Incorpora la propuesta a `main`. GitHub Pages publicará con el proceso habitual.
2. En el editor SQL de Supabase ejecuta [35-coleccion-mascotas.sql](supabase/35-coleccion-mascotas.sql), después de haber instalado la actualización 34.
3. Abre la web y pulsa «Actualizar página» si aparece una versión anterior. La versión visible debe ser `v35-mascotas-coleccion`.

La migración añade el catálogo; puede repetirse. No cambia los precios de las cuatro mascotas originales, inventarios, mascota elegida ni saldos. Las mascotas nuevas permanecen como «Próximamente» hasta instalar SQL 35. El servidor determina el precio cobrado y mantiene las mismas protecciones de compra y propiedad de la versión 34.

## Precios nuevos

- Suerte de cascabel: **220 JJ**.
- Nube de nieve: **180 JJ**.
- Sakura Shiba: **240 JJ**.
- Inari carmesí: **480 JJ**.
- Ajolotito rosa: **200 JJ**.
- Pipita: **140 JJ**.
- Michi esmoquin: **180 JJ**.
- Canela rizada: **160 JJ**.
- Palomita nube: **150 JJ**.
- Coralín: **190 JJ**.
- Brotito: **140 JJ**.
- Dino celeste: **320 JJ**.
- Pingüi violeta: **230 JJ**.
- Perlita rosa: **280 JJ**.
- Lobito nocturno: **350 JJ**.
- Toffee orejitas: **170 JJ**.
- Luna plateada: **380 JJ**.
- Michi tiburón: **420 JJ**.
- Pochi motosierra: **500 JJ**.

Las mascotas son cosméticas: acompañan los menús y muestran las frases existentes; puedes elegir ninguna. Se ocultan durante el piano para dejar libre el área de juego. No otorgan premios ni ventajas adicionales.

## Verificación

- `tests/pets35.cjs`: los 19 precios, descuento en saldo compartido, reintentos, migración repetida, propiedad, fondos insuficientes y acceso restringido.
- `tests/pets35-ui.cjs`: catálogo móvil/escritorio, grupos, filtros, búsqueda bilingüe, orden, compra real contra SQL local, equipar, ninguna, recarga, inglés y separación de cuentas.
- `tests/piano34.cjs` y `tests/piano-ui.cjs`: regresión del piano y mascotas anteriores.

Las pruebas usan una base local aislada; **no se ha ejecutado SQL en producción**.

