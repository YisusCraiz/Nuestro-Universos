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
 files jsonb;
 amount integer;
 active boolean;
 reserve_delta integer;
 card_id text;
begin
 if me is null or public.is_member() is distinct from true then
   raise exception 'GIFT_UNAVAILABLE';
 end if;
 if p_action='mine' then
   return coalesce((
     select jsonb_agg((to_jsonb(g)-'code'-'recipient'-'creator')||jsonb_build_object('sender',case when p.handle='jesus' then 'Yisus' else 'Julie' end) order by g.redeemed_at desc)
     from public.jj_secret_gifts g join public.profiles p on p.id=g.creator
     where g.recipient=me and g.redeemed_at is not null
   ),'[]'::jsonb);
 end if;
 if p_action='list' then
   return jsonb_build_object('admin',admin,'creator',true,'balance',(public.bb_shop()->>'coins')::bigint,'gifts',coalesce((
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
   if p_data ? 'attachments' then
     files := p_data->'attachments';
   elsif draft_id is not null and p_data->>'attachment' is not distinct from gift.attachment then
     files := gift.attachments;
   elsif nullif(p_data->>'attachment','') is not null then
     files := jsonb_build_array(jsonb_build_object('path',p_data->>'attachment'));
   else
     files := '[]'::jsonb;
   end if;
   if jsonb_typeof(files) is distinct from 'array' then raise exception 'INVALID_ATTACHMENT'; end if;
   if exists (
     select 1 from jsonb_array_elements(files) f
     left join storage.objects o on o.bucket_id='jj-secret-gifts' and o.name=f->>'path'
       and (storage.foldername(o.name))[1]=me::text
     where o.name is null or (
       f->>'comic_language' is not null and (
         f->>'comic_language' not in ('es','en') or o.metadata->>'mimetype' is distinct from 'application/pdf'
       )
     )
   ) then raise exception 'INVALID_ATTACHMENT'; end if;
   select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
     'path',f->>'path','name',left(f->>'name',255),'mime',o.metadata->>'mimetype','comic_language',f->>'comic_language'
   )) order by ord),'[]'::jsonb)
   into files from jsonb_array_elements(files) with ordinality as entry(f,ord)
   join storage.objects o on o.bucket_id='jj-secret-gifts' and o.name=f->>'path';
   file_path := files->0->>'path';
   amount := coalesce((p_data->>'coins')::integer,gift.coins,0);
   if amount<0 or (amount>0 and target=me) then raise exception 'INVALID_GIFT_COINS'; end if;
   active := coalesce((p_data->>'enabled')::boolean,false);
   reserve_delta := (case when active then amount else 0 end)
     -(case when gift.enabled then gift.coins else 0 end);
   if reserve_delta<>0 then
     perform pg_advisory_xact_lock(hashtextextended(me::text,25));
     if reserve_delta>0 and reserve_delta>(public.bb_shop()->>'coins')::bigint then
       raise exception 'INSUFFICIENT_GIFT_COINS';
     end if;
   end if;
   card_id := nullif(trim(p_data->>'card'),'');
   insert into public.jj_secret_gifts(id,code,recipient,creator,title,body,theme,attachment,attachments,card,opens_at,enabled,coins,sender_note)
   values (coalesce(draft_id,gen_random_uuid()),gift_code,target,me,trim(p_data->>'title'),trim(p_data->>'body'),
     p_data->>'theme',file_path,files,card_id,nullif(p_data->>'opens_at','')::timestamptz,active,amount,case when p_data ? 'sender_note' then nullif(trim(p_data->>'sender_note'),'') else gift.sender_note end)
   on conflict(id) do update set title=excluded.title,body=excluded.body,theme=excluded.theme,attachment=excluded.attachment,attachments=excluded.attachments,
     card=excluded.card,opens_at=excluded.opens_at,enabled=excluded.enabled,coins=excluded.coins,sender_note=excluded.sender_note
   returning * into gift;
   if reserve_delta<>0 then
     insert into public.jj_money_log(user_id,request,kind,data,jj,result)
     values(me,gen_random_uuid(),'secret_gift_reserve',jsonb_build_object('gift_id',gift.id),-reserve_delta,'{}'::jsonb);
   end if;
   return (to_jsonb(gift)-'creator')||jsonb_build_object('for_self',gift.recipient=me);
 end if;
 if p_action not in ('preview','redeem') then raise exception 'GIFT_UNAVAILABLE'; end if;
 select * into gift from public.jj_secret_gifts
 where code=upper(trim(p_data->>'code')) and recipient=me for update;
 if not found then raise exception 'GIFT_UNAVAILABLE'; end if;
 if gift.redeemed_at is null then
   if not gift.enabled or gift.opens_at>now() then raise exception 'GIFT_UNAVAILABLE'; end if;
   if p_action='preview' then
     return jsonb_build_object('theme',gift.theme,'redeemed',false,'sender_note',gift.sender_note,'sender',(select case when handle='jesus' then 'Yisus' else 'Julie' end from public.profiles where id=gift.creator));
   end if;
   if gift.card is not null then
     insert into jj_collect.inventory(owner,card,origin) values(me,gift.card,'secret_gift');
     insert into jj_collect.discoveries(user_id,card) values(me,gift.card) on conflict do nothing;
   end if;
   if gift.coins>0 then
     perform pg_advisory_xact_lock(hashtextextended(me::text,25));
     insert into public.jj_money_log(user_id,request,kind,data,jj,result)
     values(me,gift.id,'secret_gift_received',jsonb_build_object('gift_id',gift.id),gift.coins,'{}'::jsonb);
   end if;
   update public.jj_secret_gifts set redeemed_at=now() where id=gift.id returning * into gift;
   insert into public.jj_received_comics(recipient,gift_id,selection,language)
   select me,gift.id,f->>'path',f->>'comic_language'
   from jsonb_array_elements(gift.attachments) f
   where f->>'mime'='application/pdf' and f->>'comic_language' in ('es','en')
   on conflict(recipient,gift_id,selection) do nothing;
 end if;
 return (to_jsonb(gift)-'code'-'recipient'-'creator')||jsonb_build_object('sender',(select case when handle='jesus' then 'Yisus' else 'Julie' end from public.profiles where id=gift.creator));
end;
$$;
