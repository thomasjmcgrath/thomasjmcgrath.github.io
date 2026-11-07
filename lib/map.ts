import type {Venue} from './catalog.ts';
export type MapView={x:number;y:number;w:number;h:number};
export const WORLD_VIEW:MapView={x:0,y:0,w:1000,h:500};
export function projectVenue(v:Pick<Venue,'lat'|'lon'>){return {x:(v.lon+180)/360*1000,y:(90-v.lat)/180*500};}
export function clampMapView(v:MapView):MapView {const w=Math.max(125,Math.min(1000,v.w)),h=w/2;return {x:Math.max(0,Math.min(1000-w,v.x)),y:Math.max(0,Math.min(500-h,v.y)),w,h};}
export function zoomMap(v:MapView,factor:number):MapView {const w=v.w/factor,h=w/2;return clampMapView({x:v.x+(v.w-w)/2,y:v.y+(v.h-h)/2,w,h});}
export function fitVenues(points:Pick<Venue,'lat'|'lon'>[]):MapView {if(!points.length)return {...WORLD_VIEW};const projected=points.map(projectVenue),xs=projected.map(p=>p.x),ys=projected.map(p=>p.y);const w=Math.max(150,Math.max(...xs)-Math.min(...xs)+90,(Math.max(...ys)-Math.min(...ys)+60)*2);return clampMapView({x:(Math.min(...xs)+Math.max(...xs)-w)/2,y:(Math.min(...ys)+Math.max(...ys)-w/2)/2,w,h:w/2});}
