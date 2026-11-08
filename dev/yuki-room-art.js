const palette = `<defs>
 <linearGradient id="@paint-gold" x2=".85" y2="1">
  <stop stop-color="#9c5c64"/><stop offset=".26" stop-color="#fff1bf"/><stop offset=".58" stop-color="#d69477"/><stop offset=".81" stop-color="#ffe2a1"/><stop offset="1" stop-color="#aa6268"/>
 </linearGradient>
 <linearGradient id="@paint-twilight" x2=".4" y2="1">
  <stop stop-color="#382650"/><stop offset=".59" stop-color="#85528d"/><stop offset="1" stop-color="#d284a6"/>
 </linearGradient>
 <linearGradient id="@paint-fabric" x2=".2" y2="1">
  <stop stop-color="#ffd0ce"/><stop offset=".44" stop-color="#d783a5"/><stop offset="1" stop-color="#9e4e80"/>
 </linearGradient>
 <linearGradient id="@paint-glass" x2=".8" y2="1">
  <stop stop-color="#fff9ce"/><stop offset=".42" stop-color="#ffd1b7"/><stop offset="1" stop-color="#e879a5"/>
 </linearGradient>
</defs>`;

const heart = '<path d="M0 4C0-2 8-3 11 3 14-3 22-2 22 4c0 6-11 13-11 13S0 10 0 4Z" fill="#ff9ebc"/>';

function chibi(x, y, julie = false, scale = 1) {
 const hair = julie ? '#694154' : '#493544';
 const clothes = julie ? '#c96d8d' : '#b67c57';
 const glasses = julie ? '#a65572' : '#322c49';
 return `<g transform="translate(${x} ${y}) scale(${scale})">
   ${julie ? '<path d="M-19 0q-7 20 1 43h36q8-21 1-43Z" fill="#694154"/>' : ''}
   <ellipse cy="43" rx="19" ry="4" fill="#29203c" opacity=".28"/>
   <path d="M-11 30h22l3 12q-5 4-10 0l-4-7-4 7q-5 4-10 0Z" fill="#57364c"/>
   <path d="M-9 22q-11 3-8 14l7-2 1 7h18l1-7 7 2q3-11-8-14Z" fill="${clothes}" stroke="#794958" stroke-width="1.4"/>
   <path d="M-13 29l2 4m22 0 2-4m-20 9h14" fill="none" stroke="#ffe2c8" stroke-opacity=".65" stroke-linecap="round" stroke-dasharray="1 2"/>
   <path d="m-7 24 7 10 7-10" fill="none" stroke="#ffe2bb" stroke-width="4"/>
   ${julie ? '<circle cy="33" r="2.2" fill="#ffda8a"/>' : '<path d="M-7 24q6 5 13 0l3 11-4 2-3-8-8 1Z" fill="#953e57"/>'}
   <path d="M-21 8q0-21 21-21T21 8L17 18h-34Z" fill="${hair}"/>
   <rect x="-18" y="-5" width="36" height="30" rx="14" fill="#ffd8bf"/><path d="M-15 16q2 8 15 8t15-8q-1 11-15 11t-15-11" fill="#de8c87" opacity=".32"/>
   <path d="${julie ? 'M-19 8q-2-20 18-20 21 0 20 20-7-4-12-14-9 10-26 14Z' : 'M-20 8q-2-14 5-15 1-8 10-5 8-6 13 0 12-1 12 15l-7-4-4 3-3-5-6 6-3-5q-7 9-17 10Z'}" fill="${hair}"/>
   <path d="M-13-5q6-6 12-5M6-9q6 0 9 5" fill="none" stroke="#bc7a81" opacity=".65" stroke-linecap="round"/>
   <ellipse cx="-8" cy="12" rx="2.2" ry="3.3" fill="#463148"/><ellipse cx="8" cy="12" rx="2.2" ry="3.3" fill="#463148"/>
   <circle cx="-8.6" cy="11" r=".8" fill="white"/><circle cx="7.4" cy="11" r=".8" fill="white"/>
   <path d="M-14 9h11v7h-11Zm17 0h11v7H3ZM-3 12h6" fill="none" stroke="${glasses}" stroke-width="1.3" stroke-linejoin="round"/>
   <path d="M-15 18h4m22 0h4" stroke="#f49a9e" stroke-linecap="round" stroke-width="2.2"/>
   <path d="M-3 19q3 4 6 0" fill="none" stroke="#994c63" stroke-linecap="round"/>
 </g>`;
}

