begin;

create schema if not exists jj_anniversary_private;
revoke all on schema jj_anniversary_private from public;
grant usage on schema jj_anniversary_private to authenticated;

create table jj_anniversary_private.progress (
  id integer primary key check (id = 1),
  stage integer not null default 0,
  revision integer not null default 0,
  joined text[] not null default '{}',
  route text,
  sequence_round integer not null default 0,
  sequence_first text not null default substr(md5(random()::text), 1, 4),
  sequence_second text not null default substr(md5(random()::text), 1, 4),
  dance_ready text[] not null default '{}',
  dance_round integer not null default 0,
  dance_start timestamptz,
  scores jsonb not null default '{}',
  comic_read text[] not null default '{}',
  tiles integer[] not null default array[0,0,0,0,0,0],
  puzzle_ready text[] not null default '{}',
  unlocked_at timestamptz
);
insert into jj_anniversary_private.progress (id) values (1);
alter table jj_anniversary_private.progress enable row level security;
revoke all on jj_anniversary_private.progress from public, anon, authenticated;

create function jj_anniversary_private.play(p_action text, p_value text, p_round int)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  player text;
  progress jj_anniversary_private.progress%rowtype;
  available boolean := now() >= '2026-12-11 00:00:00 America/Matamoros'::timestamptz;
  clue text;
  encoded text;
  slot int;
  piece int;
  score int;
  now_ms bigint;
