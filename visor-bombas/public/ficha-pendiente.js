import {SECTORES_INT, sectorDe} from './planta-integrada.js';
import {originales, htmlFotos, fotosActualizadas, guardarFoto, bindPhotoTransfers} from './fotos-bomba.js';
import {photoInputStarted,setPhotoInputStatus} from './fotos-bomba.js';
import {pumpNames} from './pump-names.js';
import {pumpData,MENSAJE_GUARDADO} from './pump-data.js';
import {datosDeExcel} from './asignacion-bombas.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const CAMPOS_PENDIENTES=[['tag','TAG de la máquina'],['nombre','Nombre de la máquina'],['marca','Marca'],['modelo','Modelo'],['serie','Número de serie'],['servicio','Servicio / fluido'],['potencia','Potencia (kW)'],['rpm','Velocidad (rpm)'],['size','Tamaño'],['caudal','Caudal (GPM)'],['altura','Altura (m)'],['impulsor','Impulsor (mm)'],['temperatura','Temperatura de trabajo'],['motor','Motor'],['acople','Elemento de acople'],['rodamiento_delantero','Rodamiento delantero'],['rodamiento_trasero','Rodamiento trasero'],['sello','Sello mecánico'],['sello_marca','Marca del sello'],['sello_modelo','Modelo del sello'],['sello_codigo','Código del sello'],['sello_diametro','Diámetro del sello (con unidad)'],['sello_material','Materiales del sello'],['motor_marca','Marca del motor'],['motor_modelo','Modelo del motor'],['motor_serie','Serie del motor'],['empaque','Empaque'],['orings','O-rings'],['observaciones','Observaciones']];
export function clavePendiente(s){return s.clave||'integrado:'+(s.sectorClave||s.sector)+':'+s.nombre;}
export async function abrirFichaPendiente(panel,s){
 const key=clavePendiente(s),sector=SECTORES_INT.find(x=>x.id===sectorDe(s.sector))?.nombre||s.sector;
 const live=panel.querySelector('form[data-reference]');
 let datos={};try{datos=JSON.parse(localStorage.getItem(key))||{};if(live?.dataset.reference===key)datos={...datos,...Object.fromEntries(new FormData(live))};}catch{}
 // Lo que el usuario guardó manda; lo vacío se completa con el Excel.
 datos={...datosDeExcel(s.excel),...Object.fromEntries(Object.entries(datos).filter(([,v])=>v))};
 const ubicacion=datos.nombre||s.excel?.nombre||'';
 const rows=items=>'<dl class="fields">'+items.map(([label,id])=>`<div class="field"><dt>${esc(label)}</dt><dd>${esc(id==='nombre'?ubicacion:datos[id]||'')}</dd></div>`).join('')+'</dl>';
 const resumen=`<div class="block"><h3>Resumen de la bomba</h3>${rows([['Servicio','servicio'],['Ubicación','nombre'],['Tamaño','size'],['Caudal (GPM)','caudal'],['Altura (m)','altura'],['Velocidad (rpm)','rpm'],['Impulsor (mm)','impulsor'],['Temperatura de trabajo','temperatura'],['Motor','motor']])}</div><div class="block"><h3>Componentes críticos</h3>${rows([['Sello mecánico','sello'],['Empaque','empaque'],['O-rings','orings'],['Elemento de acople','acople'],['Rodamiento delantero','rodamiento_delantero'],['Rodamiento trasero','rodamiento_trasero']])}</div>`;
 // Misma estructura que las bombas con ficha completa (ej. B31): Datos y fotos → Resumen → resto.
 const titulo=s.tagAsignado||pumpNames.nameOf(key)||datos.nombre||'esta bomba';
 const componentes=[['marca','Datos de la bomba'],['motor_marca','Motor'],['sello','Sello'],['empaque','Empaque'],['rodamiento_delantero','Rodamientos y acople'],['orings','O-rings']];
 panel.innerHTML=`<section class="edit-equipment" id="editar-equipo" aria-label="Actualizar ${esc(titulo)}"><h3>Datos y fotos de ${esc(titulo)}</h3><nav class="equipment-primary-actions" aria-label="Editar ${esc(titulo)}"><a href="#editar-datos" data-ir="datos">Editar datos de ${esc(titulo)}</a><a href="#imagenes-pendientes" data-ir="fotos">Editar fotos de ${esc(titulo)}</a></nav><details class="equipment-components"><summary>Ir a un componente</summary><div class="edit-equipment-links">${componentes.map(([campo,n])=>`<a href="#editar-datos" data-ir="datos" data-campo="${campo}">${esc(n)}</a>`).join('')}</div></details></section><div id="resumen-pendiente"></div><details class="block editar-datos" id="editar-datos"><summary>Editar datos de ${esc(titulo)}</summary><form id="nombre-bomba" class="block"><label class="field">Nombre o código de la bomba<input name="nombre" maxlength="120" value="${esc(datos.nombre||'')}" placeholder="Ej.: B14 o Alambique UQ" style="width:100%;box-sizing:border-box"></label><button class="primary wide" type="submit">Guardar nombre</button><p role="status" id="nombre-estado"></p></form><p class="notice">${s.excel?"Datos tomados del Excel de bombas. Podés corregirlos aquí; lo que guardes queda por encima del Excel."+(s.excel.obs?" Observación: "+esc(s.excel.obs):""):"Bomba individual identificada por su geometría en el modelo 3D. Podés actualizar sus datos, componentes y fotos aquí. Confirmá el TAG y los datos técnicos en campo; escribir un TAG no crea ni vincula una ficha automáticamente. Los campos pendientes permanecen vacíos."}</p><form id="maquina-pendiente" data-reference="${esc(key)}"><h3>Ingresar datos de máquina</h3><div class="fields">${CAMPOS_PENDIENTES.filter(([id])=>id!=='nombre').map(([id,label])=>`<label class="field">${esc(label)}<input name="${id}" maxlength="500" value="${esc(datos[id]||'')}" style="width:100%;box-sizing:border-box"></label>`).join('')}</div><button class="primary wide" type="submit">Guardar datos</button><p role="status" id="maquina-estado"></p></form></details><div id="imagenes-pendientes"></div><p class="muted">Con tu cuenta, los datos y las fotos se comparten con todo el equipo al guardar. Todavía no se vinculan a una ficha de Obsidian.</p>`;
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
  await abrirFichaPendiente(panel,s);if(panel.querySelector('#maquina-pendiente')?.dataset.reference===key)panel.querySelector('#maquina-estado').textContent=msg;
 };
 // Si otra persona guarda datos de esta bomba, la ficha se actualiza sola (salvo que esté escribiendo).
 if(panel._alCambiarDatos)document.removeEventListener('vocatus:datos',panel._alCambiarDatos);
 const alCambiar=panel._alCambiarDatos=()=>{const f=panel.querySelector('#maquina-pendiente');if(!f||f.dataset.reference!==key){document.removeEventListener('vocatus:datos',alCambiar);panel._alCambiarDatos=null;return;}if(!f.contains(document.activeElement))abrirFichaPendiente(panel,s);};
 document.addEventListener('vocatus:datos',alCambiar);
 panel.querySelectorAll('[data-ir]').forEach(a=>a.onclick=e=>{e.preventDefault();const destino=a.dataset.ir==='fotos'?panel.querySelector('#imagenes-pendientes'):panel.querySelector('#editar-datos');if(destino.tagName==='DETAILS')destino.open=true;destino.scrollIntoView({behavior:'smooth',block:'start'});const campo=a.dataset.campo&&panel.querySelector(`#maquina-pendiente [name="${a.dataset.campo}"]`);if(campo)setTimeout(()=>campo.focus({preventScroll:true}),350);});
 const encabezado=()=>{const el=document.getElementById('selected-tag');if(el)el.textContent=s.tagAsignado||pumpNames.nameOf(key)||'Sin TAG';};encabezado();
 const destino=panel.querySelector('#imagenes-pendientes');
 // Las fotos pertenecen a este lugar, aunque cambie su TAG.
 const fotoKey=s.fotoKey||(s.tagAsignado&&key==='nuevo:'+s.tagAsignado?'='+s.tagAsignado:key);
 async function pintar(){
  let act={},photoError='';try{act=await fotosActualizadas(fotoKey,{writable:false});photoError=act.warning||'';}catch(error){photoError=error.message;}if(!destino.isConnected)return;
  destino.innerHTML=htmlFotos({tag:s.tagAsignado||s.nombre,photoKey:fotoKey,photo:s.imagenesLugar?.photo,ubicacionCroquis:s.imagenesLugar?.ubicacionCroquis},s.imagenesLugar?originales(s.imagenesLugar,s.imagenesLugar):{},act,{writable:false});
  bindPhotoTransfers(destino,fotoKey,{writable:false,reference:true},pintar);
  if(photoError){const error=destino.querySelector('#fotos-error');error.textContent=photoError;const retry=document.createElement('button');retry.type='button';retry.textContent='Reintentar leer fotos';retry.onclick=pintar;error.after(retry);}
  destino.querySelectorAll('input[data-slot]').forEach(input=>input.onchange=async()=>{const file=input.files?.[0];if(!file)return;input.disabled=true;try{await photoInputStarted(input);await guardarFoto(fotoKey,input.dataset.slot,file,{writable:false});await pintar();}catch(e){setPhotoInputStatus(input,e.message,true);if(destino.isConnected)destino.querySelector('#fotos-error').textContent=e.message;}finally{input.disabled=false;input.value='';}});
 }
 await pintar();
}

