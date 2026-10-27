import {SECTORES_INT} from './planta-integrada.js';
import {searchPump} from './interfaz-core.js';
export function areasHistorial(pumps,areaOf=p=>p.areaId) {
 const areas=SECTORES_INT.map(a=>({id:a.id,nombre:a.nombre}));
 for(const p of pumps){const id=areaOf(p);if(id&&!areas.some(a=>a.id===id))areas.push({id,nombre:id});}
 return areas.map(a=>({...a,count:pumps.filter(p=>areaOf(p)===a.id).length}));
}
export const filtrarHistorial=(pumps,{area='',query=''}={},areaOf=p=>p.areaId)=>pumps.filter(p=>(!area||areaOf(p)===area)&&searchPump(p,query));
