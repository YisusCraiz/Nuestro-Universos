export const roomBackdrop = `<svg class="yr-backdrop" viewBox="0 0 960 480" preserveAspectRatio="none" aria-hidden="true">
 <defs>
  <linearGradient id="yr-wall" x2=".82" y2="1"><stop stop-color="#977ba5"/><stop offset="1" stop-color="#483658"/></linearGradient>
  <linearGradient id="yr-side" x2="1" y2="1"><stop stop-color="#634a7d"/><stop offset="1" stop-color="#30213e"/></linearGradient>
  <linearGradient id="yr-floor" x2=".13" y2="1"><stop stop-color="#a77b8f"/><stop offset="1" stop-color="#5c405c"/></linearGradient>
  <radialGradient id="yr-sun"><stop stop-color="#ffcc98" stop-opacity=".72"/><stop offset="1" stop-color="#ffa9a7" stop-opacity="0"/></radialGradient>
  <linearGradient id="yr-glass" x2=".4" y2="1"><stop stop-color="#312955"/><stop offset="1" stop-color="#846eaa"/></linearGradient>
  <linearGradient id="yr-quilt" x2=".85" y2="1"><stop stop-color="#e6bbc9"/><stop offset="1" stop-color="#996587"/></linearGradient>
  <linearGradient id="yr-wood" x2="0" y2="1"><stop stop-color="#f4c4ac"/><stop offset="1" stop-color="#ac7a7c"/></linearGradient>
  <pattern id="yr-wallpaper" width="35" height="56" patternUnits="userSpaceOnUse"><path d="M2 0v56M13 0v56" stroke="#fff1ee" opacity=".12"/></pattern>
 </defs>
 <path d="M0 0h960v480H0z" fill="#493655"/>
 <path d="M0 0h685v295H178L0 386Z" fill="url(#yr-wall)"/>
 <path d="M0 0h685v295H178L0 386Z" fill="url(#yr-wallpaper)"/>
 <path d="M685 0h275v423L685 295Z" fill="url(#yr-side)"/>
 <path d="M0 386l178-91h507l275 128v57H0Z" fill="url(#yr-floor)"/>
 <path d="M0 386l178-91h507l275 128" fill="none" stroke="#d7a8ae" stroke-width="7"/>
 <path d="M0 407q458-75 960 21M0 453q470-62 960-3M0 479q480-46 960-11M244 297 91 480m247-184-72 184m165-185-1 185m92-185 78 185m17-185 188 185" fill="none" stroke="#513849" stroke-opacity=".43" stroke-width="2"/>
 <ellipse cx="331" cy="330" rx="410" ry="232" fill="url(#yr-sun)"/>
 <path d="M100 209v-65a67 67 0 0 1 134 0v65Z" fill="#5d486e" stroke="#765776" stroke-width="18"/>
 <path d="M98 205v-65a65 65 0 0 1 130 0v65Z" fill="url(#yr-glass)" stroke="#efc5c9" stroke-width="7"/>
 <path d="M162 79v124M99 150h128" stroke="#efc5c9" stroke-width="4"/>
 <path d="M143 109a17 17 0 1 0 5 30 15 15 0 0 1-5-30" fill="#fff0b7"/>
 <path d="M195 111h8m-4-4v8m3 65h9m-4.5-4.5v9m-81-13h6m-3-3v6" stroke="#fff1c3" stroke-width="2"/>
 <path d="M80 211h160l-8 10H90Z" fill="url(#yr-wood)"/>
 <path d="M95 221h116l146 137-199 22Z" fill="#ffd6a4" opacity=".09"/>
 <path d="M107 227h105" stroke="#eac4be" opacity=".32" stroke-width="2"/>
 <path d="M535 285 682 273 837 317l-10 57-282-33Z" fill="#362839" opacity=".35"/>
 <path d="m542 238 130-18 133 36-28 65-245-24Z" fill="#b785a1" stroke="#67415c" stroke-width="4"/>
 <path d="m532 283 259 22-7 28-246-24Z" fill="#633f61"/>
 <path d="m552 242 102-14 104 28-16 31-203-16Z" fill="url(#yr-quilt)"/>
 <path d="m652 230 104 26-15 32-111-12Z" fill="#9f698f"/>
 <path d="m542 268 198 18m-167-49-15 32m51-38-13 42m55-42-17 45m48-38-16 40m48-30-16 33" fill="none" stroke="#ffe0df" stroke-opacity=".43" stroke-width="1.5" stroke-dasharray="3 3"/>
 <path d="M313 234h170l-16 11H300Z" fill="url(#yr-wood)"/>
 <path d="M300 245h167v9H300Z" fill="#745272"/>
 <ellipse cx="406" cy="386" rx="176" ry="39" fill="#6f4f75" opacity=".55"/>
 <ellipse cx="406" cy="384" rx="161" ry="31" fill="none" stroke="#dfabb7" stroke-opacity=".65" stroke-width="2"/>
 <path d="M718 43q95 69 239 41" fill="none" stroke="#513951" stroke-width="3"/>
 <g fill="#ffdd9f"><circle cx="737" cy="56" r="4"/><circle cx="777" cy="76" r="4"/><circle cx="825" cy="91" r="4"/><circle cx="877" cy="94" r="4"/><circle cx="932" cy="89" r="4"/></g>
 </svg>`;