const designs = {
 'jj-poster': `<path d="M37 16 50 5l13 11" fill="none" stroke="#ffd7a5" stroke-width="2"/>
   <rect x="9" y="15" width="82" height="77" rx="6" fill="#513553"/>
   <rect x="12" y="16" width="76" height="70" rx="4" fill="url(#@paint-gold)"/>
   <rect x="17" y="21" width="66" height="59" rx="2" fill="url(#@paint-twilight)"/>
   <circle cx="60" cy="46" r="21" fill="#e8a4c6" opacity=".38"/>
   <path d="M20 55Q46 30 78 56M23 38l11-8 7 4 10-9 18 13" fill="none" stroke="#ffe8b7" opacity=".46" stroke-dasharray="1.4 2"/>
   <path d="M20 76h60M24 84h52" stroke="#ffe8b7" opacity=".7"/>
   <circle cx="23" cy="42" r="1.4" fill="#ffeabf"/><circle cx="76" cy="43" r="1.4" fill="#ffeabf"/>
   ${chibi(35, 42, false, .7)}${chibi(64, 42, true, .7)}
   <g transform="translate(46 24) scale(.37)">${heart}</g>
   <path d="M22 28h7m-3.5-3.5v7M71 31h6m-3-3v6" stroke="#fff0c8" stroke-width="1.5"/>`,
 'jj-plush': `<ellipse cx="50" cy="82" rx="46" ry="11" fill="#452e58" opacity=".25"/>
   ${chibi(28, 39, false, 1.02)}${chibi(72, 39, true, 1.02)}
   <path d="M11 62q-5 13 3 18m70-18q6 13-2 19" fill="none" stroke="#ffc7b3" stroke-width="1.5" stroke-dasharray="2 2"/>
   <path d="M10 78h9l-1 8-4-2-3 2Z" fill="url(#@paint-gold)"/>
   <g transform="translate(39 68)">${heart}<path d="M4 5q0-4 5-2" fill="none" stroke="#ffe5ed" stroke-linecap="round"/></g>`,
 'jj-polaroid': `<path d="M20 85 34 47l13 2-10 37Z" fill="#735366"/><g transform="rotate(-8 50 49)">
   <rect x="23" y="14" width="57" height="77" rx="3" fill="#593d55"/>
   <rect x="21" y="11" width="57" height="76" rx="3" fill="#fff1db" stroke="url(#@paint-gold)" stroke-width="1.5"/>
   <rect x="26" y="17" width="47" height="49" rx="2" fill="url(#@paint-twilight)"/>
   <path d="m29 28 6-6 10 2 7-5 11 8 7-4" stroke="#ffdcb6" fill="none" opacity=".65" stroke-dasharray="1 2"/>
   ${chibi(39, 36, false, .53)}${chibi(61, 36, true, .53)}
   <g transform="translate(45 72) scale(.45)">${heart}</g><path d="M30 78h12m16 0h9" stroke="#c5859d" stroke-linecap="round"/></g>`,
 'jj-lamp': `<ellipse cx="50" cy="89" rx="32" ry="6" fill="#4a344a"/>
   <ellipse cx="50" cy="83" rx="31" ry="7" fill="url(#@paint-gold)"/><path d="M28 85q22 5 44 0" fill="none" stroke="#784c64" opacity=".55"/>
   <path d="M49 83V63" stroke="#c3977d" stroke-width="6"/>
   <path d="M50 69S12 45 12 26c0-21 28-23 38-6 10-17 38-15 38 6 0 19-38 43-38 43Z" fill="url(#@paint-glass)" stroke="url(#@paint-gold)" stroke-width="3"/>
   <path d="M21 28c0-8 8-13 16-9" fill="none" stroke="#fff6d5" stroke-linecap="round" stroke-width="4"/>
   <path d="M45 36h10m-5-5v10" stroke="#fff5d2" stroke-width="2.6" stroke-linecap="round"/>`,
 'jj-pillow': `<ellipse cx="50" cy="77" rx="46" ry="10" fill="#47304b" opacity=".32"/>
   <path d="M12 31 8 25q12 3 18 0 24-7 49 0l16-2-3 11q8 17 1 34l3 10-17-3q-26 7-49 0L9 78l4-12q-7-17-1-35Z" fill="#a34c7d" stroke="#693c63" stroke-width="3"/>
   <path d="M17 34q32-13 66 0l2 32q-33 13-70 1Z" fill="url(#@paint-fabric)" stroke="#ffdecf" stroke-width="1.5" stroke-dasharray="2 3"/>
   <path d="M20 41q15-6 21 5m39 12q-15 6-21-4M22 64q17 6 28-1m30-22q-17-5-28 1" fill="none" stroke="#fff0ce" opacity=".74" stroke-dasharray="2 2"/>
   <path d="M50 64S34 55 34 46c0-8 11-8 16-1 5-7 16-7 16 1 0 9-16 18-16 18Z" fill="url(#@paint-gold)" stroke="#995b7a" stroke-width="1.5"/>
   <g transform="translate(42 45) scale(.72)">${heart}</g>
   <path d="M23 51h7m-3.5-3.5v7M72 48h7m-3.5-3.5v7" stroke="#fff0ce" stroke-width="1.5"/>`
};

