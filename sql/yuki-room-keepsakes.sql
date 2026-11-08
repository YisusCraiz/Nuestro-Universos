insert into public.yuki_catalog (id, kind, slot, es, en, price)
values
  ('jj-poster', 'decor', 'poster', 'Póster chibi J&J', 'J&J chibi poster', 220),
  ('jj-plush', 'decor', 'plush', 'Peluches de Yisus y Julie', 'Yisus and Julie plushies', 320),
  ('jj-polaroid', 'decor', 'frame', 'Polaroid de los dos', 'Polaroid of you two', 150),
  ('jj-lamp', 'decor', 'light', 'Lámpara corazón', 'Heart lamp', 250),
  ('jj-pillow', 'decor', 'pillow', 'Cojín bordado', 'Embroidered cushion', 130)
on conflict (id) do nothing;
