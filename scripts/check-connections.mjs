const origin=new URL(process.env.HIPPO_SITE_URL||'http://localhost:5173');
if(origin.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(origin.hostname))throw Error('Use HTTPS for a hosted site.');
async function read(path){const response=await fetch(new URL(path,origin),{redirect:'error',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('The site status endpoint is unavailable.');return response.json();}
const status=await read('/api/status'),trends=await read('/api/trends');
console.log(JSON.stringify({database:status.database,flights:status.flights?.status,externalInterest:trends.status,measuredAnimals:trends.rows?.length||0},null,2));
if(status.database!=='connected'||process.argv.includes('--require-data')&&(!status.flights?.configured||trends.status!=='available'))process.exitCode=1;
