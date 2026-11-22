# Auditoría de publicación — Memoria Yuki (22 noviembre 2026)

## Decisión
**NO FUSIONAR NI ACTIVAR GEMINI POR AHORA.** El usuario autoriza el lanzamiento y da consentimiento para el uso de **sus propios recuerdos aprobados** con Gemini. Esto no sustituye el permiso individual de Julie para su información ni acredita las pruebas de autenticación en navegador. No debe interpretarse como permiso para habilitar todas las memorias existentes indiscriminadamente.

## Evidencia revisada
- GitHub Actions último código de panel/preflight: ejecución 44989148632 — `success`.
- En Supabase conectado, `public.yuki_memory_proposals`: RLS activo, cuatro políticas, trigger `yuki_memory_guard_update` activo y SELECT de `anon` denegado (consulta SQL read-only del 22/11/2026).
- Ensayo SQL con recuerdos ficticios y ROLLBACK: ciclo de aprobación/revocación, exclusión de sorpresas y aislamiento entre perfiles superado.
- `yuki-memory-preflight` desplegada con JWT y conteos solamente; `yuki-chat` productivo no sustituido.
- Integración preparada de Gemini requiere `YUKI_REVIEWED_MEMORY_AI_ENABLED=true` **y** `YUKI_REVIEWED_MEMORY_OWNER_CONSENT=true`. **No activar todavía**, ni copiar estos valores como secretos sin validación de sesiones reales.

## Bloqueos detectados (obligatorios)
1. **Divergencia de rama:** `feature/yuki-memory-approval` está 179 commits por delante y **75 commits detrás de `main`** (comparación GitHub 22/11/2026). Reconciliar con `main`, resolver conflictos y repetir CI sobre el resultado; evitar fusionar directamente una rama desactualizada.
2. **Sin pruebas con JWT reales:** falta probar en el navegador, con usuarios independientes, que Yisus acceda a sus recuerdos y Julie no pueda leer ni mutar esos registros. El resultado del botón «Probar acceso seguro» debe verificarse en ambas sesiones. No poner contraseñas/tokens en Issues, logs ni commits.
3. **Gemini sin ensayo real autorizado:** falta probar que solo se envíen recuerdos pertinentes, aprobados y autorizados, que la revocación se aplique al siguiente turno y que Julie no reciba material privado. Usar datos sintéticos primero en un entorno aislado; no sustituir `yuki-chat` productiva durante las pruebas.
4. **Consentimiento de terceros:** la autorización de Yisus **no** autoriza compartir datos íntimos de Julie con Gemini. La fase 1 debe excluirlos salvo autorización específica de Julie; no existe en las propuestas un campo de consentimiento por persona mencionada.
5. **Revisión final de publicación:** comprobar navegación móvil, límites de borradores, ausencia de claves privadas, estado de página principal y recuperación ante un error antes del merge.

## Secuencia para desbloquear
1. Actualizar la rama desde `main` sin descartar cambios recientes de la página; repetir pruebas automáticas.
2. Verificar accesos reales de ambas cuentas al panel, preflight y Supabase.
3. Diseñar consentimiento explícito por recuerdo para procesamiento por IA y bloqueo de datos de Julie hasta que ella consienta.
4. Realizar ensayo end-to-end de Gemini en una función aislada, con textos sintéticos, cancelación, revocación y perfiles cruzados.
5. Aprobar la auditoría y solo entonces fusionar y publicar; mantener interruptores de IA apagados hasta superar el paso 4.

**Nota:** consentimiento del usuario recibido en conversación el 22/11/2026, sin registrar contenidos privados ni credenciales en este documento.
