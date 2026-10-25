# Colección privada · Primer universo

Preparada para Jesús y Julissa. La migración crea `collection=false`: no activa la sorpresa al desplegar ni al terminar las pruebas. Solo Jesús puede verla mientras está oculta. El servidor también rechaza consultas y operaciones de Julissa mientras siga desactivada. No se envían notificaciones. Los commits con prefijo `[internal]` no aparecen en las noticias compartidas.

## Abrir y revelar

Jesús puede abrir **Álbum JJ** en el menú. Al decidir revelar la sorpresa, ir a **Perfiles → Apartados que puede ver Julissa → Álbum JJ** y activar el interruptor. No hace falta editar código. La aplicación de Julissa recibe la visibilidad al actualizar sus secciones.

## Contenido

30 cartas: 12 Comunes, 8 Raras, 5 Épicas, 3 Legendarias y 2 EXE. Cada carta incluye una dedicatoria original en español e inglés, escrita de Jesús para Julissa. No se atribuyen a Julissa palabras que no haya escrito. Las ilustraciones conservan el diseño de los personajes de `assets/romantic-game-couple.png`: pelo rizado y gafas negras de Jesús; pelo castaño largo y gafas claras de Julissa.

La ilustración generada está en `assets/collection/first-universe-v1.webp`, un atlas de seis columnas por cinco filas. El cliente recorta visualmente cada celda mediante CSS, con una versión WebP optimizada para cargar rápido, conservando la composición del original. Creado con la herramienta integrada de generación de imágenes. Prompt: treinta escenas originales en cuadrícula uniforme, desde Lego, billetera, cine, tenis, llamadas y otoño hasta samurái, vampira, magia estelar, reino de cristal, hilos rojos, alas, jardín del tiempo, meteoros y versiones EXE azul y rosa. Sin texto, marcos ni márgenes. La referencia guía la identidad; no se reutiliza su escena.

## Economía expansiva solicitada

Un sobre cuesta **30 JJ** y entrega tres cartas. Un sobre inicial por usuario es gratuito. Los valores se calculan en servidor; los JJ usan el monedero compartido existente y no el saldo JxJ del casino.

| Rareza | Probabilidad base por carta | Venta | Fragmentos al reciclar | Coste de fabricación |
|---|---:|---:|---:|---:|
| Común | 70 % | 4 JJ | 1 | 8 |
| Rara | 20 % | 35 JJ | 4 | 24 |
| Épica | 8 % | 80 JJ | 12 | 70 |
| Legendaria | 1.7 % | 220 JJ | 35 | 200 |
| EXE | 0.3 % | 650 JJ | 90 | 500 |

Si van nueve sobres sin Épica o superior, la tercera carta del siguiente sube a Épica cuando sea necesario. Cualquier Épica, Legendaria o EXE reinicia el contador. Las probabilidades publicadas son las base, antes de esa garantía.

Simulación reproducible con semilla 246813579, generador LCG `(1664525*x+1013904223) mod 2^32`, 100000 sobres: venta media **66.44606 JJ**, ganancia neta media **36.44606 JJ** por sobre al vender las tres cartas. Se aplicaron 1196 mejoras por garantía. Es una economía deliberadamente expansiva, sin límite diario de cartas ni venta; las ganancias no están garantizadas en cada sobre. Tres comunes se venden por 12 JJ.

Se premia descubrir 10, 20 y 30 cartas distintas con 40, 100 y 250 JJ, una vez por usuario. Los descubrimientos se conservan aunque una copia se venda, recicle o intercambie.

## Intercambios

Hasta cinco copias por lado, JJ o combinación de ambos. Ofertas, contraofertas, aceptación, rechazo y cancelación. Cada operación se confirma mostrando lo que entrega cada parte. Las copias y JJ ofrecidos se reservan en servidor; los pedidos se validan al aceptar. Las monedas reservadas se descuentan al proponer y se entregan al receptor al aceptar. Si se cancela, rechaza o vence la oferta, se devuelven una sola vez. Las ofertas duran siete días y su caducidad se procesa al consultar u operar la colección.

Las favoritas están protegidas frente a ventas, reciclaje y ofertas. Una copia reservada tampoco puede venderse ni ofrecerse dos veces. Los cambios son transaccionales y usan los mismos bloqueos de monedero que la tienda. Las solicitudes tienen UUID y recibo: reintentar una respuesta perdida no compra ni vende otra vez. La operación pendiente se conserva en el navegador por usuario.

## Instalación y comprobación

