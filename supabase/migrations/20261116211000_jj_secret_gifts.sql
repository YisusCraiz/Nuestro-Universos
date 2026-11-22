begin;
create table public.jj_secret_gifts (
 id uuid primary key default gen_random_uuid(),
 code text not null unique check (code ~ '^[A-Z0-9-]{6,36}$'),
 recipient uuid not null references auth.users(id),
 title text not null check (length(title) between 1 and 120),
 body text not null check (length(body) between 1 and 16000),
 theme text not null check (theme in ('anniversary','christmas','surprise')),
 attachment text,
 card text references jj_collect.catalog(id),
 opens_at timestamptz,
 enabled boolean not null default false,
 redeemed_at timestamptz
);
alter table public.jj_secret_gifts enable row level security;
revoke all on public.jj_secret_gifts from public, anon, authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('jj-secret-gifts','jj-secret-gifts',false,20971520,array['image/png','image/jpeg','image/webp','application/pdf','audio/mpeg','audio/wav','video/mp4']);
create policy jj_secret_upload on storage.objects for insert to authenticated
with check (bucket_id='jj-secret-gifts' and public.is_jesus() and (storage.foldername(name))[1]=auth.uid()::text);
create function public.jj_secret_can_read(p_name text) returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce(public.is_jesus(),false) or exists (
   select 1 from public.jj_secret_gifts
   where attachment=p_name and recipient=auth.uid() and redeemed_at is not null
 );
$$;
revoke all on function public.jj_secret_can_read(text) from public,anon;
grant execute on function public.jj_secret_can_read(text) to authenticated;
create policy jj_secret_read on storage.objects for select to authenticated
using (bucket_id='jj-secret-gifts' and public.jj_secret_can_read(name));

create function public.jj_secret_gifts_api(p_action text, p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 me uuid := auth.uid();
 admin boolean := coalesce(public.is_jesus(),false);
 gift public.jj_secret_gifts;
 draft_id uuid;
 target uuid;
 gift_code text;
 file_path text;
 card_id text;
begin
 if me is null or public.is_member() is distinct from true then
   raise exception 'GIFT_UNAVAILABLE';
 end if;
 if p_action='list' then
   return jsonb_build_object('admin',admin,'gifts',coalesce((
     select jsonb_agg(case when admin then to_jsonb(g)
       else to_jsonb(g)-'code'-'recipient' end order by g.redeemed_at desc nulls last,g.title)
     from public.jj_secret_gifts g
     where admin or (g.recipient=me and g.redeemed_at is not null)
   ),'[]'::jsonb));
 end if;
 if p_action='save' and admin then
   draft_id := nullif(p_data->>'id','')::uuid;
   if draft_id is not null then
     select * into gift from public.jj_secret_gifts where id=draft_id for update;
     if not found or gift.redeemed_at is not null then raise exception 'GIFT_LOCKED'; end if;
   end if;
   select id into strict target from public.profiles where handle='julisa';
   gift_code := coalesce(gift.code,nullif(upper(trim(p_data->>'code')),''),upper(replace(gen_random_uuid()::text,'-','')));
   file_path := nullif(p_data->>'attachment','');
   if file_path is not null and not exists (
     select 1 from storage.objects where bucket_id='jj-secret-gifts' and name=file_path and (storage.foldername(name))[1]=me::text
   ) then raise exception 'INVALID_ATTACHMENT'; end if;
   card_id := nullif(trim(p_data->>'card'),'');
   insert into public.jj_secret_gifts(id,code,recipient,title,body,theme,attachment,card,opens_at,enabled)
   values (coalesce(draft_id,gen_random_uuid()),gift_code,target,trim(p_data->>'title'),trim(p_data->>'body'),
     p_data->>'theme',file_path,card_id,nullif(p_data->>'opens_at','')::timestamptz,coalesce((p_data->>'enabled')::boolean,false))
   on conflict(id) do update set title=excluded.title,body=excluded.body,theme=excluded.theme,attachment=excluded.attachment,
     card=excluded.card,opens_at=excluded.opens_at,enabled=excluded.enabled
   returning * into gift;
   return to_jsonb(gift);
 end if;
 if p_action not in ('preview','redeem') then raise exception 'GIFT_UNAVAILABLE'; end if;
 select * into gift from public.jj_secret_gifts
 where code=upper(trim(p_data->>'code')) and recipient=me for update;
 if not found then raise exception 'GIFT_UNAVAILABLE'; end if;
 if gift.redeemed_at is null then
   if not gift.enabled or gift.opens_at>now() then raise exception 'GIFT_UNAVAILABLE'; end if;
   if p_action='preview' then
     return jsonb_build_object('theme',gift.theme,'redeemed',false);
   end if;
   if gift.card is not null then
     insert into jj_collect.inventory(owner,card,origin) values(me,gift.card,'secret_gift');
     insert into jj_collect.discoveries(user_id,card) values(me,gift.card) on conflict do nothing;
   end if;
   update public.jj_secret_gifts set redeemed_at=now() where id=gift.id returning * into gift;
 end if;
 return to_jsonb(gift)-'code'-'recipient';
end;
$$;
revoke all on function public.jj_secret_gifts_api(text,jsonb) from public,anon;
grant execute on function public.jj_secret_gifts_api(text,jsonb) to authenticated;
commit;
