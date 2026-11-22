# Yuki · Memoria 1.0.0

**Fecha:** 22 de noviembre de 2026  
**Proyecto:** Nuestro Universo  
**Versión:** `yuki-memory-v1.0.0`

## Novedades

### Memoria individual
- Dos perfiles de memoria independientes: Yisus (`jesus`) y Julie (`julisa`).
- Proponer recuerdos manualmente como pendientes; el dueño aprueba o rechaza cada recuerdo.
- Editar, buscar, filtrar, revisar fechas y borrar recuerdos.
- Editar un recuerdo aprobado devuelve el registro a pendiente para solicitar nueva revisión.
- Las sorpresas protegidas no se incluyen en las consultas de recuerdos de Gemini.

### Consentimiento para Gemini
- Activación independiente para cada cuenta, inicialmente desactivada.
- El modelo recibe únicamente recuerdos propios aprobados y no sorpresa cuando el titular lo autoriza.
- Cada perfil puede revocar el permiso para futuros turnos. No es posible retirar retroactivamente información ya transmitida o leída.

### Compartir recuerdos privados
- Compartición explícita de **un recuerdo específico** con la pareja verificada, incluso si su clasificación original es `private`.
- Compartir para lectura no autoriza a Gemini: existe un segundo permiso `allow_ai` controlado por quien comparte.
- Gemini solo recibe recuerdos de la pareja cuando el dueño autorizó el uso con IA **y** el destinatario habilitó su consentimiento personal.
- El dueño puede revocar lectura y uso con IA; cambiar texto, privacidad o aprobación revoca automáticamente los permisos otorgados.
- Se excluyen los recuerdos de sorpresa, pendientes y rechazados.
- Pantalla bilingüe de recuerdos compartidos y recibidos.

### Protección e implementación
- Supabase Auth con aislamiento por propietario y Row Level Security.
- Políticas de consentimiento individual, trigger de revocación y RPC filtrada por destinatario autenticado.
- `yuki-chat` versión 10 en Supabase, con lectura de permisos por turno y `verify_jwt=true`.
- `yuki-memory-preflight` versión 3, verificación aislada sin devolver textos de memoria.
- Pruebas de GitHub Actions y ensayos SQL sintéticos reversibles, sin conservar registros de prueba.

## Cómo empezar

1. Entra en [Mi memoria](https://yisuscraiz.github.io/Nuestro-Universos/yuki-memory.html) con tu propio perfil.
2. Escribe un recuerdo, guárdalo como pendiente y apruébalo.
3. Para que Yuki lo use en tus conversaciones, activa el consentimiento de Gemini en tu panel.
4. Entra en [Compartir recuerdos](https://yisuscraiz.github.io/Nuestro-Universos/yuki-memory-sharing.html), concede acceso de lectura a un recuerdo específico y, si lo deseas, activa por separado el uso con Gemini para tu pareja.
5. Para revocar un permiso, retíralo en la misma pantalla.

## Alcance y limitaciones conocidas

- **No hay sincronización automática** entre la memoria de ChatGPT y Nuestro Universo. Los recuerdos se introducen manualmente.
- Las etiquetas `private` y `shared` no proporcionan acceso cruzado por sí solas. Solo un permiso explícito permite la lectura por la pareja.
- La revocación bloquea **nuevas recuperaciones**, pero no puede borrar lo que alguien ya leyó, copió o escuchó, ni respuestas previas de Gemini.
- La versión 1.0 no incluye solicitudes de acceso a recuerdos, clasificación automática avanzada ni sugerencias inteligentes de fechas.
- Las pruebas SQL y de interfaz automatizada se superaron. Los usuarios indicaron haber probado sus cuentas; la nueva pantalla de compartición no dispone todavía de evidencia independiente de prueba real con ambos navegadores.
- Se confirmó el código en `main`, pero no pudo verificarse desde este entorno la propagación HTTP de GitHub Pages.

## Notas de despliegue
Este lanzamiento etiqueta la implementación de **memoria** dentro de Nuestro Universo; no cambia la versión global de la página ni incluye los demás apartados.
