function bed(wood, quilt, shadow, stitching) {
 return `<ellipse cx="52" cy="78" rx="44" ry="13" fill="#291e36" opacity=".33"/>
 <path d="M13 62V29q0-13 12-15h25v37M17 28h32" fill="${wood}" stroke="#57394c" stroke-width="3"/>
 <path d="m13 65 32-32 46 19v19L62 88 13 70Z" fill="${wood}" stroke="#57394c" stroke-width="3"/>
 <path d="M62 76v12l29-17V59Z" fill="${shadow}"/>
 <path d="m14 57 31-27 46 20-30 23z" fill="${quilt}" stroke="${shadow}" stroke-width="2"/>
 <path d="m17 52 16-13 20 8-15 14z" fill="#f9dfd0" stroke="#bc8fa0" stroke-width="2"/>
 <path d="m54 40-19 22m32-16L48 68m31-17L60 72M27 48l47 17" stroke="${stitching}" stroke-width="1.6" stroke-dasharray="2 2"/>
 <path d="m65 61 3-5 3 1-3 5z" fill="${stitching}"/>`;
}
function shelf(wood, interior, books) {
 return `<ellipse cx="50" cy="88" rx="39" ry="7" fill="#291e36" opacity=".28"/>
 <path d="M13 16 28 9h59v71l-13 8H13z" fill="${wood}" stroke="#54394e" stroke-width="2"/>
 <path d="M73 17 87 9v71l-14 8z" fill="#62445c"/>
 <path d="M20 23h46v56H20z" fill="${interior}"/>
 <path d="M21 53h45M21 79h45" stroke="#e7b6a4" stroke-width="4"/>
 <path d="M25 34h8v17h-8zm12-4h7v21h-7zm11 6h9v15h-9zm-21 26h12v15H27zm16-2h8v17h-8z" fill="${books}"/>
 <path d="M27 39h4m8-3h3m7 6h6m-24 24h5" stroke="#fff1cf" stroke-width="1.5"/>
 <path d="M54 67h8l-2 10h-5z" fill="#d99b9e"/><path d="M58 67q-8-11-3-10l3 4q4-6 7-4l-5 10" fill="#8dba99"/>`;
}
function cabinet(wood, panel, top) {
 return `<ellipse cx="52" cy="84" rx="40" ry="9" fill="#291e36" opacity=".33"/>
 <path d="M13 30 30 20h59v55L73 86H13z" fill="${wood}" stroke="#654658" stroke-width="3"/>
 <path d="m13 30 17-10h59L73 31z" fill="${top}"/><path d="m73 31 16-11v55L73 86z" fill="#6b4b62"/>
 <rect x="20" y="39" width="46" height="14" rx="3" fill="${panel}"/><rect x="20" y="61" width="46" height="15" rx="3" fill="${panel}"/>
 <path d="M40 45h7m-7 22h7" stroke="#ffe4ae" stroke-width="3" stroke-linecap="round"/>
 <path d="M21 82v8m43-8v8" stroke="#624356" stroke-width="5"/>`;
}
export const furnitureArt = {
 'bed-lavender':bed('#ad798f','#ba9bd5','#735786','#f9ddb8'),
 'bed-rose':bed('#b87f7b','#e9a5af','#9d596d','#fff0c6'),
 'shelf-walnut':shelf('#a57465','#674758','#e5a590'),
 'shelf-cloud':shelf('#ba9cbe','#645477','#b6d2cf'),
 'cabinet-rose':cabinet('#9f697c','#c58f9d','#e3b2aa'),
 'cabinet-lilac':cabinet('#897299','#b39bc6','#dac0d9')
};
