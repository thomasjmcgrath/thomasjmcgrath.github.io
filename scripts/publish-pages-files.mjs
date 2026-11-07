import {readdir,readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

const routes=new Set(['hippos','map','plan','news','trends','learn','about','compare','passport','birthdays','watch','quiz']);
export function allowedGeneratedPath(path){
 if(typeof path!=='string'||path.startsWith('/')||path.includes('..')||path.includes('\\'))return false;
 if(['index.html','404.html','.nojekyll','CNAME','data/news.json','favicon.svg'].includes(path))return true;
 if(/^(assets|images|fonts)\/[\w./-]+$/.test(path))return true;
 return routes.has(path.split('/')[0])&&/^(?:[a-z-]+\/){1,2}index\.html$/.test(path);
}
async function filesUnder(root,prefix=''){const out=[];for(const entry of await readdir(join(root,prefix),{withFileTypes:true})){const path=prefix?prefix+'/'+entry.name:entry.name;if(entry.isDirectory())out.push(...await filesUnder(root,path));else if(entry.isFile())out.push(path);else throw Error('Only regular static files are published.');}return out.sort();}
export async function publishFiles(directory='dist',destination='.',stage=false){
 const current=await filesUnder(directory);if(!current.includes('index.html')||current.some(p=>!allowedGeneratedPath(p)))throw Error('Unexpected file in static build output.');
 let previous=[];try{previous=JSON.parse(await readFile(join(destination,'pages-generated.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 if(!Array.isArray(previous)||previous.some(p=>!allowedGeneratedPath(p)))throw Error('Invalid generated-file manifest. Nothing was removed.');
 for(const path of previous)if(!current.includes(path))await rm(join(destination,path),{force:true});
 for(const path of current){const target=join(destination,path);await mkdir(join(target,'..'),{recursive:true});await copyFile(join(directory,path),target);}
 await writeFile(join(destination,'pages-generated.json'),JSON.stringify(current,null,2)+'\n');
 if(stage){const paths=[...new Set([...current,...previous,'pages-generated.json','public/data/news.json'])];execFileSync('git',['add','-A','--pathspec-from-file=-','--pathspec-file-nul'],{cwd:destination,input:Buffer.from(paths.join('\0')+'\0')});}
 console.log('Prepared '+current.length+' static files for branch-based GitHub Pages.');return current;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)await publishFiles('dist','.',process.argv.includes('--stage'));
