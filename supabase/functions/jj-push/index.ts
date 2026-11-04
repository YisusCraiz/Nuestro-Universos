import webpush from 'npm:web-push@3.6.7';

// Invoked by Cron, never by the browser. JWT verification is disabled for this
// function only; a separate 256-bit secret authenticates the scheduled caller.
const endpointAllowed = /^https:\/\/(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)\/[^\s]+$/;
async function authorized(value: string, expected: string) {
 const hash = async (v: string) => new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));
 const [a,b]=await Promise.all([hash(value),hash(expected)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0&&expected.length>=32;
}
Deno.serve(async request=>{
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 if(!await authorized(request.headers.get('x-jj-cron-secret')||'',Deno.env.get('JJ_CRON_SECRET')||''))return new Response('Unauthorized',{status:401});
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 const publicKey=Deno.env.get('JJ_VAPID_PUBLIC_KEY'),privateKey=Deno.env.get('JJ_VAPID_PRIVATE_KEY'),subject=Deno.env.get('JJ_VAPID_SUBJECT');
 if(!url||!key||!publicKey||!privateKey||!subject)return new Response('Missing server configuration',{status:503});
 const rpc=async(name:string,args:Record<string,unknown>={})=>{const response=await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Database '+response.status);const text=await response.text();return text?JSON.parse(text):null;};
 let stage='vapid';
 try{
  try { webpush.setVapidDetails(subject.trim(),publicKey.trim(),privateKey.trim()); }
  catch(error) {
   if(!/subject/i.test(String(error))) throw error;
   webpush.setVapidDetails('https://yisuscraiz.github.io/Nuestro-Universos/',publicKey.trim(),privateKey.trim());
  }
  stage='claim';const batch=await rpc('jj_push_claim');stage='delivery';let sent=0,failed=0;
  // Ten concurrent sends cap wall time while leaving enough time to settle leases.
  for(let offset=0;offset<batch.length;offset+=10)await Promise.all(batch.slice(offset,offset+10).map(async(item:any)=>{
   let status=400;
   try{
    if(!endpointAllowed.test(item.endpoint))throw Error('Invalid endpoint');
    // Generate encrypted protocol data, then use native fetch for Deno compatibility.
    const details=webpush.generateRequestDetails({endpoint:item.endpoint,keys:item.keys},JSON.stringify({title:'J & J · Nuestro universo',body:item.body,page:item.page,tag:item.tag}),{TTL:3600,urgency:'normal'});
    const response=await fetch(details.endpoint,{method:'POST',headers:details.headers,body:details.body,redirect:'error',signal:AbortSignal.timeout(10000)});
    status=response.status;await response.body?.cancel();
   }catch{status=503;}
   await rpc('jj_push_finish',{p_id:item.id,p_lease:item.lease,p_status:status});
   if(status>=200&&status<300)sent++;else failed++;
  }));
  return Response.json({claimed:batch.length,sent,failed});
 }catch(error){ // Do not log private endpoints, subscription keys, or content.
  return Response.json({error:'Delivery temporarily unavailable',stage,configurationField:stage==='vapid'?(/subject/i.test(String(error))?'subject':/public/i.test(String(error))?'publicKey':/private/i.test(String(error))?'privateKey':'library'):null},{status:503});
 }
});

