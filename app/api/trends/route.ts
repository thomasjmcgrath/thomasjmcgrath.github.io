import {json} from '@/lib/server';
import {externalTrends} from '@/lib/trend-server';
export const dynamic='force-dynamic';
export async function GET(req:Request){const region=new URL(req.url).searchParams.get('region')||'WORLDWIDE';if(!/^(WORLDWIDE|[A-Z]{2})$/.test(region))return json({error:'Invalid region.'},400);try{return json(await externalTrends(region));}catch{return json({status:'unavailable',error:'External interest data is unavailable.'},503);}}
