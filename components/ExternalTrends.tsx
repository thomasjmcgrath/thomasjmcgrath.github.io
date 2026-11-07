'use client';
import {useState} from 'react';
import {hippos} from '@/lib/catalog';
import {Arrow} from './Site';
export function ExternalTrends(){
 const [chosen,setChosen]=useState(['moo-deng','fiona','maple']);
 const terms=chosen.map(id=>hippos.find(h=>h.id===id)!.name+' hippo');
 const url=new URL('https://trends.google.com/trends/explore');url.searchParams.set('date','today 12-m');url.searchParams.set('q',terms.join(','));
 return <div className="connection-note"><span className="status-badge warning">EXTERNAL INTEREST FEED NOT CONNECTED</span><h3>TAKE YOUR CURIOSITY FURTHER.</h3><p>This edition has no measured global search leaderboard. You can compare selected search terms directly on Google Trends, where the source explains its relative-interest scale.</p><fieldset className="pages-trend-options"><legend>Choose up to five hippos to compare</legend>{hippos.map(h=><label key={h.id}><input type="checkbox" checked={chosen.includes(h.id)} disabled={!chosen.includes(h.id)&&chosen.length>=5} onChange={()=>setChosen(a=>a.includes(h.id)?a.filter(id=>id!==h.id):[...a,h.id])}/>{h.name}</label>)}</fieldset>{chosen.length>0?<a className="btn" href={url.href} target="_blank" rel="noreferrer">Explore Google Trends <Arrow/></a>:<p>Choose at least one hippo to prepare a comparison.</p>}<p className="pages-source-note">Your selected text terms are sent only when you open the provider. Google Trends values are relative interest, not exact search totals.</p></div>;
}
