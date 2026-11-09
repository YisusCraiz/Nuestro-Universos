const wallSlots = new Set(['wall','poster','poster2','display']);
const shelfSlots = new Set(['frame','player']);
const bedSlots = new Set(['plush','pillow']);
const clamp = (value, min, max) => Math.max(min,Math.min(max,value));

export function mountLayout(scene, { current, read, saved, repaint, status, canStart }) {
 const toolbar=document.createElement('div');
 toolbar.className='yr-layout';
 toolbar.hidden=true;
 const actions=document.createElement('div');
 const hint=document.createElement('p');
 hint.setAttribute('aria-live','polite');
 const guide=document.createElement('div');
 guide.className='yr-layout-guide';
 guide.hidden=true;
 scene.prepend(guide);
 const button=(es,en,action)=>{
  const control=document.createElement('button');
  control.type='button';
  control.className='yr-action';
  control.textContent=say(es,en);
  control.onclick=action;
  actions.append(control);
  return control;
 };
 toolbar.append(actions,hint);
 scene.closest('.yr-stage').after(toolbar);
 let draft=null,history=[],drag=null,busy=false;
 const editing=()=>draft!==null;
 const start=button('Editar cuarto','Edit room',()=>{
  if(!canStart())return;
  draft={...read()};
  history=[];
  repaint();
 });
 const undo=button('Deshacer','Undo',()=>{
  if(!history.length)return;
  draft=history.pop();
  repaint();
 });
 const reset=button('Restaurar distribución','Restore layout',()=>{
  history.push(draft);
  draft={};
  repaint();
 });
 const save=button('Guardar','Save',async()=>{
  if(busy||drag||!editing())return;
  busy=true;
  refresh();
  try{
   const {data,error}=await db.rpc('yuki_save_layout',{p_layout:draft});
   if(error)throw error;
   if(!current())return;
   draft=null;
   history=[];
   saved(data);
   repaint();
   status.textContent=say('Distribución guardada.','Room layout saved.');
  }catch{
   if(current())hint.textContent=say('No se pudo guardar. Tus cambios siguen aquí para reintentar.','Could not save. Your changes are still here to retry.');
  }finally{
   busy=false;
   refresh();
  }
 });
 const cancel=button('Cancelar','Cancel',()=>{
  draft=null;
  history=[];
  repaint();
 });

 function refresh(){
  toolbar.hidden=false;
  scene.toggleAttribute('data-layout-editing',editing());
  start.hidden=editing();
  start.disabled=!canStart();
  for(const control of [undo,reset,save,cancel])control.hidden=!editing();
  undo.disabled=busy||!!drag||!history.length;
  reset.disabled=busy||!!drag||!Object.keys(draft||{}).length;
  save.disabled=cancel.disabled=busy||!!drag;
  hint.hidden=!editing();
 }
 function position(item,point){
  if(point){
   item.style.left=point.x+'%';
   item.style.top=point.y+'%';
  }else{
   item.style.removeProperty('left');
   item.style.removeProperty('top');
  }
 }
 function zoneFor(item){
  const {slot,item:id}=item.dataset;
  if(wallSlots.has(slot)||id==='shelf-cloud')return 'wall';
  if(shelfSlots.has(slot))return 'shelf';
  if(bedSlots.has(slot))return 'bed';
  return 'floor';
 }
 function pointFor(item,x,y){
  const bounds=scene.getBoundingClientRect();
  const object=item.getBoundingClientRect();
  const half=object.width/bounds.width*50;
  const height=object.height/bounds.height*100;
  const zone=zoneFor(item);
  const ranges={wall:[5,94,13,58],shelf:[31,51,46,55],bed:[57,84,57,77],floor:[5,95,67,96]};
  const [left,right,top,bottom]=ranges[zone];
  const nextX=clamp(x,Math.max(half,left),Math.min(100-half,right));
  const seam=nextX<19?80-nextX:nextX>71?61+(nextX-71)*.94:61;
  const nextY=clamp(y,Math.max(height+2,zone==='floor'?seam+6:top),bottom);
  return {item:item.dataset.item,x:Math.round(nextX*10)/10,y:Math.round(nextY*10)/10};
 }
 function apply(item){
  const {slot,item:id}=item.dataset;
  const point=(draft||read())[slot];
  if(point?.item===id&&Number.isFinite(point.x)&&Number.isFinite(point.y))position(item,point);
  if(editing()&&!item.hasAttribute('data-preview')){
   item.tabIndex=0;
   item.setAttribute('aria-label',say('Mover ','Move ')+(item.dataset.name||id));
  }
 }
 function begin(){
  if(!editing())return;
  hint.textContent=say('Arrastra un objeto dentro de su guía. También puedes usar las flechas del teclado.','Drag an object within its guide. You can also use the arrow keys.');
  refresh();
 }
 function commit(item,point){
  history.push(draft);
  draft={...draft,[item.dataset.slot]:point};
  position(item,point);
  refresh();
 }
 function down(event){
  if(!editing()||busy||drag||event.button!==0)return;
  const item=event.target.closest('.yr-decor:not([data-preview])');
  if(!item)return;
  event.preventDefault();
  const rect=item.getBoundingClientRect();
  drag={item,id:event.pointerId,dx:rect.left+rect.width/2-event.clientX,dy:rect.bottom-event.clientY,point:null};
  scene.setPointerCapture(event.pointerId);
  item.dataset.dragging='';
  guide.dataset.zone=zoneFor(item);
  guide.hidden=false;
  refresh();
 }
 function move(event){
  if(!drag||event.pointerId!==drag.id)return;
  const rect=scene.getBoundingClientRect();
  const x=(event.clientX+drag.dx-rect.left)/rect.width*100;
  const y=(event.clientY+drag.dy-rect.top)/rect.height*100;
  drag.point=pointFor(drag.item,x,y);
  position(drag.item,drag.point);
 }
 function end(event){
  if(!drag||event.pointerId!==drag.id)return;
  const {item,point}=drag;
  drag=null;
  delete item.dataset.dragging;
  guide.hidden=true;
  if(event.type==='pointerup'&&point)commit(item,point);
  else{
   position(item,null);
   apply(item);
   refresh();
  }
 }
 function keys(event){
  if(!editing()||busy||drag)return;
  const item=event.target.closest('.yr-decor:not([data-preview])');
  const delta={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[event.key];
  if(!item||!delta)return;
  event.preventDefault();
  const rect=scene.getBoundingClientRect();
  const object=item.getBoundingClientRect();
  commit(item,pointFor(item,(object.left+object.width/2-rect.left)/rect.width*100+delta[0],(object.bottom-rect.top)/rect.height*100+delta[1]));
 }
 const blockClick=event=>{
  if(editing()&&event.target.closest('.yr-decor,.yr-actor')){
   event.preventDefault();
   event.stopImmediatePropagation();
  }
 };
 scene.addEventListener('pointerdown',down);
 scene.addEventListener('pointermove',move);
 scene.addEventListener('pointerup',end);
 scene.addEventListener('pointercancel',end);
 scene.addEventListener('lostpointercapture',end);
 scene.addEventListener('keydown',keys);
 scene.addEventListener('click',blockClick,true);
 return {apply,editing,refresh,begin,dragging:()=>!!drag};
}
