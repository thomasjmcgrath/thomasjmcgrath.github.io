import {isVisitorToken} from '../lib/analytics.ts';
import {parseFlight,providerQuery,normalizeFlights,externalFlightLinks,type FlightQuery} from './flights.ts';

export interface FlightSession {id:string;visitor:string;token:string;query_json:string|null;created_at:number;expires_at:number;}
export interface FlightPorts {
 fetch:typeof fetch; load:(id:string)=>Promise<FlightSession|null>; save:(session:FlightSession)=>Promise<void>;
 count:(visitor:string,since:number)=>Promise<number>; hash:(value:string)=>Promise<string>; now:()=>number; uuid:()=>string;
}
export class FlightError extends Error {status:number;constructor(message:string,status=400){super(message);this.status=status;}}
export async function flightSearch(raw:Record<string,unknown>,apiKey:string|undefined,ports:FlightPorts){
 const now=ports.now();
 if(!apiKey){const q=parseFlight(raw.query);if(q.depart<new Date(now).toISOString().slice(0,10))throw new FlightError('Choose a future flight date.');return {status:'not_connected',message:'Live prices need a flight-provider connection. You can search these dates directly below.',links:externalFlightLinks(q)};}
 if(!isVisitorToken(raw.visitor))throw new FlightError('Reload the page to start a search.');
 const visitor=await ports.hash(String(raw.visitor));let session:FlightSession|null=null,q:FlightQuery;
 if(raw.sessionId){
  if(typeof raw.sessionId!=='string'||!isVisitorToken(raw.sessionId))throw new FlightError('Invalid search session.');
  session=await ports.load(raw.sessionId);
  if(!session||session.expires_at<=now||!session.query_json)throw new FlightError('This search has expired. Start a new search.',410);
  if(session.visitor!==visitor)throw new FlightError('This search belongs to a different browser session.',403);
  q=parseFlight(JSON.parse(session.query_json));
  if(raw.query&&JSON.stringify(parseFlight(raw.query))!==JSON.stringify(q))throw new FlightError('The route, dates or travellers changed. Start a new search.',409);
 }else{
  q=parseFlight(raw.query);
  if(q.depart<new Date(now).toISOString().slice(0,10))throw new FlightError('Choose a future flight date.');
  if(await ports.count(visitor,now-900000)>=5)throw new FlightError('Please wait before starting another flight search.',429);
 }
 const endpoint='https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/';
 let response:Response;
 try{response=await ports.fetch(endpoint+(session?'poll/'+encodeURIComponent(session.token):'create'),{method:'POST',headers:{'x-api-key':apiKey,'Content-Type':'application/json'},body:JSON.stringify(session?{}:providerQuery(q)),signal:AbortSignal.timeout(20000),redirect:'manual'});}catch{throw new FlightError('The flight provider did not respond. Try again or use a direct search link.',502);}
 if(!response.ok)throw new FlightError(response.status===429?'The flight provider is busy. Try again shortly.':'The flight provider could not complete this search. Check the connection or try a direct search link.',502);
 let data:Record<string,any>;
 try{data=await response.json() as Record<string,any>;if(!data||typeof data!=='object')throw Error();}catch{throw new FlightError('The flight provider returned an unreadable response.',502);}
 const token=typeof data.sessionToken==='string'&&data.sessionToken.length>0&&data.sessionToken.length<=8192?data.sessionToken:session?.token;
 if(!token)throw new FlightError('The flight provider returned an incomplete search session.',502);
 const saved:FlightSession={id:session?.id||ports.uuid(),visitor,token,query_json:JSON.stringify(q),created_at:session?.created_at||now,expires_at:session?.expires_at||now+900000};
 await ports.save(saved);
 return {...normalizeFlights(data),sessionId:saved.id,retrievedAt:new Date(ports.now()).toISOString(),expiresAt:new Date(saved.expires_at).toISOString(),provider:'Skyscanner',currency:q.currency,travellers:q.adults,priceBasis:'Total for all requested travellers'};
}
