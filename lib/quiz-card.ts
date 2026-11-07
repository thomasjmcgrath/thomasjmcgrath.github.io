import {hippos} from './catalog';
import {archetypes,validHippo} from './quiz';

export async function downloadQuizCard(id:string,origin:string){
 const match=archetypes.find(a=>a.id===validHippo(id)),hippo=hippos.find(h=>h.id===id);
 if(!match||!hippo)throw Error('Choose a quiz result first.');
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1400;
 const c=canvas.getContext('2d');if(!c)throw Error('Image export is unavailable in this browser.');
 const display=getComputedStyle(document.documentElement).getPropertyValue('--display').trim()||'sans-serif';
 const body=getComputedStyle(document.documentElement).getPropertyValue('--body').trim()||'sans-serif';
 const text=(value:string,x:number,y:number,width:number,lineHeight:number)=>{
  let line='';for(const word of value.split(/\s+/)){if(c.measureText(line+word).width>width&&line){c.fillText(line.trim(),x,y);y+=lineHeight;line='';}line+=word+' ';}if(line)c.fillText(line.trim(),x,y);return y+lineHeight;
 };
 c.fillStyle='#091f25';c.fillRect(0,0,1080,1400);
 c.fillStyle='#d4ff69';c.font='26px '+body;c.fillText('HIPPO WORLD TOUR / THE PERSONALITY QUIZ',64,72);
 c.fillStyle='#fff8e8';c.font='150px '+display;c.fillText(hippo.name.toUpperCase(),64,232);
 c.fillStyle='#d4ff69';c.font='50px '+display;text(match.title.toUpperCase(),68,302,940,52);
 let hasPhoto=false;
 if(hippo.image){try{
  const img=new Image();img.src=hippo.image;await img.decode();
  const x=64,y=360,w=952,h=530,scale=Math.max(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);c.restore();hasPhoto=true;
 }catch{}}
 if(!hasPhoto){c.fillStyle='#174838';c.fillRect(64,360,952,530);c.fillStyle='#d4ff69';c.font='70px '+display;c.fillText('EXCELLENT HIPPO ENERGY.',100,640);}
 c.fillStyle='#fff8e8';c.font='35px '+body;text(match.tagline,64,970,952,46);
 c.fillStyle='#d4ff69';c.font='28px '+body;c.fillText(match.tags.join('  /  ').toUpperCase(),64,1090);
 c.fillStyle='#b7c9ac';c.font='21px '+body;c.fillText('A just-for-fun fictional archetype quiz.',64,1140);
 c.font='19px '+body;text(new URL('/quiz',origin).toString(),64,1180,952,26);
 if(hasPhoto){c.font='15px '+body;text('Archive image: '+hippo.imageCredit+'. Source: '+hippo.imageSource+(hippo.imageLicenseUrl?' · '+hippo.imageLicenseUrl:''),64,1250,952,22);}
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('The result card could not be created.')),'image/png'));
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='my-hippo-match-'+id+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}

