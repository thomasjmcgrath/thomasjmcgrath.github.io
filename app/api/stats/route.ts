import { statistics,json } from '@/lib/server';
import { metrics,type Metric } from '@/lib/analytics';
export const dynamic='force-dynamic';
export async function GET(req:Request){const url=new URL(req.url),days=Number(url.searchParams.get('days')||30),metric=(url.searchParams.get('metric')||'search') as Metric;if(![7,30,90].includes(days)||!metrics.includes(metric))return json({error:'Invalid statistics filter.'},400);try{return json(await statistics(days,metric));}catch{return json({error:'Shared statistics are temporarily unavailable.'},503);}}
