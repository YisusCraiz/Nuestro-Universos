# Yuki: memoria con aprobación individual (fase 1)

## Estado
Propuesta en rama, **no desplegada**. No se ha ejecutado SQL ni se ha conectado ChatGPT a Supabase. La memoria interna de ChatGPT no dispone aquí de una API de lectura o sincronización automática.

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
