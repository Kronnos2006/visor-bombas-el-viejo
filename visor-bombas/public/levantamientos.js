import {explainSyncError,listCloudSurveys,surveyConnection,surveyPackage} from './cloud-surveys.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const aviso=(kind,text)=>{$('#estado').innerHTML=`<div class="msg ${kind}">${esc(text)}</div>`;};

function detalle(data){
 const labels=data.fieldLabels||{},rows=Object.entries(data.fields||{}).map(([id,value])=>[labels[id]||id.replaceAll('_',' '),value]);
 if(data.orings?.length)rows.push(['O-rings',data.orings.map(o=>[o.posicion,o.medida,o.material,o.codigo].filter(Boolean).join(' · ')).join('; ')]);
 if(data.observations)rows.push(['Observaciones',data.observations]);
 return rows.map(([label,value])=>`<p><b>${esc(label)}:</b> ${esc(value)}</p>`).join('')||'<p class="muted">Sin datos escritos.</p>';
}
function guardarArchivo(pkg){
 const url=URL.createObjectURL(new Blob([JSON.stringify(pkg)],{type:'application/json'}));
 const a=Object.assign(document.createElement('a'),{href:url,download:`levantamiento_${pkg.tag}_${pkg.date||'sin-fecha'}_${pkg.id.slice(0,8)}.json`});
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
try{
 const connection=await surveyConnection();
 if(!connection)aviso('warn','Entrá con tu cuenta para ver los levantamientos.');
 else{
  const rows=await listCloudSurveys(connection);
  aviso(rows.length?'ok':'warn',rows.length?rows.length+' levantamiento(s) recibidos.':'Todavía no hay levantamientos recibidos.');
  $('#lista').innerHTML=rows.map((row,i)=>`<section class="card"><h2>${esc(row.tag)}</h2><p class="muted">${esc(row.data.author||'Responsable por indicar')} · ${esc(new Date(row.created_at).toLocaleString('es-CR'))} · ${(row.data.photos||[]).length} foto(s)</p>${detalle(row.data)}<button type="button" data-i="${i}">Descargar paquete</button></section>`).join('');
  $('#lista').onclick=async event=>{
   const button=event.target.closest('button[data-i]');if(!button)return;button.disabled=true;
   try{guardarArchivo(await surveyPackage(connection,rows[Number(button.dataset.i)]));}
   catch(error){console.error(error);aviso('err',explainSyncError(error,'No se pudo descargar el paquete. Revisá la señal y reintentá.'));}
   finally{button.disabled=false;}
  };
 }
}catch(error){console.error(error);aviso('err',explainSyncError(error,'No se pudieron leer los levantamientos. Revisá la señal y recargá la página.'));}
