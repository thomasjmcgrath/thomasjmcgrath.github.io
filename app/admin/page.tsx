import {Admin} from '@/components/Admin';
export const metadata={title:'Owner dashboard',robots:{index:false,follow:false}};
export default function Page(){return <section className="page-section cream"><div className="container"><p className="eyebrow">CATALOG / SOURCES / OWNER TOOLS</p><h1 className="page-title">KEEP THE<br/><em>FIELD NOTES FRESH.</em></h1><p className="page-intro">Review source changes and maintain the visitor guidance behind each profile.</p><Admin/></div></section>;}
