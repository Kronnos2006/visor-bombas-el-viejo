import {pumpNames} from './pump-names.js';
import {pumpData,MENSAJE_GUARDADO} from './pump-data.js';
import {datosDeExcel} from './asignacion-bombas.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const CAMPOS_PENDIENTES=[['tag','TAG de la máquina'],['nombre','Nombre de la máquina'],['marca','Marca'],['modelo','Modelo'],['serie','Número de serie'],['servicio','Servicio / fluido'],['potencia','Potencia (kW)'],['rpm','Velocidad (rpm)'],['size','Tamaño'],['caudal','Caudal (GPM)'],['altura','Altura (m)'],['impulsor','Impulsor (mm)'],['temperatura','Temperatura de trabajo'],['motor','Motor'],['acople','Elemento de acople'],['rodamiento_delantero','Rodamiento delantero'],['rodamiento_trasero','Rodamiento trasero'],['sello','Sello mecánico'],['sello_marca','Marca del sello'],['sello_modelo','Modelo del sello'],['sello_codigo','Código del sello'],['sello_diametro','Diámetro del sello (con unidad)'],['sello_material','Materiales del sello'],['motor_marca','Marca del motor'],['motor_modelo','Modelo del motor'],['motor_serie','Serie del motor'],['empaque','Empaque'],['orings','O-rings'],['observaciones','Observaciones']];
export function clavePendiente(s){return s.clave||'integrado:'+(s.sectorClave||s.sector)+':'+s.nombre;}
export function fotoClavePendiente(s){const key=clavePendiente(s);return s.fotoKey||(s.tagAsignado&&key==='nuevo:'+s.tagAsignado?'='+s.tagAsignado:key);}
export function renderEquipmentEdit(titulo,editor){
 const link=({href,ir,campo},label)=>'<a href="'+esc(href)+'"'+(ir?' data-ir="'+esc(ir)+'"':'')+(campo?' data-campo="'+esc(campo)+'"':'')+'>'+esc(label)+'</a>';
 const componentes=[['placa','Placa'],['motor','Motor'],['sello','Sello'],['empaque','Empaque'],['componentes','Rodamientos y acople'],['orings','O-rings']];
 return `<section class="edit-equipment" id="editar-equipo" aria-label="Actualizar ${esc(titulo)}"><h3>Datos y fotos de ${esc(titulo)}</h3><nav class="equipment-primary-actions" aria-label="Editar ${esc(titulo)}">${link(editor('general'),'Editar datos de '+titulo)}${link(editor('fotos'),'Editar fotos de '+titulo)}${link({href:'#documentos-bomba',ir:'documentos'},'Manuales y CAD')}</nav><details class="equipment-components"><summary>Ir a un componente</summary><div class="edit-equipment-links">${componentes.map(([grupo,label])=>link(editor(grupo),label)).join('')}</div></details></section>`;
}
export const pendingEquipmentEditor=grupo=>({
 href:grupo==='fotos'?'#ficha-fotos':'#editar-datos',
 ir:grupo==='fotos'?'fotos':'datos',
 campo:{placa:'marca',motor:'motor_marca',sello:'sello',empaque:'empaque',componentes:'rodamiento_delantero',orings:'orings'}[grupo]
});
export function montarEdicionDeReferencia(panel,s,alActualizar){
 const key=clavePendiente(s),editor=panel.querySelector('#editar-datos'),destino=panel.querySelector('#ficha-fotos');
 if(!editor||!destino)return;
 const live=panel.querySelector('form[data-reference]');
 let datos={};try{datos=JSON.parse(localStorage.getItem(key))||{};if(live?.dataset.reference===key)datos={...datos,...Object.fromEntries(new FormData(live))};}catch{}
 // Lo que el usuario guardó manda; lo vacío se completa con el Excel.
 datos={...datosDeExcel(s.excel),...Object.fromEntries(Object.entries(datos).filter(([,v])=>v))};
 const titulo=s.tagAsignado||pumpNames.nameOf(key)||datos.nombre||'esta bomba';
 editor.innerHTML=`<summary>Editar datos de ${esc(titulo)}</summary><form id="nombre-bomba" class="block"><label class="field">Nombre o código de la bomba<input name="nombre" maxlength="120" value="${esc(datos.nombre||'')}" placeholder="Ej.: B14 o Alambique UQ" style="width:100%;box-sizing:border-box"></label><button class="primary wide" type="submit">Guardar nombre</button><p role="status" id="nombre-estado"></p></form><p class="notice">${s.excel?"Datos tomados del Excel de bombas. Podés corregirlos aquí; lo que guardes queda por encima del Excel."+(s.excel.obs?" Observación: "+esc(s.excel.obs):""):"Bomba individual identificada por su geometría en el modelo 3D. Podés actualizar sus datos, componentes y fotos aquí. Confirmá el TAG y los datos técnicos en campo; escribir un TAG no crea ni vincula una ficha automáticamente. Los campos pendientes permanecen vacíos."}</p><form id="maquina-pendiente" data-reference="${esc(key)}"><h3>Ingresar datos de máquina</h3><div class="fields">${CAMPOS_PENDIENTES.filter(([id])=>id!=='nombre').map(([id,label])=>`<label class="field">${esc(label)}<input name="${id}" maxlength="500" value="${esc(datos[id]||'')}" style="width:100%;box-sizing:border-box"></label>`).join('')}</div><button class="primary wide" type="submit">Guardar datos</button><p role="status" id="maquina-estado"></p></form>`;
 panel.querySelector('#nombre-bomba').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,estado=form.querySelector('#nombre-estado'),button=form.querySelector('button'),valor=form.nombre.value;button.disabled=true;estado.textContent='Guardando…';
  try{
   const result=await pumpNames.save(key,valor);if(!form.isConnected)return;
   encabezado();
   estado.textContent={done:'Nombre guardado para todo el equipo.',offline:'Guardado en este celular. Se comparte cuando vuelva la señal.','signed-out':'Guardado en este navegador. Entrá con tu cuenta para compartirlo.','read-only':'Guardado en este navegador. Tu cuenta solo permite consultar.'}[result]||'Guardado en este navegador. Todavía no se pudo compartir; se reintenta solo.';
  }catch{estado.textContent='No se pudo guardar. Revisá el almacenamiento del navegador.';}
  finally{button.disabled=false;}
 };
 panel.querySelector('#maquina-pendiente').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,button=form.querySelector('button[type=submit]');button.disabled=true;form.querySelector('#maquina-estado').textContent='Guardando…';
  let msg;try{const result=await pumpData.save(key,Object.fromEntries(new FormData(form)));msg=MENSAJE_GUARDADO[result]||'Guardado en este navegador. Todavía no se pudo compartir; se reintenta solo.';}catch{msg='No se pudo guardar. Revisá el almacenamiento del navegador.';}
  if(!form.isConnected)return;
  await alActualizar?.();
  if(panel.querySelector('#maquina-pendiente')?.dataset.reference===key){panel.querySelector('#editar-datos').open=true;panel.querySelector('#maquina-estado').textContent=msg;}
 };
 // Si otra persona guarda datos de esta bomba, la ficha se actualiza sola (salvo que esté escribiendo).
 if(panel._alCambiarDatos)document.removeEventListener('vocatus:datos',panel._alCambiarDatos);
 const alCambiar=panel._alCambiarDatos=()=>{const f=panel.querySelector('#maquina-pendiente');if(!f||f.dataset.reference!==key){document.removeEventListener('vocatus:datos',alCambiar);panel._alCambiarDatos=null;return;}if(!f.contains(document.activeElement))alActualizar?.();};
 document.addEventListener('vocatus:datos',alCambiar);
 panel.querySelectorAll('[data-ir]').forEach(a=>a.onclick=e=>{e.preventDefault();const target=a.dataset.ir==='documentos'?panel.querySelector('#documentos-bomba'):a.dataset.ir==='fotos'?destino:editor;if(target.tagName==='DETAILS')target.open=true;else if(a.dataset.ir==='documentos'){const detalles=target.querySelector('details');if(detalles)detalles.open=true;}target.scrollIntoView({behavior:'smooth',block:'start'});const campo=a.dataset.campo&&panel.querySelector(`#maquina-pendiente [name="${a.dataset.campo}"]`);if(campo)setTimeout(()=>campo.focus({preventScroll:true}),350);});
 const encabezado=()=>{const el=document.getElementById('selected-tag');if(el)el.textContent=s.tagAsignado||pumpNames.nameOf(key)||'Sin TAG';};encabezado();
}

