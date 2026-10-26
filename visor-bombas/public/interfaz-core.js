// Reglas de presentación compartidas, sin acceso a archivos ni almacenamiento.
export const knownValue=v=>v!=null&&String(v).trim()!==''&&!/^(?:por confirmar|sin dato|sin levantar|pendiente|<pendiente)/i.test(String(v).trim());
export const normalizeSearch=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\s\-–—]+/g,'');
export const searchPump=(p,q)=>normalizeSearch([p.tag,p.nombre,p.servicio,p.zona,p.marca,p.modelo,p.serie,p.size].filter(v=>v!=null).join(' ')).includes(normalizeSearch(q));
export {verificationOf,verificationText} from './verification-core.js';
export function completeness(p={}){
 const spec=n=>(p.specs||[]).find(([k])=>k===n)?.[1];
 const values=[p.marca,p.modelo,p.serie,p.size,p.servicio,spec('Caudal'),spec('Altura'),spec('Velocidad de bomba'),p.motor?.marca,p.motor?.potencia,p.seal?.tipo,p.seal?.diametro];
 return {done:values.filter(knownValue).length,total:values.length};
}
export function storageDescription({demo,writable,vaultName}){
 if(!writable)return 'Solo este navegador · sin sincronización con Obsidian';
 if(demo)return 'Demostración · informes en la bóveda de prueba; rangos de temperatura en este navegador';
 return 'Obsidian · '+(vaultName||'bóveda local');
}
