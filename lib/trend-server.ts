import {env} from 'cloudflare:workers';
import {db,digest} from './server';
import {importInterest,interestView,type InterestSnapshot} from '@/providers/interest-service';
export async function refreshTrends(){
 return importInterest({url:env.HIPPO_TRENDS_FEED_URL,token:env.HIPPO_TRENDS_FEED_TOKEN},{
  fetch,now:Date.now,key:digest,
  load:key=>db().prepare('SELECT * FROM trend_snapshots WHERE feed_key=?').bind(key).first<InterestSnapshot>(),
  comparison:async region=>{
   const row=await db().prepare('SELECT payload FROM trend_snapshots WHERE region=? AND payload IS NOT NULL ORDER BY success_at DESC LIMIT 1').bind(region).first<{payload:string}>();
   if(row)return JSON.parse(row.payload);
   return db().prepare('SELECT source,method FROM trend_points WHERE region=? LIMIT 1').bind(region).first<{source:string;method:string}>();
  },
  save:async s=>{await db().prepare('INSERT INTO trend_snapshots(feed_key,region,payload,attempted_at,success_at,status,note) VALUES(?,?,?,?,?,?,?) ON CONFLICT(feed_key) DO UPDATE SET region=excluded.region,payload=excluded.payload,attempted_at=excluded.attempted_at,success_at=excluded.success_at,status=excluded.status,note=excluded.note').bind(s.feed_key,s.region,s.payload,s.attempted_at,s.success_at,s.status,s.note).run();},
 });
}
export async function externalTrends(region='WORLDWIDE'){
 const snapshot=await db().prepare('SELECT * FROM trend_snapshots WHERE region=? AND payload IS NOT NULL ORDER BY success_at DESC LIMIT 1').bind(region).first<InterestSnapshot>();
 if(snapshot)return interestView(snapshot);
 // Preserve any imports from previous versions without assigning absent animals zero.
 const rows=(await db().prepare('SELECT hippo_id,date,value,source,method,imported_at FROM trend_points WHERE region=? AND date=(SELECT MAX(date) FROM trend_points WHERE region=?) ORDER BY value DESC').bind(region,region).all<{hippo_id:string;date:string;value:number;source:string;method:string;imported_at:string}>()).results;
 if(rows.length)return {status:'available',region,rows,source:rows[0].source,method:rows[0].method,dataThrough:rows[0].date,lastSuccessAt:rows[0].imported_at,legacy:true,comparable:rows.length>=2,stale:Date.now()-Date.parse(rows[0].date+'T00:00:00Z')>14*86400000};
 if(!env.HIPPO_TRENDS_FEED_URL)return {status:'not_connected',region,rows:[]};
 const current=await db().prepare('SELECT status,attempted_at,success_at,region FROM trend_snapshots WHERE feed_key=?').bind(await digest(env.HIPPO_TRENDS_FEED_URL)).first<InterestSnapshot>();
 return {status:current?.status===0?'unavailable':current?.region&&current.region!==region?'no_data_for_region':'awaiting_refresh',region,rows:[],lastAttemptAt:current?.attempted_at||null,lastSuccessAt:current?.success_at||null};
}
