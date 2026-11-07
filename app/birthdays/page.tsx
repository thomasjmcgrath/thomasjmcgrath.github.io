import {Birthdays} from '@/components/Birthdays';
export const metadata={title:'The Hippo Birthday Calendar',description:'Sourced hippo birth-date anniversaries with a downloadable calendar. Zoo events are listed separately in the news bulletin.'};
export const dynamic='force-dynamic';
export default function Page(){return <section className="section cream"><div className="container"><p className="eyebrow">SEVEN MAIN CHARACTERS / MANY REASONS FOR CAKE</p><h1 className="page-title">BIG BIRTHDAY<br/><em>ENERGY.</em></h1><p className="page-intro">A calendar for people who remember a hippo’s birthday before their own plans.</p><Birthdays asOf={new Date().toISOString().slice(0,10)}/></div></section>;}
