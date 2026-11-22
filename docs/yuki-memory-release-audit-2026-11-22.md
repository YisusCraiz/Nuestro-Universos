# Auditoría de publicación — Memoria Yuki (22 noviembre 2026)

## Decisión
**NO FUSIONAR NI ACTIVAR GEMINI POR AHORA, HASTA PASAR PRUEBAS REALES.** Ambos titulares expresaron consentimiento a través de Yisus: él lo otorgó directamente y comunicó que Julie lo autorizó verbalmente en llamada el 22/11/2026. Esto permite avanzar en la preparación, pero no equivale a una verificación independiente del alcance del consentimiento de Julie ni a compartir cualquier dato íntimo sin límites. Esto no sustituye el permiso individual de Julie para su información ni acredita las pruebas de autenticación en navegador. No debe interpretarse como permiso para habilitar todas las memorias existentes indiscriminadamente.

## Evidencia revisada
- GitHub Actions último código de panel/preflight: ejecución 44989148632 — `success`.
- En Supabase conectado, `public.yuki_memory_proposals`: RLS activo, cuatro políticas, trigger `yuki_memory_guard_update` activo y SELECT de `anon` denegado (consulta SQL read-only del 22/11/2026).
- Ensayo SQL con recuerdos ficticios y ROLLBACK: ciclo de aprobación/revocación, exclusión de sorpresas y aislamiento entre perfiles superado.
- `yuki-memory-preflight` desplegada con JWT y conteos solamente; `yuki-chat` productivo no sustituido.
- Integración preparada de Gemini requiere `YUKI_REVIEWED_MEMORY_AI_ENABLED=true` **y** `YUKI_REVIEWED_MEMORY_OWNER_CONSENT=true`. **No activar todavía**, ni copiar estos valores como secretos sin validación de sesiones reales.

## Bloqueos detectados (obligatorios)
1. **Divergencia de rama RESUELTA:** `feature/yuki-memory-approval` integró `main` con merge commit `69c7395b16c58a73785037d9e9158fe839770537`. La nueva comparación confirma **0 commits detrás de `main`**. Repetir CI del código integrado antes de aprobar publicación.
2. **Sin pruebas con JWT reales:** falta probar en el navegador, con usuarios independientes, que Yisus acceda a sus recuerdos y Julie no pueda leer ni mutar esos registros. El resultado del botón «Probar acceso seguro» debe verificarse en ambas sesiones. No poner contraseñas/tokens en Issues, logs ni commits.
3. **Gemini sin ensayo real autorizado:** falta probar que solo se envíen recuerdos pertinentes, aprobados y autorizados, que la revocación se aplique al siguiente turno y que Julie no reciba material privado. Usar datos sintéticos primero en un entorno aislado; no sustituir `yuki-chat` productiva durante las pruebas.
4. **Consentimiento individual y granular:** Yisus informa que Julie también consintió verbalmente, pero el sistema aún no ofrece a Julie controles propios de memoria, revocación y destinatarios. No habilitar envío automático de datos íntimos de terceros, secretos, ni sorpresas por el simple consentimiento verbal; implementar controles por titular antes de esa fase.
5. **Revisión final de publicación:** comprobar navegación móvil, límites de borradores, ausencia de claves privadas, estado de página principal y recuperación ante un error antes del merge.

## Secuencia para desbloquear
1. **COMPLETADO:** integrar `main` en la rama de Yuki sin descartar cambios recientes; confirmar CI y ausencia de regresiones.
2. Verificar accesos reales de ambas cuentas al panel, preflight y Supabase.
3. Diseñar consentimiento explícito por recuerdo para procesamiento por IA y bloqueo de datos de Julie hasta que ella consienta.
4. Realizar ensayo end-to-end de Gemini en una función aislada, con textos sintéticos, cancelación, revocación y perfiles cruzados.
5. Aprobar la auditoría y solo entonces fusionar y publicar; mantener interruptores de IA apagados hasta superar el paso 4.

**Nota:** consentimiento del usuario recibido en conversación el 22/11/2026, sin registrar contenidos privados ni credenciales en este documento.

## Actualización de integración — 22 noviembre 2026
- A petición de Yisus, se integraron los cambios recientes de `main` en la rama de memoria por merge commit `69c7395b16c58a73785037d9e9158fe839770537`; GitHub reporta **0 commits detrás**.
- Yisus comunicó el consentimiento verbal de Julie durante una llamada. No se almacenan datos privados, grabaciones ni contraseñas como evidencia. El consentimiento no cambia automáticamente permisos de RLS ni hace públicas sorpresas.
- La publicación del PR y la integración con Gemini siguen sujetas a pruebas reales con las cuentas de ambos perfiles y una comprobación de revocación con Gemini. El sistema de memoria vigente sigue intacto.
