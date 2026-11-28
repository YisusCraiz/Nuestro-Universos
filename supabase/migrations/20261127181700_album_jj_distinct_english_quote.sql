update jj_collect.catalog
set data=jsonb_set(data,'{dedication_en}',to_jsonb('Even after dreaming up a thousand characters, I still love how we talk when it’s just us.'::text))
where id='nu-560' and data->>'dedication_en'='We can imagine a thousand characters and still enjoy talking as ourselves.';