export const sceneStyles = `

.yr {container: yuki-room / inline-size;}
.yr .yr-stage {
 padding:clamp(4px,1.1cqi,12px);
 background:linear-gradient(140deg,#806077,#332541 55%,#9a647c);
 border:1px solid #e5b3bd78;
 border-radius:clamp(17px,3cqi,34px);
 box-shadow:0 18px 40px #150e2370;
}
.yr .yr-scene {
 width:100%; min-width:0; height:clamp(258px,57cqi,640px); isolation:isolate;
 border-radius:clamp(13px,2.4cqi,26px); background:#533d64;
}
.yr .yr-header {flex-wrap:wrap; row-gap:8px;}
.yr .yr-header h1 {font-size:clamp(24px,4cqi,38px);}
.yr .yr-balance {margin-inline-start:auto;}
.yr .yr-tabs {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));}
.yr .yr-tabs button {padding-inline:6px; overflow-wrap:anywhere;}

.yr .yr-scene::after {content:none;}
.yr-backdrop {display:block; position:absolute; inset:0; width:100%; height:100%; pointer-events:none;}
.yr-room-title {z-index:6; background:#291e37e8; border:1px solid #f4cad066; border-radius:30px; padding:7px 12px;}
.yr .yr-decor {filter:drop-shadow(0 5px 4px #32203363);}
.yr .yr-decor[data-slot="wall"] {width:15%; height:34%; left:12%; top:13%;}
.yr .yr-decor[data-slot="shelf"] {width:15%; height:37%; left:0; top:41%;}
.yr .yr-decor[data-slot="light"] {width:13%; height:31%; left:85%; right:auto; top:42%;}
.yr .yr-decor[data-slot="plant"] {width:11%; height:27%; left:10%; bottom:10%;}
.yr .yr-decor[data-slot="rug"] {width:42%; height:28%; left:22%; bottom:7%; transform:scaleY(.72);}
.yr .yr-decor[data-slot="poster"] {width:22%; height:34%; left:37%; top:10%;}
.yr .yr-decor[data-slot="frame"] {width:11%; height:21%; left:34%; bottom:49%;}
.yr .yr-decor[data-slot="plush"] {width:22%; height:30%; left:57%; bottom:41%; z-index:2;}
.yr .yr-decor[data-slot="pillow"] {width:15%; height:22%; left:68%; bottom:34%;}
.yr .yr-decor[data-preview] {filter:drop-shadow(0 0 6px #fff0ad);}
.yr-decor[data-item="jj-lamp"]::before {content:''; position:absolute; inset:-25%; background:radial-gradient(#ffcd9970,transparent 64%); z-index:-1;}
.yr .yr-actor {bottom:12%; width:clamp(56px,13cqi,112px); height:auto; aspect-ratio:94/126; transform-origin:center bottom;}
.yr .yr-pose {position:absolute; inset:0;}
.yr .yr-actor::before {content:''; position:absolute; bottom:0; left:18%; width:64%; height:9%; background:#39264069; border-radius:50%; filter:blur(3px); z-index:-1;}
.yr .yr-card {min-width:0; background:linear-gradient(155deg,#4a3156,#241b31 72%); border-color:#d6a9d156; padding:12px; overflow-wrap:anywhere;}
.yr .yr-preview {height:clamp(104px,21cqi,170px); border:1px solid #d7a8c74d; border-radius:15px; background:radial-gradient(ellipse at 50% 42%,#cb8fb177,#4d375f60 72%);}
.yr .yr-preview svg {width:92%; height:92%; max-width:156px; filter:drop-shadow(0 6px 5px #160c2280);}
.yr .yr-card .yr-action {margin:3px; padding:8px 10px;}
.yr .yr-card .yr-action[aria-pressed="true"] {border-color:#ffdf9d; color:#ffedc9;}
.yr-preview-label {position:absolute; z-index:6; bottom:8px; right:9px; margin:0; max-width:75%; color:#fff0cb; background:#2a1c33ef; border-radius:12px; padding:5px 10px; font-size:12px;}
@container yuki-room (max-width:525px) {
 .yr .yr-tabs {grid-template-columns:repeat(2,minmax(0,1fr));}
 .yr .yr-scene {height:clamp(274px,88cqi,390px);}
 .yr .yr-grid {grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px;}
 .yr .yr-card {padding:8px;}
 .yr .yr-decor[data-slot="poster"] {width:28%; height:28%; left:33%; top:9%;}
 .yr .yr-decor[data-slot="frame"] {width:15%; left:33%; bottom:49%;}
 .yr .yr-decor[data-slot="plush"] {width:25%; left:55%; bottom:40%;}
 .yr .yr-decor[data-slot="pillow"] {width:18%; left:67%; bottom:32%;}
 .yr .yr-decor[data-slot="light"] {width:15%; left:84%;}
 .yr .yr-decor[data-slot="plant"] {width:16%; left:6%;}
 .yr-room-title {top:10px; left:10px; font-size:9px;}
}
@container yuki-room (max-width:255px) {
 .yr .yr-grid {grid-template-columns:minmax(0,1fr);}
}
`;
