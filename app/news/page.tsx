import {NewsFeed} from '@/components/NewsFeed';
import {newsFeed} from '@/lib/news-server';
import {hippos} from '@/lib/catalog';
export const metadata={title:'The Bloat Bulletin · Hippo news',description:'Source-dated news about Moo Deng, Fiona, Fritz, Poppy, Maple, Haggis and Toni. Save stories and follow the hippos on your trip.'};
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{hippo?:string}>}){const [data,params]=await Promise.all([newsFeed(),searchParams]);const animal=hippos.some(h=>h.id===params.hippo)?params.hippo:'all';return <section className="section cream bulletin-page"><div className="container"><p className="eyebrow">INDEPENDENT HIPPO ENTHUSIASM / WITH RECEIPTS</p><div className="bulletin-masthead"><h1>THE BLOAT<br/><em>BULLETIN.</em></h1><p>The latest stories we can source.<br/>The personalities you came for.<br/>A completely normal reading habit.</p></div><NewsFeed initial={data} initialHippo={animal}/></div></section>;}
