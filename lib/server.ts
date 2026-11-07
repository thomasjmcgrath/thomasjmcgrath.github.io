import { env } from 'cloudflare:workers';
import {MONITOR_IDS,readSourceBody,extractSourceText,sourceChanged} from './source-monitor';
import { sources, venues, hippos, EDITORIAL_DATE, type ViewingStatus } from './catalog';
import { eventKey, metrics, isVisitorToken, ranking, type Metric } from './analytics';

export const db=()=>{if(!env.DB)throw Error('The shared database is unavailable.');return env.DB;};
export const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function sameOrigin(req:Request):boolean {const origin=req.headers.get('origin');return !!origin&&new URL(origin).host===new URL(req.url).host;}
export async function body(req:Request,max=5000):Promise<unknown>{const text=await req.text();if(text.length>max)throw Error('Request is too large.');return JSON.parse(text);}
export function admin(req:Request):boolean {return env.HIPPO_STANDALONE!=='1'&&!!env.HIPPO_ADMIN_USER_ID&&req.headers.get('oai-authenticated-user-id')===env.HIPPO_ADMIN_USER_ID;}
export async function catalog(){
 let rows:{venue_id:string;status:ViewingStatus;viewing:string;updated_at:string;source_url:string}[]=[],registryAvailable=true;
 try{rows=(await db().prepare('SELECT venue_id,status,viewing,updated_at,source_url FROM venue_overrides').all<typeof rows[number]>()).results;}catch{registryAvailable=false;}
 return {hippos,venues:venues.map(v=>{
  if(!registryAvailable)return {...v,status:v.status==='off-show'?'off-show' as const:'recheck' as const,viewing:'Current visitor-status updates could not be loaded. Confirm directly with the venue before planning this visit. '+v.viewing};
  const over=rows.find(r=>r.venue_id===v.id);return over?{...v,status:over.status,viewing:over.viewing,reviewedAt:over.updated_at,overrideSource:over.source_url}:v;
 }),registryAvailable,editorialDate:EDITORIAL_DATE};
}
export async function recordEvent(req:Request){
 if(!sameOrigin(req))return json({error:'Use the site to record an event.'},403);
 if(/bot|crawler|spider|preview|headless/i.test(req.headers.get('user-agent')||''))return json({accepted:false});
 const value=await body(req,1000) as Record<string,unknown>;
 if(!isVisitorToken(value.session)||typeof value.hippoId!=='string'||!hippos.some(h=>h.id===value.hippoId)||!metrics.includes(value.metric as Metric))return json({error:'Invalid event.'},400);
 const now=Date.now(),date=new Date(now).toISOString().slice(0,10),session=await digest(value.session),metric=value.metric as Metric,hippoId=value.hippoId;
 const count=await db().prepare('SELECT COUNT(*) AS n FROM analytics_events WHERE session=? AND created_at>?').bind(session,now-1_800_000).first<{n:number}>();if((count?.n||0)>60)return json({error:'Please try again later.'},429);
 const key=eventKey(session,hippoId,metric,now);
 const results=await db().batch([
  db().prepare('INSERT INTO analytics_events(id,session,hippo_id,metric,created_at,date) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(key,session,hippoId,metric,now,date),
  db().prepare('INSERT INTO analytics_daily(date,hippo_id,metric,count) SELECT ?,?,?,COUNT(*) FROM analytics_events WHERE date=? AND hippo_id=? AND metric=? ON CONFLICT(date,hippo_id,metric) DO UPDATE SET count=excluded.count').bind(date,hippoId,metric,date,hippoId,metric),
 ]);
 return json({accepted:results[0].meta.changes>0,deduplicationMinutes:30});
}
export async function digest(input:string){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function statistics(days=30,metric:Metric='search'){
 const today=new Date().toISOString().slice(0,10),from=new Date(Date.parse(today)-days*86400000).toISOString().slice(0,10),previous=new Date(Date.parse(today)-days*2*86400000).toISOString().slice(0,10);
 const all=(await db().prepare('SELECT hippo_id,SUM(CASE WHEN date>=? THEN count ELSE 0 END) AS current,SUM(CASE WHEN date<? THEN count ELSE 0 END) AS previous FROM analytics_daily WHERE metric=? AND date>=? AND date<? GROUP BY hippo_id').bind(from,from,metric,previous,today).all<{hippo_id:string;current:number;previous:number}>()).results;
 const series=(await db().prepare('SELECT date,SUM(count) AS count FROM analytics_daily WHERE metric=? AND date>=? AND date<? GROUP BY date ORDER BY date').bind(metric,from,today).all()).results;
 const todayRow=await db().prepare('SELECT COALESCE(SUM(count),0) AS n FROM analytics_daily WHERE metric=? AND date=?').bind(metric,today).first<{n:number}>();
 return {rows:ranking(all),series,total:all.reduce((n,r)=>n+Number(r.current),0),today:todayRow?.n||0,days,metric,from,through:today,calculatedAt:new Date().toISOString(),method:'One animal per metric per anonymous 30-minute session. Completed UTC days; today shown separately.'};
}
export async function sourceStatus(){return (await db().prepare(`SELECT source_id,attempted_at,success_at,status,changed,note,reviewed_at FROM source_checks WHERE source_id IN (${MONITOR_IDS.map(()=>'?').join(',')}) ORDER BY source_id`).bind(...MONITOR_IDS).all()).results;}
export async function refreshSources(){
 const allowed=sources.filter(s=>(MONITOR_IDS as readonly string[]).includes(s.id)),results:Record<string,unknown>[]=[];
 async function check(source:typeof allowed[number]){const previous=await db().prepare('SELECT * FROM source_checks WHERE source_id=?').bind(source.id).first<{hash:string;changed:number;attempted_at:string;reviewed_at:string;reviewer:string;success_at:string;status:number}>();if(previous&&Date.now()-Date.parse(previous.attempted_at)<(previous.status===0?60000:12*3600000)){results.push({sourceId:source.id,status:'recently_checked'});return;}const now=new Date().toISOString();try{
  const response=await fetch(source.url,{headers:{'User-Agent':'HippoWorldTour/1.0 (+educational visitor-source monitoring)'},signal:AbortSignal.timeout(12000),redirect:'manual'});
  if(!response.ok)throw Error(`Official source returned HTTP ${response.status}.`);
  const text=extractSourceText(await readSourceBody(response),source.id);
  const prefix='v2|'+source.url+'|',hash=prefix+await digest(text),baselineChanged=!!previous?.hash&&!previous.hash.startsWith(prefix),changed=sourceChanged(previous?.hash,hash,prefix)?1:previous?.changed||0;
  const note=changed?'Source text changed. Editorial review required; visitor guidance has not been automatically changed.':baselineChanged?'Monitoring extraction updated. A new text baseline was recorded; visitor guidance has not been reconfirmed.':'Source retrieved. Retrieval is not a new confirmation of animal visibility.';
  await db().prepare('INSERT INTO source_checks(source_id,attempted_at,success_at,status,hash,changed,note) VALUES(?,?,?,?,?,?,?) ON CONFLICT(source_id) DO UPDATE SET attempted_at=excluded.attempted_at,success_at=excluded.success_at,status=excluded.status,hash=excluded.hash,changed=excluded.changed,note=excluded.note').bind(source.id,now,now,response.status,hash,changed,note).run();results.push({sourceId:source.id,status:'retrieved',changed:!!changed});
 }catch(e){const message=e instanceof Error?e.message:'Source check failed.';await db().prepare('INSERT INTO source_checks(source_id,attempted_at,status,changed,note) VALUES(?,?,?,0,?) ON CONFLICT(source_id) DO UPDATE SET attempted_at=excluded.attempted_at,status=excluded.status,note=excluded.note').bind(source.id,now,0,message).run();results.push({sourceId:source.id,status:'unavailable',message});}}
 for(let i=0;i<allowed.length;i+=3)await Promise.all(allowed.slice(i,i+3).map(check));
 await db().batch([db().prepare('DELETE FROM analytics_events WHERE created_at<?').bind(Date.now()-14*86400000),db().prepare('DELETE FROM analytics_daily WHERE date<?').bind(new Date(Date.now()-200*86400000).toISOString().slice(0,10)),db().prepare('DELETE FROM flight_sessions WHERE expires_at<?').bind(Date.now())]);
 return {checkedAt:new Date().toISOString(),results};
}
export function providers(){return {flights:{configured:!!env.HIPPO_SKYSCANNER_API_KEY,provider:'Skyscanner',status:env.HIPPO_SKYSCANNER_API_KEY?'configured':'not_connected'},trends:{configured:!!env.HIPPO_TRENDS_FEED_URL,status:env.HIPPO_TRENDS_FEED_URL?'configured':'not_connected'},adminConfigured:!!env.HIPPO_ADMIN_USER_ID};}
