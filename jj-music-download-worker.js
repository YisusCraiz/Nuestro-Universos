'use strict';

// Load the verified, single-threaded core only for uploads that need conversion.
const FFMPEG_CORE='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/';
const CORE_SCRIPT_INTEGRITY='sha384-sKfkiFtvUk+vexk+0EUhEh366190/4WpgUAsUvaxEfyg7+E1Zt5Y5hrsU808g8Q9';
const CORE_WASM_INTEGRITY='sha384-U1VDhkPYrM3wTCT4/vjSpSsKqG/UjljYrYCI4hBSJ02svbCkxuCi6U6u/peg5vpW';

async function fetchCore(file,integrity){
  const response=await fetch(FFMPEG_CORE+file,{integrity,credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('Could not load audio converter');
  return response;
}

self.onmessage=async ({data:buffer})=>{
  try{
    const [script,wasmBinary]=await Promise.all([
      fetchCore('ffmpeg-core.js',CORE_SCRIPT_INTEGRITY).then(r=>r.arrayBuffer()),
      fetchCore('ffmpeg-core.wasm',CORE_WASM_INTEGRITY).then(r=>r.arrayBuffer())
    ]);
    const scriptUrl=URL.createObjectURL(new Blob([script],{type:'application/javascript'}));
    try{importScripts(scriptUrl);}
    finally{URL.revokeObjectURL(scriptUrl);}
    const core=await self.createFFmpegCore({wasmBinary});
    core.FS.writeFile('song.input',new Uint8Array(buffer),{canOwn:true});
    const status=core.exec(
      '-hide_banner','-loglevel','error','-protocol_whitelist','file',
      '-format_whitelist','aac,flac,mov,mp4,m4a,3gp,3g2,mj2,mp3,ogg,wav','-i','song.input',
      '-map','0:a:0','-map_metadata','-1','-c:a','libmp3lame','-ac','2','-q:a','2',
      '-id3v2_version','0','-write_id3v1','0','song.mp3'
    );
    if(status!==0)throw Error('Could not encode audio');
    const mp3=core.FS.readFile('song.mp3');
    if(!mp3.byteLength)throw Error('Encoded audio is empty');
    self.postMessage({mp3},[mp3.buffer]);
  }catch{
    self.postMessage({error:true});
  }
};
