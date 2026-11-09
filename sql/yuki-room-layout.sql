create or replace function public.yuki_save_layout(p_layout jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $layout$
declare
 uid uuid:=auth.uid();
 room_decor jsonb;
 item_slot text;
 point jsonb;
 clean jsonb:='{}'::jsonb;
begin
 if not coalesce(public.yuki_access(),false) then
  raise exception 'FORBIDDEN' using errcode='42501';
 end if;
 if jsonb_typeof(p_layout) is distinct from 'object' or length(p_layout::text)>5000 then
  raise exception 'BAD_LAYOUT';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,25));
 select decor into room_decor from public.yuki_home where user_id=uid;
 if not found then raise exception 'ROOM_NOT_FOUND'; end if;

 for item_slot,point in select key,value from jsonb_each(p_layout) loop
  if item_slot not in ('wall','poster','poster2','display','frame','player','shelf','tv','bed','plush','pillow','light','cabinet','instrument','sofa','plant','rug')
   or jsonb_typeof(point) is distinct from 'object'
   or jsonb_typeof(point->'item') is distinct from 'string'
   or jsonb_typeof(point->'x') is distinct from 'number'
   or jsonb_typeof(point->'y') is distinct from 'number'
  then raise exception 'BAD_LAYOUT'; end if;
  if (point->>'x')::numeric not between 0 and 100 or (point->>'y')::numeric not between 0 and 100 then
   raise exception 'BAD_LAYOUT';
  end if;
  if room_decor->>item_slot=point->>'item' then
   clean:=jsonb_set(clean,array[item_slot],jsonb_build_object(
    'item',point->>'item','x',round((point->>'x')::numeric,1),'y',round((point->>'y')::numeric,1)
   ));
  end if;
 end loop;

 update public.yuki_home set decor=jsonb_set(decor,array['layout'],clean) where user_id=uid;
 return clean;
end;
$layout$;
revoke all on function public.yuki_save_layout(jsonb) from public, anon;
grant execute on function public.yuki_save_layout(jsonb) to authenticated;
