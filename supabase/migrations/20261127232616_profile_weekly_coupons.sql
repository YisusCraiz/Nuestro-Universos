begin;

create table public.jj_profile_style (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 bio text not null default '' check (char_length(bio) <= 240),
 frame text not null default 'classic' check (frame in ('classic', 'navy', 'gold', 'aurora')),
 medals text[] not null default '{}'
);
alter table public.jj_profile_style enable row level security;
revoke all on public.jj_profile_style from public, anon, authenticated;
grant select on public.jj_profile_style to authenticated;
grant insert (user_id, bio, frame), update (bio, frame) on public.jj_profile_style to authenticated;
create policy profile_style_read on public.jj_profile_style for select to authenticated
 using (public.is_member());
create policy profile_style_insert on public.jj_profile_style for insert to authenticated
 with check (public.is_member() and user_id = (select auth.uid()));
create policy profile_style_update on public.jj_profile_style for update to authenticated
 using (public.is_member() and user_id = (select auth.uid()))
 with check (public.is_member() and user_id = (select auth.uid()));

create function public.jj_save_profile_style(p_bio text, p_frame text) returns void
language sql security invoker set search_path = '' as $$
 insert into public.jj_profile_style (user_id,bio,frame) values (auth.uid(),trim(p_bio),p_frame)
 on conflict (user_id) do update set bio=excluded.bio, frame=excluded.frame;
$$;
revoke all on function public.jj_save_profile_style(text,text) from public, anon;
grant execute on function public.jj_save_profile_style(text,text) to authenticated;

create schema jj_profile;
revoke all on schema jj_profile from public, anon;
grant usage on schema jj_profile to authenticated;
create table jj_profile.coupons (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 week_start date not null,
 percent integer not null check (percent in (10, 20, 30, 50)),
 earned_at timestamptz not null default now(),
 used_at timestamptz,
 used_title text,
 unique (user_id, week_start)
);
alter table jj_profile.coupons enable row level security;
revoke all on jj_profile.coupons from public, anon, authenticated;

create function jj_profile.title_price(p_title text) returns integer
language sql immutable set search_path = '' as $$
 select case p_title when 'novios' then 0 when 'stargazer' then 3 when 'player' then 5 when 'moon' then 8 end;
$$;
revoke all on function jj_profile.title_price(text) from public, anon, authenticated;

-- Share the price list with the original title shop.
create or replace function public.universe_titles(p_action text default 'read', p_title text default 'novios')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 me uuid := auth.uid();
 price integer;
 wallet jsonb;
begin
 if public.is_member() is distinct from true then raise exception 'NOT_MEMBER'; end if;
 perform pg_advisory_xact_lock(hashtextextended(me::text,25));
 if p_action = 'equip' then
  price := jj_profile.title_price(p_title);
  if price is null then raise exception 'BAD_TITLE'; end if;
  if price > 0 and not exists (select 1 from public.universe_title_inventory where user_id=me and title=p_title) then
   wallet := public.bb_shop();
   if (wallet->>'coins')::bigint < price then raise exception 'INSUFFICIENT_COINS'; end if;
   insert into public.universe_title_inventory values (me,p_title,price);
  end if;
  insert into public.universe_equipped_titles values (me,p_title)
   on conflict (user_id) do update set title=excluded.title;
 elsif p_action <> 'read' then raise exception 'BAD_ACTION';
 end if;
 wallet := public.bb_shop();
 return jsonb_build_object(
  'coins',(wallet->>'coins')::bigint,
  'equipped',coalesce((select title from public.universe_equipped_titles where user_id=me),'novios'),
  'owned',coalesce((select jsonb_agg(title) from public.universe_title_inventory where user_id=me),'[]'::jsonb)||'["novios"]'::jsonb,
  'profiles',coalesce((select jsonb_agg(jsonb_build_object('user_id',user_id,'title',title)) from public.universe_equipped_titles),'[]'::jsonb)
 );
end;
$$;

