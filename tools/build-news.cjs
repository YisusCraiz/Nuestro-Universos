const fs=require('node:fs'),{execFileSync}=require('node:child_process');
const entries=JSON.parse(fs.readFileSync('news.json','utf8').replace(/^\uFEFF/,''));
const commits=execFileSync('git',['log','--reverse','--format=%H','8d2425a8db10f97a033d7a51cca2c1b6fd1d893c..HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
for(const sha of commits){if(entries.some(n=>n.commit===sha))continue;
const message=execFileSync('git',['show','-s','--format=%s',sha],{encoding:'utf8'}).trim();
// Private preparation must never announce a surprise in the shared news feed.
if(message.startsWith('[internal]'))continue;
entries.unshift({version:sha.slice(0,7),commit:sha,date:execFileSync('git',['show','-s','--format=%cs',sha],{encoding:'utf8'}).trim(),es:{title:'Nueva actualización',body:message},en:null});
}fs.writeFileSync('news.json',JSON.stringify(entries,null,2)+'\n');
