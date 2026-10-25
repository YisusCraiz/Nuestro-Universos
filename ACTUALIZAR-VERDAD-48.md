# Verdad o reto: más humor y cartas sin repetición

Se sustituyen diez preguntas o retos redundantes y se añaden cuarenta tarjetas bilingües: diez verdades y diez retos para cada nivel. El mazo queda en 140 tarjetas, 70 normales y 70 coquetas. Se conservan las preguntas románticas útiles y la posibilidad de omitir cualquier tarjeta.

La sala registra las cartas extraídas, incluidas las omitidas. No vuelven a salir hasta agotar las disponibles. El historial permanece al reconectar; al barajar se evita repetir inmediatamente la última carta. El modo coqueto sigue requiriendo que ambos lo acepten.

La migración `truth_fun_deck` ya está aplicada al proyecto configurado en config.js. No requiere cambiar el frontend ni ejecutar SQL manualmente en ese proyecto. Para otras instalaciones, aplicar supabase/migrations/20261025001948_truth_fun_deck.sql una sola vez. El parche verifica la implementación anterior antes de modificarla y preserva sus controles de acceso y recompensas.

Validación realizada en una transacción con rollback: ciclo completo de 70 tarjetas normales y 140 con coqueteo, alternancia de turnos, omisiones, restricción del nivel y primera carta tras barajar. Sin duplicados exactos en español ni inglés. No se modificaron partidas o premios de usuarios durante la prueba. Prueba reproducible: tests/fixtures/truth-deck-cycle.sql. No se probó una videollamada real entre dos dispositivos.
