// Ubicación de cada TAG según la lista del usuario (5-nov-2026) y datos de su Excel.
// No borra ni reescribe datos existentes: decide qué TAG muestra cada lugar del 3D.
export const claveCuerpo=tag=>'tag:'+tag;
export function indexarAsignacion(data){
 return {porLugar:new Map((data?.A||[]).map(a=>[a.id,a])),quitar:new Set(data?.Q||[]),nuevas:data?.N||[],excel:data?.excel||{}};
}
export const nombreExcel=(as,tag)=>as.excel[tag]?.nombre||'';
export const tituloTag=(as,tag)=>nombreExcel(as,tag)?`${tag} · ${nombreExcel(as,tag)}`:tag;
export function sectorDePosicion(x,z){
 if(x<-20)return 'DUSA';
 if(z<-15)return 'REF Detalle';
 if(z>9)return 'REF Almacenamiento alcohol';
 return 'REF Cuatro tanques detalle';
}
const CAMPOS=[['liquido','Líquido'],['bomba','Bomba'],['tamano','Tamaño'],['sello','Sello'],['motor','Motor'],['acople','Acople'],['rodDel','Rodamiento delantero'],['rodTra','Rodamiento trasero'],['obs','Observaciones']];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function bloqueExcel(as,tag){
 const d=as.excel[tag];if(!d)return '';
 const filas=CAMPOS.filter(([k])=>d[k]).map(([k,l])=>`<div class="field"><dt>${l}</dt><dd>${esc(d[k])}</dd></div>`).join('');
 return `<section class="block" id="datos-excel"><h3>${esc(tag)} · ${esc(d.nombre)}</h3><p>${esc(d.area)}</p>${filas?`<dl class="fields">${filas}</dl>`:'<p>El Excel todavía no tiene datos de esta bomba.</p>'}</section>`;
}

// Convierte una fila del Excel en los campos de la ficha. Lo que falta queda vacío.
export function datosDeExcel(e){
 if(!e)return {};
 const partes=String(e.bomba||'').split('·').map(x=>x.trim()).filter(Boolean),valor=n=>partes.find(x=>x.toLowerCase().startsWith(n.toLowerCase()+':'))?.split(':').slice(1).join(':').trim()||'';
 const libres=partes.filter(x=>!x.includes(':')),inicio=libres[0]?.split(/\s+/)||[];
 const conMarca=libres.length>1||inicio.length>1;
 const d={marca:conMarca?inicio[0]:libres[0]||'',modelo:libres.length>1?libres.slice(1).join(' '):inicio.slice(1).join(' '),servicio:e.liquido,size:e.tamano,caudal:valor('GPM'),altura:valor('HD [m]'),rpm:valor('RPM'),impulsor:valor('Ø Imp [mm]')||(valor('Ø Imp [pulg]')?valor('Ø Imp [pulg]')+' pulg':''),motor:e.motor,acople:e.acople,rodamiento_delantero:e.rodDel,rodamiento_trasero:e.rodTra,sello:e.sello};
 return Object.fromEntries(Object.entries(d).filter(([,v])=>v));
}
