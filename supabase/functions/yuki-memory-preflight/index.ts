// Isolated staging preflight. Never sends memory text or calls Gemini.
import { createClient } from 'npm:@supabase/supabase-js@2';

const headers={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type',
  'Access-Control-Allow-Methods':'POST,OPTIONS',
  'Cache-Control':'no-store'
};
const respond=(payload:object,status=200)=>Response.json(payload,{status,headers});

Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response(null,{headers});
  if(request.method!=='POST')return respond({code:'method_not_allowed'},405);
  const authorization=request.headers.get('Authorization')??'';
  const match=/^Bearer (\S+)$/i.exec(authorization);
  if(!match)return respond({code:'unauthorized'},401);
  try{
    const url=Deno.env.get('SUPABASE_URL');
    const key=Deno.env.get('SUPABASE_ANON_KEY');
    if(!url||!key)return respond({code:'configuration_unavailable'},503);
    const db=createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
    const auth=await db.auth.getUser(match[1]);
    if(auth.error||!auth.data.user)return respond({code:'unauthorized'},401);
    const uid=auth.data.user.id;
    const {data:profile,error:profileError}=await db.from('profiles').select('handle').eq('id',uid).single();
    if(profileError||profile?.handle!=='jesus')return respond({code:'forbidden'},403);

    // Return only synthetic-safe counts, not any individual memory or content.
    const [approved,excluded]=await Promise.all([
      db.from('yuki_memory_proposals').select('id',{count:'exact',head:true})
        .eq('owner_id',uid).eq('status','approved').in('visibility',['private','shared']),
      db.from('yuki_memory_proposals').select('id',{count:'exact',head:true})
        .eq('owner_id',uid).eq('status','approved').eq('visibility','surprise')
    ]);
    if(approved.error||excluded.error)return respond({code:'query_unavailable'},503);
    return respond({ok:true,approvedVisibleCount:approved.count??0,excludedSurpriseCount:excluded.count??0,
      geminiUsed:false,memoryTextReturned:false});
  }catch{return respond({code:'internal_error'},503);}
});
