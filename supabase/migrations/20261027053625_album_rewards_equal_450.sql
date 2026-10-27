-- Every album milestone awards the same 450 JJ. Existing claims/history stay intact.
do $balance$
declare original text; patched text;
begin
 original:=pg_get_functiondef('jj_collect.api(text,uuid,jsonb)'::regprocedure);
 if position('bonus:=450;' in original)>0 then return;end if;
 patched:=regexp_replace(original,'bonus:=case total[^;]+end;','bonus:=450;');
 if patched=original or position('bonus:=450;' in patched)=0 then raise exception 'ALBUM_REWARD_RULE_NOT_FOUND';end if;
 execute patched;
end $balance$;
