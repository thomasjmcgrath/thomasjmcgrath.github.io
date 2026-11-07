'use client';
import {useEffect,useState} from 'react';
import {hippos} from '@/lib/catalog';
import {Arrow} from './Site';
type Point={hippo_id:string;date:string;value:number;source:string;method:string;imported_at:string;rank?:number|null};
type Snapshot={status:string;rows:Point[];source?:string;sourceUrl?:string;method?:string;dataThrough?:string;lastAttemptAt?:string;lastSuccessAt?:string;refreshIssue?:boolean;stale?:boolean;comparable?:boolean};
export function ExternalTrends(){
 const [region,setRegion]=useState('WORLDWIDE'),[data,setData]=useState<Snapshot>({status:'loading',rows:[]});
 useEffect(()=>{const abort=new AbortController();setData({status:'loading',rows:[]});fetch('/api/trends?region='+region,{signal:abort.signal}).then(async r=>{if(!r.ok)throw Error();setData(await r.json() as Snapshot);}).catch(e=>{if(e.name!=='AbortError')setData({status:'unavailable',rows:[]});});return()=>abort.abort();},[region]);
 const rows=data.rows,missing=hippos.filter(h=>!rows.some(r=>r.hippo_id===h.id)),max=Math.max(...rows.map(r=>r.value),1);
 const comparable=data.comparable!==false&&rows.length>=2&&rows.some(r=>r.value>0);
 const emptyLabel=data.status==='unavailable'?'Feed temporarily unavailable':data.status==='awaiting_refresh'?'Waiting for the first authorized refresh':data.status==='no_data_for_region'?'No provider snapshot for this geography':'External interest feed not connected';
 return <div className="external-trends">
  <label>Geography<select value={region} onChange={e=>setRegion(e.target.value)}><option value="WORLDWIDE">Worldwide</option><option value="CA">Canada</option><option value="US">United States</option><option value="GB">United Kingdom</option><option value="TH">Thailand</option><option value="FR">France</option></select></label>
  {data.status==='loading'?<p className="loading" role="status">Checking the external feed…</p>:rows.length?<>
   <p className="intro">Measured search interest in this provider snapshot. Only animals measured on the same date are compared.</p>
   {(data.refreshIssue||data.stale)&&<p className="notice" role="status">{data.refreshIssue?'The latest refresh failed. The last successful snapshot is still shown. ':''}{data.stale?'This snapshot is more than 14 days old.':''}</p>}
   {!comparable&&<p className="notice info">There is not enough nonzero, comparable data to assign a ranking.</p>}
   <div className="leaderboard">{rows.map((r,i)=>{const rank=comparable&&r.value>0?(r.rank??rows.findIndex(p=>p.value===r.value)+1):null;return <a className="leader-row" href={'/hippos/'+r.hippo_id} key={r.hippo_id}><span className="rank">{rank??'·'}</span><span className="leader-name">{hippos.find(h=>h.id===r.hippo_id)?.name}<span className="leader-bar" style={{width:(r.value/max*100)+'%'}}/></span><span className="leader-count">{r.value.toLocaleString(undefined,{maximumFractionDigits:2})}<small>RELATIVE INTEREST</small></span></a>;})}</div>
   <p className="data-caption">{data.sourceUrl?<a href={data.sourceUrl} target="_blank" rel="noreferrer">{data.source||rows[0].source} ↗</a>:data.source||rows[0].source} · snapshot {rows[0].date} · data through {data.dataThrough||rows[0].date} · last import {data.lastSuccessAt||rows[0].imported_at}</p>
   <p>{data.method||rows[0].method}</p>
   {missing.length>0&&<p className="data-caption">Not measured in this snapshot: {missing.map(h=>h.name).join(', ')}. Missing values are not treated as zero.</p>}
  </>:<div className="connection-note"><span className="status-badge warning">{emptyLabel}</span><h3>THE NUMBERS NEED<br/>A REAL SOURCE.</h3><p>Results appear when an authorized search-interest provider is connected. Relative interest is separate from exact search counts and activity on this website.</p><p>No provider ranking is available for this geography yet.</p><a className="btn outline" href="https://trends.google.com/trends/explore?date=today%203-m&q=Moo%20Deng%20hippo,Fiona%20hippo,Poppy%20hippo,Maple%20hippo" target="_blank" rel="noreferrer">Open an external comparison <Arrow/></a></div>}
 </div>;
}
