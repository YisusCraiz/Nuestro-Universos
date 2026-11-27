do $$
declare
  definition text := pg_get_functiondef('jj_anniversary_private.play(text,text,integer)'::regprocedure);
  opening text := $opening$now() >= '2026-12-11 00:00:00 America/Matamoros'::timestamptz$opening$;
begin
  if strpos(definition, opening) = 0 then
    if strpos(definition, 'available boolean := true;') > 0 then return; end if;
    raise exception 'Could not locate the anniversary opening date';
  end if;
  execute replace(definition, opening, 'true');
end $$;
