# Yuki: memoria con aprobación individual (fase 1)

## Estado
Panel en rama, **aún no fusionado ni publicado**. La tabla `public.yuki_memory_proposals` y su trigger de seguridad ya se aplicaron al proyecto Supabase `wainkarkdlbfprgytyty`; las pruebas SQL de aislamiento se ejecutaron correctamente. Las pruebas DOM de GitHub Actions usan un cliente Supabase simulado: **no equivalen a una prueba real con dos sesiones**. Gemini aún no tiene acceso a estos recuerdos. La memoria interna de ChatGPT no dispone aquí de una API de lectura o sincronización automática.

## Flujo
1. Yisus redacta o importa manualmente un resumen de recuerdo (nunca conversaciones completas por defecto).
2. Se guarda como `pending` con propietario y nivel: `private`, `shared` o `surprise`.
3. Yisus revisa el texto exacto, edita la visibilidad y aprueba o rechaza **cada** propuesta.
4. Solo un backend de confianza podrá incorporar recuerdos aprobados al contexto de Gemini; jamás leer propuestas pendientes.
5. El backend verifica identidad, permiso del propietario, consentimiento de Julie cuando sea información privada de ella, destinatario y fecha de revelación antes de responder.
6. La revocación debe impedir nuevas lecturas; borrar un recuerdo debe eliminarlo de índices y cachés derivados.

## Seguridad
- La tabla propuesta está aislada por RLS y `auth.uid()`; no hay política de lectura entre usuarios.
- No poner service_role, claves secretas ni textos privados en GitHub Pages.
- No confiar en roles de `user_metadata`, parámetros de URL ni instrucciones del prompt para autorizar.
- El nivel `shared` **no** concede automáticamente acceso a Julie: se necesita un backend de autorización y consentimiento.
- Los secretos de Julie deben ser creados/autorizados por Julie, no clasificados unilateralmente por Yisus.
- Una sorpresa no debe filtrarse ni siquiera a través de pistas generadas por el modelo.
- Registrar aprobación, revocación y acceso en auditoría privada antes del lanzamiento.

## Próximos pasos antes de activar
- Identificar cómo `Nuestro Universo` autentica a Yisus y Julie, y cuál proyecto Supabase usa en producción.
- Adaptar el SQL al modelo real y ejecutar pruebas de aislamiento con dos usuarios.
- Crear pantalla de revisión, edición, aprobación y revocación; comprobar accesibilidad móvil.
- Crear Edge Function de ingestión y recuperación que no exponga recuerdos ajenos.
- Hacer pruebas negativas: Julie no ve pendientes/privados/sorpresas, Yisus no ve recuerdos privados de Julie, Gemini no obtiene material no aprobado.
- Integrar una exportación manual desde ChatGPT; una sincronización automática solo sería posible mediante una fuente/API explícitamente disponible y autorizada.

**Esta rama no debe fusionarse hasta completar las pruebas de seguridad.**

## Verificación realizada (12 noviembre 2026)
- Se comprobó que existen perfiles `jesus` y `julisa` en la base productiva configurada en `config.js`.
- Se simuló una sesión autenticada con el UUID del perfil `jesus`, se insertó una propuesta temporal y se cambió a la identidad de `julisa` en la misma transacción.
- La consulta de `julisa` sobre el recuerdo temporal devolvió **0 filas**. La transacción se revirtió con `ROLLBACK`, sin persistir datos de prueba.
- Se confirmó que RLS está activado y existen cuatro políticas para SELECT, INSERT, UPDATE y DELETE por propietario.
- Esta prueba SQL **no sustituye** las pruebas E2E con sesión real en navegador ni demuestra aún que Gemini respete las reglas.
- La interfaz de importación exige sesión de Supabase y perfil `jesus`; la verdadera barrera de acceso a los datos es RLS, no la verificación del navegador.