create function jj_profile.hub(p_action text, p_coupon uuid, p_title text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 me uuid := auth.uid();
 week date := public.jj_week();
 alternate boolean := ((week - date '2026-11-23') / 7) % 2 <> 0;
 tasks jsonb;
 required integer;
 completed integer;
 roll integer;
 coupon jj_profile.coupons;
 price integer;
 wallet jsonb;
begin
 if me is null or public.is_member() is distinct from true then raise exception 'NOT_MEMBER'; end if;

 if p_action = 'partner' then
  -- Only settled, recorded VS wagers shared by these two accounts.
  return (select jsonb_build_object('wins',count(*) filter (where winner <> me),
                                  'losses',count(*) filter (where winner = me),
                                  'draws',count(*) filter (where winner is null))
    from (
      select w.winner from public.bb_wagers w
      join public.profiles other on other.id = case when w.host=me then w.guest else w.host end
      where me in (w.host,w.guest) and other.handle in ('jesus','julisa') and w.state='paid' and w.winner is not null
      union all
      select w.winner from jj_golf.wagers w
      join public.profiles other on other.id = case when w.host=me then w.guest else w.host end
      where me in (w.host,w.guest) and other.handle in ('jesus','julisa') and w.state in ('paid','draw')
    ) results);
 end if;

 if p_action = 'redeem' then
  perform pg_advisory_xact_lock(hashtextextended(me::text,25));
  select * into coupon from jj_profile.coupons
   where id=p_coupon and user_id=me and used_at is null for update;
  if not found then raise exception 'COUPON_UNAVAILABLE'; end if;
  price := jj_profile.title_price(p_title);
  if price is null or price <= 0 or exists (
    select 1 from public.universe_title_inventory where user_id=me and title=p_title
  ) then raise exception 'TITLE_NOT_ELIGIBLE'; end if;
  price := greatest(1, price - greatest(1, round(price * coupon.percent / 100.0)::integer));
  wallet := public.bb_shop();
  if (wallet->>'coins')::bigint < price then raise exception 'INSUFFICIENT_COINS'; end if;
  insert into public.universe_title_inventory values (me,p_title,price);
  update jj_profile.coupons set used_at=now(), used_title=p_title where id=coupon.id;
  return public.universe_titles('equip',p_title);
 end if;

 if p_action in ('weekly','claim') then
  with candidates(id, section, progress, target, position) as (
   select m.mission, v.section, m.progress, m.target, v.position
     from public.jj_missions() m
     join (values
      (case when alternate then 'letters3' else 'letter' end,'messages',1),
      (case when alternate then 'playlist' else 'song' end,case when alternate then 'playlists' else 'music' end,2),
      (case when alternate then 'memories3' else 'photo' end,'memories',3),
      (case when alternate then 'variety' else 'games3' end,'games',4),
      ('puzzle','puzzles',5),
      (case when alternate then 'together3' else 'together' end,'truth',6)
     ) v(id,section,position) on m.mission=v.id
   union all
   select 'album_card','collection',count(*)::integer,1,7 from jj_collect.inventory
    where owner=me and origin='pack' and acquired >= (week::timestamp at time zone 'America/Matamoros')
      and acquired < ((week+7)::timestamp at time zone 'America/Matamoros')
  )
  select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'route',c.section,'progress',c.progress,'target',c.target) order by c.position),'[]'),
         least(3,count(*)::integer), count(*) filter (where c.progress >= c.target)::integer
   into tasks, required, completed
   from candidates c left join public.section_visibility s on s.section=c.section
   where public.is_jesus() or s.visible;
  if p_action = 'claim' then
   if required=0 or completed<required then raise exception 'WEEKLY_INCOMPLETE'; end if;
   roll := floor(random()*100)::integer;
   insert into jj_profile.coupons(user_id,week_start,percent)
    values (me,week,case when roll<55 then 10 when roll<83 then 20 when roll<97 then 30 else 50 end)
    on conflict (user_id,week_start) do nothing;
  end if;
  select * into coupon from jj_profile.coupons where user_id=me and week_start=week;
  return jsonb_build_object('tasks',tasks,'required',required,'completed',completed,
      'week_end',week+7,'percent',coupon.percent);
 end if;

 if p_action = 'coupons' then
  return (select coalesce(jsonb_agg(to_jsonb(c)-'user_id' order by c.earned_at desc),'[]')
          from jj_profile.coupons c where c.user_id=me);
 end if;
 raise exception 'BAD_ACTION';
end;
$$;
revoke all on function jj_profile.hub(text,uuid,text) from public, anon;
grant execute on function jj_profile.hub(text,uuid,text) to authenticated;
create function public.jj_profile_hub(p_action text, p_coupon uuid default null, p_title text default null)
returns jsonb language sql security invoker set search_path = '' as $$
 select jj_profile.hub(p_action,p_coupon,p_title);
$$;
revoke all on function public.jj_profile_hub(text,uuid,text) from public, anon;
grant execute on function public.jj_profile_hub(text,uuid,text) to authenticated;

commit;
