'use strict';
(() => {
  let promptEvent = null;
  const button = document.getElementById('install-app');
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isLocal = ['localhost','127.0.0.1',''].includes(location.hostname);

  function help() {
    modal(`<h2>Tu universo, a un toque</h2>
      ${isLocal?'<p class="install-note">Primero publica la página y abre su enlace HTTPS en tu teléfono.</p>':''}
      ${standalone()?'<p class="install-note">Ya está abierta como aplicación ♡</p>':''}
      ${promptEvent?'<button class="btn btn-wide" id="confirm-install">Instalar</button>':''}
      <div class="install-steps stack">
        <section><h3>iPhone · Safari</h3><p>Abre el enlace en Safari. Pulsa Compartir, luego Añadir a pantalla de inicio. Si aparece Abrir como app web, actívalo y pulsa Añadir.</p></section>
        <section><h3>Android · Chrome</h3><p>Abre el enlace en Chrome. Pulsa el menú ⋮ y luego Añadir a pantalla de inicio o Instalar aplicación. Confirma para crear el icono.</p></section>
        <section><h3>Laptop · Chrome o Edge</h3><p>Abre el menú del navegador y busca Instalar esta página como aplicación, o utiliza el icono de instalación en la barra de direcciones si aparece.</p></section>
      </div>
      <p class="hint install-note">Necesitas internet para iniciar sesión, ver sus archivos y guardar publicaciones. Añadirla al inicio no cambia dónde se guardan sus recuerdos.</p>`);
    const install=document.getElementById('confirm-install');
    if(install)install.onclick=async()=>{
      const event=promptEvent;
      if(!event){help();return;}
      promptEvent=null;install.disabled=true;
      try {
        await event.prompt();
        const choice=await event.userChoice;
        if(choice.outcome==='accepted')toast('Instalación solicitada. Confirma en tu dispositivo.');
        else toast('Puedes volver a instalarla desde el menú del navegador.');
      } catch {toast('No se pudo abrir la instalación. Sigue los pasos de tu navegador.');}
      help();
    };
  }
  button.onclick=help;
  addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;});
  addEventListener('appinstalled',()=>{promptEvent=null;toast('Listo, ya puedes buscar el icono en tu dispositivo ♡');});

  // Never cache Supabase, sessions, uploads, config.js or private media.
  // This worker only provides a bilingual offline explanation for page navigation.
  if('serviceWorker' in navigator && window.isSecureContext && location.protocol!=='file:') {
    navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'})
      .catch(error=>console.warn('Home-screen offline fallback unavailable:',error));
  }
})();
