# Rankings y misiones · v41

En Inicio se muestran tres clasificaciones, además del salón y la carrera de coronas:

- JJ disponibles: mismo cálculo que `bb_shop`, después de compras, transferencias y reservas vigentes.
- JXJ actuales: suma de movimientos JXJ del servidor.
- Total apostado en casino: suma histórica de `stake` en slots, ruleta, caballos y reparto de póker. Incluye apuestas ganadoras; excluye cambios de moneda, pagos y segunda fase del póker. Cada petición confirmada cuenta una vez.

Se muestran empates. Hay actualización manual, cada minuto mientras Inicio está visible y al regresar a la pestaña. Los fallos conservan el último ranking cargado y permiten reintentar. Las cifras son privadas para los miembros del universo; no hay acceso anónimo ni a historiales individuales mediante este endpoint.

Las 14 misiones semanales existentes conservan identificadores, objetivos y premios. Se añaden visitas en 3/5 días, 5 cartas, 3 comentarios, 3 recuerdos, 10 partidas, 5 juegos diferentes y 3 tarjetas compartidas: 22 semanales. Se añaden puzle y mejora de récord a las diarias: 7 diarias. Cada misión sigue entregando 1 JJ una vez por período. El progreso usa los eventos existentes de la semana/día de America/Matamoros; las partidas se refieren a juegos que registran estos eventos. No se reinician saldos ni premios.

## Base de datos

Aplicar únicamente `supabase/migrations/20261024181945_rankings_missions.sql` al proyecto existente. No volver a ejecutar el esquema ni migraciones anteriores. La migración añade el endpoint `jj_rankings`, con implementación privilegiada en un esquema no expuesto y envoltura pública SECURITY INVOKER. Actualiza las dos funciones de consulta de misiones. No modifica la liquidación de coronas ni sus resultados históricos.

## Verificación

- `node tests/rankings-missions.cjs`: contabilidad de cartera, gastos de casino sin duplicados, separación entre cuentas, 22/7 misiones, premios únicos, permisos y liquidación de coronas con puntuación/tiempo/empates. La liquidación probada es una copia de la función existente en producción en `tests/fixtures/crown-settlement.sql`.
- `node tests/rankings-missions-ui.cjs`: orden de los tres rankings, empates, actualización/reintento, español/inglés y dimensiones móvil/escritorio. Permite indicar Chromium con `PW_CHROMIUM_PATH`.
- Comprobación en producción dentro de una transacción revertida: el JJ del ranking coincide con `bb_shop()` para ambos perfiles; ambos pueden leer las 22/7 misiones y la competición. No se guardan premios ni operaciones de prueba en sus cuentas.

La corona se entrega al liquidar un período cerrado cuando se consulta el dashboard/competición. Gana quien lidera más juegos, considerando menor tiempo donde corresponde; los empates cuentan para ambos y un período sin juegos no produce corona. La operación es idempotente. Esta actualización conserva las coronas anteriores y mantiene oculta la colección privada.
