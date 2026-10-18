const fs=require('node:fs'),assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');
(async()=>{const pg=new PGlite();await pg.exec(`
create role anon;create role authenticated;create schema auth;create schema storage;
create table auth.users(id uuid primary key);create table public.profiles(id uuid primary key,handle text);
create function auth.uid() returns uuid language sql stable as $$select current_setting('request.jwt.claim.sub',true)::uuid$$;
create function public.is_member() returns boolean language sql security definer as $$select exists(select 1 from public.profiles where id=auth.uid())$$;
create function public.jj_dashboard() returns jsonb language sql as $$select '{"coins":20}'::jsonb$$;
create table public.section_visibility(section text primary key,visible boolean);create table public.bb_inventory(user_id uuid,skin text,paid integer);create table public.bb_skins(id text,price integer);
create table public.bb_equipped(user_id uuid primary key,skin text);
create table public.bb_wagers(host uuid,guest uuid,host_ok boolean,guest_ok boolean,amount integer,state text,expires timestamptz);
create table public.bb_coin_transfers(user_id uuid,delta integer);
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(bucket_id text,name text);alter table storage.objects enable row level security;
create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
grant usage on schema public,auth,storage to authenticated;grant select on public.profiles to authenticated;
insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
insert into public.profiles values('11111111-1111-4111-8111-111111111111','jesus'),('22222222-2222-4222-8222-222222222222','julisa');
`);await pg.exec(fs.readFileSync('supabase/27-universo.sql','utf8'));
const user='11111111-1111-4111-8111-111111111111';await pg.exec(`select set_config('request.jwt.claim.sub','${user}',false);set role authenticated;`);
const wallet=async()=> (await pg.query('select public.universe_titles() as data')).rows[0].data;
assert.equal((await wallet()).coins,20);await pg.exec("select public.universe_titles('equip','moon')");assert.equal((await wallet()).coins,12);await pg.exec("select public.universe_titles('equip','moon')");assert.equal((await wallet()).coins,12);
await assert.rejects(pg.exec("select public.universe_titles('equip','fake')"));
await pg.exec(`insert into public.universe_comics(owner_id,owner_handle,title,pages) values('${user}','jesus','Capítulo 1',array['${user}/page'])`);
await assert.rejects(pg.exec(`insert into public.universe_comics(owner_id,owner_handle,title,pages) values('${user}','julisa','Falso',array['${user}/page'])`));
await assert.rejects(pg.exec(`insert into public.universe_comics(owner_id,owner_handle,title,pages) values('${user}','jesus','Falso',array['other/page'])`));
await pg.exec("reset role;select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);set role authenticated;");
assert.equal((await pg.query('select * from public.universe_comics')).rows.length,1);assert.equal((await pg.query("update public.universe_comics set title='Changed' returning id")).rows.length,0);
assert.equal((await wallet()).coins,20);console.log('PASS: title debit, idempotence, shared wallet, invalid title, comic ownership, path validation, shared reading, unauthorized edit.');await pg.close();})();


