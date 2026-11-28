begin;

create function jj_heist.prize_amount() returns integer
language sql immutable set search_path = '' as $$ select 600 $$;
revoke all on function jj_heist.prize_amount() from public, anon, authenticated;

create or replace function jj_heist.has_prize() returns boolean
language sql volatile set search_path = '' as $$
 select coalesce((
  select (p->>'jj')::bigint >= jj_heist.prize_amount()
  from jsonb_array_elements(jj_rank.read()->'players') p
  where p->>'handle'='jesus'
 ),false);
$$;

create or replace function jj_heist.play(p_action text, p_run uuid, p_revision integer, p_input integer, p_at bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 me uuid := auth.uid();
 keeper uuid;
 prize integer := jj_heist.prize_amount();
 now_ms bigint;
 wall_time timestamptz;
 today date;
 next_day timestamptz;
 last_run jj_heist.runs;
 used integer;
 winner boolean;
 available boolean;
 issue text;
 failure text;
 hit_time bigint;
 x integer;
 y integer;
 nx integer;
 ny integer;
 beam integer;
 elapsed bigint;
 dial_period integer;
 dial_window integer;
 room_details jsonb;
begin
 if me is null or public.is_member() is distinct from true or not exists (
  select 1 from public.profiles where id=me and handle='julisa'
 ) then raise exception 'HEIST_NOT_ALLOWED'; end if;
 if p_action is null or p_action not in ('status','start','tap','move','pulse','leave') then
  raise exception 'HEIST_BAD_ACTION';
 end if;
 select id into strict keeper from public.profiles where handle='jesus';

 perform pg_advisory_xact_lock(hashtextextended(me::text,519));
 wall_time := clock_timestamp();
 now_ms := floor(extract(epoch from wall_time)*1000);
 today := (wall_time at time zone 'America/Matamoros')::date;
 next_day := (today+1)::timestamp at time zone 'America/Matamoros';

 update jj_heist.runs set result='timeout',revision=revision+1
  where player=me and result is null and (game_day<>today or started_ms+60000<=now_ms);
 select * into last_run from jj_heist.runs where player=me and game_day=today order by attempt_no desc limit 1;
 select count(*) filter (where result is distinct from 'funds'), coalesce(bool_or(result='won'),false)
  into used,winner from jj_heist.runs where player=me and game_day=today;

 if p_action='start' and (last_run.id is null or last_run.result is not null) and not winner and used<3 then
  if wall_time+interval '60 seconds'>next_day then
   issue := 'reset';
  else
   perform pg_advisory_xact_lock(hashtextextended(keeper::text,25));
   available := jj_heist.has_prize();
   if available then
    now_ms := floor(extract(epoch from clock_timestamp())*1000);
    if to_timestamp((now_ms+60000)/1000.0)>next_day then
     issue := 'reset';
    else
     insert into jj_heist.runs(player,game_day,started_ms,stage_ms,symbols,gaps,shifts)
     values (me,today,now_ms,now_ms,
      array(select i from generate_series(0,8) i order by random() limit 6),
      array(select floor(random()*5)::integer from generate_series(1,4)),
      array(select floor(random()*2400)::integer from generate_series(1,4)))
     returning * into last_run;
     used := used+1;
    end if;
   end if;
  end if;
 end if;

 if p_action in ('tap','move','pulse','leave') and last_run.id is not null and last_run.result is null then
  if p_run is distinct from last_run.id or p_revision is distinct from last_run.revision then
   issue := 'sync';
  elsif p_action='leave' then
   failure := 'abandoned';
  elsif p_at is null or p_at<now_ms-850 or p_at>now_ms+250 then
   issue := 'connection';
  else
   hit_time := least(p_at,now_ms);
   if p_action='tap' and last_run.stage='memory' and hit_time>=last_run.stage_ms+5100 then
    if p_input is distinct from last_run.symbols[last_run.step+1] then
     failure := 'memory';
    else
     last_run.step := last_run.step+1;
     if last_run.step=6 then
      last_run.stage := 'lasers';
      last_run.stage_ms := now_ms;
      last_run.step := 0;
     end if;
    end if;
   elsif p_action='move' and last_run.stage='lasers' and p_input between 0 and 3 then
    x := last_run.position%5;
    y := last_run.position/5;
    nx := x + case p_input when 1 then 1 when 3 then -1 else 0 end;
    ny := y + case p_input when 0 then -1 when 2 then 1 else 0 end;
    if nx not between 0 and 4 or ny not between 0 and 4 or hit_time<last_run.stage_ms
      or hit_time<coalesce(last_run.last_input_ms+110,0) then
     issue := 'sync';
    else
     beam := greatest(y,ny);
     if y<>ny and x<>last_run.gaps[beam] and (hit_time-last_run.stage_ms+last_run.shifts[beam])%2400>=1050 then
      failure := 'lasers';
     else
      last_run.position := ny*5+nx;
      if last_run.position=2 then
       last_run.stage := 'dial';
       last_run.stage_ms := now_ms+750;
       last_run.phase_offset := floor(random()*1100);
      end if;
     end if;
    end if;
   elsif p_action='pulse' and last_run.stage='dial' and hit_time>=last_run.stage_ms then
    dial_period := (array[2300,1950,1650])[last_run.step+1];
    dial_window := (array[600,510,420])[last_run.step+1];
    elapsed := (hit_time-last_run.stage_ms+last_run.phase_offset)%dial_period;
    if elapsed<floor(dial_period*0.64) or elapsed>=floor(dial_period*0.64)+dial_window then
     failure := 'dial';
    else
     last_run.step := last_run.step+1;
     if last_run.step<3 then
      last_run.stage_ms := now_ms+650;
      last_run.phase_offset := floor(random()*1000);
     else
      perform pg_advisory_xact_lock(hashtextextended(keeper::text,25));
      available := jj_heist.has_prize();
      if available then
       insert into public.jj_money_log(user_id,request,kind,data,jj,result) values
        (keeper,last_run.id,'heist_debit',jsonb_build_object('day',today),-prize,'{}'),
        (me,last_run.id,'heist_prize',jsonb_build_object('day',today),prize,'{}');
       insert into public.jj_inbox(recipient,subject,kind,reference)
        values (keeper,me,'heist',last_run.id::text||':'||prize::text);
       failure := 'won';
       winner := true;
      else
       failure := 'funds';
       used := used-1;
      end if;
     end if;
    end if;
   else
    issue := 'sync';
   end if;
  end if;
  if issue is null then
   update jj_heist.runs set stage=last_run.stage, stage_ms=last_run.stage_ms, step=last_run.step,
    position=last_run.position, phase_offset=last_run.phase_offset, last_input_ms=hit_time,
    result=failure, revision=revision+1 where id=last_run.id returning * into last_run;
  end if;
 end if;

 if (last_run.id is null or last_run.result is not null) and not winner and used<3 and available is null then
  available := jj_heist.has_prize();
 end if;
 now_ms := floor(extract(epoch from clock_timestamp())*1000);
 if last_run.id is not null then
  room_details := jsonb_build_object('id',last_run.id,'revision',last_run.revision,
   'stage',last_run.stage,'stage_ms',last_run.stage_ms,'deadline',last_run.started_ms+60000,
   'result',last_run.result,'step',last_run.step);
  if last_run.result='won' then
   room_details := room_details||jsonb_build_object('paid',(
    select jj from public.jj_money_log where user_id=me and request=last_run.id and kind='heist_prize'
   ));
  end if;
  if last_run.result is null then
   case last_run.stage
    when 'memory' then
     if now_ms<last_run.stage_ms+5100 then
      room_details := room_details||jsonb_build_object('symbols',last_run.symbols);
     end if;
    when 'lasers' then
     room_details := room_details||jsonb_build_object('pos',last_run.position,'gaps',last_run.gaps,'shifts',last_run.shifts);
    when 'dial' then
     room_details := room_details||jsonb_build_object('offset',last_run.phase_offset,
      'period',(array[2300,1950,1650])[last_run.step+1],'window',(array[600,510,420])[last_run.step+1]);
   end case;
  end if;
 end if;

 return jsonb_build_object('server_ms',now_ms,'remaining',3-used,'won',winner,'funded',available,
  'reset',next_day,'issue',issue,'prize',prize,'run',room_details);
end;
$$;

commit;
