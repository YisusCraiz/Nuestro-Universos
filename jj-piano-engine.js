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
 function game(notes,difficulty){const states=notes.map(()=>0),events=[];let perfect=0,good=0,wrong=0,combo=0,maxCombo=0;const win=windows[difficulty];
  function expire(t){for(let i=0;i<notes.length;i++)if(!states[i]&&notes[i].t<t-win){states[i]=3;combo=0;}}
  return {notes,states,events,press(t,l){t=Math.max(0,Math.round(t));if(events.length>=12000||l<0||l>3)return 'ignored';expire(t);events.push([t,l]);let idx=-1,distance=win+1;
   for(let i=0;i<notes.length;i++)if(!states[i]&&notes[i].l===l){const d=Math.abs(t-notes[i].t);if(d<distance){distance=d;idx=i;}}
   if(idx<0){wrong++;combo=0;return 'wrong';}const p=distance<=Math.floor(win/2);states[idx]=p?1:2;p?perfect++:good++;maxCombo=Math.max(maxCombo,++combo);return p?'perfect':'good';
  },tick:expire,get combo(){return combo;},result(){const score=Math.max(0,perfect*100+good*70-wrong*10),accuracy=Math.min(10000,Math.floor(score*100/notes.length));return {perfect,good,wrong,miss:notes.length-perfect-good,score,accuracy,combo:maxCombo,grade:accuracy>=9700?'S':accuracy>=9000?'A':accuracy>=7500?'B':accuracy>=6000?'C':'D'};}};
 }
 return {chart,game,windows};
})();
if(typeof module!=='undefined')module.exports=PianoEngine;
