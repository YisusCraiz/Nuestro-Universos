begin;
alter table public.universe_comics add column if not exists title_en text not null default '' check(length(title_en)<=120);
alter table public.universe_comics add column if not exists page_text jsonb not null default '{}'::jsonb check(jsonb_typeof(page_text)='object' and octet_length(page_text::text)<=2097152);
-- New catalog rows use existing skins; wallet, levels and income remain server-authoritative.
insert into public.jj_pet_catalog(id,price,skin) values
('halloween-ghost',180,'pajamas'),('halloween-skeleton',220,'casual'),
('halloween-pumpkin',200,'witch'),('halloween-bat',190,'devil'),('halloween-cat',240,'cat')
on conflict(id) do nothing;
commit;
