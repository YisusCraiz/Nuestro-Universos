do $$
declare
  fn text := pg_get_functiondef('jj_anniversary_private.play(text,text,integer)'::regprocedure);
  marker text := '  if not available then';
begin
  if strpos(fn,marker)=0 then raise exception 'Missing anniversary gate'; end if;
  execute replace(fn,marker,$gate$  if player = 'julisa' and not coalesce((select visible from public.section_visibility where section='flowers'),false) then
    raise exception 'SECTION_HIDDEN';
  end if;
$gate$ || marker);
end $$;