## Integración Gemini preparada (sin activar)
- `supabase/functions/yuki-chat/index.ts` consulta `yuki_memory_proposals` **solo** si `YUKI_REVIEWED_MEMORY_AI_ENABLED=true` y el perfil autenticado es `jesus`.
- Filtra `owner_id` con el UUID del JWT, `status='approved'`, y limita a 20 registros. Se usa el cliente con JWT del usuario y RLS; no se usa el cliente administrador para leer propuestas.
- Son obligatorios **dos** controles independientes: `YUKI_REVIEWED_MEMORY_AI_ENABLED=true` (activación técnica) y `YUKI_REVIEWED_MEMORY_OWNER_CONSENT=true` (consentimiento explícito del propietario para enviar los recuerdos aprobados a Gemini). El consentimiento de un recuerdo para almacenamiento **no** implica consentimiento para procesamiento por IA.
- Por defecto ambos controles están apagados; este cambio en la rama no despliega la Edge Function. No habilitar hasta confirmar consentimiento informado y completar pruebas reales de ambas cuentas, revocación y ausencia de filtraciones.
- La función ya tenía un sistema **anterior y separado** de recuerdos (`yuki_chat_memories` / `yuki_memories`). Este cambio no modifica sus políticas ni los permisos de recuerdos compartidos preexistentes.

## Refuerzos de seguridad y errores de red (noviembre 2026)
- Guardar recuerdos captura el texto y la privacidad en el momento de envío, y conserva un borrador nuevo escrito mientras la petición anterior sigue en curso.
- Al invalidarse la sesión durante una operación, los botones de creación, actualización y paginación permanecen bloqueados; no deben mostrar éxitos tardíos.
- La carga de recuerdos contempla tanto respuestas fallidas como excepciones de red. Una reconexión se prueba desde el panel sin reutilizar permisos de otra sesión.
- Las pruebas DOM incluyen intentos de usar controles después del cierre de sesión y verifican que no haya consultas ni mutaciones posteriores.
- Las pruebas DOM con Supabase simulado y las pruebas SQL de aislamiento no reemplazan un recorrido real con dos sesiones de navegador.

## Conservación de ediciones simultáneas
- Antes de crear una propuesta nueva, el panel solicita confirmación si existen ediciones sin guardar en otras tarjetas.
- Si una tarjeta empieza a editarse mientras una inserción está pendiente, el resultado de esa inserción no fuerza una recarga que borre el texto local. La propuesta queda guardada, y el usuario puede actualizar la lista después de conservar sus ediciones.
- Un error de carga informa que la lista todavía visible puede estar desactualizada; no afirma que los datos mostrados sean recientes.
- Las pruebas automatizadas de estas situaciones usan un cliente Supabase simulado. La validación con cuentas reales sigue pendiente.

## Revisión de cambios paralelos y sorpresas
- Si una operación detecta un conflicto, antes de recargar el panel se revisan **todas** las tarjetas visibles con ediciones sin guardar, no solo la tarjeta que originó el conflicto.
- Cuando otra tarjeta cambia mientras una actualización está pendiente, la recarga automática se pospone para no borrar el nuevo borrador. Un aviso explica que debe actualizarse la lista después de conservar las ediciones.
- Las tarjetas con visibilidad `surprise` indican explícitamente que están excluidas del contexto de Gemini incluso si se aprobaron. La integración de Gemini permanece desactivada por defecto.
- Estas garantías tienen pruebas de DOM simulado; sigue faltando validación de dos sesiones reales y revisión manual de accesibilidad.

