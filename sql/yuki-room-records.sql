begin;

insert into public.yuki_catalog(id,kind,slot,es,en,price)
values
 ('jj-turntable','decor','player','Tocadiscos de Yuki','Yuki’s record player',420),
 ('jj-globe','decor','frame','Esfera de cristal J&J','J&J crystal globe',290),
 ('winter-bauble','decor','poster','Esfera navideña J&J','J&J Christmas bauble',250),
 ('winter-wreath','decor','wall','Corona navideña J&J','J&J Christmas wreath',290),
 ('winter-sleigh','decor','plush','Trineo navideño J&J','J&J Christmas sleigh',360)
on conflict(id) do nothing;

CREATE OR REPLACE FUNCTION public.yuki_hub(p_action text DEFAULT 'read'::text, p_item text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid(); c public.yuki_catalog; balance bigint;
begin
 if not coalesce(public.yuki_access(),false) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,25));
 insert into public.yuki_home(user_id) values(uid) on conflict do nothing;
 if p_action in('buy','equip','remove') then
  if p_item like 'vinyl:%' then
   if p_action <> 'buy' then raise exception 'BAD_ITEM'; end if;
   if not exists(select 1 from public.yuki_inventory where user_id=uid and item='jj-turntable') then
    raise exception 'TURNTABLE_REQUIRED';
   end if;
   if not exists(select 1 from public.posts where id::text=substr(p_item,7) and kind='music' and nullif(audio_path,'') is not null) then
    raise exception 'BAD_ITEM';
   end if;
   insert into public.yuki_catalog(id,kind,slot,es,en,price)
   values(p_item,'decor','vinyl','Vinilo','Record',90) on conflict(id) do nothing;
  end if;
  select * into c from public.yuki_catalog where id=p_item;
  if not found then raise exception 'BAD_ITEM'; end if;
  if p_action='buy' and c.id<>'uniform' and not exists(select 1 from public.yuki_inventory where user_id=uid and item=c.id) then
   balance:=(public.bb_shop()->>'coins')::bigint;
   if balance<c.price then raise exception 'INSUFFICIENT_COINS'; end if;
   insert into public.yuki_inventory(user_id,item,paid) values(uid,c.id,c.price);
  end if;
  if p_action='equip' then
   if c.id<>'uniform' and not exists(select 1 from public.yuki_inventory where user_id=uid and item=c.id) then raise exception 'NOT_OWNED'; end if;
   if c.kind='outfit' then update public.yuki_home set outfit=c.id where user_id=uid;
   else update public.yuki_home set decor=jsonb_set(decor,array[c.slot],to_jsonb(c.id)) where user_id=uid; end if;
  elsif p_action='remove' then
   if c.kind<>'decor' then raise exception 'BAD_ITEM'; end if;
   update public.yuki_home set decor=decor-c.slot where user_id=uid and decor->>c.slot=c.id;
  end if;
 elsif p_action<>'read' then raise exception 'BAD_ACTION'; end if;
 return jsonb_build_object('coins',(public.bb_shop()->>'coins')::bigint,'outfit',(select outfit from public.yuki_home where user_id=uid),'decor',(select decor from public.yuki_home where user_id=uid),'owned',jsonb_build_array('uniform')||coalesce((select jsonb_agg(item order by item) from public.yuki_inventory where user_id=uid),'[]'),'catalog',(select jsonb_agg(to_jsonb(x) order by kind,price,id) from public.yuki_catalog x where x.slot<>'vinyl'));
end $function$;

commit;
