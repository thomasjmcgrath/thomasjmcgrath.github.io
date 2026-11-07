import {env} from 'cloudflare:workers';
import {json,body,sameOrigin,db,digest} from '@/lib/server';
import {flightSearch,FlightError,type FlightSession} from '@/providers/flight-service';
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'Start the search from this site.'},403);
 try{
  const raw=await body(req) as Record<string,unknown>;
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return json({error:'Enter a flight search.'},400);
  const result=await flightSearch(raw,env.HIPPO_SKYSCANNER_API_KEY,{
   fetch,now:Date.now,uuid:()=>crypto.randomUUID(),hash:digest,
   load:id=>db().prepare('SELECT * FROM flight_sessions WHERE id=?').bind(id).first<FlightSession>(),
   count:async(visitor,since)=>(await db().prepare('SELECT COUNT(*) AS n FROM flight_sessions WHERE visitor=? AND created_at>?').bind(visitor,since).first<{n:number}>())?.n||0,
   save:async s=>{await db().prepare('INSERT INTO flight_sessions(id,visitor,token,query_json,created_at,expires_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET token=excluded.token').bind(s.id,s.visitor,s.token,s.query_json,s.created_at,s.expires_at).run();},
  });
  return json(result,'status' in result&&result.status==='not_connected'?503:200);
 }catch(e){return json({error:e instanceof FlightError?e.message:e instanceof SyntaxError?'Enter a valid flight search.':'The flight search could not be completed.'},e instanceof FlightError?e.status:400);}
}
