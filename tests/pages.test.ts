import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ACTIVITY_LIMIT,parseLocalActivity,addLocalEvent,localActivity,demoActivity,type LocalEvent} from '../lib/pages-activity.ts';
import {validNewsSnapshot,retainNews,retainNewsCheck,type PageNewsSnapshot} from '../lib/pages-news.ts';
import {hippos,venues} from '../lib/catalog.ts';
import {pageRoutes} from '../scripts/pages-routes.mjs';
import {parseFlight,externalFlightLinks} from '../providers/flights.ts';
import {allowedGeneratedPath,publishFiles} from '../scripts/publish-pages-files.mjs';
import {mkdtemp,mkdir,writeFile,readFile,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const now=Date.parse('2026-11-07T12:00:00Z');
const event=(extra:Partial<LocalEvent>={}):LocalEvent=>({hippoId:'fiona',metric:'view',at:now-86400000,session:'browser_session_1',...extra});
const snapshot=()=>JSON.parse(readFileSync(new URL('../public/data/news.json',import.meta.url),'utf8')) as PageNewsSnapshot;

test('local event parsing rejects malformed, unknown, stale and future records',()=>{
 const bad=[event({hippoId:'unknown'}),event({metric:'bad' as any}),event({at:now+1}),event({at:now-201*86400000}),event({session:'x'})];
 assert.deepEqual(parseLocalActivity(JSON.stringify([event(),...bad]),now),[event()]);
 for(const raw of [null,'not json','{}','x'.repeat(250001)])assert.deepEqual(parseLocalActivity(raw,now),[]);
});
test('local activity is deduplicated by animal, measure and session for thirty minutes',()=>{
 const a=event(),events=[a];assert.equal(addLocalEvent(events,event({at:a.at+1799999})),events);
 assert.equal(addLocalEvent(events,event({at:a.at+1800000})).length,2);
 assert.equal(addLocalEvent(events,event({hippoId:'maple'})).length,2);
 assert.equal(addLocalEvent(events,event({metric:'search'})).length,2);
});
test('local event retention has a hard storage cap',()=>{
 const events=Array.from({length:ACTIVITY_LIMIT},(_,i)=>event({session:'session_'+i}));
 const retained=addLocalEvent(events,event({session:'new_session'}));assert.equal(retained.length,ACTIVITY_LIMIT);assert.equal(retained.at(-1)?.session,'new_session');assert.equal(retained[0].session,'session_1');
});
test('local statistics separate completed UTC days, previous periods and today',()=>{
 const rows=[event(),event({at:now,session:'today_session'}),event({at:now-8*86400000,session:'prior_session'})];
 const d=localActivity(7,'view',rows,now);assert.equal(d.total,1);assert.equal(d.today,1);assert.equal(d.rows.find(r=>r.hippo_id==='fiona')?.previous,1);assert.equal(d.series.length,7);assert.equal(d.from,'2026-10-31');assert.equal(d.through,'2026-11-07');
});
test('sample counts are stable, cover the cast and carry no fabricated dates or growth',()=>{
 const d=demoActivity(30,'search');assert.deepEqual(d,demoActivity(30,'search'));assert.equal(d.rows.length,7);assert.ok(d.rows.every(r=>hippos.some(h=>h.id===r.hippo_id)&&r.current>0&&r.change===null));assert.deepEqual(d.series,[]);assert.equal(d.from,'');assert.equal(d.through,'');assert.throws(()=>demoActivity(12,'search'));assert.throws(()=>localActivity(30,'bad',[],now));
});
test('every browser page and named animal has a direct GitHub Pages route',()=>{
 assert.equal(new Set(pageRoutes.map(r=>r.path)).size,pageRoutes.length);assert.equal(pageRoutes.length,20);for(const path of ['/','/quiz','/plan','/news','/passport','/about',...hippos.map(h=>'/hippos/'+h.id)])assert.ok(pageRoutes.some(r=>r.path===path));assert.ok(!pageRoutes.some(r=>r.path==='/admin'));
});
test('static news snapshot is valid, attributed and bounded',()=>{assert.ok(validNewsSnapshot(snapshot()));assert.ok(!validNewsSnapshot({items:[],feeds:[],editorialCheckedAt:42}));const d=snapshot();d.items[0]={...d.items[0],url:'javascript:alert(1)'};assert.ok(!validNewsSnapshot(d));});
test('new news is appended while a changed headline stays retained for editorial review',()=>{
 const previous=snapshot();const story={...previous.items[0],publisherId:'cincinnati-news',hippoIds:['fiona'],id:'https://cincinnatizoo.org/hippo-test/',url:'https://cincinnatizoo.org/hippo-test/',origin:'feed' as const};
 const first=retainNews(previous,[story],'cincinnati-news','2026-11-07T12:00:00Z');assert.equal(first.added,1);assert.equal(first.changed,0);
 const changed=retainNews(first.snapshot,[{...story,title:'A different hippo headline'}],'cincinnati-news','2026-11-08T12:00:00Z');assert.equal(changed.changed,1);assert.equal(changed.snapshot.items.find(i=>i.id===story.id)?.title,story.title);assert.equal(changed.snapshot.items.find(i=>i.id===story.id)?.reviewRequired,true);assert.equal(changed.snapshot.reviewQueue?.find(i=>i.id===story.id)?.pending.title,'A different hippo headline');
});
test('editorial stories survive automated headline changes',()=>{const previous=snapshot(),story=previous.items[0];const changed=retainNews(previous,[{...story,title:'Changed title',origin:'feed'}],story.publisherId,'2026-11-07T12:00:00Z');assert.equal(changed.changed,0);assert.equal(changed.snapshot.items.find(i=>i.id===story.id)?.title,story.title);});
test('failed publisher checks preserve the last successful retrieval and stored stories',()=>{
 const original=snapshot(),good=retainNewsCheck(original,{source_id:'cincinnati-news',attempted_at:'2026-11-07T12:00:00Z',success_at:'2026-11-07T12:00:00Z',status:200,matched:2,note:'Retrieved'}),bad=retainNewsCheck(good,{source_id:'cincinnati-news',attempted_at:'2026-11-08T12:00:00Z',success_at:null,status:0,matched:0,note:'Unavailable'});
 assert.equal(bad.feeds.find(f=>f.source_id==='cincinnati-news')?.success_at,'2026-11-07T12:00:00Z');assert.equal(bad.feeds.find(f=>f.source_id==='cincinnati-news')?.status,0);assert.deepEqual(bad.items,original.items);assert.equal(bad.lastAttemptAt,'2026-11-08T12:00:00Z');
});
test('browser flight links retain the chosen route, dates and traveller count',()=>{
 const q=parseFlight({origin:'YVR',destination:'YYZ',depart:'2027-05-01',returnDate:'2027-05-07',adults:3,currency:'CAD'});const links=externalFlightLinks(q);assert.equal(links.length,2);assert.ok(links[0].url.includes('/yvr/yyz/270501/270507/'));assert.equal(new URL(links[0].url).searchParams.get('adults'),'3');assert.ok(links[1].url.includes('/YVR-YYZ/2027-05-01/2027-05-07/3adults'));const one=externalFlightLinks({...q,returnDate:undefined});assert.ok(!one[1].url.includes('2027-05-07'));
});
test('the static browser entry does not call application-server endpoints',()=>{
 for(const name of ['Site','FlightSearch','Popularity','ExternalTrends','SourceHealth','NewsFeed','NewsTeaser']){const s=readFileSync(new URL('../components/'+name+'.tsx',import.meta.url),'utf8');assert.ok(!/fetch\(['"`]\/api\//.test(s),name+' must use browser or static data');}
 assert.equal(venues.find(v=>v.id===hippos.find(h=>h.id==='haggis')?.venueId)?.status,'off-show');
});
test('generated-file publication rejects source paths and traversal',()=>{for(const p of ['../README.md','/index.html','.git/config','app/page.tsx','lib/catalog.ts','assets/../package.json','data/private.json'])assert.equal(allowedGeneratedPath(p),false,p);for(const p of ['index.html','404.html','.nojekyll','favicon.svg','assets/index-abc.js','images/fiona.jpg','fonts/body.woff','data/news.json','hippos/fiona/index.html','quiz/index.html'])assert.equal(allowedGeneratedPath(p),true,p);});
test('publishing generated files removes only obsolete generated assets',async()=>{
 const root=await mkdtemp(join(tmpdir(),'hippo-pages-test-')),source=join(root,'build'),target=join(root,'site');
 try{await mkdir(join(source,'assets'),{recursive:true});await mkdir(join(target,'assets'),{recursive:true});await writeFile(join(source,'index.html'),'<html>Hippos</html>');await writeFile(join(source,'assets/new.js'),'new');await writeFile(join(target,'assets/old.js'),'old');await writeFile(join(target,'README.md'),'keep this source document');await writeFile(join(target,'pages-generated.json'),JSON.stringify(['index.html','assets/old.js']));await publishFiles(source,target);assert.equal(await readFile(join(target,'README.md'),'utf8'),'keep this source document');assert.equal(await readFile(join(target,'assets/new.js'),'utf8'),'new');await assert.rejects(access(join(target,'assets/old.js')));await writeFile(join(target,'pages-generated.json'),JSON.stringify(['../README.md']));await assert.rejects(publishFiles(source,target));assert.equal(await readFile(join(target,'README.md'),'utf8'),'keep this source document');}finally{await rm(root,{recursive:true,force:true});}
});
