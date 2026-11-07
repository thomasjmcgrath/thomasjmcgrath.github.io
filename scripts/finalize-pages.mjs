import {readFile,mkdir,writeFile,access} from 'node:fs/promises';
import {join} from 'node:path';
import {pageRoutes} from './pages-routes.mjs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function finalizePages(directory='dist'){
 const template=await readFile(join(directory,'index.html'),'utf8');
 for(const r of pageRoutes){
  const title=r.path==='/'?r.title:r.title+' · Hippo World Tour';
  const html=template.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escape(title)+'</title>');
  const folder=join(directory,r.path.slice(1));await mkdir(folder,{recursive:true});await writeFile(join(folder,'index.html'),html);
 }
 await writeFile(join(directory,'404.html'),template.replace(/<title>[\s\S]*?<\/title>/,'<title>Different puddle · Hippo World Tour</title>'));
 await writeFile(join(directory,'.nojekyll'),'');
 await access(join(directory,'data/news.json'));
 console.log('Prepared '+pageRoutes.length+' GitHub Pages routes and the fallback page.');
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)await finalizePages();
