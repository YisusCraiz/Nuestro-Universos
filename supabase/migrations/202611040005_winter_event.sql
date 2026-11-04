begin;
create table public.jj_winter_event(
 id int primary key check(id=1) default 1,
 revealed boolean not null default false,
 stage int not null default 0 check(stage between 0 and 5),
 hunt int not null default 0 check(hunt between 0 and 3),
 bridge text[] not null default array['star','moon','snow','bell'],
 bridge_ready uuid[] not null default '{}',
 lights int not null default 0 check(lights between 0 and 5),
 final_ready uuid[] not null default '{}',
 revision int not null default 0,
 completed_at timestamptz
);
insert into public.jj_winter_event(id) values(1);
create table public.jj_winter_players(
 user_id uuid primary key references public.profiles(id),
 joined_at timestamptz not null default now(),
 page int not null default 0 check(page between 0 and 5),
 read_at timestamptz
);
alter table public.jj_winter_event enable row level security;
alter table public.jj_winter_players enable row level security;
revoke all on public.jj_winter_event,public.jj_winter_players from public,anon,authenticated;

create function public.jj_winter(p_action text default 'read',p_step int default null,p_value text default null,p_revision int default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare e public.jj_winter_event%rowtype;me public.profiles%rowtype;
 actors text[]:=array['jesus','julisa','jesus'];
 answers text[]:=array['moon','snow','bell'];
 light_actors text[]:=array['jesus','julisa','jesus','julisa','jesus'];
 light_answers text[]:=array['bell','star','moon','snow','star'];
begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;
 select * into me from public.profiles where id=auth.uid();
 if me.handle not in ('jesus','julisa') then raise exception 'NOT_MEMBER';end if;
 select * into e from public.jj_winter_event where id=1 for update;
 if p_action='reveal' then
  if me.handle<>'jesus' then raise exception 'OWNER_ONLY';end if;
  update public.jj_winter_event set revealed=true,revision=revision+1 where id=1 and not revealed;
 elsif p_action='read' then null;
 elsif not e.revealed then raise exception 'EVENT_HIDDEN';
 elsif p_action='join' then
  insert into public.jj_winter_players(user_id) values(me.id) on conflict do nothing;
 elsif not exists(select 1 from public.jj_winter_players where user_id=me.id) then raise exception 'JOIN_FIRST';
 elsif p_action='start' then
  if e.stage=0 then
   if (select count(*) from public.jj_winter_players p join public.profiles u on u.id=p.user_id where u.handle in ('jesus','julisa'))<>2 then raise exception 'WAIT_PARTNER';end if;
   update public.jj_winter_event set stage=1,revision=revision+1 where id=1;
  end if;
 elsif p_action='hunt' then
  if e.stage<>1 or p_step is distinct from e.hunt then raise exception 'EVENT_CHANGED';end if;
  if me.handle<>actors[e.hunt+1] then raise exception 'PARTNER_TURN';end if;
  if p_value is distinct from answers[e.hunt+1] then raise exception 'TRY_AGAIN';end if;
  update public.jj_winter_event set hunt=hunt+1,stage=case when hunt=2 then 2 else 1 end,revision=revision+1 where id=1;
 elsif p_action='swap' then
  if e.stage<>2 or p_revision is distinct from e.revision then raise exception 'EVENT_CHANGED';end if;
  if p_step is null or p_step not between 1 and 3 then raise exception 'BAD_SLOT';end if;
  update public.jj_winter_event set bridge[p_step]=e.bridge[p_step+1],bridge[p_step+1]=e.bridge[p_step],bridge_ready='{}',revision=revision+1 where id=1;
 elsif p_action='bridge_ready' then
  if e.stage<>2 or p_revision is distinct from e.revision then raise exception 'EVENT_CHANGED';end if;
  if e.bridge<>array['moon','bell','star','snow'] then raise exception 'TRY_BRIDGE';end if;
  if not(me.id=any(e.bridge_ready)) then
   update public.jj_winter_event set bridge_ready=array_append(bridge_ready,me.id),
    stage=case when cardinality(bridge_ready)=1 then 3 else 2 end,revision=revision+1 where id=1;
  end if;
 elsif p_action='light' then
  if e.stage<>3 or p_step is distinct from e.lights then raise exception 'EVENT_CHANGED';end if;
  if me.handle<>light_actors[e.lights+1] then raise exception 'PARTNER_TURN';end if;
  if p_value is distinct from light_answers[e.lights+1] then raise exception 'TRY_AGAIN';end if;
  update public.jj_winter_event set lights=lights+1,revision=revision+1 where id=1;
 elsif p_action='charge' then
  if e.stage<>3 or e.lights<>5 then raise exception 'EVENT_CHANGED';end if;
  if not(me.id=any(e.final_ready)) then
   update public.jj_winter_event set final_ready=array_append(final_ready,me.id),
    stage=case when cardinality(final_ready)=1 then 4 else 3 end,revision=revision+1 where id=1;
  end if;
 elsif p_action='page' then
  if e.stage<>4 then raise exception 'EVENT_CHANGED';end if;
  if p_step is null or p_step not between 0 and 5 then raise exception 'BAD_PAGE';end if;
  update public.jj_winter_players set page=greatest(page,p_step)
   where user_id=me.id and p_step<=page+1 and read_at is null;
 elsif p_action='finish' then
  if e.stage not in(4,5) then raise exception 'EVENT_CHANGED';end if;
  update public.jj_winter_players set read_at=coalesce(read_at,now()) where user_id=me.id and page=5;
  if e.stage=4 and (select count(*) from public.jj_winter_players p join public.profiles u on u.id=p.user_id where u.handle in('jesus','julisa') and read_at is not null)=2 then
   update public.app_settings set season='christmas',updated_at=now() where id=1;
   update public.jj_winter_event set stage=5,completed_at=now(),revision=revision+1 where id=1;
  end if;
 else raise exception 'BAD_ACTION';
 end if;
 select * into e from public.jj_winter_event where id=1;
 if not e.revealed and me.handle<>'jesus' then return jsonb_build_object('revealed',false,'stage',0);end if;
 return to_jsonb(e)||jsonb_build_object('players',(select coalesce(jsonb_agg(jsonb_build_object('id',p.user_id,'handle',u.handle,'page',p.page,'read_at',p.read_at)),'[]') from public.jj_winter_players p join public.profiles u on u.id=p.user_id));
end $$;
revoke all on function public.jj_winter(text,int,text,int) from public,anon;
grant execute on function public.jj_winter(text,int,text,int) to authenticated;
commit;
