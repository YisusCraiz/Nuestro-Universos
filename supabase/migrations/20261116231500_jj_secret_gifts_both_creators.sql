begin;
alter table public.jj_secret_gifts add column creator uuid references auth.users(id);
update public.jj_secret_gifts set creator=(select id from public.profiles where handle='jesus') where creator is null;
alter table public.jj_secret_gifts alter column creator set not null;
create index jj_secret_gifts_creator_idx on public.jj_secret_gifts(creator);

alter policy jj_secret_upload on storage.objects
with check (bucket_id='jj-secret-gifts' and public.is_member() and (storage.foldername(name))[1]=auth.uid()::text);

create or replace function public.jj_secret_can_read(p_name text) returns boolean
language sql stable security definer set search_path='' as $body$
 select (public.is_member() is true and (storage.foldername(p_name))[1]=auth.uid()::text)
 or exists (
   select 1 from public.jj_secret_gifts
   where attachment=p_name and recipient=auth.uid() and redeemed_at is not null
 );
$body$;
create or replace function public.jj_secret_gifts_api(p_action text, p_data jsonb default '{}'::jsonb)
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
 if p_action='mine' then
   return coalesce((
     select jsonb_agg(to_jsonb(g)-'code'-'recipient'-'creator' order by g.redeemed_at desc)
     from public.jj_secret_gifts g
     where g.recipient=me and g.redeemed_at is not null
   ),'[]'::jsonb);
 end if;
 if p_action='list' then
   return jsonb_build_object('admin',admin,'creator',true,'gifts',coalesce((
     select jsonb_agg((to_jsonb(g)-'creator')||jsonb_build_object('for_self',g.recipient=me)
       order by g.redeemed_at desc nulls last,g.title)
     from public.jj_secret_gifts g
     where g.creator=me
   ),'[]'::jsonb));
 end if;
 if p_action='save' then
   draft_id := nullif(p_data->>'id','')::uuid;
   if draft_id is not null then
     select * into gift from public.jj_secret_gifts where id=draft_id and creator=me for update;
     if not found or gift.redeemed_at is not null then raise exception 'GIFT_LOCKED'; end if;
   end if;
   if draft_id is not null then
     target := gift.recipient;
   elsif p_data->>'recipient'='self' or p_data->>'recipient'=(case when admin then 'jesus' else 'julisa' end) then
     target := me;
   else
     select id into strict target from public.profiles where handle=(case when admin then 'julisa' else 'jesus' end);
   end if;
   gift_code := coalesce(gift.code,nullif(upper(trim(p_data->>'code')),''),upper(replace(gen_random_uuid()::text,'-','')));
   file_path := nullif(p_data->>'attachment','');
   if file_path is not null and not exists (
     select 1 from storage.objects where bucket_id='jj-secret-gifts' and name=file_path and (storage.foldername(name))[1]=me::text
   ) then raise exception 'INVALID_ATTACHMENT'; end if;
   card_id := nullif(trim(p_data->>'card'),'');
   insert into public.jj_secret_gifts(id,code,recipient,creator,title,body,theme,attachment,card,opens_at,enabled)
   values (coalesce(draft_id,gen_random_uuid()),gift_code,target,me,trim(p_data->>'title'),trim(p_data->>'body'),
     p_data->>'theme',file_path,card_id,nullif(p_data->>'opens_at','')::timestamptz,coalesce((p_data->>'enabled')::boolean,false))
   on conflict(id) do update set title=excluded.title,body=excluded.body,theme=excluded.theme,attachment=excluded.attachment,
     card=excluded.card,opens_at=excluded.opens_at,enabled=excluded.enabled
   returning * into gift;
   return (to_jsonb(gift)-'creator')||jsonb_build_object('for_self',gift.recipient=me);
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
 return to_jsonb(gift)-'code'-'recipient'-'creator';
end;
$$;
revoke all on function public.jj_secret_gifts_api(text,jsonb) from public,anon;
grant execute on function public.jj_secret_gifts_api(text,jsonb) to authenticated;
commit;