begin
  select handle into player from public.profiles where id = auth.uid() and handle in ('jesus','julisa');
  if player is null or not public.is_member() then raise exception 'NOT_MEMBER'; end if;

  if not available then
    if p_action is distinct from 'read' then raise exception 'ANNIVERSARY_CLOSED'; end if;
    return jsonb_build_object('available',false);
  end if;

  if p_action = 'read' then
    select * into progress from jj_anniversary_private.progress where id = 1;
  else
    select * into progress from jj_anniversary_private.progress where id = 1 for update;
    if p_action = 'join' then
      if not (player = any(progress.joined)) then
        progress.joined := array_append(progress.joined, player);
      end if;
    elsif cardinality(progress.joined) <> 2 then raise exception 'WAIT_PARTNER';
    elsif p_action = 'route' and progress.stage = 0 then
      if p_value is null or p_value not in ('horror','dance','both') then raise exception 'BAD_CHOICE'; end if;
      progress.route := p_value;
      progress.stage := 1;
    elsif p_action = 'sequence' and progress.stage = 1 and p_round = progress.sequence_round then
      if player <> (array['jesus','julisa'])[progress.sequence_round+1] then raise exception 'PARTNER_TURN'; end if;
      encoded := (array[progress.sequence_first,progress.sequence_second])[progress.sequence_round+1];
      if p_value is distinct from translate(encoded, '0123456789abcdef', '0123012301230123') then raise exception 'TRY_SEQUENCE'; end if;
      progress.sequence_round := progress.sequence_round + 1;
      if progress.sequence_round = 2 then progress.stage := 2; end if;
    elsif p_action = 'dance_ready' and progress.stage = 2 and progress.dance_start is null then
      if not (player = any(progress.dance_ready)) then
        progress.dance_ready := array_append(progress.dance_ready, player);
      end if;
      if cardinality(progress.dance_ready) = 2 then
        progress.dance_round := progress.dance_round + 1;
        progress.dance_start := clock_timestamp() + interval '5 seconds';
      end if;
    elsif p_action = 'dance_score' and progress.stage = 2 and p_round = progress.dance_round
        and clock_timestamp() >= progress.dance_start + interval '3.15 seconds' then
      if p_value is null or p_value !~ '^[01]{4}$' then raise exception 'BAD_SCORE'; end if;
      if not (progress.scores ? player) then
        progress.scores := progress.scores || jsonb_build_object(player,p_value);
      end if;
      if progress.scores ?& array['jesus','julisa'] then
        score := bit_count((progress.scores->>'jesus')::bit(4) & (progress.scores->>'julisa')::bit(4));
        if score >= 3 then progress.stage := 3; end if;
        progress.dance_ready := '{}';
        progress.dance_start := null;
        progress.scores := '{}';
      end if;
    elsif p_action = 'dance_retry' and progress.stage = 2 and p_round = progress.dance_round
        and clock_timestamp() >= progress.dance_start + interval '10 seconds' then
      progress.dance_ready := '{}';
      progress.dance_start := null;
      progress.scores := '{}';
    elsif p_action = 'comic' and progress.stage = 3 then
      if not (player = any(progress.comic_read)) then
        progress.comic_read := array_append(progress.comic_read, player);
      end if;
      if cardinality(progress.comic_read) = 2 then progress.stage := 4; end if;
    elsif p_action = 'place' and progress.stage = 4 then
      if p_value is null or p_value !~ '^[1-6]:[1-6]$' then raise exception 'BAD_TILE'; end if;
      piece := split_part(p_value,':',1)::int;
      slot := split_part(p_value,':',2)::int;
      if (piece <= 3) <> (player = 'jesus') then raise exception 'PARTNER_TURN'; end if;
      if progress.tiles[slot] not in (0,piece) then raise exception 'OCCUPIED'; end if;
      if progress.tiles[slot] <> piece then
        progress.tiles := array_replace(progress.tiles,piece,0);
        progress.tiles[slot] := piece;
        progress.puzzle_ready := '{}';
      end if;
    elsif p_action = 'remove' and progress.stage = 4 then
      if p_value is null or p_value !~ '^[1-6]$' then raise exception 'BAD_TILE'; end if;
      piece := p_value::int;
      if (piece <= 3) <> (player = 'jesus') then raise exception 'PARTNER_TURN'; end if;
      progress.tiles := array_replace(progress.tiles,piece,0);
      progress.puzzle_ready := '{}';
    elsif p_action = 'confirm' and progress.stage = 4 then
      if progress.tiles <> array[4,1,5,2,6,3] then raise exception 'TRY_PUZZLE'; end if;
      if not (player = any(progress.puzzle_ready)) then
        progress.puzzle_ready := array_append(progress.puzzle_ready,player);
      end if;
      if cardinality(progress.puzzle_ready) = 2 then
        progress.stage := 5;
        progress.unlocked_at := now();
      end if;
    else raise exception 'EVENT_CHANGED';
    end if;

    progress.revision := progress.revision + 1;
    update jj_anniversary_private.progress as target set
      revision=progress.revision, stage=progress.stage, joined=progress.joined, route=progress.route,
      sequence_round=progress.sequence_round, dance_ready=progress.dance_ready, dance_round=progress.dance_round,
      dance_start=progress.dance_start, scores=progress.scores, comic_read=progress.comic_read,
      tiles=progress.tiles, puzzle_ready=progress.puzzle_ready, unlocked_at=progress.unlocked_at
    where target.id=1;
  end if;

  if progress.stage = 1 and player = (array['julisa','jesus'])[progress.sequence_round+1] then
    encoded := (array[progress.sequence_first,progress.sequence_second])[progress.sequence_round+1];
    clue := translate(encoded, '0123456789abcdef', '0123012301230123');
  end if;
  now_ms := floor(extract(epoch from clock_timestamp())*1000);
  return jsonb_build_object(
    'available',true, 'revision',progress.revision, 'stage',progress.stage, 'joined',progress.joined, 'route',progress.route,
    'sequence_round',progress.sequence_round, 'clue',clue,
    'dance_ready',progress.dance_ready,'dance_round',progress.dance_round,
    'dance_start',floor(extract(epoch from progress.dance_start)*1000), 'server_time',now_ms,
    'submitted',progress.scores ? player, 'comic_read',progress.comic_read,
    'tiles',progress.tiles, 'puzzle_ready',progress.puzzle_ready, 'unlocked_at',progress.unlocked_at
  );
end $$;

revoke all on function jj_anniversary_private.play(text,text,int) from public, anon;
grant execute on function jj_anniversary_private.play(text,text,int) to authenticated;

create function public.jj_anniversary(p_action text default 'read', p_value text default null, p_round int default null)
returns jsonb language sql security invoker set search_path = '' as $$
  select jj_anniversary_private.play(p_action,p_value,p_round);
$$;
revoke all on function public.jj_anniversary(text,text,int) from public, anon;
grant execute on function public.jj_anniversary(text,text,int) to authenticated;
commit;
