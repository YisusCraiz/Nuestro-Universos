const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('jj-collection.js','utf8');
const bounds=JSON.parse(source.match(/const artBounds=(.*);/)[1]);
const files=vm.runInNewContext('('+source.match(/const artFiles=(.*);/)[1]+')');
const draw=source.slice(source.indexOf(' function art(c){'),source.indexOf(' function mini('));
let count=0;
for(const [collection,file] of Object.entries(files)){
 const [xs,ys]=bounds[file];assert.equal(xs.length,7);assert.equal(ys.length,6);
 const art=vm.runInNewContext(draw+';art',{artFiles:files,artBounds:bounds,currentName:c=>c.id,esc:s=>s});
 for(let i=0;i<30;i++){
  const html=art({collection,art:i,id:'test'}),v=html.match(/background-size:([\d.]+)% ([\d.]+)%;--cx:([\d.]+)%;--cy:([\d.]+)%/).slice(1).map(Number);
  const w=xs[6]*100/v[0],h=ys[5]*100/v[1],x=v[2]/100*(xs[6]-w),y=v[3]/100*(ys[5]-h),col=i%6,row=Math.floor(i/6);
  assert.ok(Math.abs(x-xs[col]-6)<1e-7);assert.ok(Math.abs(y-ys[row]-6)<1e-7);
  assert.ok(Math.abs(x+w-(xs[col+1]-6))<1e-7);assert.ok(Math.abs(y+h-(ys[row+1]-6))<1e-7);count++;
 }
}
assert.equal(count,510);console.log('PASS: all 510 cards sample only their measured panel, with a six-pixel interior margin at every size.');
