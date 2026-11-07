import {type Hippo,type Venue,statusLabel} from '@/lib/catalog';
import {AddHippo,HippoIcon,Arrow} from './Site';
export function HippoCard({hippo,venue,feature=false}:{hippo:Hippo;venue:Venue;feature?:boolean}){
 return <article className={`hippo-card ${feature?'featured':''}`}>
  <a className="hippo-art" href={`/hippos/${hippo.id}`} style={{backgroundColor:hippo.color}} aria-label={`Meet ${hippo.name}`}>
   {hippo.image?<img src={hippo.image} alt={hippo.imageAlt||`Archive photograph of ${hippo.name}`} style={{objectPosition:hippo.imagePosition}} loading="lazy" decoding="async" width="700" height="550"/>:<><span className="portrait-letter" aria-hidden="true">{hippo.name.slice(0,1)}</span><HippoIcon size={190}/><span className="art-label">ILLUSTRATED SPECIES ICON</span></>}
   <span className="country-stamp">{hippo.countryCode}</span><span className="photo-label">{hippo.image?'ARCHIVE IMAGE':'FIELD NOTES'}</span><span className="art-arrow"><Arrow/></span>
  </a>
  {hippo.image&&hippo.imageSource&&<p className="card-photo-credit"><a href={hippo.imageSource} target="_blank" rel="noreferrer">Image: {hippo.imageCredit} ↗</a>{hippo.imageLicenseUrl&&<a href={hippo.imageLicenseUrl} target="_blank" rel="noreferrer">Licence ↗</a>}</p>}
  <div className="hippo-info">
   <span className="micro">{hippo.species==='pygmy'?'PYGMY HIPPO':'COMMON HIPPO'} / {venue.country}</span>
   <a href={`/hippos/${hippo.id}`}><h3>{hippo.name.toUpperCase()}{hippo.nativeName&&<small>{hippo.nativeName}</small>}</h3></a>
   <p>{hippo.intro}</p><div className="venue-line"><span className={`status-dot ${venue.status==='off-show'?'orange':''}`}/>{venue.city}</div>
   <div className="card-bottom"><span className="status-text">{statusLabel(venue.status)}</span><AddHippo id={hippo.id}/></div>
  </div>
 </article>;
}
