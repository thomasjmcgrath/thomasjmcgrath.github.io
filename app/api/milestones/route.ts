import {json} from '@/lib/server';
import {birthdayOccurrences} from '@/lib/milestones';
import {addDays} from '@/lib/planner';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const q=new URL(req.url).searchParams,from=q.get('from')||new Date().toISOString().slice(0,10),through=q.get('through')||addDays(from,365),ids=q.get('hippos');const events=ids!==null?birthdayOccurrences(from,through,ids?ids.split(','):[]):birthdayOccurrences(from,through);return json({events,from,through,note:'Birth-date anniversaries from the sourced profiles. These are not announced zoo events.'});}catch(e){return json({error:e instanceof Error?e.message:'Invalid calendar window.'},400);}}
