import { recordEvent,json } from '@/lib/server';
export async function POST(req:Request){try{return await recordEvent(req);}catch{return json({error:'Statistics could not be recorded.'},503);}}
