insert into public.yuki_catalog (id,kind,slot,es,en,price) values
('nu-album','decor','frame','ÁlbumJJ de colección','Collectible AlbumJJ',240),
('nu-piano','decor','shelf','PianoJJ de sobremesa','PianoJJ miniature',350),
('nu-letters','decor','frame','Cartas para Julie','Letters for Julie',160),
('nu-comics','decor','shelf','Biblioteca de nuestros cómics','Our comic library',280),
('nu-arcade','decor','shelf','Mini arcade de J&J','J&J mini arcade',390),
('nu-vinyl','decor','wall','Nuestro disco romántico','Our romantic record',230),
('nu-crown','decor','frame','Corona de campeones JJ','JJ champions crown',260),
('nu-constellation','decor','poster','Constelación de nuestro universo','Our universe constellation',210),
('nu-anniversary','decor','frame','Recuerdo del día 11','Day 11 keepsake',180),
('nu-gamepad','decor','pillow','Cojín de nuestras partidas','Our game nights cushion',190)
on conflict (id) do nothing;