begin;
create table if not exists public.yuki_poster_assets (
 id text primary key references public.yuki_catalog(id),
 image bytea not null
);
alter table public.yuki_poster_assets enable row level security;
revoke all on table public.yuki_poster_assets from public, anon, authenticated;

create or replace function public.yuki_poster_images()
returns jsonb language plpgsql stable security definer set search_path = ''
as $photos$
begin
 if not coalesce(public.yuki_access(),false) then
  raise exception 'FORBIDDEN' using errcode='42501';
 end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',id,'image',encode(image,'base64')) order by id)
  from public.yuki_poster_assets),'[]'::jsonb);
end;
$photos$;
revoke all on function public.yuki_poster_images() from public, anon;
grant execute on function public.yuki_poster_images() to authenticated;

insert into public.yuki_catalog(id,kind,slot,es,en,price)
values
 ('sofa-velvet','decor','sofa','Sillón de terciopelo','Velvet sofa',340),
 ('sofa-cream','decor','sofa','Butaca crema','Cream armchair',290),
 ('room-tv','decor','tv','Televisión de videoclips','Music video TV',480),
 ('guitar-electric','decor','instrument','Guitarra eléctrica estelar','Starlight electric guitar',290),
 ('guitar-acoustic','decor','instrument','Guitarra acústica floral','Floral acoustic guitar',260),
 ('room-piano-rose','decor','instrument','Piano rosa de salón','Rose parlor piano',390),
 ('room-katanas','decor','display','Exhibidor de katanas','Katana display',310),
 ('winter-plush-jj-reno','decor','plush','Peluches de Julie Santa y Yisus reno','Santa Julie and reindeer Yisus plushies',320),
 ('winter-plush-st-reno','decor','plush','Peluches de Sarai Santa y Tobey reno','Santa Sarai and reindeer Tobey plushies',320),
 ('winter-plush-jj-knit','decor','plush','Peluches navideños de Yisus y Julie','Yisus and Julie Christmas plushies',320),
 ('winter-plush-st-knit','decor','plush','Peluches navideños de Sarai y Tobey','Sarai and Tobey Christmas plushies',320),
 ('outfit-casual','outfit','outfit','Sudadera casual','Casual hoodie',360),
 ('outfit-aesthetic','outfit','outfit','Conjunto con boina','Beret outfit',420),
 ('outfit-dress','outfit','outfit','Vestido lila','Lavender dress',460),
 ('photo-poster-01','decor','poster','Póster · Navidad de Jesús y Julissa','Poster · Jesús and Julissa at Christmas',180),
 ('photo-poster-02','decor','poster','Póster · Navidad entre cuatro','Poster · Christmas with friends',180),
 ('photo-poster-03','decor','poster','Póster · Our Spooky Season I','Poster · Our Spooky Season I',180),
 ('photo-poster-04','decor','poster','Póster · Our Spooky Season II','Poster · Our Spooky Season II',180),
 ('photo-poster-05','decor','poster','Póster · No abras esa caja','Poster · Do not open that box',180),
 ('photo-poster-06','decor','poster','Póster · The Chocolate Spell','Poster · The Chocolate Spell',180),
 ('photo-poster-07','decor','poster','Póster · The Kitchen Ghost','Poster · The Kitchen Ghost',180),
 ('photo-poster-08','decor','poster','Póster · Mi regalo favorito','Poster · My favorite gift',180),
 ('photo-poster-09','decor','poster','Póster · Octubre contigo','Poster · October with you',180)
on conflict(id) do nothing;

CREATE OR REPLACE FUNCTION public.yuki_hub(p_action text DEFAULT 'read'::text, p_item text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid(); c public.yuki_catalog; balance bigint; target_slot text; tint_outfit text; tint_key text; tint_mix text;
begin
 if not coalesce(public.yuki_access(),false) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,25));
 insert into public.yuki_home(user_id) values(uid) on conflict do nothing;
 if p_action='dye' then
  if p_item is null or p_item !~ '^[a-z0-9-]+:[0-9a-f]{6}:[0-9a-f]{6}$' then raise exception 'BAD_COLOR'; end if;
  tint_outfit:=split_part(p_item,':',1);
  tint_mix:=substr(p_item,length(tint_outfit)+2);
  tint_key:='dye:'||tint_outfit;
  if tint_outfit='uniform' or not exists(
   select 1 from public.yuki_inventory i join public.yuki_catalog k on k.id=i.item
   where i.user_id=uid and k.kind='outfit' and k.id=tint_outfit
  ) then raise exception 'NOT_OWNED'; end if;
  if not exists(select 1 from public.yuki_inventory where user_id=uid and item=tint_key) then
   balance:=(public.bb_shop()->>'coins')::bigint;
   if balance<120 then raise exception 'INSUFFICIENT_COINS'; end if;
   insert into public.yuki_catalog(id,kind,slot,es,en,price)
   values(tint_key,'decor','dye','Taller de color','Color studio',120) on conflict(id) do nothing;
   insert into public.yuki_inventory(user_id,item,paid) values(uid,tint_key,120);
  end if;
  update public.yuki_home set decor=jsonb_set(decor,array[tint_key],to_jsonb(tint_mix)) where user_id=uid;
 elsif p_action in('buy','equip','remove') then
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
  if not found or c.slot='dye' then raise exception 'BAD_ITEM'; end if;
  if p_action='buy' and c.id<>'uniform' and not exists(select 1 from public.yuki_inventory where user_id=uid and item=c.id) then
   balance:=(public.bb_shop()->>'coins')::bigint;
   if balance<c.price then raise exception 'INSUFFICIENT_COINS'; end if;
   insert into public.yuki_inventory(user_id,item,paid) values(uid,c.id,c.price);
  end if;
  if p_action='equip' then
   if c.id<>'uniform' and not exists(select 1 from public.yuki_inventory where user_id=uid and item=c.id) then raise exception 'NOT_OWNED'; end if;
   if c.kind='outfit' then update public.yuki_home set outfit=c.id where user_id=uid;
   elsif c.slot='poster' then
    select case
      when decor->>'poster'=c.id then 'poster'
      when decor->>'poster2'=c.id then 'poster2'
      when decor->>'poster' is null then 'poster'
      when decor->>'poster2' is null then 'poster2'
     end into target_slot from public.yuki_home where user_id=uid;
    if target_slot is null then raise exception 'POSTER_LIMIT'; end if;
    update public.yuki_home set decor=jsonb_set(decor,array[target_slot],to_jsonb(c.id)) where user_id=uid;
   else update public.yuki_home set decor=jsonb_set(decor,array[c.slot],to_jsonb(c.id)) where user_id=uid; end if;
  elsif p_action='remove' then
   if c.kind<>'decor' then raise exception 'BAD_ITEM'; end if;
   update public.yuki_home set decor=decor-c.slot where user_id=uid and decor->>c.slot=c.id;
   if c.slot='poster' then
    update public.yuki_home set decor=decor-'poster2' where user_id=uid and decor->>'poster2'=c.id;
   end if;
  end if;
 elsif p_action<>'read' then raise exception 'BAD_ACTION'; end if;
 return jsonb_build_object('coins',(public.bb_shop()->>'coins')::bigint,'outfit',(select outfit from public.yuki_home where user_id=uid),'decor',(select decor from public.yuki_home where user_id=uid),'owned',jsonb_build_array('uniform')||coalesce((select jsonb_agg(item order by item) from public.yuki_inventory where user_id=uid),'[]'),'catalog',(select jsonb_agg(to_jsonb(x) order by kind,price,id) from public.yuki_catalog x where x.slot not in ('vinyl','dye')));
end $function$;

commit;
