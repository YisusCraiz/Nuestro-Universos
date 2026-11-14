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
- Por defecto el interruptor está apagado; este cambio en la rama no despliega la Edge Function. No habilitar hasta confirmar consentimiento para enviar recuerdos a Gemini y completar pruebas reales de ambas cuentas, revocación y ausencia de filtraciones.
- La función ya tenía un sistema **anterior y separado** de recuerdos (`yuki_chat_memories` / `yuki_memories`). Este cambio no modifica sus políticas ni los permisos de recuerdos compartidos preexistentes.
