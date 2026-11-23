'use strict';

const SONG_DEDICATION='hecho por Jesús para Julissa';
const SONG_ARTIST='JxJ';
const SONG_DEFAULT_COVER='assets/icon-512.png';
let songDownloadInProgress=false;

async function songDownloadBlob(url){
  const response=await fetch(url,{referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('Could not fetch song media');
  return response.blob();
}

async function songCoverJpeg(blob){
  // JPEG covers work in players that cannot display WebP or animated artwork.
  const url=URL.createObjectURL(blob);
  try{
    const image=new Image();
    await new Promise((resolve,reject)=>{
      image.onload=resolve;
      image.onerror=reject;
      image.src=url;
    });
    const scale=Math.min(1,1024/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    const context=canvas.getContext('2d');
    context.fillStyle='#171424';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(image,0,0,canvas.width,canvas.height);
    return await new Promise((resolve,reject)=>canvas.toBlob(
      jpeg=>jpeg?resolve(jpeg):reject(Error('Could not encode cover')),'image/jpeg',.9
    ));
  }finally{
    URL.revokeObjectURL(url);
  }
}

async function rawSongMp3(blob){
  // Skip existing ID3v2 metadata while keeping the MPEG audio frames byte-for-byte.
  let offset=0;
  while(offset+10<=blob.size){
    const h=new Uint8Array(await blob.slice(offset,offset+10).arrayBuffer());
    if(h[0]!==0x49||h[1]!==0x44||h[2]!==0x33)break;
    if(h[3]<2||h[3]>4||h.subarray(6).some(byte=>byte>127))return null;
    const size=h.subarray(6).reduce((result,byte)=>result*128+byte,0);
    offset+=10+size+(h[3]===4&&(h[5]&16)?10:0);
  }
  const h=new Uint8Array(await blob.slice(offset,offset+4).arrayBuffer());
  const mp3=h.length===4&&h[0]===255&&(h[1]&224)===224
    &&(h[1]&24)!==8&&(h[1]&6)===2&&(h[2]&240)!==240&&(h[2]&12)!==12;
  if(!mp3)return null;
  const tail=blob.size>=offset+128?await blob.slice(-128,-125).text():'';
  return blob.slice(offset,tail==='TAG'?blob.size-128:blob.size);
}

function convertSongMp3(buffer){
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('jj-music-download-worker.js?v=1',document.baseURI));
    const timer=setTimeout(()=>finish(new Error('Audio conversion timed out')),180000);
    function finish(error,mp3){
      clearTimeout(timer);
      worker.terminate();
      if(error)reject(error);
      else resolve(new Blob([mp3],{type:'audio/mpeg'}));
    }
    worker.onmessage=({data})=>data.mp3?finish(null,data.mp3):finish(new Error('Audio conversion failed'));
    worker.onerror=()=>finish(new Error('Audio converter could not load'));
    worker.onmessageerror=()=>finish(new Error('Could not receive converted audio'));
    worker.postMessage(buffer,[buffer]);
  });
}

function songId3Unicode(text){
  const buffer=new Uint8Array(2+text.length*2);
  buffer.set([255,254]);
  const view=new DataView(buffer.buffer);
  for(let i=0;i<text.length;i++)view.setUint16(2+i*2,text.charCodeAt(i),true);
  return buffer;
}

function songId3Frame(id,...parts){
  const data=new Blob(parts);
  const header=new Uint8Array(10);
  header.set(new TextEncoder().encode(id));
  new DataView(header.buffer).setUint32(4,data.size);
  return new Blob([header,data]);
}

function tagSongMp3(audio,cover,title){
  const titleFrame=songId3Frame('TIT2',Uint8Array.of(1),songId3Unicode(title));
  const artistFrame=songId3Frame('TPE1',Uint8Array.of(0),SONG_ARTIST);
  const commentFrame=songId3Frame('COMM',Uint8Array.of(1,115,112,97),
    songId3Unicode(''),Uint8Array.of(0,0),songId3Unicode(SONG_DEDICATION));
  const coverFrame=songId3Frame('APIC',Uint8Array.of(0),'image/jpeg',Uint8Array.of(0,3,0),cover);
  const size=titleFrame.size+artistFrame.size+commentFrame.size+coverFrame.size;
  // The ID3v2.3 tag size is sync-safe, while individual frame sizes are ordinary integers.
  const header=Uint8Array.of(73,68,51,3,0,0,(size>>>21)&127,(size>>>14)&127,(size>>>7)&127,size&127);
  return new Blob([header,titleFrame,artistFrame,commentFrame,coverFrame,audio],{type:'audio/mpeg'});
}

async function downloadSong(button,post){
  if(post?.kind!=='music'||!post.audio_path||!state.profile||!ensureLive())return;
  if(songDownloadInProgress){
    toast(say('Ya se está preparando una canción.','A song is already being prepared.'));
    return;
  }
  const owner=state.profile.id;
  const current=()=>state.profile?.id===owner&&button.isConnected;
  const title=String(post.title??'').replace(/\0/g,'').trim()||say('Canción','Song');
  const base=title.replace(/\.(mp3|m4a|wav|ogg|flac)$/i,'').replace(/[<>:"/\\|?*\x00-\x1f]/g,' ')
    .replace(/\s+/g,' ').slice(0,100).trim().replace(/\.+$/,'')||say('Canción','Song');
  const label=button.innerHTML;
  songDownloadInProgress=true;
  button.disabled=true;
  button.setAttribute('aria-busy','true');
  button.textContent=say('Preparando descarga…','Preparing download…');
  try{
    const [audioUrl,coverUrl]=await Promise.all([
      mediaUrl(post.audio_path,true),
      post.image_path?mediaUrl(post.image_path,true):SONG_DEFAULT_COVER
    ]);
    if(!current())return;
    const [audio,cover]=await Promise.all([
      songDownloadBlob(audioUrl),
      songDownloadBlob(coverUrl).then(songCoverJpeg)
    ]);
    if(!current())return;
    const mp3=await rawSongMp3(audio)??await convertSongMp3(await audio.arrayBuffer());
    if(!current())return;
    const url=URL.createObjectURL(tagSongMp3(mp3,cover,title));
    const link=document.createElement('a');
    link.href=url;
    link.download=base+'.mp3';
    document.body.append(link);
    try{link.click();}
    finally{
      link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    }
  }catch{
    if(current())toast(say('No se pudo preparar la descarga. Inténtalo de nuevo.','Could not prepare the download. Try again.'));
  }finally{
    songDownloadInProgress=false;
    button.disabled=false;
    button.removeAttribute('aria-busy');
    button.innerHTML=label;
  }
}
