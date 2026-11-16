'use strict';

const worlds = [
 {id:'S', icon:'✿', names:['Japón','Japan'], subtitle:['Sakura, torii y jardines de piedra','Sakura, torii gates and stone gardens'], palette:['#382b46','#815b73','#5c806e','#f2bbcc']},
 {id:'N', icon:'❄', names:['Navidad','Christmas'], subtitle:['Nieve, hielo y senderos de regalo','Snow, ice and gift-lined trails'], palette:['#173744','#377168','#468878','#b9e1e7']},
 {id:'H', icon:'☾', names:['Halloween','Halloween'], subtitle:['Calabazas, neblina y rebotes','Pumpkins, mist and bank shots'], palette:['#342330','#735043','#775c63','#ffbd78']},
 {id:'U', icon:'✦', names:['Nuestro Universo','Our Universe'], subtitle:['Nebulosas, meteoritos y constelaciones','Nebulae, meteors and constellations'], palette:['#151d42','#445283','#536aa1','#b0c6ff']}
];

const catalog = [
 {world:0,names:['Paseo de sakura','Sakura Walk'],par:3,start:[116,320],cup:[1005,340],walls:[[370,99,32,167],[370,397,32,162],[725,230,34,115]],sand:[[453,395,166,90]],bumpers:[[612,228,27]]},
 {world:0,names:['Sendero de los torii','Torii Trail'],par:4,start:[145,503],cup:[995,155],walls:[[310,95,36,342],[520,261,35,314],[792,95,35,265]],sand:[[875,342,136,95]]},
 {world:0,names:['Jardín koi','Koi Garden'],par:4,start:[135,168],cup:[985,503],walls:[[595,95,35,184],[785,366,40,209]],water:[[267,244,280,179],[869,199,132,68]],bumpers:[[678,330,35],[450,505,24]]},
 {world:1,names:['Aldea nevada','Snowy Village'],par:3,start:[130,442],cup:[995,408],walls:[[300,294,260,30],[710,383,32,191]],ice:[[413,392,188,80],[793,191,112,105]],bumpers:[[660,354,30]]},
 {world:1,names:['Taller de regalos','Gift Workshop'],par:4,start:[120,200],cup:[1000,490],walls:[[315,95,70,215],[505,407,59,168],[697,95,60,238],[860,386,57,189]],sand:[[610,384,56,107]],bumpers:[[606,244,28]]},
 {world:1,names:['Lago de auroras','Aurora Lake'],par:4,start:[139,500],cup:[980,148],walls:[[409,384,33,190],[742,95,36,194]],ice:[[322,173,352,182],[820,326,184,128]],water:[[507,444,100,83],[198,98,82,106]]},
 {world:2,names:['Huerto de calabazas','Pumpkin Patch'],par:3,start:[119,355],cup:[1002,289],walls:[[468,95,36,165],[760,417,41,158]],bumpers:[[298,293,46],[476,405,39],[657,235,42],[845,368,40]],sand:[[532,471,138,74]]},
 {world:2,names:['Mansión de las sombras','Shadow Manor'],par:4,start:[131,493],cup:[997,181],walls:[[294,235,36,340],[442,95,35,283],[631,280,36,295],[819,95,35,241]],sand:[[478,458,108,72]]},
 {world:2,names:['Pantano embrujado','Haunted Bog'],par:5,start:[128,154],cup:[998,502],walls:[[425,95,35,177],[635,374,35,201],[813,95,35,257]],water:[[204,320,193,166],[484,124,125,104],[696,467,92,65]],bumpers:[[907,381,35]]},
 {world:3,names:['Jardín lunar','Moon Garden'],par:4,start:[148,435],cup:[997,196],walls:[[286,186,42,389],[530,95,35,249],[809,374,35,201]],sand:[[617,186,134,115]],bumpers:[[450,420,40]]},
 {world:3,names:['Cinturón de meteoritos','Meteor Belt'],par:4,start:[122,312],cup:[999,366],walls:[[346,432,191,36],[701,95,39,164]],bumpers:[[267,383,44],[405,250,49],[557,347,42],[697,414,42],[852,247,48]],ice:[[733,475,152,72]]},
 {world:3,names:['Constelación J×J','J×J Constellation'],par:5,start:[122,489],cup:[1004,160],walls:[[278,259,37,316],[446,95,38,294],[648,295,39,280],[821,95,37,233]],water:[[496,445,106,65]],bumpers:[[749,199,32],[947,356,28]]}
].map(course=>({walls:[],sand:[],ice:[],water:[],bumpers:[],...course}));

const ballSkins = [
 {id:'classic', names:['Estrella y luna','Star & Moon'],rarity:0, colors:null,mark:null},
 {id:'sakura', names:['Sakura','Sakura'],world:0,rarity:0,colors:['#fff2f6','#ed82a9','#973c70'],mark:'✿'},
 {id:'koi', names:['Koi dorado','Golden Koi'],world:0,rarity:1,colors:['#fff4c3','#f3aa50','#a14828'],mark:'◈'},
 {id:'torii', names:['Torii escarlata','Scarlet Torii'],world:0,rarity:2,colors:['#ffc3aa','#c23853','#6a1830'],mark:'門'},
 {id:'snow', names:['Copo de nieve','Snowflake'],world:1,rarity:0,colors:['#f6ffff','#8fcef1','#236b9d'],mark:'❄'},
 {id:'gift', names:['Regalo dorado','Golden Gift'],world:1,rarity:1,colors:['#fff1b4','#ecba54','#955b2b'],mark:'✦'},
 {id:'aurora', names:['Aurora boreal','Northern Lights'],world:1,rarity:2,colors:['#e2fffa','#73cec5','#43529e'],mark:'⋇'},
 {id:'pumpkin', names:['Calabaza traviesa','Mischief Pumpkin'],world:2,rarity:0,colors:['#ffe0a4','#ed9344','#7c442f'],mark:'✧'},
 {id:'ghost', names:['Fantasma de Yuki','Yuki’s Ghost'],world:2,rarity:1,colors:['#f7edff','#c5a3ee','#695495'],mark:'✦'},
 {id:'eclipse', names:['Eclipse encantado','Haunted Eclipse'],world:2,rarity:2,colors:['#ce9cf3','#745388','#271636'],mark:'☾'},
 {id:'polaris', names:['Estrella polar','North Star'],world:3,rarity:0,colors:['#edf9ff','#8db9ff','#344f9d'],mark:'✦'},
 {id:'pinkmoon', names:['Luna rosa','Pink Moon'],world:3,rarity:1,colors:['#fff1f5','#ed9bc3','#a14e89'],mark:'☾'},
 {id:'jxj', names:['Constelación J×J','J×J Constellation'],world:3,rarity:2,colors:['#fff0b2','#b594e6','#394b87'],mark:'♡'}
];
