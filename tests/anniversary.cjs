'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {PGlite} = require('@electric-sql/pglite');

async function run() {
  const db = new PGlite();
  try {
    const migration = fs.readFileSync(path.join(__dirname,'../supabase/migrations/20261127002000_jj_anniversary.sql'),'utf8');
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create function auth.uid() returns uuid language sql stable as
        $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create table public.profiles(id uuid primary key, handle text not null);
      create function public.is_member() returns boolean language sql stable as
        $$select exists(select 1 from public.profiles where id=auth.uid())$$;
      insert into public.profiles values
        ('00000000-0000-0000-0000-000000000001','jesus'),
        ('00000000-0000-0000-0000-000000000002','julisa'),
        ('00000000-0000-0000-0000-000000000003','guest');
    `);
    await db.exec(migration);
    async function actor(n) {
      await db.exec(`reset role; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000${n}',false); set role authenticated;`);
    }
    async function play(action='read',value=null,round=null) {
      const {rows} = await db.query('select public.jj_anniversary($1,$2,$3) as state',[action,value,round]);
      return rows[0].state;
    }
    await actor(2);
    const {rows:[clock]} = await db.query("select now() >= '2026-12-11 00:00:00 America/Matamoros'::timestamptz as open");
    assert.equal((await play()).available,clock.open);
    if (!clock.open) await assert.rejects(play('join'),/ANNIVERSARY_CLOSED/);
    await assert.rejects(db.exec('select * from jj_anniversary_private.progress'),/permission denied/);
    await db.exec('reset role; set role anon');
    await assert.rejects(play(),/permission denied/);

    const launch = fs.readFileSync(path.join(__dirname,'../supabase/migrations/20261127013000_open_jj_anniversary.sql'),'utf8');
    await db.exec('reset role');
    await db.exec(launch);
    await db.exec(launch);
    await actor(2);
    assert.equal((await play()).available,true);
    await actor(3);
    await assert.rejects(play(),/NOT_MEMBER/);
    await actor(1);
    await play('join');
    await assert.rejects(play('route','both'),/WAIT_PARTNER/);
    await actor(2);
    await play('join');
    let result = await play('route','both');
    assert.equal(result.stage,1);
    assert.equal(result.route,'both');
    const first = result.clue;
    assert.match(first,/^[0-3]{4}$/);
    await assert.rejects(play('sequence',first,0),/PARTNER_TURN/);
    await actor(1);
    assert.equal((await play()).clue,null);
    await assert.rejects(play('sequence','9999',0),/TRY_SEQUENCE/);
    result = await play('sequence',first,0);
    assert.equal(result.sequence_round,1);
    const second = result.clue;
    await actor(2);
    assert.equal((await play('sequence',second,1)).stage,2);

    async function dance(left,right) {
      await actor(1);
      await play('dance_ready');
      await actor(2);
      const start = await play('dance_ready');
      assert.ok(start.dance_start > start.server_time);
      await assert.rejects(play('dance_score',right,start.dance_round),/EVENT_CHANGED/);
      await db.exec("reset role; update jj_anniversary_private.progress set dance_start=clock_timestamp()-interval '5 seconds'");
      await actor(2);
      assert.equal((await play('dance_score',right,start.dance_round)).stage,2);
      await actor(1);
      return play('dance_score',left,start.dance_round);
    }

    result = await dance('1110','1011');
    assert.equal(result.stage,2);
    assert.equal(result.dance_start,null);
    assert.equal((await dance('1111','1011')).stage,3);

    assert.equal((await play('comic')).stage,3);
    await actor(2);
    assert.equal((await play('comic')).stage,4);
    await assert.rejects(play('confirm'),/TRY_PUZZLE/);
    await assert.rejects(play('place','1:1'),/PARTNER_TURN/);
    await play('place','4:2');
    await play('place','4:1');
    await play('place','5:3');
    await play('place','6:5');
    await actor(1);
    await assert.rejects(play('place','1:1'),/OCCUPIED/);
    await play('place','1:2');
    await play('place','2:4');
    await play('place','3:6');
    assert.equal((await play('confirm')).unlocked_at,null);
    await actor(2);
    result = await play('confirm');
    assert.equal(result.stage,5);
    assert.ok(result.unlocked_at);
    await actor(1);
    assert.equal((await play()).unlocked_at,result.unlocked_at);
    console.log('Anniversary: date gate, authenticated roles, two-player turns, rhythm retry, shared puzzle and unlock passed.');
  } finally { await db.close(); }
}
run().catch(error => {console.error(error);process.exitCode=1;});
