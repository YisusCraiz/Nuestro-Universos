-- Reuse the existing season, wallet, ownership and equip rules for the new releases.
insert into public.bb_skins(id, price) values
  ('christmas-lights', 6),
  ('christmas-delivery-elf', 7),
  ('christmas-snowman', 8)
on conflict (id) do nothing;

insert into public.jj_pet_catalog(id, price, skin) values
  ('christmas-carrot', 180, 'christmas-snowman'),
  ('christmas-sparky', 200, 'christmas-lights'),
  ('christmas-slippy', 170, 'christmas-delivery-elf'),
  ('christmas-cookie', 190, 'christmas-delivery-elf')
on conflict (id) do nothing;
