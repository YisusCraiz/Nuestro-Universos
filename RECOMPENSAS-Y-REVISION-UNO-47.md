# Recompensas y revisión de UNO · v47

| Actividad | Antes | Ahora |
|---|---:|---:|
| Terminar un minijuego clásico | 1 JJ | 3 JJ |
| Bonus por récord | +2 JJ por superar la marca de ambos | +3 JJ por mejorar la marca propia del período |
| Límite compartido minijuegos/piano | 20 JJ / 10 partidas premiadas al día | 45 JJ / 12 partidas premiadas al día |
| Piano fácil, C/B/A/S | 1/2/3/4 JJ | 2/3/5/6 JJ |
| Piano normal, C/B/A/S | 2/3/5/7 JJ | 3/5/8/11 JJ |
| Piano difícil, C/B/A/S | 3/5/8/10 JJ | 5/8/12/15 JJ |
| Mejorar marca de piano, misma canción/dificultad | +1 JJ | +2 JJ |
| Casino, victoria con ganancia neta positiva | Pago de la tabla | Pago de la tabla +1 JXJ, primeras 3 victorias del día |

Los límites se renuevan a medianoche de America/Matamoros. Una primera marca de minijuego gana 3 JJ; igualarla no da bonus. La mejora personal usa el sentido correcto de puntuación o tiempo del juego. Piano conserva la exigencia de terminar con al menos C. Las monedas ya recibidas hoy cuentan para el límite nuevo; los premios no son retroactivos. Las monedas, cartas y compras existentes se conservan.

El bonus del casino está incluido en `payout`, `net` y el saldo devuelto, y aparece por separado en el recibo. No se da por cambios, derrotas, empates, recuperar la apuesta ni repartir póker sin resolver. En póker se comprueba solamente al resolver la mano. Reintentar una operación recupera el mismo resultado sin volver a pagar. Las probabilidades y tablas base se conservan.

Con sobres de 30 JJ, diez partidas clásicas sin mejoras permiten reunir un sobre; cinco mejoras personales pueden reunirlo también. El límite de 45 JJ equivale a 1.5 sobres diarios antes de las misiones y otros movimientos. El bonus del casino añade como máximo 3 JXJ (6 JJ al cambiar), de modo que no sustituye el progreso jugando. Son equivalencias de monedas, no garantías de duración ni de beneficios en el casino.

## UNO

La revisión no requirió modificar el motor. Se verificaron 108 cartas, turnos, manos privadas, anuncio antes/después de quedar con una carta, carreras entre declaración/reclamo, penalización de dos cartas sin cambiar turno, expiración tras la siguiente acción, +2 de colores distintos con acumulación opcional, +4/desafíos, penalización final, objetivos por rondas/puntos, apuestas, revanchas y recuperación de la sala.

Pruebas: `tests/cards.cjs`, `tests/cards30.cjs`, `tests/cards-matches.cjs`, `tests/uno-audit.cjs`, comprobación UI con dos navegadores aislados y pruebas del casino con SQL local. `tests/rewards-balance.cjs` valida marcas propias, límites compartidos, día local, piano, bonus de póker/ruleta, saldos y reintentos. Las pruebas no usan las cuentas reales.

Aplicar únicamente `supabase/migrations/20261024205059_uno_rewards_balance.sql` al proyecto existente. Cambia las funciones de recompensa; no altera tablas ni permisos de acceso. La interfaz muestra las cantidades nuevas. La colección privada conserva su visibilidad actual.
