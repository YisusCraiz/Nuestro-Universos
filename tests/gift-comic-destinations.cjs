'use strict';
const assert = require('node:assert/strict');
const {readFileSync, readdirSync} = require('node:fs');
const {JSDOM} = require('jsdom');
const {PGlite} = require('@electric-sql/pglite');

const sender = '00000000-0000-4000-8000-000000000001';
const recipient = '00000000-0000-4000-8000-000000000002';
const migrations = 'supabase/migrations/';
const html = readFileSync('regalos-jxj.html', 'utf8');
const script = html.match(/<script>\s*('use strict';[\s\S]+?)<\/script>/)[1];
const nextTurn = () => new Promise(resolve => setTimeout(resolve, 10));
const until = async predicate => {
  for (let tries = 0; tries < 100; tries++) {
    if (predicate()) return;
    await nextTurn();
  }
  assert.fail('Gift page did not reach the expected state');
};
const db = new PGlite();

async function setup() {
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create schema storage;
    create schema jj_collect;
    create table auth.users(id uuid primary key);
    create table public.profiles(id uuid primary key, handle text);
    create function auth.uid() returns uuid language sql stable as
      'select nullif(current_setting(''test.user_id'', true), '''')::uuid';
    create function public.is_member() returns boolean language sql as
      'select exists (select 1 from public.profiles where id=auth.uid())';
    create function public.is_jesus() returns boolean language sql as
      'select exists (select 1 from public.profiles where id=auth.uid() and handle=''jesus'')';
    create function public.bb_shop() returns jsonb language sql as 'select ''{"coins":100}''::jsonb';
    create function storage.foldername(text) returns text[] language sql as 'select string_to_array($1,''/'')';
    create table storage.objects(bucket_id text, name text, metadata jsonb, primary key(bucket_id,name));
    create table public.jj_secret_gifts(
      id uuid primary key, code text unique, recipient uuid, creator uuid, title text, body text, theme text,
      attachment text, attachments jsonb default '[]', card text, opens_at timestamptz,
      enabled boolean, coins integer default 0, redeemed_at timestamptz
    );
    insert into auth.users values ('${sender}'), ('${recipient}');
    insert into public.profiles values ('${sender}', 'jesus'), ('${recipient}', 'julisa');
  `);
  await db.exec(readFileSync(migrations+'20261118021500_jj_gift_presentation_and_private_comics.sql', 'utf8'));
  const migration = readdirSync(migrations).find(file => file.endsWith('_jj_gift_comic_destinations.sql'));
  await db.exec(readFileSync(migrations+migration, 'utf8'));
}

async function asUser(id) {
  await db.query("select set_config('test.user_id', $1, false)", [id]);
}
async function giftRpc(action, data = {}) {
  return (await db.query('select public.jj_secret_gifts_api($1,$2) as result', [action, JSON.stringify(data)])).rows[0].result;
}
async function comics() {
  return (await db.query('select public.jj_received_comics_api() as result')).rows[0].result;
}
function page(hash, id) {
  const {window} = new JSDOM(html, {url:'https://example.test/regalos-jxj.html#'+hash, runScripts:'outside-only'});
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.UNIVERSE_CONFIG = {};
  window.supabase = {createClient: () => ({
    auth:{
      getSession:async () => ({data:{session:{}}}),
      getUser:async () => ({data:{user:{id}}})
    },
    rpc:async (name, args) => {
      try {
        if(name==='jj_secret_gifts_api') return {data:await giftRpc(args.p_action,args.p_data)};
        const {p_gift,p_selection,p_language}=args;
        const {rows}=await db.query('select public.jj_received_comics_api($1,$2,$3) as result',[p_gift,p_selection,p_language]);
        return {data:rows[0].result};
      } catch(error) { return {error}; }
    },
    storage:{from:bucket => ({
      upload:async (path,file,{contentType}) => {
        await db.query('insert into storage.objects values ($1,$2,$3)', [bucket,path,JSON.stringify({mimetype:contentType})]);
        return {};
      },
      createSignedUrl:async () => ({data:{signedUrl:'https://example.test/attachment'}})
    })}
  })};
  window.eval(script);
  return window;
}

(async () => {
  await setup();
  await asUser(sender);
  const editor = page('view=create&lang=es', sender);
  const document = editor.document;
  const button = id => document.getElementById(id);
  await until(() => !button('editor').hidden);
  button('draftNext').click();
  const fields = button('draft').elements;
  fields.title.value = 'Aniversario';
  fields.body.value = 'Un regalo bilingüe';
  const files = [
    new editor.File(['%PDF-'], 'Historia ES.pdf', {type:'application/pdf'}),
    new editor.File(['%PDF-'], 'Story EN.PDF'),
    new editor.File(['%PDF-'], 'Adjunto.pdf', {type:'application/pdf'}),
    new editor.File(['image'], 'Recuerdo.png', {type:'image/png'})
  ];
  Object.defineProperty(fields.file,'files',{value:files});
  fields.file.dispatchEvent(new editor.Event('change'));
  const languages = () => [...button('draftFiles').querySelectorAll('select')];
  assert.equal(languages().length,3);
  for(const [index,language] of ['es','en'].entries()){
    languages()[index].value=language;
    languages()[index].dispatchEvent(new editor.Event('change'));
  }
  button('langEn').click();
  assert.deepEqual(languages().map(select=>select.value),['es','en','']);
  assert.equal(languages()[0].selectedOptions[0].textContent,'Comics · Spanish');
  button('langEs').click();
  button('draftNext').click();
  assert.match(button('reviewDetails').textContent,/Historia ES\.pdf · Cómics · Español/);
  assert.match(button('reviewDetails').textContent,/Story EN\.PDF · Cómics · Inglés/);
  assert.match(button('reviewDetails').textContent,/Adjunto\.pdf · Solo en el regalo/);
  fields.enabled.checked = true;
  button('draftNext').click();
  await until(() => !button('print').hidden && !button('draft').inert);
  const {gifts:[gift]} = await giftRpc('list');
  assert.deepEqual(gift.attachments.map(file=>file.comic_language),['es','en',undefined,undefined]);
  assert.equal(gift.attachments[1].mime,'application/pdf');
  button('resumeEdit').click();
  assert.deepEqual(languages().map(select=>select.value),['es','en','']);
  await assert.rejects(giftRpc('save',{id:gift.id,attachments:[{...gift.attachments[3],comic_language:'en'}]}), /INVALID_ATTACHMENT/);
  await assert.rejects(giftRpc('save',{id:gift.id,attachments:[{...gift.attachments[0],comic_language:'fr'}]}), /INVALID_ATTACHMENT/);
  await assert.rejects(giftRpc('redeem',{code:gift.code}), /GIFT_UNAVAILABLE/);
  editor.close();

  await asUser(recipient);
  const receiver = page('gift='+gift.code+'&lang=en', recipient);
  const received = id => receiver.document.getElementById(id);
  await until(() => !received('gift').hidden);
  assert.equal(received('attachmentLinks').hidden,true);
  assert.deepEqual(await comics(),[]);
  received('openGift').click();
  await until(() => !received('attachmentLinks').hidden);
  assert.deepEqual([...received('attachmentLinks').querySelectorAll('a[href]')].map(link=>link.hash),[
    '#volver-regalos=comics&comic-lang=es', '#volver-regalos=comics&comic-lang=en'
  ]);
  assert.equal(received('attachmentLinks').querySelectorAll('details').length,2);
  await giftRpc('redeem',{code:gift.code});
  const list = await comics();
  assert.equal(list.length,2);
  assert.deepEqual(Object.fromEntries(list.map(item=>[item.language,item.files[0].name])),{es:'Historia ES.pdf',en:'Story EN.PDF'});
  const manual = received('attachmentLinks').querySelectorAll('details')[1];
  manual.querySelector('button').click();
  await until(() => manual.querySelector('a').hidden === false);
  assert.equal((await comics()).length,3);
  await asUser(sender);
  assert.deepEqual(await comics(),[]);
  receiver.close();
  console.log('Gift PDF destinations, redemption, privacy and manual fallback passed');
})().catch(error => {
  console.error(error);
  process.exitCode=1;
}).finally(() => db.close());
