import {useEffect,useState} from 'react';
import seeds from '../content/news.json';
import {venues,hippos,EDITORIAL_DATE} from './catalog';
import {sortNews,type NewsItem} from './news';
import {validNewsSnapshot} from './pages-news';
import type {NewsData} from '../components/NewsFeed';

export const catalog=()=>({venues,hippos});
const editorialCheckedAt='2026-11-06';
export function newsFeed():NewsData{return {items:sortNews(seeds.map(s=>({...s,id:s.url,origin:'editorial',checkedAt:editorialCheckedAt,firstSeenAt:s.addedAt||editorialCheckedAt}) as NewsItem&{firstSeenAt:string})),feeds:[],storageAvailable:true,editorialCheckedAt};}
export function useNewsData(){
 const [data,setData]=useState<NewsData>(newsFeed);
 useEffect(()=>{const abort=new AbortController();fetch('/data/news.json',{signal:abort.signal}).then(async r=>{if(!r.ok)throw Error();const raw:unknown=await r.json();if(!validNewsSnapshot(raw))throw Error();setData(raw);}).catch(e=>{if(e.name!=='AbortError')setData(d=>({...d,storageAvailable:false}));});return()=>abort.abort();},[]);
 return data;
}
export const visitorNotesDate=EDITORIAL_DATE;
