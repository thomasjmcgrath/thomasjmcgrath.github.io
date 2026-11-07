import {readFile,writeFile,rename} from 'node:fs/promises';
import {NEWS_PUBLISHERS,rssCandidates,htmlCandidates,articleCandidate,articleUrl,type NewsItem} from '../lib/news.ts';
import {validNewsSnapshot,retainNews,retainNewsCheck} from '../lib/pages-news.ts';
import {readSourceBody} from '../lib/source-monitor.ts';

const path=new URL('../public/data/news.json',import.meta.url);
let snapshot:unknown=JSON.parse(await readFile(path,'utf8'));
if(!validNewsSnapshot(snapshot))throw Error('The retained news snapshot is invalid. It was not overwritten.');
let current=snapshot;
async function fetchText(url:string){
 const r=await fetch(url,{headers:{'User-Agent':'HippoWorldTour/1.6 (attributed public news headlines)'},redirect:'manual',signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error('Publisher returned HTTP '+r.status+'.');
 const raw=await readSourceBody(r,2000000);
 if(/_Incapsula_Resource|<title>\s*(Just a moment|Access denied)/i.test(raw))throw Error('The publisher returned a blocked page.');
 return raw;
}
for(const p of NEWS_PUBLISHERS.filter(p=>p.indexUrl)){
 const now=new Date().toISOString();
 try{
  let raw=await fetchText(p.indexUrl!);const candidates:NewsItem[]=[];
  if(p.id==='toronto-news'){const target=[...raw.matchAll(/href=["']([^"']*\/mediaroom\/press\d{4})["']/gi)].map(m=>articleUrl(m[1],p)).find(Boolean);if(target)raw=await fetchText(target);}
  if(p.format==='rss')candidates.push(...rssCandidates(raw,p));
  else for(const url of htmlCandidates(raw,p).slice(0,2)){try{const item=articleCandidate(await fetchText(url),url,p);if(item)candidates.push(item);}catch{}}
  const merged=retainNews(current,candidates,p.id,now);current=retainNewsCheck(merged.snapshot,{source_id:p.id,attempted_at:now,success_at:now,status:200,matched:candidates.length,note:'Index retrieved. '+candidates.length+' matching stories, '+merged.added+' new. '+merged.changed+' changed headlines retained for editorial review.'});
  console.log(JSON.stringify({publisher:p.name,status:'retrieved',matched:candidates.length,added:merged.added,review:merged.changed}));
 }catch(e){const note=e instanceof Error?e.message:'News retrieval failed.';current=retainNewsCheck(current,{source_id:p.id,attempted_at:now,success_at:null,status:0,matched:0,note:note.slice(0,500)});console.log(JSON.stringify({publisher:p.name,status:'unavailable',retained:true,note:note.slice(0,500)}));}
}
if(!validNewsSnapshot(current))throw Error('Updated news failed validation. The original snapshot was retained.');
const temporary=new URL('../public/data/news.json.tmp',import.meta.url);await writeFile(temporary,JSON.stringify(current,null,2)+'\n');await rename(temporary,path);
console.log('News snapshot saved. Animal homes and visitor guidance were not modified.');
