import {json,admin} from '@/lib/server';
import {newsFeed} from '@/lib/news-server';
export const dynamic='force-dynamic';
export async function GET(req:Request){const owner=new URL(req.url).searchParams.get('owner')==='1';if(owner&&!admin(req))return json({error:'Owner authorization is required.'},403);return json(await newsFeed(owner));}
