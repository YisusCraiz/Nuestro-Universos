import {recolor} from './yuki-room-dye.js?v=2';
export const expressions=new URL('../assets/yuki-room/yuki-expressions.webp',import.meta.url).href;
const customizationEvent='yuki-customized';
const homeEntries=new Map();
const storageKey=owner=>'yuki.home.changed.'+owner;
function homeEntry(owner){
 if(!homeEntries.has(owner))homeEntries.set(owner,{data:null,time:0,revision:0,pending:null,lastSignal:null});
 return homeEntries.get(owner);
}
export function updateHome(data){
 const owner=state.profile?.id;
 if(!owner)return;
 const entry=homeEntry(owner);
 Object.assign(entry,{data,time:Date.now(),revision:entry.revision+1});
 window.dispatchEvent(new CustomEvent(customizationEvent,{detail:{owner,data}}));
 try{localStorage.setItem(storageKey(owner),crypto.randomUUID());}catch{}
}
export async function home(force=false){
 const owner=state.profile?.id;
 const entry=homeEntry(owner);
 if(!force&&entry.data&&Date.now()-entry.time<60000)return entry.data;
 const revision=entry.revision;
 if(entry.pending?.revision===revision)return entry.pending.promise;
 const promise=(async()=>{
  const {data,error}=await db.rpc('yuki_hub');
  if(error)throw error;
  if(entry.revision!==revision && state.profile?.id===owner)return home();
  if(state.profile?.id===owner)Object.assign(entry,{data,time:Date.now()});
  return data;
 })();
 entry.pending={revision,promise};
 try{return await promise;}
 finally{if(entry.pending?.promise===promise)entry.pending=null;}
}
export function watchHome(owner,apply){
 let active=true;
 const customized=event=>{if(event.detail?.owner===owner)apply(event.detail.data);};
 const storage=event=>{
  if(event.key!==storageKey(owner)||state.profile?.id!==owner)return;
  const entry=homeEntry(owner);
  if(entry.lastSignal!==event.newValue)Object.assign(entry,{data:null,time:0,revision:entry.revision+1,lastSignal:event.newValue});
  home(true).then(data=>{if(active&&state.profile?.id===owner)apply(data);}).catch(()=>{});
 };
 window.addEventListener(customizationEvent,customized);
 window.addEventListener('storage',storage);
 return ()=>{
  active=false;
  window.removeEventListener(customizationEvent,customized);
  window.removeEventListener('storage',storage);
 };
}
const pajamaColors = new Set(['pajamas-rose','pajamas-mint','pajamas-blue','outfit-casual','outfit-aesthetic','outfit-dress']);
export async function skin(outfit,palette){
 const url=pajamaColors.has(outfit)
  ?new URL('../assets/yuki-room/'+outfit+'.webp?v=2',import.meta.url).href
  :(outfit==='pajamas'?await import('./yuki-pajamas.js?v=1'):await import('./yuki-poses.js?v=poses-1')).yukiPoses;
 return palette?recolor(url,palette).catch(()=>url):url;
}
const local=[
['Hoy cabe una aventura pequeña. ¿Una canción o una partida?','There is room for a tiny adventure today. A song or a game?'],
['Un audio con tu voz puede hacer un día mucho más bonito.','A little voice note can make a day much sweeter.'],
['Estoy supervisando el nivel de ternura. Va bastante bien.','I am monitoring the cuteness levels. Looking good.'],
['A veces el mejor plan es quedarse platicando de cualquier cosa.','Sometimes the best plan is talking about absolutely anything.'],
['Pregunta inesperada: ¿qué canción le dedicarías hoy?','Unexpected question: which song would you dedicate today?'],
['Mi habilidad secreta: encontrar un rincón cómodo en cualquier pantalla.','My secret skill: finding a cozy corner on any screen.'],
['Misión opcional: contar algo bueno que pasó hoy, por pequeño que sea.','Optional quest: share one good thing from today, however small.'],
['Los cumplidos específicos tienen un poder especial. Prueba uno.','Specific compliments have a special power. Try one.'],
['¿Un duelo de chistes malos? Yo puedo llevar el marcador.','A terrible-joke duel? I can keep score.'],
['Apuesto una estrella imaginaria a que pueden hacerse sonreír.','I bet an imaginary star you can make each other smile.'],
['El cariño también se nota al escuchar sin apurarse.','Affection shows in listening without rushing, too.'],
['La vida necesita capítulos tranquilos entre las grandes aventuras.','Life needs quiet chapters between the big adventures.'],
['Fufufu~ una nota que diga «pensé en ti» tiene mucho potencial.','Fufufu~ a note saying “I thought of you” has plenty of potential.'],
['Me gusta cuando este universo se llena de pequeñas historias.','I like it when this universe fills with little stories.'],
['Descansar juntos también cuenta como un buen plan.','Resting together counts as a good plan, too.'],
['Un recuerdo bonito no necesita un día perfecto.','A lovely memory does not need a perfect day.'],
['Hoy soy la guardiana oficial de las pausas cómodas.','Today I am the official guardian of cozy breaks.'],
['Si este momento tuviera música de fondo, ¿cuál sería?','If this moment had background music, what would it be?'],
['Me tomé muy en serio eso de acompañarlos por su universo.','I took this whole accompanying-you-around-your-universe thing seriously.'],
['Una foto cotidiana también puede convertirse en un tesoro.','An everyday photo can become a treasure, too.'],
['¿Qué detalle de tu pareja te sigue pareciendo adorable?','What little thing about your partner still makes you smile?'],
['Una noche de risas merece su propia banda sonora.','A night of laughter deserves its own soundtrack.'],
['No hace falta ganar la partida para disfrutar la compañía.','You do not have to win the game to enjoy the company.'],
['Tengo cara de traviesa, pero sé guardar una sorpresa.','I may look mischievous, but I can keep a surprise.'],
['¿Qué les gustaría aprender juntos, solo por diversión?','What would you like to learn together, just for fun?'],
['El mejor mensaje puede ser uno sencillo y sincero.','The best message can be a simple, sincere one.'],
['Este cuarto pide una tarde tranquila y una buena historia.','This room calls for a quiet afternoon and a good story.'],
['Si escuchas un suspiro dramático, probablemente sea mío.','If you hear a dramatic sigh, it is probably mine.'],
['Hoy tengo energía de personaje secundario que se roba la escena.','Today I have scene-stealing side-character energy.'],
['¿Un «cómo estás de verdad» antes de elegir qué jugar?','How about “how are you really?” before choosing a game?'],
['Me quedo por aquí. Las mejores conversaciones no siempre tienen prisa.','I will hang around. The best conversations do not always rush.'],
['Les propongo un reto amable: agradecerse un detalle pequeño.','A gentle challenge: thank each other for one little thing.']
];
let phraseState=new Map();
function phraseEntry(){const key=(state.profile?.id||'none')+':'+(UniverseI18n.language==='en'?'en':'es');if(!phraseState.has(key)){let saved={};try{saved=JSON.parse(localStorage.getItem('yuki.phrases.'+key)||'{}')}catch{}phraseState.set(key,{key,generated:Array.isArray(saved.generated)?saved.generated:[],recent:Array.isArray(saved.recent)?saved.recent:[],checked:0,pending:null});}return phraseState.get(key);}
function persist(e){try{localStorage.setItem('yuki.phrases.'+e.key,JSON.stringify({generated:e.generated,recent:e.recent}))}catch{}}
export function warmPhrases(){const e=phraseEntry();if(e.pending||Date.now()-e.checked<30*60*1000)return;e.checked=Date.now();const language=UniverseI18n.language==='en'?'en':'es';e.pending=db.functions.invoke('yuki-phrases',{body:{language}}).then(({data,error})=>{if(!error&&Array.isArray(data?.phrases)){e.generated=[...new Set(data.phrases.filter(x=>typeof x==='string'&&x.length<=180))];persist(e);}}).catch(()=>{}).finally(()=>e.pending=null);}
export function phrase(){const e=phraseEntry();warmPhrases();const en=UniverseI18n.language==='en';const pool=[...new Set([...e.generated,...local.map(p=>p[en?1:0])])];let available=pool.filter(p=>!e.recent.includes(p));if(!available.length){e.recent=e.recent.slice(-5);available=pool.filter(p=>!e.recent.includes(p));}const result=available[Math.floor(Math.random()*available.length)];e.recent.push(result);e.recent=e.recent.slice(-Math.min(28,pool.length-1));persist(e);return result;}
