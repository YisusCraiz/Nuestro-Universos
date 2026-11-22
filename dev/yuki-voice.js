export function mountVoice(current) {
 let player, request=0, speech;
 const cache=new Map();
 function stop() {
  request++;
  if(player){player.pause();player=null;}
  if(speech){window.speechSynthesis?.cancel();speech=null;}
 }
 function device(text, language, onError) {
  if(!window.speechSynthesis || !window.SpeechSynthesisUtterance){onError();return;}
  speech=new SpeechSynthesisUtterance(text);
  speech.lang=language==='en'?'en-US':'es-MX';
  speech.pitch=1.12;
  speech.rate=1.04;
  speech.onerror=event=>{if(!['interrupted','canceled'].includes(event.error))onError();};
  window.speechSynthesis.speak(speech);
 }
 async function play(text, language, onError, turnId) {
  stop();
  const token=request;
  if(!turnId){device(text,language,onError);return;}
  const cacheKey=turnId+':'+language;
  try {
   let src=cache.get(cacheKey);
   if(!src){
    const {data,error}=await db.functions.invoke('yuki-chat',{body:{action:'voice',turnId,language}});
    if(error || !(data instanceof Blob) || !data.size)throw Error('voice');
    if(!current() || token!==request)return;
    src=URL.createObjectURL(new Blob([data],{type:'audio/mpeg'}));
    cache.set(cacheKey,src);
    if(cache.size>12){
     const oldest=cache.keys().next().value;
     URL.revokeObjectURL(cache.get(oldest));
     cache.delete(oldest);
    }
   }
   if(!current() || token!==request)return;
   player=new Audio(src);
   await player.play();
  } catch {
   if(current() && token===request)device(text,language,onError);
  }
 }
 return {play,stop,close(){
  stop();
  for(const url of cache.values())URL.revokeObjectURL(url);
  cache.clear();
 }};
}
