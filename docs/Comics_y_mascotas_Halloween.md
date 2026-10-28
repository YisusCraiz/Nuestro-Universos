# Cómics bilingües y mascotas de Halloween

La migración `20261028033912_comics_bilingual_halloween_pets.sql` añade `title_en` y `page_text` a los capítulos existentes y cinco mascotas al catálogo. Se aplicó al proyecto configurado en `config.js`. No cambia capítulos, visibilidad, monedas, compras ni niveles existentes.

## Uso

En Comics, añade o edita un capítulo. Elige imágenes en orden de lectura. Cada página tiene campos de diálogo español e inglés; escribe números de viñeta y nombres de personaje si quieres facilitar su lectura. Puedes usar el botón ES → EN y revisar su resultado antes de guardar. El servicio es el mismo que ya usa el sitio (MyMemory); recibe el texto de esa página solo al pulsar el botón. No hace OCR ni cambia los globos de la imagen. Si falla o tiene límite diario, pega la traducción manualmente.

Al cambiar el idioma del sitio a English, el lector muestra los diálogos ingleses guardados y el título inglés si existe. La imagen original sigue visible y puede ampliarse en otra pestaña. Las páginas antiguas sin traducción muestran un aviso; siguen siendo legibles como antes. Reordenar páginas mueve su traducción; quitar una página quita su texto del capítulo al guardar. Las imágenes retiradas conservan el comportamiento anterior de Storage (no se borran automáticamente).

En Tienda → Mascotas puedes filtrar la familia Halloween. Las cinco también aparecen en Mascota → Colección. Compras, equipamiento y producción usan los RPC y precios del servidor ya existentes.

| Mascota | Precio JJ | Skin asociada |
|---|---:|---|
| Bu, el fantasmita | 180 | pajamas |
| Huesitos bailarín | 220 | casual |
| Calabacita andante | 200 | witch |
| Alitas de medianoche | 190 | devil |
| Michi hechicero | 240 | cat |

El arte vectorial y su animación CSS respetan movimiento reducido. No son mascotas del cliente ChatGPT: pertenecen a la página.

## Validación

`npm ci --prefix tests` y `npm run --prefix tests test:halloween`.

También pasaron `node tests/universe.cjs` y `node tests/pets35.cjs`. Incluyen lectura antigua, traducciones ausentes, escape de texto, protección de un modal reemplazado, identidad de página al reordenar, cinco compras y repetición sin doble cobro, permisos y migración repetida.

Se incluye una prueba Playwright opcional en `tests/comics-halloween-ui.cjs`; no se pudo ejecutar aquí porque la descarga del navegador devolvió un archivo inválido. Las pruebas DOM se ejecutaron con jsdom. Las ilustraciones SVG se renderizaron y revisaron por separado.

El guion de «Julissa, este es tu susto» está en `Julissa_este_es_tu_susto_Guion.md`. Es un documento de producción; no se generó un videoclip final.
