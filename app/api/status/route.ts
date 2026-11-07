import { providers,sourceStatus,json } from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){try{return json({...providers(),checks:await sourceStatus(),database:'connected'});}catch{return json({...providers(),checks:[],database:'unavailable'},503);}}