Aplicar después de SQL 34 `supabase/migrations/20261024065246_collectible_cards.sql`. La migración no cambia los saldos existentes ni entrega cartas automáticamente. Tablas y lógica en esquema privado, RLS y acceso directo revocado; RPC pública invocadora con permisos para usuarios autenticados. La función interna comprueba membresía y visibilidad antes de leer o mutar.

`npm test --prefix tests` ejecuta las pruebas de servidor, economía e información privada en noticias. `node tests/collection-ui.cjs` prueba dos navegadores móviles, apartado oculto, apertura de tres cartas, favoritas, respuesta perdida, intercambio y diseño de escritorio. Usa el navegador de Playwright instalado (por defecto, el canal msedge usado por las pruebas existentes). No utiliza las cuentas ni los saldos reales.

## Ampliación: Segundo universo

La migración `20261024120352_album_second_universe.sql` añade 30 cartas (#031–#060), manteniendo las originales, saldos, copias, favoritos, ofertas y descubrimientos. Nueva distribución: 12 Comunes, 8 Raras, 5 Épicas, 3 Legendarias y 2 EXE, cada una con dedicatoria nueva en ambos idiomas. Las aperturas mezclan ambas colecciones y mantienen precio, probabilidades base, valor de venta y garantía. El filtro Colección permite explorar cada capítulo por separado. El progreso global ahora llega a 60. Se añaden premios únicos a los 40, 50 y 60 descubrimientos de 180, 260 y 400 JJ; los premios anteriores se conservan.

Arte generado con la herramienta integrada, referencia de identidad `assets/romantic-game-couple.png`, en `assets/collection/second-universe-v1.webp` (6 × 5). Prompt: escenas nuevas de cocina, música, librería, picnic, fotografía, videojuegos, acuario, rueda de la fortuna, girasoles, helado, puzle y cine en casa; pirata, sirena, dragón, inventor, arquera y biblioteca encantada; Halloween, Navidad, constelaciones, auroras, astronautas y baile; fénix, santuario de cerezos, islas soñadas, ceremonia fantástica y versiones EXE verde y ámbar. Sin rótulos ni márgenes. La ceremonia es un escenario de fantasía; la dedicatoria lo presenta como un sueño sin prisa.

No se modifica la visibilidad de `collection`. Pruebas: `node tests/collection60.cjs` y `node tests/collection60-ui.cjs`, incluyendo conservación de datos, cartas antiguas y nuevas en sobres, filtros, ilustración EXE correcta y dedicatorias.

## Ampliación: Tercer universo

`20261024160916_album_third_universe.sql` añade #061–#090 sin modificar los 60 diseños previos, los saldos ni las copias de los usuarios. Incluye 12 Comunes, 8 Raras, 5 Épicas, 3 Legendarias y 2 EXE, con treinta dedicatorias nuevas de Jesús para Julissa en ambos idiomas. Los sobres conservan el precio de 30 JJ y sus probabilidades, valores y garantía; ahora mezclan tres colecciones. El progreso llega a 90 y el filtro Colección añade Tercer universo. Los premios anteriores se conservan y se añaden premios únicos por 70, 80 y 90 descubrimientos de 300, 400 y 600 JJ. La visibilidad no cambia.

Arte generado con la herramienta integrada a partir de la referencia de identidad habitual; archivo `assets/collection/third-universe-v1.webp`, cuadrícula 6 × 5. Prompt: desayuno de waffles, plantas, mapa estelar, bicicleta tándem, ventana lluviosa, bufanda, karaoke, castillo de arena, gato, farol, auriculares y ajedrez; caballero de hielo, cuidadora de fénix, caravana voladora, explorador submarino, alquimia y panadería aérea; calle de faroles, fuegos artificiales, biblioteca lunar, emperatriz solar, guardianes de la marea y baile entre nubes; guardianes koi, planeta jardín, reloj de arena galáctico, eclipse y variantes EXE violeta y turquesa. Sin rótulos, marcos ni márgenes; mantener pelo y gafas de los dos personajes.

Pruebas: `node tests/collection90.cjs` y `node tests/collection90-ui.cjs`. Verifican conservación de los 60 registros anteriores, saldos y descubrimientos, mezcla de sobres, fabricación, filtros y premios nuevos sin duplicación.

## Ampliación: Cuarto universo

`20261024162808_album_fourth_universe.sql` añade #091–#120 sin modificar los 90 diseños previos, sus copias, saldos o descubrimientos. Incluye 12 Comunes, 8 Raras, 5 Épicas, 3 Legendarias y 2 EXE con dedicatorias originales bilingües de Jesús para Julissa. Los sobres conservan el precio de 30 JJ, las probabilidades, los valores y la garantía, y mezclan las cuatro colecciones. Se añade el filtro Cuarto universo y premios únicos por 100, 110 y 120 descubrimientos de 450, 550 y 800 JJ, conservando los premios anteriores. La visibilidad no cambia.

Arte generado con la herramienta integrada y la referencia de identidad habitual en `assets/collection/fourth-universe-v1.webp` (cuadrícula 6 × 5). Prompt: pizza, telescopio, corona de flores, cerámica, patines, cámara instantánea, sala de acertijos, camping, origami, diente de león, boliche y arcade; monje del trueno, princesa del conejo lunar, tortuga con pueblo, mago de hongos, relojera y globo sobre cristales; cosecha de manzanas, huevos de primavera, tren nocturno, violinista de cristal, ballena cósmica y teatro de máscaras; faro flotante, árbol de las estaciones, fénix de nieve y zorro de fuego, cascadas de gravedad invertida y EXE escarlata y blanco perla. Sin rótulos ni márgenes.

Pruebas: `node tests/collection120.cjs` y `node tests/collection120-ui.cjs`. Incluyen conservación de datos, cartas antiguas y nuevas en sobres, fabricación EXE, filtros, ilustraciones, intercambios y premios nuevos sin duplicación.

## Ampliación: Quinto universo

`20261024193030_album_fifth_universe.sql` añade #121–#150 conservando las 120 cartas previas, saldos, copias, favoritos, ofertas, descubrimientos y premios cobrados. Incluye 12 Comunes, 8 Raras, 5 Épicas, 3 Legendarias y 2 EXE con treinta dedicatorias nuevas de Jesús para Julissa en español e inglés. Se conservan precio, probabilidades, valores y garantía. El filtro añade Quinto universo y el progreso alcanza 150. Los nuevos premios únicos por 130, 140 y 150 descubrimientos son de 600, 700 y 1000 JJ. La visibilidad permanece como esté configurada.

Arte creado con la herramienta integrada y la referencia de identidad de ambos, en `assets/collection/fifth-universe-v1.webp` (6 × 5). Prompt: cupcakes, robot de juguete, ukelele, invernadero, compras cotidianas, carta, muñeco de nieve, pesca de juguete, hamaca, cachorro, fideos y casa de hadas; espadachín del viento, sanadora del océano, medusa voladora, astrónomo del desierto, acuarelas y té en un loto; pan de otoño, cometas de primavera, guardabosques con lobo, bailarina de auroras, tren en Saturno y dragón de origami; jardín de colibríes, galaxia en un libro, portal de espejos, puente arcoíris y EXE solar naranja y lunar amatista. Sin rótulos, marcos ni márgenes.

Pruebas: `node tests/collection150.cjs` y `node tests/collection150-ui.cjs`. Verifican conservación de las 120 cartas, monedero y descubrimientos, sobres mixtos, fabricación EXE, filtros, ilustraciones y premios sin duplicaciones.

## Ampliación: Sexto universo

`20261024195135_album_sixth_universe.sql` añade #151–#180 conservando las 150 cartas anteriores y los saldos, copias, favoritos, ofertas, descubrimientos y premios cobrados. Contiene 12 Comunes, 8 Raras, 5 Épicas, 3 Legendarias y 2 EXE con treinta dedicatorias nuevas en ambos idiomas. Sobres, probabilidades, valores y garantía permanecen iguales. Se añade el filtro Sexto universo y el progreso alcanza 180. Los premios únicos por 160, 170 y 180 descubrimientos son de 750, 850 y 1200 JJ. No se cambia la visibilidad.

Arte generado con la herramienta integrada y la referencia de identidad de ambos, en `assets/collection/sixth-universe-v1.webp` (6 × 5). Prompt: dumplings, avión de papel, hierbas aromáticas, kayak, sombras con las manos, álbum de pegatinas, juego de mesa, planetario, pretzels, fresas, minigolf y paseo en canal; bardo con dragón, bruja de mariposas, ferrocarril de nubes, herrero celestial, cartógrafa y restaurante submarino; laberinto de girasoles, pueblo de jengibre, viajero de arena, cantante estelar, carruaje alado y ciudad de espejos; pozo de deseos, tortugas de cristal, globos de constelaciones, escalera del sol y la luna y variantes EXE obsidiana y coral. Sin rótulos, marcos ni márgenes.

Pruebas: `node tests/collection180.cjs` y `node tests/collection180-ui.cjs`. Cubren conservación de datos, sobres mixtos, fabricación EXE, filtros, ilustraciones, intercambios y premios sin duplicaciones.

## Ampliación: Séptimo universo · Japón

`20261024200227_album_japan_universe.sql` añade las treinta cartas #181–#210, todas de temática japonesa, sin modificar las 180 anteriores ni los saldos, copias, ofertas, favoritos, descubrimientos y premios cobrados. Distribución: 12 Comunes, 8 Raras, 5 Épicas, 3 Legendarias y 2 EXE. Cada carta tiene una nueva dedicatoria de Jesús para Julissa en ambos idiomas. Se conservan precio, probabilidades y garantía; el progreso llega a 210. Nuevos premios únicos por 190, 200 y 210 descubrimientos: 900, 1000 y 1400 JJ. La visibilidad no cambia.

Se añade el filtro Colección «Séptimo universo · Japón» y el filtro Tema «Japón». Las cartas conservan su categoría habitual y una etiqueta adicional `japon`, por lo que pueden encontrarse tanto por temporada/fantasía como por Japón.

Arte creado con la herramienta integrada y referencia de identidad en `assets/collection/seventh-japan-v1.webp` (6 × 5). Prompt: onigiri, matcha, yukata, hortensias y paraguas, shogi, pincel, takoyaki, tatami, daruma, temari, mercado y koi; ronin, guardiana del torii, kitsune, shakuhachi, taiko y hanami; té entre arces, jardín nevado, guardián tengu, figura de nieve, grullas sobre Fuji y ciudad maneki-neko; bote de faroles, castillos del sol y la luna, puente de Tanabata, cerámica kintsugi y EXE ronin neón y kitsune digital. Fantasía japonesa original, sin rótulos, kanji, marcos ni márgenes.

Pruebas: `node tests/collection210.cjs` y `node tests/collection210-ui.cjs`. Incluyen conservación de las 180 cartas, etiquetas, filtro Japón, sobres mixtos, fabricación EXE, intercambios e idempotencia de premios.


## Octavo universo · Throne of Seal · #211–240
30 fanarts de Jesús y Julissa inspirados en el donghua: caballero de luz, asesina de sombras, templos, compañeros mágicos y tronos. Nuevo filtro Throne of Seal, dedicatorias español/inglés, 12 comunes, 8 raras, 5 épicas, 3 legendarias y 2 EXE. Hitos 220/230/240: 1050/1150/1600 JJ. Conserva sobres, probabilidades, economía anterior y ocultación para Julissa. Arte: `assets/collection/eighth-throne-v1.webp`.


## Noveno universo · Black Clover · #241–270
30 fanarts de Jesús y Julissa inspirados en el anime: antimagia, magia de agua, grimorios, Toros Negros y otras variantes de caballeros mágicos. Nuevo filtro Black Clover, dedicatorias español/inglés; 12 comunes, 8 raras, 5 épicas, 3 legendarias, 2 EXE. Hitos 250/260/270: 1200/1300/1800 JJ. Conserva sobres, probabilidades y ocultación para Julissa. Arte: `assets/collection/ninth-clover-v1.webp`.


## Décimo universo · Kimetsu no Yaiba · #271–300
30 fanarts de Jesús y Julissa inspirados en el anime: cazadores, respiraciones de agua, trueno, llamas, niebla, flores, amor y mariposas, glicinas y dos EXE. Filtro Kimetsu no Yaiba y dedicatorias español/inglés. 12 comunes, 8 raras, 5 épicas, 3 legendarias y 2 EXE. Hitos 280/290/300: 1350/1450/2000 JJ. Conserva economía y la configuración actual de visibilidad; el apartado ya estaba desbloqueado al aplicar esta ampliación. Arte: `assets/collection/tenth-kimetsu-v1.webp`.


## Recompensas y undécimo universo · Kimetsu: lazos · #301–330
Los hitos se reclaman en la pestaña Recompensas, separada de La máquina. Muestra progreso y estados reclamado, bloqueado o disponible, conservando todos los premios anteriores. 30 fanarts de la pareja adulta: Jesús como Tanjiro u Obanai; Julie como Nezuko o Mitsuri. Dedicatorias español/inglés, 12 comunes, 8 raras, 5 épicas, 3 legendarias, 2 EXE. Hitos 310/320/330: 1500/1600/2200 JJ. Conserva visibilidad y economía. Arte: `assets/collection/eleventh-kimetsu-bonds-v1.webp`.


## Duodécimo universo · Gyutaro y Daki · #331–360
30 fanarts de la pareja adulta en cosplay: Jesús inspirado en Gyutaro y Julie en Daki/Ume, con hoces, cintas obi, faroles y ciruelos. Dedicatorias español/inglés, 12 comunes, 8 raras, 5 épicas, 3 legendarias, 2 EXE. Hitos 340/350/360: 1650/1750/2400 JJ, dentro de la pestaña Recompensas. Conserva visibilidad y economía. Arte: `assets/collection/twelfth-kimetsu-moon-v1.webp`.
