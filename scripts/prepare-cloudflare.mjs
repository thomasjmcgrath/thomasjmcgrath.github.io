import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
/**
 * @template {Record<string, any>} T
 * @param {T} built
 * @param {{databaseId?:string,accountId?:string,name?:string}} [options]
 */
export function standaloneConfig(built,options={}){
 const {databaseId,accountId,name='hippo-world-tour'}=options;
 if(!/^[a-f0-9-]{36}$/i.test(databaseId||''))throw Error('Set CLOUDFLARE_D1_DATABASE_ID to the D1 database ID.');
 if(accountId&&!/^[a-f0-9]{32}$/i.test(accountId))throw Error('Set a valid CLOUDFLARE_ACCOUNT_ID.');
 if(!/^[a-z0-9][a-z0-9-]{0,62}$/.test(name))throw Error('Use a lowercase Cloudflare Worker name.');
 return {...built,name,...(accountId?{account_id:accountId}:{}),vars:{HIPPO_STANDALONE:'1'},services:[],d1_databases:[{binding:'DB',database_name:name,database_id:databaseId,migrations_dir:'../../drizzle'}]};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const built=JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
 const config=standaloneConfig(built,{databaseId:process.env.CLOUDFLARE_D1_DATABASE_ID,accountId:process.env.CLOUDFLARE_ACCOUNT_ID,name:process.env.HIPPO_WORKER_NAME||'hippo-world-tour'});
 await writeFile('dist/server/wrangler.standalone.json',JSON.stringify(config,null,2)+'\n');
 console.log('Prepared standalone Cloudflare deployment configuration.');
}
