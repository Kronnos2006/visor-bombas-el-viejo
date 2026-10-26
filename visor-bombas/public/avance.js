import {verificationText} from './verification-core.js';
import {filterProgress} from './avance-core.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LABELS={placa:'Placa',sello:'Sello',empaque:'Empaque',orings:'O-rings',fotos:'Fotos',bodega:'Bodega'};
// Fotos: qué categoría requerida falta y cuántas fotos antiguas esperan clasificación (no se adivina qué muestran).
const fotosNota=r=>{const f=r.fotos;if(!f)return '';const falta=[!f.placa1&&'placa de la bomba',!f.bomba&&'foto de la bomba'].filter(Boolean);const partes=[falta.length&&'Fotos: falta '+falta.join(' y '),f.sinClasificar&&f.sinClasificar+' foto(s) sin clasificar'].filter(Boolean);return partes.length?`<small class="muted">${esc(partes.join(' · '))}</small>`:'';};
let data={rows:[]};
function render(){
 const rows=filterProgress(data.rows||[],{kind:$('#kind').value,only:$('#only').value,verified:$('#verified').value});
 const pct=rows.length?Math.round(rows.reduce((sum,r)=>sum+(r.total?r.done/r.total:0),0)/rows.length*100):0;
 $('#stats').innerHTML=`<div><b>${rows.length}</b><span>equipos en la vista</span></div><div><b>${pct}%</b><span>documentación completa</span></div><div><b>${rows.filter(r=>r.done===r.total).length}</b><span>fichas documentadas</span></div><div><b>${rows.filter(r=>r.verification.verified).length}</b><span>verificadas en campo${data.demo?' · DEMO':''}</span></div>`;
 $('#rows').innerHTML=rows.map(r=>`<tr><td><strong>${esc(r.tag)}</strong>${r.demo||data.demo?' <span class="demo-chip">DEMO</span>':''}<br><span class="muted">${esc(r.servicio||r.area)}</span></td><td><div class="chips">${Object.entries(r.checks).map(([k,v])=>`<span class="chip ${v===null?'na':v?'ok':'no'}">${v===null?'–':v?'✓':'○'} ${LABELS[k]||esc(k)}</span>`).join('')}</div>${fotosNota(r)}</td><td>${r.done}/${r.total}<div class="bar" role="progressbar" aria-label="Documentación de ${esc(r.tag)}" aria-valuenow="${r.percent}" aria-valuemin="0" aria-valuemax="100"><i style="width:${r.percent}%"></i></div></td><td>${r.verification.verified?`<span class="chip ok">Identidad, placa y repuestos${data.demo?' · DEMO':''}</span><br><small>${esc(r.verification.date)} · ${esc(r.verification.author)}</small>`:`<span class="chip no">${esc(verificationText(r.verification))}</span>`}</td><td class="no-print"><a href="/levantamiento.html?tag=${encodeURIComponent(r.tag)}">Levantar →</a></td></tr>`).join('')||'<tr><td colspan="5">No hay equipos con estos filtros.</td></tr>';
}
try{
 const r=await fetch('/api/progress'),result=await r.json();if(!r.ok)throw Error(result.error);data=result;
 const inv=data.inventory;$('#inventory-note').textContent=inv?`Avance: ${inv.progressTotal} fichas (${inv.availableB} equipos B + ${inv.availableP} bombas P del PFD). Visor: ${inv.viewerTotal} elementos (${inv.registeredB} equipos B + ${inv.reference3D} referencias 3D sin TAG). Las referencias sin TAG no son fichas verificables. ${inv.unmappedB} fichas B adicionales no están asociadas al mapa.${inv.missingB.length?' Faltan fichas de: '+inv.missingB.join(', '):''}`:'';
 $('#mode').textContent=data.demo?'Modo demostración: fichas y verificaciones de ejemplo.':'';
 if(data.errors?.length)$('#mode').textContent+=' No se pudieron leer: '+data.errors.map(e=>e.tag+' ('+e.error+')').join(', ');
}catch(e){$('#mode').textContent='No se pudo leer el avance: '+e.message;}
for(const id of ['kind','only','verified'])$('#'+id).onchange=render;
render();
