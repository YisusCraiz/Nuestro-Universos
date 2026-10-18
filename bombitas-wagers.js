'use strict';
const BombitasWagers=(()=>{
 const active=w=>!!w&&['offered','running'].includes(w.state);
 // JSONB key ordering is not a client contract.
 const sameRules=(a,b)=>a?.seconds===b?.seconds&&a?.wins===b?.wins;
 function create({rpc,user,room,onChange=()=>{},onWallet=()=>{},storage=null,uuid=()=>crypto.randomUUID()}){
  const state={enabled:null,wager:null,busy:false},finished=new Set();let offer=null,pending=null,serial=Promise.resolve();
  const key='bb-pending-wager:'+user;
  try{pending=JSON.parse(storage?.getItem(key)||'null');}catch{}
  const save=()=>{try{if(pending)storage?.setItem(key,JSON.stringify(pending));else storage?.removeItem(key);}catch{}};
  function call(action,args={}){const task=serial.then(()=>perform(action,args));serial=task.catch(()=>{});return task;}
  async function perform(action,args){state.busy=true;onChange();const current=room()?.id||null;try{const result=await rpc('bb_wager',{p_action:action,p_code:room()?.code||'',...args});state.enabled=true;if(result.wager&&!active(result.wager))finished.add(result.wager.id);if(current===(room()?.id||null)){state.wager=result.wager;onWallet(result);}if(pending&&result.wager?.id===pending.id&&!active(result.wager)){pending=null;save();}return result;}catch(e){if(e?.code==='PGRST202'||/does not exist|schema cache|UNSUPPORTED/.test(e?.message||''))state.enabled=false;throw e;}finally{state.busy=false;onChange();}}
  async function refresh(){if(!room()||state.busy)return;return call('read');}
  async function propose(amount,rules){if(!Number.isSafeInteger(amount)||amount<0||amount>2147483647)throw Error('BAD_AMOUNT');if(!offer||offer.amount!==amount||!sameRules(offer.rules,rules)||(state.wager?.id===offer.id&&!active(state.wager)))offer={id:uuid(),amount,rules:{...rules}};return call('propose',{p_id:offer.id,p_amount:amount,p_rules:rules});}
  async function accept(){if(!state.wager)throw Error('WAGER_NOT_FOUND');return call('accept',{p_id:state.wager.id});}
  async function start(amount,rules){if(!amount){if(active(state.wager)&&room()?.id===state.wager.room_id)throw Error('CANCEL_WAGER_FIRST');return null;}const w=state.wager;if(!w||!active(w)||w.amount!==amount||!w.host_ok||!w.guest_ok||!sameRules(w.rules,rules))throw Error('BOTH_MUST_ACCEPT');const result=await call('start',{p_id:w.id,p_rules:rules});if(!result||result.wager?.state!=='running')throw Error('START_NOT_CONFIRMED');return result.wager.id;}
  async function cancel(){if(!active(state.wager))return;return call('cancel',{p_id:state.wager.id});}
  async function settle(id,winner){if(!id||finished.has(id))return;if(state.wager?.id===id&&!active(state.wager))return;pending={id,winner};save();return call('result',{p_id:id,p_winner:winner});}
  async function recover(){if(!pending||state.busy)return;return call('result',{p_id:pending.id,p_winner:pending.winner});}
  function reset(){state.wager=null;offer=null;onChange();}
  return {state,refresh,propose,accept,start,cancel,settle,recover,reset};
 }
 return {active,sameRules,ready:(w,amount,rules)=>!!w&&w.amount===amount&&['offered','running'].includes(w.state)&&w.host_ok&&w.guest_ok&&sameRules(w.rules,rules),create};
})();
if(typeof module!=='undefined')module.exports=BombitasWagers;
