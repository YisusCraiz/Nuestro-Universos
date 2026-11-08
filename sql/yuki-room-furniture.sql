insert into public.yuki_catalog(id,kind,slot,es,en,price)
values
 ('bed-lavender','decor','bed','Cama lavanda de estrellas','Lavender starlight bed',390),
 ('bed-rose','decor','bed','Cama rosa de ensueño','Rose dream bed',390),
 ('shelf-walnut','decor','shelf','Repisa de nogal','Walnut shelf',230),
 ('shelf-cloud','decor','shelf','Repisa lavanda','Lavender shelf',230),
 ('cabinet-rose','decor','cabinet','Cajonera rosa','Rose dresser',270),
 ('cabinet-lilac','decor','cabinet','Cajonera lila','Lilac dresser',270),
 ('jj-poster-stars','decor','poster','Póster estelar de Jesús y Julie','Jesús and Julie starlight poster',240),
 ('pajamas-rose','outfit','outfit','Pijama de estrellas rosa','Rose star pajamas',450),
 ('pajamas-mint','outfit','outfit','Pijama de estrellas menta','Mint star pajamas',450),
 ('pajamas-blue','outfit','outfit','Pijama de estrellas azul','Blue star pajamas',450)
on conflict(id) do nothing;