// Datos de esta bomba con la misma forma que una ficha completa, para el «Resumen de la bomba».
export function bombaParaResumen(s){
 const key=clavePendiente(s);let guardado={};try{guardado=JSON.parse(localStorage.getItem(key))||{};}catch{}
 const d={...datosDeExcel(s.excel),...Object.fromEntries(Object.entries(guardado).filter(([,v])=>v))};
 const conUnidad=(v,u)=>v&&/^[\d.,\s-]+$/.test(String(v))?`${v} ${u}`:v||'';
 return {tag:s.tagAsignado||'Sin TAG',nombre:d.nombre||s.excel?.nombre||s.nombre,servicio:d.servicio,size:d.size,
  specs:[['Caudal',conUnidad(d.caudal,'GPM')],['Altura',conUnidad(d.altura,'m')],['Velocidad de bomba',conUnidad(d.rpm,'rpm')],['Impulsor',conUnidad(d.impulsor,'mm')]],
  motor:{marca:[d.motor_marca,d.motor_modelo].filter(Boolean).join(' ')||d.motor||'',potencia:conUnidad(d.potencia,'kW'),rpm:''},
  seal:{tipo:d.sello||[d.sello_marca,d.sello_modelo].filter(Boolean).join(' '),diametro:d.sello_diametro||''},
  acople:d.acople,rodamientos:{delantero:d.rodamiento_delantero,trasero:d.rodamiento_trasero},observaciones:d.observaciones,temperaturaTexto:d.temperatura||''};
}
