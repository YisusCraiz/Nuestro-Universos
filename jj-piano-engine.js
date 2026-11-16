'use strict';
const PianoEngine=(()=>{
 const windows=[0,180,140,105],spacing=[0,500,310,190];
 function chart(samples,rate,duration,difficulty){const hop=Math.max(1,Math.floor(rate*.02)),energy=[];let max=0;
  for(let start=0;start<Math.min(samples.length,duration*rate);start+=hop){let sum=0;for(let j=start;j<Math.min(start+hop,samples.length);j++)sum+=samples[j]*samples[j];const rms=Math.sqrt(sum/hop);energy.push(rms);max=Math.max(max,rms);}
  if(max<.0002)throw Error('SILENT_AUDIO');
  const flux=energy.map((x,i)=>Math.max(0,x-(energy[i-1]||0)));let beat=500,bestCorrelation=0;
  for(let lag=18;lag<=40;lag++){let sum=0;for(let i=lag;i<flux.length;i++)sum+=flux[i]*flux[i-lag];const normalized=sum/Math.max(1,flux.length-lag);if(normalized>bestCorrelation){bestCorrelation=normalized;beat=lag*20;}}
  const times=[],gap=spacing[difficulty],stride=Math.max(gap,Math.round(beat/(difficulty===1?1:difficulty===2?2:3)/20)*20);let last=-gap;
  // Choose a local energy accent near each rhythmic slot. This is an automatic
  // arrangement, not a claim to reproduce the original piano score.
  for(let target=1100;target<duration*1000-650;target+=stride){const center=Math.round(target/20);let best=center,value=-1;
   for(let k=Math.max(1,center-3);k<=Math.min(energy.length-1,center+3);k++){const onset=energy[k]+Math.max(0,energy[k]-energy[k-1])*2;if(onset>value&&k*20-last>=gap){best=k;value=onset;}}
   const t=best*20;if(t-last>=gap){times.push(t);last=t;}
  }return times.map((t,i)=>({t,l:(i*7+Math.floor(i/4))%4}));
 }
 function game(notes,difficulty){const states=notes.map(()=>0),events=[];let perfect=0,good=0,wrong=0,combo=0,maxCombo=0,lastHit=null;const win=windows[difficulty];
  function expire(t){for(let i=0;i<notes.length;i++)if(!states[i]&&notes[i].t<t-win){states[i]=3;combo=0;}}
  return {notes,states,events,press(t,l){lastHit=null;t=Math.max(0,Math.round(t));if(events.length>=12000||l<0||l>3)return 'ignored';expire(t);events.push([t,l]);let idx=-1,distance=win+1;
   for(let i=0;i<notes.length;i++)if(!states[i]&&notes[i].l===l){const d=Math.abs(t-notes[i].t);if(d<distance){distance=d;idx=i;}}
   if(idx<0){wrong++;combo=0;return 'wrong';}const p=distance<=Math.floor(win/2);states[idx]=p?1:2;lastHit=notes[idx];p?perfect++:good++;maxCombo=Math.max(maxCombo,++combo);return p?'perfect':'good';
  },tick:expire,get lastHit(){return lastHit;},get combo(){return combo;},result(){const score=Math.max(0,perfect*100+good*70-wrong*10),accuracy=Math.min(10000,Math.floor(score*100/notes.length));return {perfect,good,wrong,miss:notes.length-perfect-good,score,accuracy,combo:maxCombo,grade:accuracy>=9700?'S':accuracy>=9000?'A':accuracy>=7500?'B':accuracy>=6000?'C':'D'};}};
 }

 // Practice uses local gesture judgement. Ranked runs still use game().
 function practice(notes,difficulty,duration){
  const chart=notes.map((note,index)=>{
   if(index>0&&index%8===3&&note.t+530<duration*1000&&
    !notes.slice(index+1,index+5).some(next=>next.l===note.l&&next.t-note.t<730)){
    return {...note,kind:'hold',end:note.t+500};
   }
   return {...note,kind:index%8===6?'flick':'tap'};
  });
  const states=chart.map(()=>0),pending=new Map(),win=windows[difficulty];
  let perfect=0,good=0,wrong=0,combo=0,best=0,lastHit=null;
  function fail(index){states[index]=3;pending.delete(chart[index].l);combo=0;}
  function award(index,error){
   const note=chart[index],clean=error<=win/2;
   states[index]=clean?1:2;pending.delete(note.l);lastHit=note;
   if(clean)perfect++;else good++;
   best=Math.max(best,++combo);
   return clean?'perfect':'good';
  }
  function tick(t){
   for(const [lane,entry] of pending){
    const note=chart[entry.index];
    if(note.kind==='hold'&&t>=note.end)award(entry.index,entry.error);
    if(note.kind==='flick'&&t>note.t+win)fail(entry.index);
   }
   for(let i=0;i<chart.length;i++){
    if(states[i]===0&&t>chart[i].t+win){states[i]=3;combo=0;}
   }
  }
  function press(t,lane,flick=false){
   tick(t);
   lastHit=null;
   if(pending.has(lane))return 'ignored';
   let index=-1,error=win+1;
   for(let i=0;i<chart.length;i++){
    const diff=Math.abs(t-chart[i].t);
    if(states[i]===0&&chart[i].l===lane&&diff<error){index=i;error=diff;}
   }
   if(index<0){wrong++;combo=0;return 'wrong';}
   const note=chart[index];
   if(note.kind==='tap'||(note.kind==='flick'&&flick))return award(index,error);
   states[index]=4;pending.set(lane,{index,error});
   return note.kind;
  }
  function release(t,lane){
   const entry=pending.get(lane);
   if(!entry)return 'ignored';
   const note=chart[entry.index];
   if(note.kind==='hold'&&t>=note.end-65)return award(entry.index,entry.error);
   fail(entry.index);
   return 'miss';
  }
  function flick(t,lane){
   const entry=pending.get(lane);
   if(!entry||chart[entry.index].kind!=='flick')return 'ignored';
   const error=Math.abs(t-chart[entry.index].t);
   if(error<=win)return award(entry.index,error);
   fail(entry.index);
   return 'miss';
  }
  return {notes:chart,states,press,release,flick,tick,
   get combo(){return combo;},get lastHit(){return lastHit;},
   result(){
    const score=Math.max(0,perfect*100+good*70-wrong*10);
    const accuracy=chart.length?Math.min(10000,Math.floor(score*100/chart.length)):0;
    return {perfect,good,wrong,miss:chart.length-perfect-good,score,accuracy,combo:best,grade:accuracy>=9700?'S':accuracy>=9000?'A':accuracy>=7500?'B':accuracy>=6000?'C':'D'};
   }
  };
 }
 return {chart,game,practice,windows};
})();
if(typeof module!=='undefined')module.exports=PianoEngine;