designs['nu-album'] = '<path d="M17 18h64v65H17z" fill="#654078" stroke="#ffdba1" stroke-width="3"/><path d="M24 18v65" stroke="#d6a0b8" stroke-width="3"/><rect x="32" y="29" width="35" height="39" rx="4" fill="#c487b0" stroke="#ffe6af"/><path d="m50 34 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#ffe5a0"/>';
designs['nu-piano'] = '<path d="M9 34h82v42H9z" fill="#332e51" stroke="#c399ba" stroke-width="3"/><path d="M15 45h70v23H15z" fill="#fff0dd"/><path d="M25 45v23m10-23v23m10-23v23m10-23v23m10-23v23m10-23v23" stroke="#766078"/><path d="M22 44v14m10-14v14m20-14v14m10-14v14m10-14v14" stroke="#3f3151" stroke-width="5"/><path d="M17 76v13m66-13v13" stroke="#d2a480" stroke-width="5"/>';
designs['nu-letters'] = '<path d="m17 31 59-9 10 53-59 9z" fill="#e4bc9d"/><path d="M13 35h74v46H13z" fill="#fff0d1" stroke="#b87989" stroke-width="2"/><path d="m13 35 37 28 37-28M13 81l27-27m47 27L60 54" fill="none" stroke="#d19b9e" stroke-width="2"/><circle cx="50" cy="61" r="10" fill="#c25c80"/><path d="m45 59 5 6 5-6" fill="none" stroke="#ffdcaa" stroke-width="2"/>';
designs['nu-comics'] = '<path d="M8 81h84v8H8z" fill="#c08a8d"/><path d="M15 19h19v61H15z" fill="#b96e96"/><path d="M37 13h21v67H37z" fill="#806ab0"/><path d="m62 23 17-4 12 58-17 4z" fill="#d4a56c"/><path d="M20 28h9m-9 5h9m13-10h11m-11 5h11m-31 41h9m13 0h11" stroke="#ffe7ba" stroke-width="2"/>';
designs['nu-arcade'] = '<path d="M23 10h54l7 72H16z" fill="#684c89" stroke="#dda1be" stroke-width="2"/><path d="M29 24h42v29H29z" fill="#221c3b" stroke="#efc19b"/><path d="m38 34 6 5-6 5m24-10-6 5 6 5" fill="none" stroke="#f6b0cf" stroke-width="3"/><path d="M21 58h58l3 12H18z" fill="#bd769f"/><path d="M35 64v-7" stroke="#ffe0ae" stroke-width="3"/><circle cx="35" cy="56" r="4" fill="#ff9eaa"/><circle cx="62" cy="63" r="3" fill="#ffe6a5"/>';
designs['nu-vinyl'] = '<circle cx="50" cy="50" r="40" fill="#262039" stroke="#d5a789" stroke-width="3"/><circle cx="50" cy="50" r="32" fill="none" stroke="#665075"/><circle cx="50" cy="50" r="25" fill="none" stroke="#665075"/><circle cx="50" cy="50" r="15" fill="#ca7ca3"/><circle cx="50" cy="50" r="4" fill="#ffe8be"/><path d="M22 36q6-12 20-15" fill="none" stroke="#a38caf" stroke-width="3"/>';
designs['nu-crown'] = '<ellipse cx="50" cy="80" rx="38" ry="7" fill="#553449"/><path d="m16 31 19 16 15-28 15 28 19-16-9 42H25z" fill="url(#@paint-gold)" stroke="#b57578" stroke-width="2"/><path d="M26 64h48" stroke="#fff0bc" stroke-width="3"/><path d="m50 43 6 8-6 8-6-8z" fill="#b968a0"/><circle cx="31" cy="54" r="3" fill="#937bc3"/><circle cx="69" cy="54" r="3" fill="#937bc3"/>';
designs['nu-constellation'] = '<rect x="12" y="10" width="76" height="80" rx="8" fill="url(#@paint-gold)"/><rect x="17" y="15" width="66" height="70" rx="5" fill="url(#@paint-twilight)"/><path d="m28 36 17-9 20 12-7 24-22 7-8-34 30 27-13-36" stroke="#d9b8df" fill="none"/><g fill="#ffe5a7"><circle cx="28" cy="36" r="3"/><circle cx="45" cy="27" r="3"/><circle cx="65" cy="39" r="3"/><circle cx="58" cy="63" r="3"/><circle cx="36" cy="70" r="3"/></g>';
designs['nu-anniversary'] = '<path d="M20 20h60v64H20z" fill="#fff0d7" stroke="#bc8195" stroke-width="3"/><path d="M20 20h60v18H20z" fill="#ae668c"/><path d="M33 14v14m34-14v14" stroke="#f5d6a7" stroke-width="5" stroke-linecap="round"/><path d="m34 48 6-4v24m15-20 6-4v24" fill="none" stroke="#905575" stroke-width="5"/><path d="M29 76h42" stroke="#e3afad"/>';
designs['nu-gamepad'] = '<path d="M25 32q25-9 50 0l14 35q2 16-12 10L63 65H37L23 77Q9 83 11 67Z" fill="url(#@paint-fabric)" stroke="#f5c5c7" stroke-width="2"/><path d="M29 43v18m-9-9h18" stroke="#65456f" stroke-width="5"/><circle cx="68" cy="45" r="4" fill="#ffe7ae"/><circle cx="77" cy="54" r="4" fill="#eab3e0"/><path d="M43 55h14" stroke="#fff0d8" stroke-dasharray="2 2"/>';

export const keepsakes = Object.fromEntries(
 Object.entries(designs).map(([id,drawing])=>[id,palette+drawing])
);
