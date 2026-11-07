const origin=new URL(process.env.HIPPO_SITE_URL||'');
if(origin.protocol!=='https:')throw Error('Set HIPPO_SITE_URL to the HTTPS address of your standalone site.');
if(!process.env.HIPPO_MAINTENANCE_TOKEN)throw Error('Set the maintenance secret before refreshing.');
const response=await fetch(new URL('/api/maintenance',origin),{method:'POST',headers:{Authorization:'Bearer '+process.env.HIPPO_MAINTENANCE_TOKEN,'Content-Type':'application/json'},body:'{}',redirect:'error',signal:AbortSignal.timeout(120000)});
if(!response.ok)throw Error('The authorized maintenance request failed.');
const data=await response.json();
console.log(JSON.stringify({visitorSources:data.visitorSources?.results?.map(r=>({source:r.sourceId,status:r.status})),interest:data.interest?.status,news:data.news?.status||'checked'},null,2));
