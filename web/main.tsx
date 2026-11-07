import React,{useEffect,type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import '../app/globals.css';
import '../app/quiz/quiz.css';
import './pages.css';
import {Site} from '@/components/Site';
import Home from '@/app/page';
import Hippos from '@/app/hippos/page';
import Profile from '@/app/hippos/[slug]/page';
import MapPage from '@/app/map/page';
import Planner from '@/app/plan/page';
import News from '@/app/news/page';
import Trends from '@/app/trends/page';
import Learn from '@/app/learn/page';
import About from '@/app/about/page';
import Compare from '@/app/compare/page';
import Passport from '@/app/passport/page';
import Birthdays from '@/app/birthdays/page';
import Watch from '@/app/watch/page';
import Quiz from '@/app/quiz/page';
import NotFound from '@/app/not-found';
import {hippos} from '@/lib/catalog';

function App(){
 const path=location.pathname.replace(/\/index\.html$/,'/').replace(/\/+$/,'')||'/';
 const searchParams=Object.fromEntries(new URLSearchParams(location.search));
 const names:Record<string,string>={'/':'Go meet your internet hippo','/hippos':'Meet the hippos','/map':'The hippo map','/plan':'Plan my hippo trip','/news':'The Bloat Bulletin','/trends':'The popularity playground','/learn':'Hippo University','/about':'Sources and privacy','/compare':'Compare destinations','/passport':'My hippo passport','/birthdays':'Birthday calendar','/watch':'The desk safari','/quiz':'Find your hippo energy'};
 const animal=path.startsWith('/hippos/')?hippos.find(h=>h.id===path.split('/')[2]):null;
 const shared=path==='/quiz'?hippos.find(h=>h.id===searchParams.result):null;
 const title=animal?.name||shared&&shared.name+' · Hippo energy'||names[path]||'Different puddle';
 useEffect(()=>{document.title=title+' · Hippo World Tour';if(location.hash){requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());}},[title]);
 let page:ReactNode;
 switch(path){
 case '/':page=<Home/>;break;
 case '/hippos':page=<Hippos searchParams={searchParams}/>;break;
 case '/map':page=<MapPage/>;break;
 case '/plan':page=<Planner/>;break;
 case '/news':page=<News searchParams={searchParams}/>;break;
 case '/trends':page=<Trends/>;break;
 case '/learn':page=<Learn/>;break;
 case '/about':page=<About/>;break;
 case '/compare':page=<Compare/>;break;
 case '/passport':page=<Passport searchParams={searchParams}/>;break;
 case '/birthdays':page=<Birthdays/>;break;
 case '/watch':page=<Watch/>;break;
 case '/quiz':page=<Quiz searchParams={searchParams}/>;break;
 default:page=animal?<Profile params={{slug:animal.id}}/>:<NotFound/>;
 }
 return <Site>{page}</Site>;
}

createRoot(document.getElementById('root')!).render(<App/>);
