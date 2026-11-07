import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {flightSearch,FlightError,type FlightPorts,type FlightSession} from '../providers/flight-service.ts';
import {priceAmount} from '../providers/flights.ts';
import {importInterest,interestView,type InterestSnapshot,type InterestPorts} from '../providers/interest-service.ts';
import {parseTrendFeed} from '../providers/trends.ts';
import {standaloneGate} from '../lib/standalone-access.ts';
import {standaloneConfig} from '../scripts/prepare-cloudflare.mjs';

const now=Date.parse('2026-11-06T12:00:00Z'),visitor='123e4567-e89b-42d3-a456-426614174000',id='123e4567-e89b-42d3-a456-426614174001';
const query={origin:'YVR',destination:'YYZ',depart:'2027-03-10',returnDate:'2027-03-15',adults:3,currency:'CAD'};
function flightHarness(){
 const sessions=new Map<string,FlightSession>(),calls:{url:string;init?:RequestInit}[]=[];
 let payload:unknown={sessionToken:'fixture-provider-session',status:'RESULT_STATUS_INCOMPLETE',content:{results:{}}};
 let code=200,clock=now,recent=0;
 const ports:FlightPorts={now:()=>clock,uuid:()=>id,hash:async x=>'hash:'+x,load:async x=>sessions.get(x)||null,save:async s=>{sessions.set(s.id,s);},count:async()=>recent,fetch:async(url,init)=>{calls.push({url:String(url),init});return new Response(JSON.stringify(payload),{status:code});}};
 return {ports,sessions,calls,setPayload:(v:unknown)=>payload=v,setCode:(v:number)=>code=v,setClock:(v:number)=>clock=v,setRecent:(v:number)=>recent=v};
}
test('flight create and poll retain original currency, travellers and expiry without exposing the provider token',async()=>{
 const h=flightHarness(),first=await flightSearch({query,visitor},'fixture-api-key',h.ports);
 assert.ok('sessionId' in first);assert.equal(first.currency,'CAD');assert.equal(first.travellers,3);
 assert.equal(h.calls[0].url,'https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create');
 const sent=JSON.parse(String(h.calls[0].init?.body));assert.equal(sent.query.adults,3);assert.equal(sent.query.queryLegs.length,2);
 assert.equal(h.calls[0].init?.redirect,'manual');
 h.setClock(now+3000);h.setPayload({status:'RESULT_STATUS_COMPLETE',content:{results:{}}});
 const second=await flightSearch({sessionId:id,visitor},'fixture-api-key',h.ports);
 assert.ok('sessionId' in second);assert.equal(second.currency,'CAD');assert.equal(second.travellers,3);assert.equal(second.expiresAt,first.expiresAt);
 assert.match(h.calls[1].url,/poll\/fixture-provider-session$/);assert.equal(h.calls[1].init?.body,'{}');
 assert.ok(!JSON.stringify(second).includes('fixture-provider-session'));assert.equal(second.complete,true);
});
test('another visitor cannot poll a search or consume a provider call',async()=>{
 const h=flightHarness();await flightSearch({query,visitor},'fixture-api-key',h.ports);
 await assert.rejects(flightSearch({sessionId:id,visitor:id},'fixture-api-key',h.ports),(e:unknown)=>e instanceof FlightError&&e.status===403);
 assert.equal(h.calls.length,1);
});
test('changing a quote currency or route requires a new flight search',async()=>{
 const h=flightHarness();await flightSearch({query,visitor},'fixture-api-key',h.ports);
 await assert.rejects(flightSearch({sessionId:id,visitor,query:{...query,currency:'USD'}},'fixture-api-key',h.ports),(e:unknown)=>e instanceof FlightError&&e.status===409);
 assert.equal(h.calls.length,1);
});
test('expired and legacy sessions cannot return stale prices',async()=>{
 const h=flightHarness();await flightSearch({query,visitor},'fixture-api-key',h.ports);h.setClock(now+900000);
 await assert.rejects(flightSearch({sessionId:id,visitor},'fixture-api-key',h.ports),(e:unknown)=>e instanceof FlightError&&e.status===410);
 h.setClock(now);h.sessions.get(id)!.query_json=null;
 await assert.rejects(flightSearch({sessionId:id,visitor},'fixture-api-key',h.ports),(e:unknown)=>e instanceof FlightError&&e.status===410);
});
test('rate limits reject new flight searches before calling the provider',async()=>{
 const h=flightHarness();h.setRecent(5);
 await assert.rejects(flightSearch({query,visitor},'fixture-api-key',h.ports),(e:unknown)=>e instanceof FlightError&&e.status===429);
 assert.equal(h.calls.length,0);
});
test('missing credentials return direct search links and no fabricated fares',async()=>{
 const h=flightHarness(),result=await flightSearch({query},undefined,h.ports);
 assert.equal(result.status,'not_connected');assert.ok('links' in result&&result.links.length===2);assert.ok(!('offers' in result));assert.equal(h.calls.length,0);
});
test('provider failures and malformed JSON do not leak provider responses',async()=>{
 const h=flightHarness();h.setCode(401);h.setPayload({error:'provider private detail'});
 await assert.rejects(flightSearch({query,visitor},'fixture-api-key',h.ports),(e:unknown)=>e instanceof FlightError&&e.status===502&&!e.message.includes('private'));
 assert.equal(h.sessions.size,0);
 h.ports.fetch=async()=>new Response('not-json');
 await assert.rejects(flightSearch({query,visitor},'fixture-api-key',h.ports),(e:unknown)=>e instanceof FlightError&&e.status===502);
});
test('missing, blank and zero monetary amounts never become free flights',()=>{
 for(const amount of [undefined,null,'','  ',0,'0'])assert.equal(priceAmount({amount:amount as any,unit:'PRICE_UNIT_WHOLE'}),null);
});
const feed={source:'Authorized fixture only',sourceUrl:'https://example.com/methodology',method:'Comparable weekly relative search interest for hippo-specific terms.',region:'WORLDWIDE',dataThrough:'2026-11-05',points:[{hippoId:'moo-deng',date:'2026-11-05',value:25},{hippoId:'fiona',date:'2026-11-05',value:25},{hippoId:'poppy',date:'2026-11-05',value:0}]};
function interestHarness(){
 const records=new Map<string,InterestSnapshot>(),calls:{url:string;init?:RequestInit}[]=[];let payload:unknown=feed,code=200,clock=now;
 const ports:InterestPorts={now:()=>clock,key:async()=> 'fixture-key',load:async key=>records.get(key)||null,comparison:async region=>{const row=[...records.values()].find(r=>r.region===region&&r.payload);return row?JSON.parse(row.payload!):null;},save:async row=>{records.set(row.feed_key,row);},fetch:async(url,init)=>{calls.push({url:String(url),init});return new Response(JSON.stringify(payload),{status:code});}};
 return {ports,records,calls,setPayload:(v:unknown)=>payload=v,setCode:(v:number)=>code=v,setClock:(v:number)=>clock=v};
}
test('interest import uses only the configured authorized endpoint and retains provenance',async()=>{
 const h=interestHarness(),r=await importInterest({url:'https://example.com/authorized-feed',token:'fixture-feed-token'},h.ports);
 assert.equal(r.status,'updated');assert.equal(h.calls[0].url,'https://example.com/authorized-feed');assert.equal(h.calls[0].init?.redirect,'manual');
 const row=h.records.get('fixture-key')!,view=interestView(row,now);assert.equal(view.sourceUrl,feed.sourceUrl);assert.equal(view.dataThrough,feed.dataThrough);assert.equal(view.rows.length,3);assert.equal(row.success_at,new Date(now).toISOString());
});
test('failed refresh preserves the last successful payload and timestamp',async()=>{
 const h=interestHarness();await importInterest({url:'https://example.com/feed'},h.ports);
 const old={...h.records.get('fixture-key')!};h.setClock(now+13*3600000);h.setCode(503);
 assert.equal((await importInterest({url:'https://example.com/feed'},h.ports)).status,'unavailable');
 const saved=h.records.get('fixture-key')!;assert.equal(saved.payload,old.payload);assert.equal(saved.success_at,old.success_at);assert.notEqual(saved.attempted_at,old.attempted_at);assert.equal(interestView(saved,now).refreshIssue,true);
});
test('invalid and changed measurement methods do not replace successful interest data',async()=>{
 const h=interestHarness();await importInterest({url:'https://example.com/feed'},h.ports);const saved=h.records.get('fixture-key')!.payload;
 h.setClock(now+13*3600000);h.setPayload({...feed,method:'A different independent measurement scale.'});
 assert.equal((await importInterest({url:'https://example.com/feed'},h.ports)).status,'unavailable');assert.equal(h.records.get('fixture-key')!.payload,saved);
});
test('large authorized feeds are rejected without publishing their payload',async()=>{
 const h=interestHarness();h.setPayload({padding:'x'.repeat(300001)});
 assert.equal((await importInterest({url:'https://example.com/feed'},h.ports)).status,'unavailable');assert.equal(h.records.get('fixture-key')!.payload,null);
});
test('successful feeds cache for twelve hours and failed attempts for one minute',async()=>{
 const h=interestHarness();await importInterest({url:'https://example.com/feed'},h.ports);
 assert.equal((await importInterest({url:'https://example.com/feed'},h.ports)).status,'recently_checked');assert.equal(h.calls.length,1);
 h.setClock(now+13*3600000);h.setCode(500);await importInterest({url:'https://example.com/feed'},h.ports);
 assert.equal((await importInterest({url:'https://example.com/feed'},h.ports)).status,'recently_checked');assert.equal(h.calls.length,2);
});
test('ties share rank, zeros receive no rank and unmeasured animals are omitted',async()=>{
 const h=interestHarness();await importInterest({url:'https://example.com/feed'},h.ports);const v=interestView(h.records.get('fixture-key')!,now);
 assert.deepEqual(v.rows.map(r=>r.rank),[1,1,null]);assert.equal(v.coverage.length,3);assert.ok(!v.coverage.includes('maple'));
});
test('one measured hippo or all-zero values do not create a world champion',async()=>{
 const h=interestHarness();h.setPayload({...feed,points:[{...feed.points[0],date:'2026-11-04'},feed.points[1]]});await importInterest({url:'https://example.com/feed'},h.ports);
 assert.equal(interestView(h.records.get('fixture-key')!,now).comparable,false);
 const row=h.records.get('fixture-key')!;row.payload=JSON.stringify({...feed,points:feed.points.map(p=>({...p,value:0}))});assert.equal(interestView(row,now).comparable,false);
});
test('interest methodology links reject malformed URLs and embedded credentials',()=>{
 for(const sourceUrl of ['https://','https://user:pass@example.com/','http://example.com/'])assert.throws(()=>parseTrendFeed({...feed,sourceUrl},new Date(now)));
});
test('unconfigured interests do not fetch or synthesize a ranking',async()=>{
 const h=interestHarness();assert.equal((await importInterest({},h.ports)).status,'not_connected');assert.equal(h.calls.length,0);assert.equal(h.records.size,0);
});
test('standalone public hosting protects maintenance and disables Sites owner entry points',()=>{
 const config={standalone:'1',maintenanceToken:'fixture-maintenance-token'};
 for(const path of ['/admin','/api/admin','/mcp','/signin-with-chatgpt'])assert.equal(standaloneGate(new Request('https://example.com'+path,{headers:{'oai-authenticated-user-id':'forged'}}),config)?.status,403);
 assert.equal(standaloneGate(new Request('https://example.com/api/maintenance'),config)?.status,403);
 assert.equal(standaloneGate(new Request('https://example.com/api/maintenance',{headers:{Authorization:'Bearer fixture-maintenance-token'}}),config),null);
 assert.equal(standaloneGate(new Request('https://example.com/hippos'),config),null);
 assert.equal(standaloneGate(new Request('https://example.com/api/maintenance'),{}),null);
});
test('standalone configuration replaces placeholders and retains Worker assets',()=>{
 const config=standaloneConfig({main:'index.js',assets:{directory:'../client'},vars:{PRIVATE_OWNER:'fixture'},services:[{binding:'private'}]},{databaseId:'123e4567-e89b-42d3-a456-426614174001'});
 assert.equal(config.main,'index.js');assert.equal(config.assets.directory,'../client');assert.deepEqual(config.vars,{HIPPO_STANDALONE:'1'});assert.equal(config.services.length,0);assert.equal(config.d1_databases[0].migrations_dir,'../../drizzle');
 assert.throws(()=>standaloneConfig({},{databaseId:'not-an-id'}));
});
test('database upgrade retains existing source successes, news and interest data',()=>{
 const database=new DatabaseSync(':memory:');
 try{
  const dir=new URL('../drizzle/',import.meta.url),migrations=readdirSync(dir).filter(x=>/^\d+.*\.sql$/.test(x)).sort();
  database.exec(readFileSync(new URL(migrations[0],dir),'utf8'));
  database.exec("INSERT INTO source_checks(source_id,attempted_at,success_at,status,note) VALUES('poppy','2026-11-05','2026-11-05',200,'retained')");
  database.exec("INSERT INTO trend_points(hippo_id,date,region,value,source,method,imported_at) VALUES('fiona','2026-11-05','WORLDWIDE',1,'fixture','comparable fixture','2026-11-05')");
  for(const name of migrations.slice(1)){database.exec(readFileSync(new URL(name,dir),'utf8'));if(name.startsWith('0001'))database.exec("INSERT INTO news_items(id,payload,first_seen_at,last_seen_at) VALUES('fixture','{}','2026-11-05','2026-11-05')");}
  assert.equal(database.prepare('SELECT id FROM news_items').get()!.id,'fixture');
  assert.equal(database.prepare('SELECT success_at FROM source_checks').get()!.success_at,'2026-11-05');
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM trend_points').get()!.n,1);
  assert.ok(database.prepare('PRAGMA table_info(flight_sessions)').all().some(r=>r.name==='query_json'));
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM trend_snapshots').get()!.n,0);
 }finally{database.close();}
});
