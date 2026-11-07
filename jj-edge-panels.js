'use strict';

function fitEdgePanel(panel){
 const header=panel.querySelector('header');
 const viewport=window.visualViewport;
 let position=null,drag=null,frame=0;

 function layout(){
  if(panel.hidden){position=null;return;}
  const x=viewport?.offsetLeft||0,y=viewport?.offsetTop||0;
  const width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
  panel.style.setProperty('--edge-view-width',width+'px');
  panel.style.setProperty('--edge-view-height',height+'px');
  panel.style.setProperty('--edge-view-right',Math.max(0,window.innerWidth-x-width)+'px');
  panel.style.setProperty('--edge-view-bottom',Math.max(0,window.innerHeight-y-height)+'px');
  panel.classList.toggle('edge-compact',height<420);
  if(position){
   const bounds=getComputedStyle(panel);
   const left=x+parseFloat(bounds.getPropertyValue('--edge-safe-left'));
   const top=y+parseFloat(bounds.getPropertyValue('--edge-safe-top'));
   const right=x+width-parseFloat(bounds.getPropertyValue('--edge-safe-right'));
   const bottom=y+height-parseFloat(bounds.getPropertyValue('--edge-safe-bottom'));
   panel.style.left=Math.max(left,Math.min(position.x,right-panel.offsetWidth))+'px';
   panel.style.top=Math.max(top,Math.min(position.y,bottom-panel.offsetHeight))+'px';
   panel.style.right='auto';
   panel.style.bottom='auto';
  }
  const focused=document.activeElement;
  if(panel.classList.contains('edge-compact')&&focused?.matches('textarea')&&panel.contains(focused)){
   const bottom=panel.getBoundingClientRect().bottom;
   const fieldBottom=focused.getBoundingClientRect().bottom;
   if(fieldBottom>bottom)panel.scrollTop+=fieldBottom-bottom+8;
  }
 }

 function schedule(){
  if(frame||panel.hidden)return;
  frame=requestAnimationFrame(()=>{frame=0;layout();});
 }
 function reset(){
  if(!panel.hidden){layout();return;}
  position=null;
  drag=null;
  for(const side of ['top','right','bottom','left'])panel.style.removeProperty(side);
 }

 header.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0||e.target.closest('button'))return;
  const rect=panel.getBoundingClientRect();
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:rect.left,top:rect.top};
  header.setPointerCapture(e.pointerId);
 });
 header.addEventListener('pointermove',e=>{
  if(drag?.id!==e.pointerId)return;
  position={x:drag.left+e.clientX-drag.x,y:drag.top+e.clientY-drag.y};
  layout();
 });
 header.addEventListener('lostpointercapture',()=>{drag=null;});
 window.addEventListener('resize',schedule);
 viewport?.addEventListener('resize',schedule);
 viewport?.addEventListener('scroll',schedule);
 if(typeof ResizeObserver==='function')new ResizeObserver(schedule).observe(panel);
 return reset;
}
