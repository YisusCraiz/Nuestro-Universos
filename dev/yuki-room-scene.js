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
 <g class="yr-default-bed">
 <path d="M535 285 682 273 837 317l-10 57-282-33Z" fill="#362839" opacity=".35"/>
 <path d="m542 238 130-18 133 36-28 65-245-24Z" fill="#b785a1" stroke="#67415c" stroke-width="4"/>
 <path d="m532 283 259 22-7 28-246-24Z" fill="#633f61"/>
 <path d="m552 242 102-14 104 28-16 31-203-16Z" fill="url(#yr-quilt)"/>
 <path d="m652 230 104 26-15 32-111-12Z" fill="#9f698f"/>
 <path d="m542 268 198 18m-167-49-15 32m51-38-13 42m55-42-17 45m48-38-16 40m48-30-16 33" fill="none" stroke="#ffe0df" stroke-opacity=".43" stroke-width="1.5" stroke-dasharray="3 3"/>
 </g>
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

.yr .yr-illustrated {width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 4px 4px #21142888);}
.yr .yr-decor[data-slot="player"] {left:36%;top:39%;width:13%;height:15%;z-index:5;}
.yr button.yr-decor {pointer-events:auto;padding:0;background:transparent;border:0;cursor:pointer;}
.yr .yr-disc {display:block;width:67%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#ffe4b2 0 3%,#bd748c 4% 21%,transparent 22%),repeating-radial-gradient(circle,#30223c 0 3px,#56425b 4px 5px);box-shadow:4px 5px 0 #21182c;}
.yr-records {padding:10px 12px;margin:0 0 10px;border-radius:14px;background:#2e223e;border:1px solid #ba98ca55;}
.yr-records select {max-width:100%;margin-inline-start:8px;}
.yr-records p {font-size:12px;margin:3px 0;}
.yr-record-player {display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:8px;}
.yr-record-player img {width:48px;height:48px;object-fit:cover;border-radius:7px;}
.yr-record-player div {grid-column:2;}
.yr-record-player img[hidden]+div {grid-column:1/-1;}
.yr-record-player small {display:block;color:#e2bfd8;}
.yr-record-seek {width:min(100%,340px);display:block;accent-color:#ffcfa1;}
.yr-record-controls {display:flex;align-items:center;flex-wrap:wrap;gap:5px;}
.yr-record-controls button {min-width:32px;min-height:32px;border-radius:8px;border:1px solid #bc90bc70;background:#483350;color:#fff2e7;}
.yr-record-controls button[aria-pressed="true"] {background:#936184;}
.yr-record-controls input {width:65px;accent-color:#ffcfa1;}
.yr-wave {display:flex;align-items:center;gap:3px;height:19px;margin-top:4px;opacity:.55;}
.yr-wave.playing {opacity:1;}
.yr-wave i {width:3px;border-radius:3px;background:#e4a5c4;}

.yr .yr-preview {display:flex;justify-content:center;align-items:center;overflow:hidden;min-width:0;padding:8px;}
.yr .yr-preview > .yr-illustrated {width:100%;height:100%;max-height:100%;max-width:100%;flex:0 1 auto;object-fit:contain;}
.yr .yr-preview > .yr-outfit {height:100%;max-height:128px;width:auto;aspect-ratio:3/4;}
.yr .yr-card h3 {position:relative;line-height:1.3;margin:8px 0;}
.yr-poster-art {height:92%;max-width:100%;aspect-ratio:4/5;display:block;overflow:hidden;padding:4px;border:2px solid #e9b982;border-radius:5px;background:radial-gradient(#d2a0a8,#623b62);}
.yr-poster-art img {display:block;height:100%;width:100%;object-fit:contain;}
.yr [data-item="jj-poster-stars"] .yr-poster-art,.yr-card:has([data-item="jj-poster-stars"]) .yr-poster-art {border-color:#dabdf6;background:radial-gradient(#a991ce,#292248);}
.yr .yr-decor[data-slot="bed"] {left:54%;top:42%;width:32%;height:29%;}
.yr-scene[data-custom-bed] .yr-default-bed {display:none;}
.yr .yr-decor[data-slot="cabinet"] {left:77%;top:42%;width:16%;height:24%;}
.yr .yr-decor[data-slot="poster"] .yr-poster-art {margin-inline:auto;}

.yr .yr-decor[data-slot="wall"] {left:8%;top:14%;width:15%;height:28%;}
.yr .yr-decor[data-slot="poster"],.yr .yr-decor[data-slot="poster2"] {top:12%;width:17%;height:24%;}
.yr .yr-decor[data-slot="poster"] {left:32%;}
.yr .yr-decor[data-slot="poster2"] {left:51%;}
.yr .yr-decor[data-slot="poster2"] .yr-poster-art {margin-inline:auto;}
.yr .yr-decor[data-slot="bed"] {left:56%;top:43%;width:32%;height:29%;}
.yr .yr-decor[data-slot="plush"] {left:64%;bottom:40%;width:17%;height:20%;z-index:2;}
.yr .yr-decor[data-slot="pillow"] {left:74%;bottom:34%;width:11%;height:13%;z-index:3;}
.yr .yr-decor[data-slot="sofa"] {left:7%;bottom:11%;width:31%;height:25%;}
.yr .yr-decor[data-slot="tv"] {left:21%;top:40%;width:19%;height:23%;z-index:4;}
.yr .yr-decor[data-slot="instrument"] {left:42%;bottom:14%;width:18%;height:23%;}
.yr .yr-decor[data-slot="display"] {left:75%;top:21%;width:17%;height:17%;}
.yr .yr-decor[data-slot="shelf"] {left:2%;top:41%;width:17%;height:26%;}
.yr .yr-decor[data-slot="cabinet"] {left:84%;top:53%;width:15%;height:22%;}
.yr .yr-decor[data-slot="light"] {left:87%;top:37%;width:11%;height:19%;}
.yr .yr-decor[data-slot="plant"] {left:3%;bottom:15%;width:10%;height:16%;}
.yr .yr-decor[data-slot="player"] {left:39%;top:40%;width:12%;height:12%;}
.yr .yr-decor[data-slot="frame"] {left:50%;bottom:47%;width:8%;height:14%;}
.yr button.yr-decor:focus-visible {outline:2px solid #ffdb9f;}
.yr-device {width:min(92vw,620px);max-height:85dvh;padding:18px;color:#fff2e7;background:#30223e;border:1px solid #be8ab0;border-radius:18px;}
.yr-device::backdrop {background:#17101bc9;}
.yr-device header {display:flex;align-items:center;justify-content:space-between;gap:8px;}
.yr-device video {display:block;width:100%;max-height:54dvh;margin-top:12px;}
.yr-device video[hidden] {display:none;}
.yr-device select {max-width:100%;}
.yr-device button {padding:8px;border-radius:10px;border:1px solid #ad7fa8;background:#493350;color:#fff2e7;}
.yr-arcade-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;max-width:300px;}
.yr-arcade-grid button {aspect-ratio:1;font-size:24px;}
.yr-arcade-grid button[aria-pressed="true"] {background:#9c5e8d;color:#ffe8a9;}

.yr-dye {margin-bottom:12px;padding:12px;border-radius:14px;background:#332442;border:1px solid #ad7fa855;}
.yr-dye h3,.yr-dye p {margin:0 0 8px;}
.yr-dye label {display:inline-flex;align-items:center;gap:6px;margin:0 10px 8px 0;}
`;
