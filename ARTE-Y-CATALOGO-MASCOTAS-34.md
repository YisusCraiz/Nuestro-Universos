# Arte y catálogo de mascotas

Mantén las futuras mascotas dentro del diseño de las skins que existan al añadirlas: contornos cálidos, proporciones chibi, ojos brillantes, rubor suave y colores del disfraz correspondiente. No añadas un estilo nuevo desconectado del armario. El catálogo SQL exige que `skin` apunte a una skin real de `bb_skins`.

Para ampliar la colección, añade una migración posterior (no cambies compras instaladas), una entrada en `UniversePets` de `jj-pets.js` con el mismo ID/precio/skin, textos ES/EN y una imagen transparente versionada en `assets/pets/`. Verifica el resultado a 65–85 px, el saldo compartido, la compra repetida y la opción Ninguna. Los precios actuales son 60–120 JJ, superiores a la ropa.

## Generación de esta colección

Se usó **imagegen integrado**, una llamada por mascota, con `transparent_background: true`. Sin CLI, sin SVG de sustitución y sin retoques posteriores de los píxeles. Referencia de estilo: `assets/bombitas/characters-v2.png`; no se usaron los humanos como sujetos del dibujo.

El prompt exacto de cada llamada fue el siguiente texto, sustituyendo `{SUBJECT}` por la fila correspondiente:

```text
Use case: stylized-concept. Asset: one transparent game companion pet PNG. Reference image is STYLE ONLY: match its polished chibi anime rendering, delicate dark warm outlines, soft pastel cel shading, glossy eyes, warm blush, cozy romantic cute proportions. Draw ONLY {SUBJECT}. One animal, no humans, no text, no extra animals or panels. Full body seated, three-quarter front facing viewer, centered with generous 15% transparent padding on all sides. Pet occupies about 70% of square image. This will be shown at 90px on a romantic couple website, so clean readable silhouette, large expressive eyes and minimal detail. Genuine transparent alpha background, no floor, no cast shadow or backdrop. Original design, coherent with the reference character wardrobe. Keep all ears, tails and accessories fully within the image.
```

| Archivo | `{SUBJECT}` |
| --- | --- |
| `assets/pets/cat-v1.png` | `a round fluffy lavender kitten with violet ears and a tiny pink heart collar, matching the purple cat onesie` |
| `assets/pets/shark-v1.png` | `a friendly tiny blue baby shark with a cream tummy, rounded fins, a pink blush and an adorable closed smile, matching the blue shark onesie` |
| `assets/pets/kitsune-v1.png` | `a cute tiny orange cream fox kitsune with three fluffy tails, a little red ribbon and tiny golden bell, matching the Halloween kitsune costume` |
| `assets/pets/bunny-v1.png` | `a cute little cream bunny wearing a small lavender moon-and-stars witch hat and purple cape, matching the moon witch Halloween costume` |

Los PNG mantienen el canal alfa original. Las capturas `preview-mascotas-34-mobile.png` y `preview-piano-34-mobile.png` muestran su integración; el dibujo final se guarda en los cuatro archivos enlazados en la guía de actualización.
