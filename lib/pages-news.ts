import {NEWS_PUBLISHERS,articleUrl,newsChanged,sortNews,type NewsItem} from './news.ts';
import {hippos} from './catalog.ts';
export type PageNewsItem=NewsItem&{firstSeenAt?:string;reviewRequired?:boolean};
export type PageNewsCheck={source_id:string;attempted_at:string;success_at:string|null;status:number;matched:number;note:string};
export type NewsReview={id:string;publisherId:string;detectedAt:string;pending:NewsItem};
export type PageNewsSnapshot={items:PageNewsItem[];feeds:PageNewsCheck[];storageAvailable:boolean;editorialCheckedAt:string;lastAttemptAt?:string|null;reviewQueue?:NewsReview[]};
export function validNewsSnapshot(raw:unknown):raw is PageNewsSnapshot{
 if(!raw||typeof raw!=='object')return false;const d=raw as PageNewsSnapshot;
 return Array.isArray(d.items)&&d.items.length<=500&&Array.isArray(d.feeds)&&d.feeds.length<=20&&typeof d.editorialCheckedAt==='string'&&d.items.every(i=>{
  if(!i||typeof i.id!=='string'||typeof i.title!=='string'||!i.title||i.title.length>220||typeof i.summary!=='string'||i.summary.length>5000||!Array.isArray(i.hippoIds)||!i.hippoIds.length||!i.hippoIds.every(id=>hippos.some(h=>h.id===id))||!['editorial','feed'].includes(i.origin)||!['family','enrichment','milestone','keeper','watch'].includes(i.category)||!Number.isFinite(Date.parse(i.checkedAt))||i.publishedAt!==null&&!Number.isFinite(Date.parse(i.publishedAt)))return false;
  const p=NEWS_PUBLISHERS.find(p=>p.id===i.publisherId);return !!p&&articleUrl(i.url,p)===i.url;
 })&&d.feeds.every(f=>f&&NEWS_PUBLISHERS.some(p=>p.id===f.source_id)&&typeof f.note==='string'&&f.note.length<=2000&&Number.isFinite(Date.parse(f.attempted_at))&&(f.success_at===null||Number.isFinite(Date.parse(f.success_at)))&&Number.isInteger(f.status));
}
export function retainNews(previous:PageNewsSnapshot,candidates:NewsItem[],sourceId:string,now:string){
 const items=new Map(previous.items.map(i=>[i.id,{...i}])),queue=new Map((previous.reviewQueue||[]).map(q=>[q.id,q]));let added=0,changed=0;
 for(const candidate of candidates){
  const publisher=NEWS_PUBLISHERS.find(p=>p.id===sourceId);if(candidate.publisherId!==sourceId||!publisher||articleUrl(candidate.url,publisher)!==candidate.url)continue;
  const old=items.get(candidate.id);
  if(old?.origin==='editorial')continue;
  if(old){if(newsChanged(old,candidate)){items.set(old.id,{...old,reviewRequired:true});queue.set(old.id,{id:old.id,publisherId:sourceId,detectedAt:now,pending:candidate});changed++;}}
  else{items.set(candidate.id,{...candidate,firstSeenAt:now});added++;}
 }
 const retained=sortNews([...items.values()]).slice(0,500),ids=new Set(retained.map(i=>i.id));
 return {snapshot:{...previous,items:retained,reviewQueue:[...queue.values()].filter(q=>ids.has(q.id)).slice(-500)},added,changed};
}
export function retainNewsCheck(previous:PageNewsSnapshot,check:PageNewsCheck):PageNewsSnapshot{
 const old=previous.feeds.find(f=>f.source_id===check.source_id),current={...check,success_at:check.status===200?check.success_at:old?.success_at||null};
 return {...previous,lastAttemptAt:check.attempted_at,feeds:[...previous.feeds.filter(f=>f.source_id!==check.source_id),current].sort((a,b)=>a.source_id.localeCompare(b.source_id))};
}
