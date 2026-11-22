# Compartición individual de recuerdos de Yuki

## Alcance
Yisus y Julie pueden compartir recuerdos **individualmente**, incluidos los marcados como `private`, sin conceder acceso general a sus propuestas. El registro del recuerdo permanece bajo propiedad de su autor y nunca puede ser editado por el destinatario.

## Permisos independientes
1. El dueño redacta y aprueba el recuerdo en `yuki-memory.html`.
2. Desde `yuki-memory-sharing.html` concede permiso de **lectura** para ese recuerdo exacto a la pareja cuyo identificador verifica el backend; esto no activa Gemini.
3. Opcionalmente el dueño activa **Permitir a Yuki usarlo con mi pareja** (`allow_ai`).
4. El destinatario debe tener activado **su propio consentimiento para Gemini** en su panel. Solo si ambos permisos están activos, su chat de Yuki puede recibir el recuerdo compartido.
5. La autorización de lectura y la autorización para Gemini se revocan independientemente. Cambiar texto, nivel de privacidad o aprobación del recuerdo revoca la compartición completa.
6. Las sorpresas y recuerdos no aprobados quedan excluidos incluso cuando alguien intenta concederlos por API.

## Garantías implementadas
- RLS en `yuki_memory_grants`: únicamente el dueño puede ver y modificar sus permisos de envío. Un trigger verifica identidad del destinatario, propietario y estado exacto del recuerdo, incluso si el cliente omite la interfaz.
- La función `yuki_shared_memories_for_me(p_for_ai)` retorna hasta 20 recuerdos compartidos con la sesión actual, **sin parámetro de usuario**. `p_for_ai=true` exige además `allow_ai=true`.
- La función `yuki_partner_for_sharing()` resuelve la pareja autorizada a partir del perfil autenticado, sin permitir que el cliente invente otro destinatario.
- No se añadió SELECT cruzado en `yuki_memory_proposals`; los permisos de memoria privados no dan acceso a otros datos.
- Los textos se muestran con `textContent`, no se interpreta contenido HTML.
- La consulta de Gemini se ejecuta por cada turno, sujeta al consentimiento del receptor y a los permisos compartidos actuales. No hay caché de grants para nuevas solicitudes.

## Limitaciones que deben respetarse
- Revocar un permiso detiene **nuevas recuperaciones**, pero no borra contenido que la otra persona ya leyó, copió o recibió en mensajes anteriores. El historial de chat de Gemini puede contener respuestas que aludan a información previamente compartida; no afirmamos borrado retroactivo.
- `shared` como visibilidad sigue siendo una **etiqueta**; **no** otorga acceso por sí solo. Un recuerdo `private` puede concederse específicamente sin cambiar la visibilidad del resto de la memoria.
- Si el recuerdo contiene información íntima de terceros que no son su dueño, se debe contar también con la autorización correspondiente.
- La fase actual permite compartir con la pareja verificada y no con usuarios arbitrarios, grupos ni enlaces públicos.
- Para revocar el permiso Gemini de forma inmediata en el servidor, el dueño desactiva `allow_ai` o revoca el grant. La otra cuenta sigue requiriendo su propio consentimiento de IA.
- Falta prueba manual de sesiones reales de ambas cuentas para declarar la nueva pantalla validada en dispositivos de usuario.

## Pruebas
- `supabase/yuki-memory-sharing-security-test.sql`: operaciones de SQL contra Supabase real, con usuarios simulados y `ROLLBACK`, probadas satisfactoriamente el 22 de noviembre de 2026.
- `tests/yuki-memory-sharing.cjs`: validaciones estáticas de permisos/HTML e integridad JavaScript.
- `tests/yuki-memory-gemini.cjs` y `tests/yuki-memory-edge-runtime.cjs`: reglas de recuperación autorizada y consentimiento receptor para Gemini.
