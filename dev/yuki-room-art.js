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
   <path d="m-7 24 7 10 7-10" fill="none" stroke="#ffe2bb" stroke-width="4"/>
   ${julie ? '<circle cy="33" r="2.2" fill="#ffda8a"/>' : '<path d="M-7 24q6 5 13 0l3 11-4 2-3-8-8 1Z" fill="#953e57"/>'}
   <path d="M-21 8q0-21 21-21T21 8L17 18h-34Z" fill="${hair}"/>
   <rect x="-18" y="-5" width="36" height="30" rx="14" fill="#ffd8bf"/>
   <path d="${julie ? 'M-19 8q-2-20 18-20 21 0 20 20-7-4-12-14-9 10-26 14Z' : 'M-20 8q-2-14 5-15 1-8 10-5 8-6 13 0 12-1 12 15l-7-4-4 3-3-5-6 6-3-5q-7 9-17 10Z'}" fill="${hair}"/>
   <path d="M-13-5q6-6 12-5M6-9q6 0 9 5" fill="none" stroke="#bc7a81" opacity=".65" stroke-linecap="round"/>
   <ellipse cx="-8" cy="12" rx="2.2" ry="3.3" fill="#463148"/><ellipse cx="8" cy="12" rx="2.2" ry="3.3" fill="#463148"/>
   <circle cx="-8.6" cy="11" r=".8" fill="white"/><circle cx="7.4" cy="11" r=".8" fill="white"/>
   <path d="M-14 9h11v7h-11Zm17 0h11v7H3ZM-3 12h6" fill="none" stroke="${glasses}" stroke-width="1.3" stroke-linejoin="round"/>
   <path d="M-15 18h4m22 0h4" stroke="#f49a9e" stroke-linecap="round" stroke-width="2.2"/>
   <path d="M-3 19q3 4 6 0" fill="none" stroke="#994c63" stroke-linecap="round"/>
 </g>`;
}

export const keepsakes = {
 'jj-poster': `<path d="M37 16 50 5l13 11" fill="none" stroke="#ffd7a5" stroke-width="2"/>
   <rect x="9" y="15" width="82" height="77" rx="6" fill="#513553"/>
   <rect x="12" y="16" width="76" height="70" rx="4" fill="#ffe0b4"/>
   <rect x="17" y="21" width="66" height="59" rx="2" fill="#8564a0"/>
   <circle cx="60" cy="48" r="23" fill="#b987ba"/>
   ${chibi(35, 42, false, .7)}${chibi(64, 42, true, .7)}
   <g transform="translate(46 24) scale(.37)">${heart}</g>
   <path d="M22 28h7m-3.5-3.5v7M71 31h6m-3-3v6" stroke="#fff0c8" stroke-width="1.5"/>`,
 'jj-plush': `<ellipse cx="50" cy="82" rx="46" ry="11" fill="#452e58" opacity=".25"/>
   ${chibi(28, 39, false, 1.02)}${chibi(72, 39, true, 1.02)}
   <g transform="translate(39 68)">${heart}<path d="M4 5q0-4 5-2" fill="none" stroke="#ffe5ed" stroke-linecap="round"/></g>`,
 'jj-polaroid': `<path d="M20 85 34 47l13 2-10 37Z" fill="#735366"/><g transform="rotate(-8 50 49)">
   <rect x="23" y="14" width="57" height="77" rx="3" fill="#593d55"/>
   <rect x="21" y="11" width="57" height="76" rx="3" fill="#ffe9d4"/>
   <rect x="26" y="17" width="47" height="49" rx="2" fill="#ac789a"/>
   ${chibi(39, 36, false, .53)}${chibi(61, 36, true, .53)}
   <g transform="translate(45 72) scale(.45)">${heart}</g></g>`,
 'jj-lamp': `<ellipse cx="50" cy="89" rx="32" ry="6" fill="#4a344a"/>
   <ellipse cx="50" cy="83" rx="31" ry="7" fill="#bb8582"/>
   <path d="M49 83V63" stroke="#c3977d" stroke-width="6"/>
   <path d="M50 69S12 45 12 26c0-21 28-23 38-6 10-17 38-15 38 6 0 19-38 43-38 43Z" fill="#ffccaf" stroke="#f598aa" stroke-width="3"/>
   <path d="M21 28c0-8 8-13 16-9" fill="none" stroke="#fff6d5" stroke-linecap="round" stroke-width="4"/>
   <path d="M45 36h10m-5-5v10" stroke="#fff5d2" stroke-width="2.6" stroke-linecap="round"/>`,
 'jj-pillow': `<ellipse cx="50" cy="77" rx="46" ry="10" fill="#47304b" opacity=".32"/>
   <path d="M12 31 8 25q12 3 18 0 24-7 49 0l16-2-3 11q8 17 1 34l3 10-17-3q-26 7-49 0L9 78l4-12q-7-17-1-35Z" fill="#a34c7d" stroke="#693c63" stroke-width="3"/>
   <path d="M17 34q32-13 66 0l2 32q-33 13-70 1Z" fill="#d883a3" stroke="#ffc9cb" stroke-width="1.5" stroke-dasharray="2 3"/>
   <g transform="translate(38 41) scale(1.1)">${heart}</g>
   <path d="M23 51h7m-3.5-3.5v7M72 48h7m-3.5-3.5v7" stroke="#fff0ce" stroke-width="1.5"/>`
};