// Datos de esta bomba con la misma forma que una ficha completa, para el «Resumen de la bomba».
export function bombaParaResumen(s){
 const key=clavePendiente(s);let guardado={};try{guardado=JSON.parse(localStorage.getItem(key))||{};}catch{}
 const d={...datosDeExcel(s.excel),...Object.fromEntries(Object.entries(guardado).filter(([,v])=>v))};
 const conUnidad=(v,u)=>v&&/^[\d.,\s-]+$/.test(String(v))?`${v} ${u}`:v||'';
 return {tag:s.tagAsignado||'Sin TAG',identidadEditada:guardado.marca||guardado.modelo?{marca:guardado.marca,modelo:guardado.modelo}:null,nombre:d.nombre||s.excel?.nombre||s.nombre,marca:d.marca,modelo:d.modelo,catalogo:d.catalogo,servicio:d.servicio,size:d.size,
  specs:[['Caudal',conUnidad(d.caudal,'GPM')],['Altura',conUnidad(d.altura,'m')],['Velocidad de bomba',conUnidad(d.rpm,'rpm')],['Impulsor',conUnidad(d.impulsor,'mm')]],
  motor:{marca:[d.motor_marca,d.motor_modelo].filter(Boolean).join(' ')||d.motor||'',potencia:conUnidad(d.potencia,'kW'),rpm:''},
  seal:{tipo:d.sello||[d.sello_marca,d.sello_modelo].filter(Boolean).join(' '),diametro:d.sello_diametro||''},
  acople:d.acople,rodamientos:{delantero:d.rodamiento_delantero,trasero:d.rodamiento_trasero},observaciones:d.observaciones,temperaturaTexto:d.temperatura||''};
}
