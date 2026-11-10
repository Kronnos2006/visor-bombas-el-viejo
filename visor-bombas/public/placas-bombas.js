// Datos leídos en las placas (fotos del visor, 9 y 10 de noviembre de 2026) y enlace al manual de cada bomba.
// Si la placa contradice al Excel, manda la placa. El archivo se arma desde la tabla completa de bombas.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let datos={},carga=null;
export function cargarPlacas(url='/modelos/placas-bombas.json?v=20261110'){
 carga??=fetch(url).then(r=>r.ok?r.json():{}).then(j=>{datos=j&&typeof j==='object'?j:{};return datos;}).catch(()=>{carga=null;return datos;});
 return carga;
}
export const placaDe=tag=>datos[String(tag||'').toUpperCase()]||null;
export function fijarPlacas(j){datos=j||{};carga=Promise.resolve(datos);}
const enlaceSeguro=u=>/^https:\/\/[^\s"'<>]+$/i.test(String(u||''))?u:'';
export function bloquePlaca(tag){
 const p=placaDe(tag);if(!p)return '';
 const filas=[['Placa de la bomba',p.placa],['Motor (placa)',p.motor],['De dónde sale',p.fuente]].filter(([,v])=>v).map(([l,v])=>`<div class="field"><dt>${l}</dt><dd>${esc(v)}</dd></div>`).join('');
 const url=enlaceSeguro(p.manual?.url);
 const manual=p.manual?(url?`<a class="primary wide manual-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">📘 Abrir manual: ${esc(p.manual.texto)}</a>`:`<p class="muted">${esc(p.manual.texto)}</p>`):'';
 const aviso=/manda/i.test(p.fuente||'')?'<p class="notice">Esta placa no coincide con el Excel. Vale lo que dice la placa.</p>':'';
 return `<section class="block" id="placa-manual" data-tag="${esc(tag)}"><h3>Placa y manual · ${esc(tag)}</h3>${aviso}${filas?`<dl class="fields">${filas}</dl>`:''}${manual}</section>`;
}
