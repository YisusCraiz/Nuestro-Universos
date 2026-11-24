'use strict';

// Sticker IDs and sprite coordinates stay fixed so messages replay the same reaction.
const streamStickerPacks = [
  {
    name: 'Jesús', start: 12, src: 'assets/stream-stickers-jesus.webp', width: 1536, height: 1024,
    items: [
      ['Pánico gamer', 'Gamer panic', [12,96,293,363]],
      ['Risa con lágrimas', 'Laughing tears', [319,96,289,363]],
      ['Modo detective', 'Detective mode', [610,92,310,364]],
      ['¡Ganó la ranita!', 'Frog wins!', [921,100,297,356]],
      ['Dormido en pijama', 'Asleep in pajamas', [1220,112,316,348]],
      ['Pizza quemada', 'Burnt pizza', [0,572,314,379]],
      ['¡Campeón!', 'Champion!', [320,588,295,355]],
      ['Qué vergüenza', 'So embarrassed', [620,599,275,343]],
      ['Hechizo de amor', 'Love spell', [902,571,323,371]],
      ['Dino en shock', 'Shocked dino', [1227,592,309,350]]
    ]
  },
  {
    name: 'Julie', start: 22, src: 'assets/stream-stickers-julie.webp', width: 1536, height: 1024,
    items: [
      ['Julie gamer', 'Gamer Julie', [7,73,315,376]],
      ['Risa con almohada', 'Giggling behind a pillow', [323,74,304,376]],
      ['Mirada sospechosa', 'Suspicious side-eye', [628,70,293,381]],
      ['¡Qué susto!', 'What a scare!', [923,75,305,373]],
      ['Puchero dramático', 'Dramatic pout', [1230,76,306,374]],
      ['Cupcake travieso', 'Silly cupcake', [3,566,319,386]],
      ['Gatita feliz', 'Happy kitten', [322,555,306,394]],
      ['Besito', 'Little kiss', [628,567,284,382]],
      ['Brujita traviesa', 'Mischievous witch', [912,539,322,409]],
      ['Helado de vainilla y sueño', 'Sleepy with vanilla ice cream', [1234,569,302,380]]
    ]
  }
];
