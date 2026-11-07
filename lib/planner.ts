import { hippos, venues, type Venue } from './catalog.ts';
import {parseReadiness} from './readiness.ts';
import {parseDayEdits,validDayOrder,type DayEdit} from './day-edits.ts';

export type Currency = 'CAD'|'USD'|'EUR'|'GBP'|'THB';
export interface TripInput { selected: string[]; origin: string; start: string; end: string; adults: number; currency: Currency; budget: number; hotel: number; food: number; transit: number; admission: number; airfare: number; transfer: number; readiness?: Record<string,string>; dayOrder?: string[]; dayEdits?: Record<string,DayEdit>; }
export interface TripDay { id:string; baseTitle?:string; notes?:string; venueId?:string; date: string; title: string; place: string; type: 'arrival'|'visit'|'transfer'|'free'|'departure'; detail: string; hippos: string[]; }
export interface TripResult { days: TripDay[]; issues: string[]; warnings: string[]; venues: Venue[]; minimumDays: number; nights: number; total: number; perPerson: number; costs: {name:string;amount:number;detail:string}[]; }
const dayMs=86_400_000;
export function validDayId(id:string):boolean {if(id==='arrival'||id==='departure')return true;const free=id.match(/^free:(\d{1,2})$/);if(free)return Number(free[1])<60;const visit=id.match(/^visit:([a-z0-9-]+)$/);if(visit)return venues.some(v=>v.id===visit[1]);const transfer=id.match(/^transfer:([a-z0-9-]+):(0|1)$/);return !!transfer&&venues.some(v=>v.id===transfer[1]);}
export function dateValue(value:string):number {if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return NaN;const n=Date.parse(value+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value?n:NaN;}
export function addDays(date:string, days:number):string{return new Date(dateValue(date)+days*dayMs).toISOString().slice(0,10);}
export function defaultTrip(now=new Date()):TripInput {const today=now.toISOString().slice(0,10);const start=addDays(today,90);return {selected:['maple'],origin:'YVR',start,end:addDays(start,3),adults:2,currency:'CAD',budget:4000,hotel:160,food:60,transit:30,admission:60,airfare:900,transfer:150};}
export function parseTrip(raw:unknown):TripInput {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('The trip file must contain a trip object.');const r=raw as Record<string,unknown>;
 if(!Array.isArray(r.selected)||r.selected.length>12||r.selected.some(x=>typeof x!=='string'||!hippos.some(h=>h.id===x)))throw Error('Choose hippos from the directory.');
 const selected=[...new Set(r.selected)] as string[];
 if(typeof r.origin!=='string'||!/^\s*[a-z]{3}\s*$/i.test(r.origin))throw Error('Enter a three-letter departure airport code.');
 if(typeof r.start!=='string'||typeof r.end!=='string'||!Number.isFinite(dateValue(r.start))||!Number.isFinite(dateValue(r.end)))throw Error('Enter valid start and end dates.');
 if(dateValue(r.end)<dateValue(r.start)||dateValue(r.end)-dateValue(r.start)>59*dayMs)throw Error('Choose a trip between 1 and 60 calendar days.');
 if(!['CAD','USD','EUR','GBP','THB'].includes(String(r.currency)))throw Error('Choose a supported currency.');
 const nums:Record<string,number>={};for(const key of ['adults','budget','hotel','food','transit','admission','airfare','transfer']){const v=r[key];if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1_000_000)throw Error(`Enter a valid ${key} amount.`);nums[key]=v;}
 if(!Number.isInteger(nums.adults)||nums.adults<1||nums.adults>8)throw Error('Choose between 1 and 8 travellers.');
 const readiness=parseReadiness(r.readiness,venues.map(v=>v.id));const dayEdits=parseDayEdits(r.dayEdits,validDayId);let dayOrder:string[]|undefined;
 if(r.dayOrder!==undefined){if(!Array.isArray(r.dayOrder)||r.dayOrder.length>60||r.dayOrder.some(id=>typeof id!=='string'||!validDayId(id))||new Set(r.dayOrder).size!==r.dayOrder.length)throw Error('The saved day order is invalid.');dayOrder=r.dayOrder as string[];}
 return {selected,origin:r.origin.trim().toUpperCase(),start:r.start,end:r.end,adults:nums.adults,currency:r.currency as Currency,budget:nums.budget,hotel:nums.hotel,food:nums.food,transit:nums.transit,admission:nums.admission,airfare:nums.airfare,transfer:nums.transfer,dayEdits,dayOrder,readiness};
}
export function distanceKm(a:Venue,b:Venue):number {const rad=(v:number)=>v*Math.PI/180;const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
export function buildTrip(input:TripInput, now=new Date(), registry=venues):TripResult {
 const t=parseTrip(input), selected=hippos.filter(h=>t.selected.includes(h.id));
 const venueIds=[...new Set(t.selected.map(id=>hippos.find(h=>h.id===id)!.venueId))];const stops=venueIds.map(id=>registry.find(v=>v.id===id)!);
 const duration=Math.round((dateValue(t.end)-dateValue(t.start))/dayMs)+1,nights=Math.max(0,duration-1), issues:string[]=[], warnings:string[]=[];
 const transfers=stops.slice(1).map((v,i)=>distanceKm(stops[i],v)>5000?2:1);const minimumDays=stops.length?2+stops.length+transfers.reduce((a,b)=>a+b,0):0;
 if(!stops.length)issues.push('Add at least one hippo to your trip.');
 if(dateValue(t.start)<dateValue(now.toISOString().slice(0,10)))issues.push('Your departure date is in the past. Choose new dates.');
 stops.filter(v=>v.status==='off-show').forEach(v=>issues.push(`${v.name}: public viewing is not confirmed. Follow the official update before planning this visit.`));
 if(stops.length&&duration<minimumDays)issues.push(`Allow at least ${minimumDays} calendar days for this route, or remove a destination. Flight schedules may require more time.`);
 stops.filter(v=>v.status==='recheck').forEach(v=>warnings.push(`${v.name}: reconfirm animal viewing before you book.`));
 warnings.push('Flight schedules and ground journeys still need confirmation. The transfer days below are planning allowances, not verified connections.');
 const rooms=Math.ceil(t.adults/2), costs=[
 {name:'Return / multi-city airfare',amount:t.airfare*t.adults,detail:`${t.currency} ${t.airfare} per person · your allowance, not a quote`},
 {name:'Accommodation',amount:t.hotel*nights*rooms,detail:`${nights} nights × ${rooms} room${rooms===1?'':'s'} × ${t.currency} ${t.hotel} · up to two travellers per room`},
 {name:'Food',amount:t.food*duration*t.adults,detail:`${duration} days × ${t.adults} traveller${t.adults===1?'':'s'} × ${t.currency} ${t.food}`},
 {name:'Local transport',amount:t.transit*duration*t.adults,detail:'Your daily allowance per traveller'},
 {name:'Admission allowance',amount:t.admission*stops.length*t.adults,detail:`${stops.length} unique venue${stops.length===1?'':'s'} · check official ticket prices`},
 {name:'Intercity transfers',amount:t.transfer*Math.max(0,stops.length-1)*t.adults,detail:'Your allowance per intercity leg, per traveller'},
 ];
 const total=Math.round(costs.reduce((sum,x)=>sum+x.amount,0)*100)/100;
 if(total>t.budget)warnings.push(`Your entered allowances exceed your group budget by ${t.currency} ${Math.round(total-t.budget).toLocaleString('en-CA')}.`);
 if(!t.airfare)warnings.push('Airfare is set to zero and is not included in the estimate.');
 let days:TripDay[]=[];let offset=0,freeIndex=0;const transferCounts=new Map<string,number>();
 const push=(d:Omit<TripDay,'date'|'id'>)=>{let id:string;if(d.type==='visit')id='visit:'+d.venueId;else if(d.type==='transfer'){const n=transferCounts.get(d.venueId!)||0;id=`transfer:${d.venueId}:${n}`;transferCounts.set(d.venueId!,n+1);}else if(d.type==='free')id='free:'+freeIndex++;else id=d.type;days.push({...d,id,date:addDays(t.start,offset++)});};
 if(!issues.length){push({title:'Arrival + settle in',place:stops[0].city,type:'arrival',detail:`Travel from ${t.origin} toward ${stops[0].airport}. Confirm arrival date, airport transfer and accommodation. Keep this day flexible.`,hippos:[]});stops.forEach((venue,i)=>{if(i>0){for(let j=0;j<transfers[i-1];j++)push({title:j?'Continue transfer + recover':`Travel to ${venue.city}`,venueId:venue.id,place:venue.city,type:'transfer',detail:'Reserve this day for the journey. Search the actual flight or train route, confirm border and transit requirements, then check local arrival dates.',hippos:[]});}const names=selected.filter(h=>h.venueId===venue.id);push({title:`Meet ${names.map(h=>h.name).join(' + ')}`,venueId:venue.id,place:venue.name,type:'visit',detail:venue.viewing,hippos:names.map(h=>h.id)});});while(offset<duration-1)push({title:'A little room for the unexpected',place:stops.at(-1)!.city,type:'free',detail:'Explore the city, rest, or add a second zoo day after checking tickets and viewing information. A quieter schedule is a feature.',hippos:[]});push({title:'Head home, with an excellent story',place:stops.at(-1)!.city,type:'departure',detail:'Confirm your departure airport, transfer and check-in time. Your international journey may arrive home on a different calendar date.',hippos:[]});}
 if(days.length&&t.dayOrder?.length){const ids=new Set(days.map(d=>d.id));if(t.dayOrder.length!==days.length||t.dayOrder.some(id=>!ids.has(id)))warnings.push('Your route or trip length changed. The automatic day layout is being used; notes for matching activities are retained.');else if(!validDayOrder(days,t.dayOrder)){issues.push('The edited day order conflicts with the required arrival, transfer and zoo-visit sequence. Reset the day layout to continue.');days=[];}else {const byId=new Map(days.map(d=>[d.id,d]));days=t.dayOrder.map(id=>byId.get(id)!);}}
 let currentCity=stops[0]?.city||'';
 days=days.map((d,i)=>{if(d.venueId)currentCity=registry.find(v=>v.id===d.venueId)!.city;return {...d,place:d.type==='free'?currentCity:d.place,date:addDays(t.start,i),baseTitle:d.title,title:t.dayEdits?.[d.id]?.title?.trim()||d.title,notes:t.dayEdits?.[d.id]?.notes||''};});
 return {days,issues,warnings,venues:stops,minimumDays,nights,total,perPerson:total/t.adults,costs};
}
export function icsEscape(s:string):string{return s.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(';','\\;').replaceAll(',','\\,');}
export function tripCalendar(days:TripDay[], now=new Date()):string {const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Hippo World Tour//Trip Planner//EN','CALSCALE:GREGORIAN','X-WR-CALNAME:Hippo World Tour'];for(const day of days){const dt=day.date.replaceAll('-','');lines.push('BEGIN:VEVENT',`UID:hippo-${dt}-${day.type}@hippoworldtour`, `DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${dt}`,`DTEND;VALUE=DATE:${addDays(day.date,1).replaceAll('-','')}`,`SUMMARY:${icsEscape(day.title)}`,`LOCATION:${icsEscape(day.place)}`,`DESCRIPTION:${icsEscape('Proposed itinerary. Confirm all bookings. '+day.detail+(day.notes?'\nYour notes: '+day.notes:''))}`,'END:VEVENT');}lines.push('END:VCALENDAR');return lines.map(line=>{const points=Array.from(line);let out='',part='',bytes=0;for(const c of points){const len=new TextEncoder().encode(c).length;if(bytes+len>72){out+=part+'\r\n ';part='';bytes=1;}part+=c;bytes+=len;}return out+part;}).join('\r\n')+'\r\n';}
