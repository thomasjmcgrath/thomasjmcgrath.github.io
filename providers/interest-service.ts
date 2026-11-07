import {parseTrendFeed,type TrendFeed} from './trends.ts';
export interface InterestSnapshot {feed_key:string;region:string|null;payload:string|null;attempted_at:string;success_at:string|null;status:number;note:string;}
export interface InterestPorts {
 fetch:typeof fetch; now:()=>number; key:(value:string)=>Promise<string>;
 load:(key:string)=>Promise<InterestSnapshot|null>;
 comparison:(region:string)=>Promise<{source:string;method:string;sourceUrl?:string}|null>;
 save:(snapshot:InterestSnapshot)=>Promise<void>;
}
export async function importInterest(config:{url?:string;token?:string},ports:InterestPorts){
 if(!config.url)return {status:'not_connected'};
 let url:URL;try{url=new URL(config.url);}catch{throw Error('Configure a valid HTTPS interest feed.');}
 if(url.protocol!=='https:'||url.username||url.password)throw Error('The interest feed requires HTTPS without embedded credentials.');
 const key=await ports.key(config.url),previous=await ports.load(key),now=ports.now();
 if(previous&&now-Date.parse(previous.attempted_at)<(previous.status===200?12*3600000:60000))return {status:'recently_checked'};
 const attemptedAt=new Date(now).toISOString();
 try{
  const response=await ports.fetch(url,{headers:config.token?{Authorization:'Bearer '+config.token}:{},signal:AbortSignal.timeout(15000),redirect:'manual'});
  if(!response.ok)throw Error('The authorized interest feed could not be retrieved.');
  const reader=response.body?.getReader();if(!reader)throw Error('The interest feed was empty.');
  let bytes=0,text='';const decoder=new TextDecoder();
  try{for(;;){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>300000)throw Error('The interest feed exceeds 300 KB.');text+=decoder.decode(chunk.value,{stream:true});}text+=decoder.decode();}finally{await reader.cancel().catch(()=>{});}
  const feed=parseTrendFeed(JSON.parse(text),new Date(now)),prior=await ports.comparison(feed.region);
  if(prior&&(prior.source!==feed.source||prior.method!==feed.method||prior.sourceUrl&&prior.sourceUrl!==feed.sourceUrl))throw Error('A changed source or measurement method needs an explicit dataset migration.');
  await ports.save({feed_key:key,region:feed.region,payload:JSON.stringify(feed),attempted_at:attemptedAt,success_at:attemptedAt,status:200,note:'Authorized interest snapshot imported.'});
  return {status:'updated',points:feed.points.length,dataThrough:feed.dataThrough,region:feed.region};
 }catch{
  // Retain the last payload and success timestamp even if fetching or validation fails.
  await ports.save({feed_key:key,region:previous?.region||null,payload:previous?.payload||null,attempted_at:attemptedAt,success_at:previous?.success_at||null,status:0,note:'The interest feed could not be imported. Previous successful data are preserved.'});
  return {status:'unavailable',message:'The interest feed could not be imported. Previous successful data are preserved.'};
 }
}
export function interestView(snapshot:InterestSnapshot,now=Date.now()){
 const feed=JSON.parse(snapshot.payload!) as TrendFeed;
 const date=feed.points.reduce((latest,p)=>p.date>latest?p.date:latest,'');
 const points=feed.points.filter(p=>p.date===date).sort((a,b)=>b.value-a.value||a.hippoId.localeCompare(b.hippoId));
 const comparable=points.length>=2&&points.some(p=>p.value>0);
 const rows=points.map((p,i)=>({hippo_id:p.hippoId,date:p.date,value:p.value,source:feed.source,method:feed.method,imported_at:snapshot.success_at,rank:comparable&&p.value>0?points.findIndex(x=>x.value===p.value)+1:null}));
 return {status:'available',region:feed.region,rows,source:feed.source,sourceUrl:feed.sourceUrl,method:feed.method,dataThrough:feed.dataThrough,lastAttemptAt:snapshot.attempted_at,lastSuccessAt:snapshot.success_at,refreshIssue:snapshot.status!==200,stale:now-Date.parse(date+'T00:00:00Z')>14*86400000,comparable,coverage:points.map(p=>p.hippoId)};
}
