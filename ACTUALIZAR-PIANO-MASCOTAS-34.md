# Piano JJ y mascotas compañeras

Versión `v34-piano-mascotas`. La propuesta no publica la página ni ejecuta consultas en tu Supabase.

## Activarla

1. Integra esta propuesta en `main`.
2. En Supabase → **SQL Editor**, ejecuta el contenido completo de [34-piano-y-mascotas.sql](supabase/34-piano-y-mascotas.sql).
3. Espera la publicación de GitHub Actions y actualiza la página. Debe aparecer `v34-piano-mascotas`.

La consulta requiere haber aplicado las anteriores hasta la 33. Si ya las aplicaste, **no las repitas**: solo necesitas la 34. Se conservan las monedas JJ/JXJ, skins, mascotas compradas, títulos y partidas anteriores. La propia 34 permite reintentar su instalación sin borrar compras ni premios.

## Piano JJ

En **Games → Piano JJ** selecciona un audio de **Musicas → Nuestra música**, la dificultad y la duración. Puedes jugar el primer minuto, los primeros dos minutos o la canción completa, hasta diez minutos. Si la canción es más corta, se usa su duración real. Necesita al menos 20 segundos y un archivo de audio compatible con tu navegador, de hasta 25 MB como los que ya permite Nuestra música.

Primero pulsa **Preparar canción**. El navegador analiza sus acentos y estima su pulso para crear un arreglo automático. Después pulsa **Comenzar** para activar el sonido y la cuenta atrás. No es una transcripción profesional de las notas originales: el audio original acompaña a las cuatro pistas de ritmo.

Toca las cuatro teclas o usa **D F J K** cuando las notas lleguen a la línea. Perfecto: 100 puntos; Bien: 70; pulsación incorrecta: −10. Una nota fallada rompe el combo. Puedes pausar y continuar; cambiar de pestaña pausa automáticamente. Volver atrás o terminar antes no entrega monedas. Las partidas caducan al pasar una hora desde su inicio.

Los enlaces de Spotify por sí solos no proporcionan el audio que necesita este juego. Para jugar esa canción, añade también su archivo de audio a Nuestra música. No se descarga ni extrae audio del reproductor de Spotify.

Hay que **terminar el fragmento y alcanzar C (60 %)** para ganar JJ:

| Dificultad | C: 60 % | B: 75 % | A: 90 % | S: 97 % |
| --- | ---: | ---: | ---: | ---: |
| Fácil | 1 JJ | 2 JJ | 3 JJ | 4 JJ |
| Normal | 2 JJ | 3 JJ | 5 JJ | 7 JJ |
| Difícil | 3 JJ | 5 JJ | 8 JJ | 10 JJ |

Mejorar una marca anterior de la misma canción y dificultad da **+1 JJ adicional**. La primera partida o un empate no cuenta como mejora. Piano y los minijuegos clásicos comparten el máximo de **10 partidas premiadas y 20 JJ diarios**, según America/Matamoros. Puedes seguir jugando y mejorar marcas después de llegar al límite.

El servidor conserva el arreglo de cada partida y recalcula el resultado a partir de las pulsaciones; no acepta una cantidad de monedas enviada por el navegador. También comprueba que haya transcurrido el tiempo mínimo de la canción. El análisis musical y las pulsaciones se originan en el navegador, por lo que esto no pretende ser un sistema antitrampas profesional. Los límites diarios se aplican en el servidor.

Si la respuesta de guardado se pierde, el resultado queda pendiente en ese navegador. Usa **Guardar resultado pendiente**: se consulta la misma partida y no se duplica el premio. Una partida vencida se descarta y permite comenzar otra.

## Mascotas

En **Tienda → Mascotas**:

| Mascota | Precio | Skin con la que combina |
| --- | ---: | --- |
| Mochi lila | 60 JJ | Disfraz de gato |
| Aleta de cielo | 80 JJ | Disfraz de tiburón |
| Kitsu de otoño | 100 JJ | Kitsune |
| Luna conejita | 120 JJ | Brujería lunar |

La compra elige la mascota y se guarda por cuenta. Puedes cambiar entre las que compraste o elegir **Ninguna mascota** sin perderlas. No es obligatorio tener la skin que combina con ella. Las mascotas son cosméticas, sin ventajas de juego.

La elegida aparece en un lateral de todos los menús y permanece al navegar. Al tocarla cambia de frase; también muestra mensajes periódicos, sin voz. Tiene frases de ánimo, descanso y sugerencias de cosas bonitas para decirle a Jesús o Julissa. Puedes cerrar el bocadillo. Durante una partida activa de piano se oculta para no tapar las teclas y vuelve al terminar.

Los precios se descuentan del mismo saldo JJ que utilizan ropa, títulos, apuestas y cambios JXJ. Se respetan las monedas reservadas en partidas. Reintentar comprar una mascota ya comprada no la cobra otra vez.

## Arte y próximas mascotas

Las cuatro ilustraciones originales se generaron con la herramienta integrada **imagegen**, usando la hoja actual de personajes solo como referencia de estilo. Se copiaron al proyecto conservando su transparencia y los originales generados. Archivos finales:

- [cat-v1.png](assets/pets/cat-v1.png)
- [shark-v1.png](assets/pets/shark-v1.png)
- [kitsune-v1.png](assets/pets/kitsune-v1.png)
- [bunny-v1.png](assets/pets/bunny-v1.png)

Consulta [ARTE-Y-CATALOGO-MASCOTAS-34.md](ARTE-Y-CATALOGO-MASCOTAS-34.md) para los prompts exactos y las reglas para añadir compañeras que combinen con las siguientes skins.

## Validación

Pruebas con PostgreSQL aislado: compra, saldo compartido, propiedad, Ninguna, reintentos, puntuación cliente/servidor, fallos/combo, reloj, límites y migración repetida. Prueba móvil con audio WAV real: elegir canción, analizarla, tocar una partida completa, pausar/continuar, guardar los JJ y cambiar de idioma. Prueba de mascota entre menús, tras recargar y con otro perfil. No se han probado los archivos musicales ni teléfonos reales de ambos.
