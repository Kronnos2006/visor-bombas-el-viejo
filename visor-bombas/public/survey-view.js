import {readSavedSurvey} from './survey-drafts.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function savedSurveyHTML(tag,storage=globalThis.localStorage){
 let record;try{record=readSavedSurvey(tag,storage);}catch{return '<section class="local-survey" role="status"><h3>No se pudo leer el cambio local</h3><p>Conservá los datos de este navegador. Abrí el editor para reintentar o descargar el respaldo.</p><a href="/levantamiento.html?tag='+encodeURIComponent(tag)+'">Abrir editor</a></section>';}
 if(!record)return '';
 const data=record.data,labels=data.fieldLabels||{},rows=Object.entries(data.fields||{}).map(([id,value])=>[labels[id]||id.replaceAll('_',' '),value]);
 for(const id of Object.keys(data.clearFields||{}))rows.push([labels[id]||id.replaceAll('_',' '),'Retiro solicitado · pendiente de aplicar a la ficha documental']);
 if(data.orings?.length||data.replaceOrings)rows.push(['O-rings',data.orings?.length?data.orings.map(o=>[o.posicion,o.medida,o.material,o.cantidad?o.cantidad+' unidad(es)':'',o.codigo].filter(Boolean).join(' · ')).join('\n'):'Lista vacía solicitada']);
 if(data.observations)rows.push(['Observaciones',data.observations]);
 if(data.verification?.scopes?.length)rows.push(['Comprobaciones declaradas',data.verification.scopes.join(', ')+(data.verification.evidence?' · '+data.verification.evidence:'')]);
 return `<section class="local-survey" aria-label="Cambios guardados de ${esc(tag)}"><h3>Cambios guardados en ${esc(tag)}</h3><p>Guardados en este navegador por ${esc(data.author||'Responsable por indicar')} · <time datetime="${esc(record.updated)}">${esc(new Date(record.updated).toLocaleString('es-CR'))}</time>.</p><p>Pendientes de trasladar a Obsidian. La ficha documental y el PDF conservan sus datos de origen. Estos cambios no se sincronizan entre equipos.</p>${rows.length?'<dl>'+rows.map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>':''}<a href="/levantamiento.html?tag=${encodeURIComponent(tag)}">Editar o descargar estos cambios</a></section>`;
}
