const fs=require('node:fs'),assert=require('node:assert/strict');
const {fixture:base,HOST,GUEST,OUT,SONG}=require('./piano34.cjs');
const entries=require('../pet-collection-35.json');
async function fixture(){const pg=await base();await pg.exec("insert into public.bb_skins values('casual',0),('pajamas',20),('yukata',20),('ninja',20),('sharkshirt',20) on conflict do nothing");await pg.exec(fs.readFileSync('supabase/35-coleccion-mascotas.sql','utf8'));return pg;}
module.exports={fixture,HOST,GUEST,OUT,SONG};
if(require.main===module)(async()=>{const pg=await fixture();let n=0;const check=x=>{assert.ok(x);n++;};const as=async id=>{await pg.exec('reset role');await pg.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await pg.exec('set role authenticated');};const pets=async(a='read',id=null)=>(await pg.query('select public.jj_pets($1,$2) d',[a,id])).rows[0].d;
await pg.query("insert into public.jj_money_log values($1,gen_random_uuid(),'test','{}',10000,0,'{}',now())",[HOST]);await as(HOST);
let data=await pets(),coins=data.coins;check(Object.keys(data.catalog).length===23);check(data.catalog.cat.price===60&&data.catalog.bunny.price===120);
for(const p of entries){check(data.catalog[p.id].price===p.price&&data.catalog[p.id].skin===p.skin);const after=await pets('buy',p.id);check(after.coins===coins-p.price&&after.equipped===p.id&&after.owned.includes(p.id));coins=after.coins;check((await pets('buy',p.id)).coins===coins);check((await pg.query('select public.bb_shop() d')).rows[0].d.coins===coins);}
check((await pets('equip',null)).equipped===null);check((await pets('equip','inari')).coins===coins);await assert.rejects(pets('buy','fake'));n++;await as(GUEST);check((await pets()).owned.length===0);await assert.rejects(pets('buy','chainsaw'));n++;await assert.rejects(pets('equip','inari'));n++;await assert.rejects(pg.query('select * from public.jj_pet_catalog'));n++;await as(OUT);await assert.rejects(pets());n++;
await pg.exec('reset role');await pg.exec(fs.readFileSync('supabase/35-coleccion-mascotas.sql','utf8'));await as(HOST);data=await pets();check(data.owned.length===19&&data.coins===coins&&data.equipped==='inari');console.log('PASS: '+n+' collection checks: all 19 prices, shared balance, idempotent purchases/migration, ownership, insufficient funds, none and RLS.');await pg.close();})().catch(e=>{console.error(e);process.exitCode=1;});

