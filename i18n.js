/* UI translations only. User-authored content is marked translate="no".
 * Text nodes are updated in place so language changes preserve forms and games. */
'use strict';
(() => {
  const dictionary = Object.assign(Object.create(null), {
    'Nuestro universo':'Our universe', 'Nuestro universo /':'Our universe /',
    '21 de septiembre · para ti':'September 21 · for you', '21 de septiembre':'September 21',
    'Hay encuentros':'Some encounters', 'que se vuelven':'become an entire', 'universo.':'universe.',
    'Y el mío empezó el día que te conocí.':'And mine began the day I met you.',
    'JULISA & JESÚS · UN RINCÓN SOLO NUESTRO':'JULISA & JESÚS · A LITTLE PLACE JUST FOR US',
    'Nuestra pequeña contraseña':'Our little secret', 'Todo empezó un día…':'It all started one day…',
    '¿Recuerdas la fecha en que nos conocimos?':'Do you remember the date we met?',
    'Día':'Day', 'Mes':'Month', 'Elige el mes':'Choose the month',
    'Enero':'January','Febrero':'February','Marzo':'March','Abril':'April','Mayo':'May','Junio':'June',
    'Julio':'July','Agosto':'August','Septiembre':'September','Octubre':'October','Noviembre':'November','Diciembre':'December',
    'Abrir nuestro universo':'Open our universe', 'Casi… piensa en el comienzo de agosto ♡':'Almost… think of the beginning of August ♡',
    'Qué bonito encontrarte aquí':'So lovely to find you here', '¿Quién viene a soñar?':'Who is here to dream?',
    'Elige tu lugar en este universo.':'Choose your place in this universe.', 'Entrar a mi perfil':'Open my profile',
    'Este universo todavía necesita conectarse. Mientras tanto, puedes conocerlo en una vista de prueba.':'This universe still needs to be connected. In the meantime, you can explore the demo.',
    'Explorar vista de prueba':'Explore the demo', 'Volver al comienzo':'Back to the beginning',
    'Hola,':'Hello,', 'Tu contraseña abre la puerta.':'Your password opens the door.', 'Contraseña':'Password',
    'Entrar a mi universo':'Enter my universe','Cambiar de perfil':'Choose another profile',
    'Falta conectar Supabase. Sigue la guía de configuración incluida.':'Supabase is not connected yet. Follow the included setup guide.',
    'No se pudo entrar. Revisa la contraseña y tu conexión.':'Could not sign in. Check your password and connection.',
    'El perfil no está asignado. Revisa el paso de usuarios en la guía.':'This account has no matching profile. Check the user setup step in the guide.',
    'No se pudo cerrar la sesión. Inténtalo de nuevo.':'Could not sign out. Please try again.',
    'Vista de prueba · las publicaciones y los récords no se guardan.':'Demo · posts and records are not saved.',
    'Cambiar perfil':'Switch profile','NUESTRO PEQUEÑO MUNDO':'OUR LITTLE WORLD','Menú principal':'Main menu',
    'Inicio':'Home','Ruleta de caramelos':'Candy wheel','Nuestra música':'Our music','Recuerdos':'Memories',
    'Cartitas':'Little letters','Flores amarillas':'Yellow flowers','Minijuegos':'Mini games','¿Novios?':'Be my girlfriend?',
    'Tu lugar favorito ♡':'Your happy place ♡','Cerrar sesión':'Sign out','Salir':'Sign out',
    'Desde aquel 1 de agosto':'Since that August 1','Este rinconcito todavía tiene candado ♡':'This little corner is still locked ♡',
    'Solo para Jesús':'Only for Jesús','No pudimos abrir este rincón':'We could not open this little corner',
    'Comprueba tu conexión e inténtalo otra vez.':'Check your connection and try again.','Volver a intentar':'Try again',
    'Qué bonito que estés en nuestro pequeño universo.':'So happy to have you in our little universe.',
    'Ramo de flores amarillas iluminadas entre estrellas':'A bouquet of yellow flowers glowing among the stars',
    'Unas flores.':'A few flowers.','Todo mi universo.':'My whole universe.',
    'Hay mil maneras de decirte lo especial que eres. Hoy, la mía es amarilla.':'There are a thousand ways to tell you how special you are. Today, mine is yellow.',
    'Tengo algo para ti':'I have something for you','Un poquito de nosotros':'A little bit of us',
    'Pequeñas cosas, grandes sentimientos':'Little things, big feelings','Un dulce para tu día':'A little treat for your day',
    'Gira la ruleta. Sonríe un poquito.':'Spin the wheel. Find a little smile.',
    'Lo que suena a ti':'Songs that sound like you','Canciones que cuentan lo nuestro.':'Songs that tell our story.',
    'Instantes para siempre':'Moments to keep forever','Los momentos que queremos guardar.':'The moments we want to hold on to.',
    'De todas las casualidades, tú eres mi favorita.':'Of all the chance encounters, you are my favorite.',
    'PARA NOSOTROS':'FOR US','HECHO DE CANCIONES, RECUERDOS Y UN POQUITO DE MAGIA ✦':'MADE OF SONGS, MEMORIES AND A LITTLE MAGIC ✦',
    'Una dosis de dulzura':'A little dose of sweetness','Cada vuelta es una pequeña excusa para hacerte sonreír.':'Every spin is a little excuse to make you smile.',
    'Este dulce es para ti':'This sweet is for you','Un giro, una sonrisa.':'One spin, one smile.','¿Probamos suerte?':'Shall we try our luck?',
    'Girar la ruleta ✧':'Spin the wheel ✧','Aquí todos los premios vienen con cariño.':'Every prize here comes with love.',
    'Buscando tu caramelo…':'Finding your sweet…','Otro caramelo ♡':'Another sweet ♡',
    'Si fueras canción, te pondría en repeat.':'If you were a song, I would play you on repeat.',
    'Tu sonrisa debería venir con advertencia: alegra días enteros.':'Your smile should come with a warning: it can brighten an entire day.',
    'No sé mucho de astronomía, pero mi estrella favorita eres tú.':'I do not know much about astronomy, but you are my favorite star.',
    'Contigo, hasta un lunes tiene sabor a viernes.':'With you, even Monday feels like Friday.',
    'Si pensar en ti fuera deporte, ya tendría medalla de oro.':'If thinking about you were a sport, I would have a gold medal.',
    'Eres ese mensaje que siempre me da gusto recibir.':'You are the message I am always happy to receive.',
    'Hoy te receto una sonrisa. La siguiente va por mi cuenta.':'Today I prescribe one smile. The next one is on me.',
    'El universo tiene millones de estrellas y yo sigo mirándote a ti.':'The universe has millions of stars, and I still only have eyes for you.',
    'A veces mi plan favorito es simplemente hablar contigo.':'Sometimes my favorite plan is simply talking to you.',
    'Tienes algo que no cabe en una frase… pero aquí sigo intentando.':'There is something about you that words cannot capture… but I keep trying.',
    'Me caes tan bien que hasta compartiría mi último caramelo contigo.':'I like you so much I would even share my last sweet with you.',
    'El día mejora un poquito cada vez que apareces.':'My day gets a little better every time you show up.',
    'Si la ternura tuviera nombre, sonaría como el tuyo.':'If sweetness had a name, it would sound like yours.',
    'Ojalá hoy te pase algo bonito. Si no, aquí tienes este abrazo.':'I hope something lovely happens to you today. In the meantime, here is a hug.',
    'Me gustas más que dormir cinco minutitos más.':'I like you more than five extra minutes of sleep.',
    'Tú haces que las cosas sencillas se sientan especiales.':'You make the simplest things feel special.',
    'Mi notificación favorita siempre tiene tu nombre.':'My favorite notification always has your name on it.',
    'Ni con todas las flores alcanzaría a explicar lo especial que eres.':'Even all the flowers in the world could not show how special you are.',
    'Te mando una sonrisa. Devuélvemela cuando quieras.':'Sending you a smile. Send one back whenever you like.',
    'Gracias por coincidir conmigo en este universo.':'Thank you for crossing paths with me in this universe.',
    'Hay personas que son hogar, incluso a través de una pantalla.':'Some people feel like home, even through a screen.',
    'Si el día pesa, aquí tienes un poquito de dulzura.':'If today feels heavy, here is a little sweetness.',
    'Qué suerte la mía: entre tanta gente, conocerte a ti.':'How lucky I am: out of so many people, I met you.',
    'No eres un caramelo, pero sí la parte más dulce de mi día.':'You are not a sweet, but you are the sweetest part of my day.',
    'Nuestra banda sonora':'Our soundtrack','Canciones escritas con algo que no cabía en palabras.':'Songs written for feelings too big for words.',
    'Subir canción':'Upload a song','Todavía no suena nuestra primera canción':'Our first song is still waiting to play',
    'Añade el audio, su portada y la historia de por qué la escribiste.':'Add the audio, its cover and the story of why you wrote it.',
    'Lo que queremos guardar':'What we want to keep','Nuestros recuerdos':'Our memories','Un lugar para volver a vivir esos días.':'A place to relive those days.',
    'Guardar recuerdo':'Save a memory','Aquí empieza nuestro álbum':'Our album starts here',
    'Sube la primera foto. Después podrán abrirla y dejarse comentarios.':'Upload the first photo. Then you can both open it and leave comments.',
    'De mi universo al tuyo':'From my universe to yours','Una imagen, unas palabras y mucho de nosotros.':'A picture, a few words and a whole lot of us.',
    'Escribir una cartita':'Write a little letter','Hay palabras esperando su momento':'Some words are waiting for their moment',
    'Escribe una frase y acompáñala con una imagen si quieres.':'Write a message and add a picture if you like.',
    'No se pudo cargar un archivo. Usa Actualizar para reintentar.':'Could not load a file. Use Refresh to try again.',
    'No se pudo cargar. Pulsa Actualizar para reintentar.':'Could not load. Tap Refresh to try again.',
    'Para mí':'For me','Solo de nosotros dos':'Just between us','↻ Actualizar':'↻ Refresh',
    'Abriendo nuestros recuerdos…':'Opening our memories…','Ver más':'See more',
    'No se pudo cargar la siguiente página. Vuelve a intentarlo.':'Could not load the next page. Please try again.',
    'Abrir y comentar ♡':'Open and comment ♡','Nosotros':'Us',
    'La vista de prueba no guarda contenido. Conecta Supabase para publicar.':'The demo does not save content. Connect Supabase to publish.',
    'Usa una imagen JPG, PNG, WebP o GIF.':'Use a JPG, PNG, WebP or GIF image.','Usa un audio MP3, M4A, WAV, OGG o FLAC.':'Use MP3, M4A, WAV, OGG or FLAC audio.',
    'No se pudo subir el archivo. Comprueba tu conexión y la configuración de Storage.':'Could not upload the file. Check your connection and Storage setup.',
    'Nombre de la canción':'Song title','Nombre de este recuerdo':'Name this memory','Un título para tu cartita':'A title for your letter',
    '¿Por qué la escribiste?':'Why did you write it?','¿Qué pasó ese día?':'What happened that day?','Lo que quiero decirte':'What I want to tell you',
    'Portada (opcional)':'Cover image (optional)','Nuestra foto':'Our photo','Imagen (opcional)':'Image (optional)',
    'Los dos podrán verlo y dejar comentarios.':'You can both see it and leave comments.',
    'Guardar con cariño':'Save with love','Guardando…':'Saving…',
    'No se pudo comprobar la conexión. Tu texto sigue aquí.':'Could not check the connection. Your text is still here.',
    'Tu publicación ya estaba guardada ♡':'Your post was already saved ♡','Escribe un título.':'Please enter a title.',
    'Guardado en nuestro universo ♡':'Saved in our universe ♡',
    'No pudimos confirmar el guardado. Reintenta desde este formulario; comprobaremos si ya se guardó para no duplicarlo.':'We could not confirm the save. Try again from this form; we will check whether it was saved to avoid duplicates.',
    'No se pudo guardar. Tu texto sigue aquí; vuelve a intentarlo.':'Could not save. Your text is still here; please try again.',
    'Lo que nos hace sentir':'How it makes us feel','Cargando comentarios…':'Loading comments…','Tu comentario':'Your comment','Dejar un comentario':'Leave a comment',
    'Se muestran los 100 comentarios más recientes.':'Showing the 100 most recent comments.','El primer comentario puede ser tuyo ♡':'The first comment could be yours ♡',
    'No se pudieron cargar los comentarios. Cierra y vuelve a abrir este recuerdo.':'Could not load comments. Close and reopen this memory.',
    'Comentario guardado ♡':'Comment saved ♡',
    'Se guardó tu comentario, pero no pudimos actualizar la lista. Vuelve a abrir el recuerdo.':'Your comment was saved, but the list could not refresh. Reopen the memory.',
    'No se pudo guardar. Tu comentario sigue aquí para reintentarlo.':'Could not save. Your comment is still here so you can try again.',
    'Preparando tus flores…':'Getting your flowers ready…','Un amarillo que dice mucho':'Yellow says so much',
    'Estas flores tienen un solo destino: tú.':'These flowers have just one destination: you.',
    'Usar mi animación HTML':'Use my HTML animation','Usar estas flores':'Use these flowers',
    'También puedes guardar una animación propia en un solo archivo HTML.':'You can also save your own animation in a single HTML file.',
    'Flores amarillas para Julisa':'Yellow flowers for Julisa',
    'Flores amarillas para la más hermosa de mi universo':'Yellow flowers for the most beautiful girl in my universe',
    'Con todo mi cariño':'With all my love','Para la más hermosa':'For the most beautiful girl','de mi universo':'in my universe',
    'Julisa, estas flores siempre van a ser para ti. ♡':'Julisa, these flowers will always be for you. ♡',
    'No se pudo cambiar la animación. Inténtalo otra vez.':'Could not change the animation. Please try again.',
    'Tu propia animación':'Your own animation',
    'Elige un HTML con estilos y scripts incluidos. Las imágenes y sonidos deben estar integrados como datos; los recursos externos no se cargan.':'Choose an HTML file with styles and scripts included. Images and sounds must be embedded as data; external resources will not load.',
    'Guardar animación':'Save animation','El HTML debe pesar menos de 2 MB.':'The HTML file must be under 2 MB.',
    'El archivo está vacío.':'The file is empty.','Tu animación ya está guardada':'Your animation is saved','No se pudo guardar.':'Could not save.',
    'Lugar':'Place','Jugador':'Player','Récord':'Best','Por jugar':'Not played yet',
    'Preparando nuestros juegos…':'Getting our games ready…','Rivales de juego, cómplices de todo':'Rivals in games, partners in everything',
    'Un ratito para jugar':'A little time to play','Dos juegos, dos nombres y una revancha pendiente.':'Two games, two names and a rematch waiting.',
    'Memoria de corazones':'Memory of hearts','Encuentra las 6 parejas. Menos intentos, más puntos.':'Find all 6 pairs. Fewer attempts, more points.',
    'Jugar memoria':'Play memory','Máximo: 1,200 puntos. Cada intento extra resta 25.':'Maximum: 1,200 points. Each extra attempt costs 25.',
    'Un latido veloz':'A quick heartbeat','Espera al amarillo y pulsa. Gana el menor tiempo.':'Wait for yellow and tap. The fastest time wins.',
    'Jugar reflejos':'Play reflexes','¿Qué tan rápido late tu corazón?':'How fast does your heart beat?',
    'Tu récord se mide en milisegundos.':'Your record is measured in milliseconds.',
    'Reintentar':'Try again','Jugar otra vez':'Play again','Espera al amarillo…':'Wait for yellow…',
    'Todavía no…':'Not yet…','¡Ahora! Pulsa ♡':'Now! Tap ♡','¡Ya!':'Go!',
    'Un poquito antes de tiempo':'A little too early','Sin récord esta vez. Vuelve a intentarlo.':'No record this time. Try again.',
    'Intento fuera de tiempo. Vamos otra vez.':'That attempt was outside the time limit. Try again.','Intentar otra vez':'Try again',
    'Detalles':'Details','Cerrar':'Close','Menú':'Menu','Abrir menú':'Open menu',
    'Añadir al inicio':'Add to Home Screen','Instalar':'Install','Cómo instalar':'How to install',
    'Tu universo, a un toque':'Your universe, one tap away',
    'Primero publica la página y abre su enlace HTTPS en tu teléfono.':'First publish the page and open its HTTPS link on your phone.',
    'iPhone · Safari':'iPhone · Safari','Android · Chrome':'Android · Chrome',
    'Abre el enlace en Safari. Pulsa Compartir, luego Añadir a pantalla de inicio. Si aparece Abrir como app web, actívalo y pulsa Añadir.':'Open the link in Safari. Tap Share, then Add to Home Screen. If Open as Web App appears, turn it on and tap Add.',
    'Abre el enlace en Chrome. Pulsa el menú ⋮ y luego Añadir a pantalla de inicio o Instalar aplicación. Confirma para crear el icono.':'Open the link in Chrome. Tap the ⋮ menu, then Add to Home screen or Install app. Confirm to create the icon.',
    'Laptop · Chrome o Edge':'Laptop · Chrome or Edge',
    'Abre el menú del navegador y busca Instalar esta página como aplicación, o utiliza el icono de instalación en la barra de direcciones si aparece.':'Open your browser menu and look for Install this page as an app, or use the install icon in the address bar if available.',
    'Necesitas internet para iniciar sesión, ver sus archivos y guardar publicaciones. Añadirla al inicio no cambia dónde se guardan sus recuerdos.':'You need internet to sign in, view your files and save posts. Adding the app to your Home Screen does not change where your memories are stored.',
    'Ya está abierta como aplicación ♡':'Already open as an app ♡',
    'Puedes volver a instalarla desde el menú del navegador.':'You can install it again from your browser menu.',
    'No se pudo abrir la instalación. Sigue los pasos de tu navegador.':'Could not open installation. Follow the steps for your browser.',
    'Instalación solicitada. Confirma en tu dispositivo.':'Installation requested. Confirm on your device.',
    'Listo, ya puedes buscar el icono en tu dispositivo ♡':'All set! Look for the icon on your device ♡',
    'Idioma':'Language','De':'From'
  });
  const defaults = { julisa: 'en', jesus: 'es' };
  const key = 'universe-language';
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  let language = ['es','en'].includes(saved) ? saved : (navigator.language?.startsWith('en') ? 'en' : 'es');
  let explicit = ['es','en'].includes(saved);
  const originals = new WeakMap();
  const attributeOriginals = new WeakMap();
  const ignored = 'script,style,textarea,[translate="no"],.notranslate';
  const attributes = ['aria-label','title','alt','placeholder'];

  function translate(source) {
    if (language !== 'en') return source;
    const core = source.trim();
    let result = Object.hasOwn(dictionary,core) ? dictionary[core] : undefined;
    if (result === undefined) {
      const decorations = core.match(/^(↻\s*|✧\s*|\+\s*)?(.+?)(\s*🔒)?$/u);
      if (decorations && dictionary[decorations[2]]) result=(decorations[1]||'')+dictionary[decorations[2]]+(decorations[3]||'');
    }
    if (result === undefined) {
      const patterns = [
        [/^Hola, (.+)\.$/,(_,name)=>`Hello, ${name}.`],
        [/^De mí para (.+)$/,(_,name)=>`From me to ${name}`],
        [/^Para (.+), de ti\.$/,(_,name)=>`For ${name}, from you.`],
        [/^De (.+)$/,(_,name)=>`From ${name}`],
        [/^Abrir (.+)$/,(_,title)=>`Open ${title}`],
        [/^(.*) · hasta (\d+) MB$/,(_,label,size)=>`${dictionary[label]||({'Audio':'Audio','Archivo HTML':'HTML file'}[label])||label} · up to ${size} MB`],
        [/^El archivo supera (\d+) MB\.$/,(_,size)=>`The file exceeds ${size} MB.`],
        [/^Voltear carta (\d+)$/,(_,number)=>`Flip card ${number}`],
        [/^Carta (\d+): (.+)$/,(_,number,symbol)=>`Card ${number}: ${symbol}`],
        [/^(\d+) intentos · (\d+) de 6 parejas$/,(_,moves,pairs)=>`${moves} attempts · ${pairs} of 6 pairs`],
        [/^([12])\.º( =)?$/,(_,rank,tie)=>`${rank==='1'?'1st':'2nd'}${tie?' =':''}`],
        [/^(\d+) (puntos|ms)([.·\s]+)(.+)$/,(_,n,unit,sep,status)=>`${n} ${unit==='puntos'?'points':unit}${sep}${({'Resultado de prueba.':'Demo result.','Guardando tu récord…':'Saving your record…','Solo en esta prueba, no guardado.':'Demo only, not saved.','Récord guardado ♡':'Record saved ♡','No se pudo guardar.':'Could not save.'})[status]||status}`]
      ];
      for (const [pattern, replace] of patterns) if (pattern.test(core)) { result=core.replace(pattern,replace);break; }
    }
    if (result === undefined) return source;
    return source.slice(0,source.indexOf(core))+result+source.slice(source.indexOf(core)+core.length);
  }

  function updateText(node) {
    if (!node.parentElement || node.parentElement.closest(ignored)) return;
    const previous = originals.get(node);
    const source = previous && node.data === previous.output ? previous.source : node.data;
    const output = translate(source);
    originals.set(node,{source,output});
    if(node.data!==output)node.data=output;
  }
  function updateElement(element) {
    if(element.closest(ignored))return;
    const cache=attributeOriginals.get(element)||{};
    for(const name of attributes){
      const value=element.getAttribute(name);if(value===null)continue;
      const previous=cache[name];
      const source=previous&&value===previous.output?previous.source:value;
      const output=translate(source);cache[name]={source,output};
      if(value!==output)element.setAttribute(name,output);
    }
    attributeOriginals.set(element,cache);
    if(element.hasAttribute('data-date')){
      const date = new Date(element.dataset.date);
      if(!Number.isNaN(date.valueOf()))element.textContent=element.dataset.dateStyle==='full'?date.toLocaleString(locale()):date.toLocaleDateString(locale(),{day:'numeric',month:'short'});
    }
  }
  function walk(root) {
    if(root.nodeType===Node.TEXT_NODE){updateText(root);return;}
    if(root.nodeType!==Node.ELEMENT_NODE)return;
    if(root.closest(ignored))return;
    updateElement(root);
    for(const child of [...root.childNodes])walk(child);
  }
  const options={subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes};
  const observer=new MutationObserver(records=>{
    observer.disconnect();
    for(const record of records){
      if(record.type==='childList')record.addedNodes.forEach(walk);
      else if(record.type==='characterData')updateText(record.target);
      else updateElement(record.target);
    }
    observer.observe(document.body,options);
  });
  function locale(){return language==='en'?'en-US':'es-MX';}
  function apply(){
    observer.disconnect();walk(document.body);
    document.documentElement.lang=language;
    document.title=language==='en'?'Our universe · Julisa & Jesús':'Nuestro universo · Julisa & Jesús';
    document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
    observer.observe(document.body,options);
  }
  function setLanguage(next,remember=true){
    if(!['es','en'].includes(next))return;
    language=next;
    if(remember){explicit=true;try{localStorage.setItem(key,next);}catch{}}
    apply();
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-language]');
    if(button)setLanguage(button.dataset.language);
  });
  window.UniverseI18n={translate,setLanguage,apply,locale,get language(){return language;},profile(handle){if(!explicit)setLanguage(defaults[handle]||'es',false);}};
  apply();
})();
