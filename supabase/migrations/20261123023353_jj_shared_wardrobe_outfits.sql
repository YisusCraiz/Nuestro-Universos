-- These shared game skins use the existing wardrobe, wallet and equip flow.
insert into public.bb_skins(id, price) values
  ('arcade-neon', 6),
  ('cafe-medianoche', 5),
  ('exploradores-astrales', 8),
  ('dia-de-lluvia', 6)
on conflict (id) do nothing;
