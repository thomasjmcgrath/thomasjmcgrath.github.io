import {hippos} from './catalog.ts';
import type {Metric} from './analytics.ts';

export const ACTIVITY_KEY='hwt-pages-activity-v1';
export const ACTIVITY_LIMIT=1000;
const metrics:Metric[]=['search','view','trip_add','flight_search','outbound'];
export type LocalEvent={hippoId:string;metric:Metric;at:number;session:string};
export function parseLocalActivity(raw:string|null,now=Date.now()):LocalEvent[]{
 if(!raw||raw.length>250000)return [];
 try{const data=JSON.parse(raw);if(!Array.isArray(data))return [];return data.slice(-ACTIVITY_LIMIT).filter((e):e is LocalEvent=>!!e&&typeof e==='object'&&hippos.some(h=>h.id===e.hippoId)&&metrics.includes(e.metric)&&Number.isFinite(e.at)&&e.at>=now-200*86400000&&e.at<=now&&typeof e.session==='string'&&/^[A-Za-z0-9_-]{8,100}$/.test(e.session));}catch{return [];}
}
export function addLocalEvent(events:LocalEvent[],event:LocalEvent):LocalEvent[]{
 if(events.some(e=>e.hippoId===event.hippoId&&e.metric===event.metric&&e.session===event.session&&Math.abs(event.at-e.at)<1800000))return events;
 return [...events,event].slice(-ACTIVITY_LIMIT);
}
export function recordLocalActivity(hippoId:string,metric:Metric,session:string){
 try{if(localStorage.getItem('hwt-analytics')==='off')return;const now=Date.now(),old=parseLocalActivity(localStorage.getItem(ACTIVITY_KEY),now),next=addLocalEvent(old,{hippoId,metric,session,at:now});localStorage.setItem(ACTIVITY_KEY,JSON.stringify(next));window.dispatchEvent(new Event('hwt-activity'));}catch{}
}
export type ActivityData={rows:{hippo_id:string;current:number;previous:number;change:number|null}[];today:number;total:number;from:string;through:string;series:{date:string;count:number}[]};
export function localActivity(days:number,metric:string,events:LocalEvent[],now=Date.now()):ActivityData{
 if(![7,30,90].includes(days)||!metrics.includes(metric as Metric))throw Error('Choose a supported statistics window and measure.');
 const end=Date.parse(new Date(now).toISOString().slice(0,10)),start=end-days*86400000,previous=start-days*86400000;
 const chosen=events.filter(e=>e.metric===metric),rows=hippos.map(h=>{const own=chosen.filter(e=>e.hippoId===h.id),current=own.filter(e=>e.at>=start&&e.at<end).length,prior=own.filter(e=>e.at>=previous&&e.at<start).length;return {hippo_id:h.id,current,previous:prior,change:current>=5&&prior?Math.round((current-prior)/prior*100):null};}).sort((a,b)=>b.current-a.current||a.hippo_id.localeCompare(b.hippo_id));
 return {rows,today:chosen.filter(e=>e.at>=end&&e.at<=now).length,total:rows.reduce((n,r)=>n+r.current,0),from:new Date(start).toISOString().slice(0,10),through:new Date(end).toISOString().slice(0,10),series:Array.from({length:days},(_,i)=>{const date=new Date(start+i*86400000).toISOString().slice(0,10);return {date,count:chosen.filter(e=>new Date(e.at).toISOString().slice(0,10)===date).length};})};
}
export function demoActivity(days:number,metric:string):ActivityData{
 if(![7,30,90].includes(days)||!metrics.includes(metric as Metric))throw Error('Choose a supported statistics window and measure.');
 const sample:Record<string,number>={'moo-deng':420,fiona:315,fritz:238,poppy:184,maple:162,haggis:127,toni:101};
 const factor=days/30*({search:1,view:1.5,trip_add:.42,flight_search:.18,outbound:.12}[metric]||1);
 const rows=hippos.map(h=>({hippo_id:h.id,current:Math.round(sample[h.id]*factor),previous:0,change:null})).sort((a,b)=>b.current-a.current);
 return {rows,today:0,total:rows.reduce((n,r)=>n+r.current,0),from:'',through:'',series:[]};
}
