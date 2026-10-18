// Run on publication; commit messages become a dated update entry.
const fs=require('node:fs'),{execFileSync}=require('node:child_process');
const entries=JSON.parse(fs.readFileSync('news.json','utf8').replace(/^\uFEFF/,''));
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(!entries.some(n=>n.commit===sha)){
 const message=execFileSync('git',['log','-1','--format=%s'],{encoding:'utf8'}).trim();
 entries.unshift({version:sha.slice(0,7),commit:sha,date:execFileSync('git',['log','-1','--format=%cs'],{encoding:'utf8'}).trim(),es:{title:'Nueva actualización',body:message},en:null});
 fs.writeFileSync('news.json',JSON.stringify(entries,null,2)+'\n');
}
