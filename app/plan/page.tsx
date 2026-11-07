import {Planner} from '@/components/Planner';
export const metadata={title:'Plan my hippo trip'};
export default function Page(){return <section className="page-section cream planner-page"><div className="container"><p className="eyebrow">YOUR NEXT VERY GOOD IDEA</p><h1 className="page-title">LET'S MAKE<br/><em>THE HIPPO TRIP.</em></h1><p className="page-intro">Pick the personalities. Give the journey enough time.<br/>Your plans update as you edit, with every allowance clearly labelled.</p><Planner/></div></section>;}
