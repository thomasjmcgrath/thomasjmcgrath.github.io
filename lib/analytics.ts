export const metrics=['search','view','trip_add','flight_search','outbound'] as const;
export type Metric=typeof metrics[number];
export function eventKey(session:string,hippoId:string,metric:Metric,_now?:number):string{return `${session}:${hippoId}:${metric}`;}
export function isVisitorToken(token:unknown):token is string{return typeof token==='string'&&/^[a-f0-9-]{36}$/i.test(token);}
export function periodLabel(days:number):string{return `Last ${days} completed days (UTC)`;}
export function ranking(rows:{hippo_id:string;current:number;previous:number}[]){return rows.map(r=>({...r,current:Number(r.current),previous:Number(r.previous),change:r.previous>0?Math.round((r.current-r.previous)/r.previous*100):null})).sort((a,b)=>b.current-a.current||a.hippo_id.localeCompare(b.hippo_id));}
