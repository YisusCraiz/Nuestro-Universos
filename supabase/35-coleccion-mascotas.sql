-- Run after 34-piano-y-mascotas.sql. Existing prices and purchases are preserved.
begin;
insert into public.jj_pet_catalog(id,price,skin) values
('maneki',220,'cat'),
('samoyed',180,'pajamas'),
('shiba',240,'yukata'),
('inari',480,'kitsune'),
('axolotl',200,'casual'),
('hamster',140,'pajamas'),
('tuxedo',180,'cat'),
('poodle',160,'casual'),
('pigeon',150,'casual'),
('clownfish',190,'sharkshirt'),
('chick',140,'casual'),
('dino',320,'shark'),
('penguin',230,'pajamas'),
('pearl',280,'cat'),
('hoodie',350,'ninja'),
('spaniel',170,'casual'),
('wolf',380,'kitsune'),
('sharkcat',420,'shark'),
('chainsaw',500,'devil')
on conflict(id) do nothing;
commit;
