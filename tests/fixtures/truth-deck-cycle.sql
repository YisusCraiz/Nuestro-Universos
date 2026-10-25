begin;
do $test$
declare u uuid; a uuid; b uuid; r jsonb; picked text; seen text[]; n integer; mode boolean;
begin
 select id into a from public.profiles order by handle limit 1;
 select id into b from public.profiles where id<>a limit 1;
 if a is null or b is null then raise exception 'Two profiles required'; end if;
 foreach mode in array array[false,true] loop
  delete from public.truth_members;
  update public.truth_room set card_id=null,turn_user=a,seen_card_ids='{}' where id=1;
  perform set_config('request.jwt.claim.sub',a::text,true);
  perform public.truth_action('join',mode);
  perform set_config('request.jwt.claim.sub',b::text,true);
  perform public.truth_action('join',mode);
  seen:='{}';
  select count(*) into n from public.truth_cards where tier='gentle' or mode;
  for i in 1..n loop
   select turn_user into u from public.truth_room where id=1;
   perform set_config('request.jwt.claim.sub',u::text,true);
   r:=public.truth_action('draw',mode);
   picked:=r#>>'{card,id}';
   if picked is null or picked=any(seen) then raise exception 'Repeated card at draw %',i; end if;
   if not mode and r#>>'{card,tier}'<>'gentle' then raise exception 'Flirty without consent';end if;
   seen:=array_append(seen,picked);
   perform public.truth_action('skip',mode);
  end loop;
  select turn_user into u from public.truth_room where id=1;
  perform set_config('request.jwt.claim.sub',u::text,true);
  r:=public.truth_action('draw',mode);
  if r#>>'{card,id}'=seen[n] then raise exception 'Immediate repeat at reshuffle';end if;
 end loop;
end $test$;
rollback;
