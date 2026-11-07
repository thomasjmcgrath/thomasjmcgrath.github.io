import {refreshNews,newsFeed} from '@/lib/news-server';
import {json,refreshSources,sourceStatus} from '@/lib/server';
import {refreshTrends,externalTrends} from '@/lib/trend-server';
export const dynamic='force-dynamic';

// Shared source-only upkeep relies on the owner-private Sites access boundary.
// A future public deployment must add separate service authorization here.
// Service access supplies no visitor identity and cannot edit owner guidance.
export async function GET(){try{return json({sources:await sourceStatus(),trends:await externalTrends(),news:await newsFeed()});}catch{return json({error:'Maintenance status is unavailable.'},503);}}
export async function POST(req:Request){
 try{
  const input=await req.text();if(input.length>200||input.trim()&&input.trim()!=='{}')return json({error:'Maintenance accepts empty arguments only.'},400);
  const visitorSources=await refreshSources();let interest:unknown;
  try{interest=await refreshTrends();}catch(e){interest={status:'unavailable',message:e instanceof Error?e.message:'Interest import failed.'};}
  let news:unknown;try{news=await refreshNews();}catch{news={status:'unavailable',message:'News upkeep could not complete. Retained stories are preserved.'};}return json({visitorSources,interest,news});
 }catch{return json({error:'Maintenance could not finish. Check the persisted status before retrying.'},503);}
}
