import { catalog,json } from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){return json(await catalog());}
