'use strict';
const BombitasSession=(()=>{
 function settings(value={}){const clamp=(n,min,max,fallback)=>Number.isInteger(+n)?Math.max(min,Math.min(max,+n)):fallback;return {seconds:clamp(value.seconds,30,600,120),wins:clamp(value.wins,1,10,5)};}
 // A short tap survives animation frames and packet loss until the game acknowledges it.
 function outbox(){let next=0;const pending=[];return {tap(){if(pending.length<8)pending.push(++next);return next;},peek(){return pending[0]||0;},ack(id){while(pending.length&&pending[0]<=id)pending.shift();},clear(){pending.length=0;},size(){return pending.length;}};}
 function inbox(){let last=0;return {consume(id,fn){if(!Number.isSafeInteger(id)||id<=last)return null;const result=fn();last=id;return {id,result};},last(){return last;}};}
 function snapshots(){let last=-1;return {accept(packet){if(!Number.isSafeInteger(packet?.revision)||packet.revision<=last)return false;last=packet.revision;return true;}};}
 function canStart(model,matchOver){return !model||matchOver;}
 return {settings,outbox,inbox,snapshots,canStart};
})();
if(typeof module!=='undefined')module.exports=BombitasSession;