## Criterios verificables para publicar la fase 1
- [x] Reglas RLS y guard de aprobación comprobados en Supabase, sin usar recuerdos personales como datos de prueba.
- [x] Pruebas DOM con Supabase simulado para crear, aprobar, revocar, borrar, cargar y proteger ediciones.
- [x] Prueba de ejecución aislada del bloque Gemini: sin flag, sin consentimiento, Julie, recuerdo pendiente, revocado, sorpresa y errores del servidor no permiten acceder a información no autorizada.
- [x] Ensayo del ciclo completo sobre la base real con datos **sintéticos**, roles `authenticated` simulados por SQL y transacción revertida: creación, aprobación, lectura filtrada, revocación, edición, eliminación y aislamiento entre perfiles (`supabase/yuki-memory-integration-rehearsal.sql`).
- [ ] Prueba real de navegador con sesión de Yisus y sesión independiente de Julie; verificar GET/POST/UPDATE/DELETE, ausencia de filtraciones y comportamiento móvil.
- [ ] Revisar manualmente el consentimiento informado del dueño, especialmente el alcance de transferencia de datos a Gemini; mantener ambos flags desactivados hasta entonces.
- [ ] Probar Edge Function desplegada en entorno de prueba controlado (sin reemplazar el chat productivo) y revocación efectiva en el siguiente turno.
- [ ] Auditar privacidad y accesibilidad, especialmente las políticas del sistema de memoria anterior, que no fueron modificadas.
- [ ] Revisar PR y fusionar/publicar solo tras aprobar los puntos anteriores.

### Revisión de seguridad de Supabase (22 noviembre 2026)
La tabla `public.yuki_memory_proposals` mantiene RLS, cuatro políticas y el trigger `yuki_memory_guard_update` activo; el rol `anon` no tiene SELECT. El asesor de seguridad no señaló hallazgos específicos de esta tabla. Sin embargo, el proyecto tiene otros avisos generales de seguridad que se deben evaluar independientemente, sin asumir que esta prueba certifica toda la aplicación.

### Verificación adicional: ensayo de integración SQL (22 noviembre 2026)
Se ejecutó directamente en el proyecto Supabase conectado `supabase/yuki-memory-integration-rehearsal.sql` con perfiles `jesus` y `julisa` simulados mediante identidad SQL, y finalizó sin excepciones. La selección de recuerdos aprobados y no sorpresas devolvió solo los registros sintéticos esperados; revocar o editar eliminó los registros de la selección aprobada; la eliminación se comprobó; Julie no pudo leer ni aprobar recuerdos de Yisus. El `ROLLBACK` eliminó los cuatro recuerdos ficticios. **Esta evidencia no demuestra una sesión real de navegador, transferencia autorizada a Gemini ni protección contra todo tipo de filtraciones del modelo.**

## Preflight aislado del backend (22 noviembre 2026)
- Se desplegó la función **separada** `yuki-memory-preflight` en Supabase; `yuki-chat` productivo no fue reemplazado. La función tiene `verify_jwt=true`, verifica el JWT y el perfil `jesus`, y consulta la tabla con RLS del usuario, sin `service_role`.
- Solo devuelve **conteos** de recuerdos aprobados consultables y sorpresas excluidas; no obtiene ni devuelve `memory_text`, ni contacta con Gemini. Incluye encabezado `Cache-Control: no-store`.
- El panel de la rama incluye el botón **Probar acceso seguro**, que utiliza la sesión de Supabase existente. El resultado no demuestra todavía el comportamiento de Gemini ni la ausencia de filtraciones en otros apartados.
- La función aparece como `ACTIVE` en la API de Supabase y se confirmó su código desplegado. Se añadieron comprobaciones automatizadas del panel y una prueba estática de los controles de la función. **Aún hay que invocarla con tokens reales de ambos perfiles** antes de considerarla validada de extremo a extremo.
- No publicar ni fusionar la nueva interfaz antes de revisar sus resultados y el consentimiento independiente para Gemini.

### Pruebas dinámicas de la función de preflight (22 noviembre 2026)
Se añadió `tests/yuki-memory-preflight-runtime.cjs`, que ejecuta el **handler real del código fuente** de la función con un cliente Supabase simulado: una sesión de Yisus devuelve solo los conteos esperados y `Cache-Control: no-store`; una petición sin token, un token inválido, el perfil de Julie, un fallo de perfil o de base de datos, una configuración incompleta y un método distinto de POST deben rechazarse sin datos privados. La prueba ahora forma parte de GitHub Actions. **No se usan tokens reales de ninguno de los dos ni se envían recuerdos a Gemini; la llamada autenticada al servicio desplegado sigue siendo una validación pendiente.**
