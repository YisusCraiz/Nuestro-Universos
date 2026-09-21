// SOLO la URL y clave PUBLICABLE de Supabase. Nunca pegues service_role ni sb_secret_.
window.UNIVERSE_CONFIG = {
  supabaseUrl: "",
  supabasePublishableKey: "",
  // Crea estos dos usuarios manualmente en Supabase Authentication.
  // Son alias de acceso, no buzones de correo. La guía explica cómo cambiar contraseñas.
  loginEmails: { julisa: "julisa@example.com", jesus: "jesus@example.com" }
};
