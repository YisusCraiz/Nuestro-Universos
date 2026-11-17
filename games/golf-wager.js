'use strict';

let golfWagerId=null, wagerData=null, wagerBusy=false, wagerMessage=[], wagerOfferId=null, roomIntent='create';
const wagerName=handle=>handle==='jesus'?'Yisus':'Julie';
const wagerCircuit=id=>id==='A'?tr('Gran vuelta J×J','J×J Grand Tour'):tr(...(worlds.find(w=>w.id===id)?.names??['Circuito','Circuit']));
const wagerTotal=scores=>scores?.reduce((sum,n)=>sum+n,0);
function wagerText(es,en){wagerMessage=[es,en];}

async function wagerRequest(action='read',fields={}){
 if(wagerBusy)return;
 wagerBusy=true;renderWager();
 try{
  const cfg=window.UNIVERSE_CONFIG;
  if(!cfg?.supabaseUrl||!window.supabase){wagerData=null;return;}
  golfClient??=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
  const {data:{session}}=await golfClient.auth.getSession();
  if(!session){wagerData=null;return;}
  const {data,error}=await golfClient.rpc('jj_golf_wager',{p_action:action,...fields});
  if(error)throw error;
  wagerData=data;
  if(action!=='read'){wagerOfferId=null;wagerMessage=[];}
 }catch(error){
  switch(error?.message){
   case 'BAD_ROOM_CODE':wagerText('Código incorrecto. Revisa los 10 caracteres.','Incorrect code. Check all 10 characters.');break;
   case 'OFFER_MISMATCH':wagerText('La sala cambió. Actualiza y revisa la apuesta.','The room changed. Refresh and check the stake.');break;
   case 'INSUFFICIENT_COINS':wagerText('Te faltan monedas JJ disponibles.','You do not have enough available JJ coins.');break;
   case 'WAGER_EXPIRED':wagerText('La apuesta venció. Las monedas volvieron al saldo.','The wager expired. The coins are available again.');break;
   case 'WAGER_OPEN':wagerText('Ya hay una apuesta abierta. Actualiza para verla.','A wager is already open. Refresh to see it.');break;
   default:wagerText('No se pudo completar. Actualiza para revisar el estado.','Could not finish. Refresh to check the wager status.');
  }
 }finally{wagerBusy=false;renderWager();}
}
function wagerButton(es,en,fn,primary=false){
 const button=document.createElement('button');button.type='button';button.textContent=tr(es,en);
 if(primary)button.className='primary';
 button.disabled=wagerBusy;
 button.onclick=fn;return button;
}
function renderWager(){
 if(!$('wager').open)return;
 $('wagerStatus').textContent=wagerMessage.length?tr(...wagerMessage):'';
 $('wagerBalance').textContent=wagerData?tr('Saldo disponible: ','Available balance: ')+wagerData.coins+' JJ':wagerBusy?tr('Cargando…','Loading…'):tr('Inicia sesión en tu perfil de Nuestro Universo para apostar.','Sign in to your Our Universe profile to wager.');
 const w=wagerData?.match;
 const ongoing=w&&['offer','playing'].includes(w.state);
 $('wagerOffer').hidden=roomIntent!=='create'||!wagerData||Boolean(ongoing)||Boolean(golfWagerId);
 $('wagerJoin').hidden=roomIntent!=='join'||!wagerData||w?.state==='playing';
 $('wagerJoin').querySelectorAll('input,button').forEach(node=>node.disabled=wagerBusy);
 $('wagerForm').querySelectorAll('input,button').forEach(node=>node.disabled=wagerBusy);
 const picker=$('wagerCircuit');
 if(!picker.options.length){for(const id of ['A',...worlds.map(world=>world.id)]){
  const option=document.createElement('option');option.value=id;option.textContent=wagerCircuit(id);picker.append(option);
 }picker.value=circuit;}
 const details=$('wagerDetails'), info=$('wagerInfo'), actions=$('wagerActions');
 details.hidden=!w;actions.replaceChildren();
 if(!w)return;
 const host=w.host===wagerData.me, yours=wagerTotal(w.mine), theirs=wagerTotal(w.theirs);
 const end=new Date(w.expires).toLocaleTimeString(english?'en-US':'es-MX',{hour:'numeric',minute:'2-digit'});
 const states={
  offer:host?tr('Sala creada · comparte el código','Room created · share the code'):tr('Sala de '+wagerName(w.host),'Room by '+wagerName(w.host)),
  playing:tr('Sala lista','Room ready'),
  paid:tr(wagerName(w.winner)+(w.stake?' ganó '+w.stake+' JJ':' ganó la partida'),wagerName(w.winner)+(w.stake?' won '+w.stake+' JJ':' won the match')),
  draw:tr('Empate. Se devolvieron las monedas.','Draw. Coins were returned.'),
  cancelled:tr('Apuesta anulada. Se devolvieron las monedas.','Wager cancelled. Coins were returned.'),
  expired:tr('Apuesta vencida. Se devolvieron las monedas.','Wager expired. Coins were returned.')
 };
 $('wagerMatchTitle').textContent=states[w.state];
 info.textContent=wagerCircuit(w.circuit)+' · '+(w.stake?w.stake+tr(' JJ por jugador · Bote: ',' JJ per player · Pot: ')+(w.stake*2)+' JJ':tr('Sin apuesta','No wager'))+(ongoing?tr(' · Vence a las ',' · Expires at ')+end:'');
 $('wagerScores').textContent=(w.mine||w.theirs)?
  wagerName(wagerData.me)+': '+(yours??'—')+' · '+wagerName(wagerData.me==='jesus'?'julisa':'jesus')+': '+(theirs??'—')+tr(' golpes',' strokes'):'';
 $('wagerBreakdown').textContent=(w.mine&&w.theirs)?wagerName(wagerData.me)+': '+w.mine.join(' / ')+'  ·  '+wagerName(wagerData.me==='jesus'?'julisa':'jesus')+': '+w.theirs.join(' / '):'';
 if(w.state==='offer'&&host&&w.code){
  const code=document.createElement('strong');code.textContent=w.code;
  actions.append(code,wagerButton('Copiar código','Copy code',async()=>{
   try{await navigator.clipboard.writeText(w.code);wagerText('Código copiado.','Code copied.');}
   catch{wagerText('Código: '+w.code,'Code: '+w.code);}
   $('wagerStatus').textContent=tr(...wagerMessage);
  },true));
 }
 if(w.state==='offer'&&!host&&!w.coded){
  actions.append(wagerButton('Aceptar '+w.stake+' JJ','Accept '+w.stake+' JJ',()=>{
   if(window.confirm(tr('¿Reservar '+w.stake+' JJ para esta apuesta?','Reserve '+w.stake+' JJ for this wager?')))wagerRequest('accept',{p_id:w.id});
  },true));
 }
 if(w.state==='playing'&&!w.mine){
  if(golfWagerId!==w.id){
   actions.append(wagerButton('Jugar mi ronda','Play my round',()=>startWagerRound(w),true));
  }else if(done){
   actions.append(wagerButton('Enviar mis golpes','Submit my strokes',()=>wagerRequest('submit',{p_id:w.id,p_scores:[...tally[players[0]]]}),true));
  }
 }
 if(w.state==='playing'&&w.mine&&w.theirs&&!w.confirmed){
  actions.append(wagerButton(w.stake?'Confirmar marcador y pago':'Confirmar marcador',w.stake?'Confirm scores and payout':'Confirm scores',()=>{
   if(!w.stake||window.confirm(tr('¿Confirmas ambos marcadores para liquidar la apuesta?','Confirm both scores to settle the wager?')))wagerRequest('confirm',{p_id:w.id});
  },true));
 }else if(w.state==='playing'&&w.mine){
  actions.append(wagerButton('Marcador enviado','Scores submitted',()=>{}));
  actions.lastElementChild.disabled=true;
 }
 if(ongoing){
  actions.append(wagerButton('Anular y devolver','Cancel and refund',()=>{
   if(window.confirm(tr('¿Anular la apuesta y devolver las monedas reservadas?','Cancel the wager and return reserved coins?')))wagerRequest('cancel',{p_id:w.id});
  }));
 }
}
function openGolfWager(intent='create'){
 if($('wager').open)return;
 roomIntent=intent;wagerMessage=[];$('wagerCircuit').replaceChildren();$('wagerCodeInput').value='';$('wager').showModal();wagerRequest();
}
function startWagerRound(w){
 circuit=w.circuit;loadBests();renderWorlds();records();
 $('who').selectedIndex=golfHandles.indexOf(wagerData.me);
 $('wager').close();startGame('far',w.id);
}
function bindGolfWager(){
 $('wagerLobby').onclick=()=>openGolfWager('create');
 $('wagerJoinLobby').onclick=()=>openGolfWager('join');
 $('wagerGame').onclick=$('wagerResult').onclick=()=>openGolfWager('match');
 $('wagerJoin').onsubmit=e=>{
  e.preventDefault();
  if(wagerBusy)return;
  const code=$('wagerCodeInput').value.trim().toUpperCase(),w=wagerData?.match;
  if(!/^[A-F0-9]{10}$/.test(code)||!w||!w.coded||w.state!=='offer'||w.host===wagerData.me){
   wagerText('No hay una sala válida. Revisa el código y actualiza si acaban de crearla.','No valid room. Check the code and refresh if it was just created.');renderWager();return;
  }
  if(w.stake&&!window.confirm(tr('¿Entrar y reservar '+w.stake+' JJ?','Join and reserve '+w.stake+' JJ?')))return;
  wagerRequest('join',{p_circuit:code,p_stake:w.stake});
 };
 $('wagerRefresh').onclick=()=>{wagerMessage=[];wagerRequest();};
 $('wagerClose').onclick=()=>$('wager').close();
 $('wagerForm').onsubmit=e=>{
  e.preventDefault();
  const stake=Number($('wagerStake').value);
  if(!Number.isInteger(stake)||stake<0||stake>1000||wagerBusy)return;
  const selectedCircuit=$('wagerCircuit').value;
  if(stake&&!window.confirm(tr('¿Proponer una apuesta de '+stake+' JJ por jugador?','Offer a wager of '+stake+' JJ per player?')))return;
  const terms=[stake,selectedCircuit].join(':');
  if(wagerOfferId?.terms!==terms)wagerOfferId={terms,id:crypto.randomUUID()};
  wagerRequest('room_offer',{p_id:wagerOfferId.id,p_stake:stake,p_circuit:selectedCircuit});
 };
 setInterval(()=>{if($('wager').open)wagerRequest();},12000);
}
