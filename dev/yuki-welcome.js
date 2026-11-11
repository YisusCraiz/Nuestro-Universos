const bucket = () => db.storage.from('yuki-welcome');
const welcome = async () => (await rpc('yuki_welcome')) || rpc('yuki_welcome_recording');
const formats = {
 mp3:'audio/mpeg', m4a:'audio/mp4', wav:'audio/wav',
 ogg:'audio/ogg', webm:'audio/webm', aac:'audio/aac'
};

export function welcomeEditor() {
 const form=document.createElement('form');
 form.className='stack';
 const title=document.createElement('h3');
 title.textContent=say('Audio de bienvenida','Welcome voice note');
 const fileLabel=document.createElement('label');
 fileLabel.textContent=say('Elige tu grabación · hasta 10 MB','Choose a recording · up to 10 MB');
 const file=document.createElement('input');
 file.type='file';
 file.accept='.mp3,.m4a,.wav,.ogg,.webm,.aac';
 file.required=true;
 fileLabel.append(file);
 const subtitleLabel=document.createElement('label');
 subtitleLabel.textContent=say('Texto en inglés para Julie (opcional)','English text for Julie (optional)');
 const subtitle=document.createElement('textarea');
 subtitle.maxLength=1800;
 subtitle.rows=3;
 subtitleLabel.append(subtitle);
 const save=document.createElement('button');
 save.className='btn secondary';
 save.textContent=say('Guardar bienvenida','Save welcome note');
 const status=document.createElement('p');
 status.setAttribute('role','status');
 form.append(title,fileLabel,subtitleLabel,save,status);
 let previous;
 save.disabled=true;
 welcome().then(data=>{
  previous=data;
  if(data){
   subtitle.value=data.subtitle_en;
   status.textContent=say('Ya hay un audio guardado. Puedes reemplazarlo aquí.','A welcome note is saved. You can replace it here.');
  }
 }).catch(()=>{status.textContent=say('No se pudo comprobar el audio guardado.','Could not check the saved recording.');})
 .finally(()=>{save.disabled=false;});

 form.onsubmit=async event=>{
  event.preventDefault();
  const recording=file.files[0];
  const extension=recording?.name.split('.').pop().toLowerCase();
  if(!recording?.size || !Object.hasOwn(formats,extension) || recording.size>10485760){
   status.textContent=say('Usa MP3, M4A, WAV, OGG, WEBM o AAC de hasta 10 MB.','Choose an MP3, M4A, WAV, OGG, WEBM or AAC file up to 10 MB.');
   return;
  }
  const path=crypto.randomUUID()+'.'+extension;
  save.disabled=true;
  status.textContent=say('Subiendo tu audio…','Uploading your voice note…');
  try{
   const {error}=await bucket().upload(path,recording,{contentType:formats[extension]});
   if(error)throw error;
   const saved=await rpc('yuki_welcome',{p_path:path,p_subtitle_en:subtitle.value.trim()});
   const old=previous;
   previous=saved;
   file.value='';
   status.textContent=say('Audio listo. Escúchalo al final del ensayo.','Voice note ready. Listen at the end of the rehearsal.');
   if(old?.path && old.path!==saved.path)await bucket().remove([old.path]);
  }catch{
   status.textContent=say('No se pudo confirmar el guardado. Puedes reintentar.','Could not confirm the save. Please try again.');
  }finally{save.disabled=false;}
 };
 return form;
}

export async function addWelcomeAudio(container) {
 try{
  const data=await welcome();
  if(!(data?.path||data?.embedded)||!container.isConnected)return;
  const area=document.createElement('div');
  const button=document.createElement('button');
  button.className='btn secondary';
  button.textContent=say('Escuchar a Jesús','Listen to Jesús');
  const audio=document.createElement('audio');
  audio.controls=true;
  audio.preload='none';
  audio.hidden=true;
  audio.dataset.yukiRoomAudio='';
  audio.setAttribute('aria-label',say('Bienvenida de Jesús','Jesús’s welcome'));
  button.onclick=async()=>{
   button.disabled=true;
   try{
    let source;
    if(data.embedded){
     const recording=await rpc('yuki_welcome_recording',{p_include_audio:true});
     if(!recording?.audio)throw Error('Missing recording');
     source='data:audio/mp4;base64,'+recording.audio.replace(/\s/g,'');
    }else{
     const {data:signed,error}=await bucket().createSignedUrl(data.path,900);
     if(error)throw error;
     source=signed.signedUrl;
    }
    if(!container.isConnected)return;
    audio.src=source;
    audio.hidden=false;
    button.hidden=true;
    await audio.play().catch(()=>{});
   }catch{
    button.textContent=say('Reintentar audio','Retry audio');
   }finally{button.disabled=false;}
  };
  area.append(button,audio);
  if(data.subtitle_en){
   const details=document.createElement('details');
   const summary=document.createElement('summary');
   summary.textContent=say('Leer el mensaje en inglés','Read the message');
   const text=document.createElement('p');
   text.lang='en';
   text.textContent=data.subtitle_en;
   details.append(summary,text);
   area.append(details);
  }
  container.append(area);
 }catch{/* The celebration still works without the optional recording. */}
}
