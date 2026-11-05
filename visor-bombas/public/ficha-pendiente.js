import {SECTORES_INT, sectorDe} from './planta-integrada.js';
import {originales, htmlFotos, fotosActualizadas, guardarFoto, bindPhotoTransfers} from './fotos-bomba.js';
import {photoInputStarted,setPhotoInputStatus} from './fotos-bomba.js';
import {pumpNames} from './pump-names.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const CAMPOS_PENDIENTES=[['tag','TAG de la máquina'],['nombre','Nombre de la máquina'],['marca','Marca'],['modelo','Modelo'],['serie','Número de serie'],['servicio','Servicio / fluido'],['potencia','Potencia (kW)'],['rpm','Velocidad (rpm)'],['size','Tamaño'],['caudal','Caudal (GPM)'],['altura','Altura (m)'],['impulsor','Impulsor (mm)'],['temperatura','Temperatura de trabajo'],['motor','Motor'],['acople','Elemento de acople'],['rodamiento_delantero','Rodamiento delantero'],['rodamiento_trasero','Rodamiento trasero'],['sello','Sello mecánico'],['sello_marca','Marca del sello'],['sello_modelo','Modelo del sello'],['sello_codigo','Código del sello'],['sello_diametro','Diámetro del sello (con unidad)'],['sello_material','Materiales del sello'],['motor_marca','Marca del motor'],['motor_modelo','Modelo del motor'],['motor_serie','Serie del motor'],['empaque','Empaque'],['orings','O-rings'],['observaciones','Observaciones']];
export function clavePendiente(s){return s.clave||'integrado:'+(s.sectorClave||s.sector)+':'+s.nombre;}
export async function abrirFichaPendiente(panel,s){
 const key=clavePendiente(s),sector=SECTORES_INT.find(x=>x.id===sectorDe(s.sector))?.nombre||s.sector;
 const live=panel.querySelector('form[data-reference]');
 let datos={};try{datos=JSON.parse(localStorage.getItem(key))||{};if(live?.dataset.reference===key)datos={...datos,...Object.fromEntries(new FormData(live))};}catch{}
 const rows=items=>'<dl class="fields">'+items.map(([label,id])=>`<div class="field"><dt>${esc(label)}</dt><dd>${esc(datos[id]||'')}</dd></div>`).join('')+'</dl>';
 const resumen=`<div class="block"><h3>Resumen de la bomba</h3>${rows([['Servicio','servicio'],['Ubicación','nombre'],['Tamaño','size'],['Caudal (GPM)','caudal'],['Altura (m)','altura'],['Velocidad (rpm)','rpm'],['Impulsor (mm)','impulsor'],['Temperatura de trabajo','temperatura'],['Motor','motor']])}</div><div class="block"><h3>Componentes críticos</h3>${rows([['Sello mecánico','sello'],['Empaque','empaque'],['O-rings','orings'],['Elemento de acople','acople'],['Rodamiento delantero','rodamiento_delantero'],['Rodamiento trasero','rodamiento_trasero']])}</div>`;
 panel.innerHTML=`<p class="eyebrow">${esc(sector)} · IDENTIFICACIÓN PENDIENTE</p><h2>${esc(datos.nombre||s.nombre)}</h2><form id="nombre-bomba" class="block"><label class="field">Nombre o código de la bomba<input name="nombre" maxlength="120" value="${esc(datos.nombre||'')}" placeholder="Ej.: B14 o Alambique UQ" style="width:100%;box-sizing:border-box"></label><button class="primary wide" type="submit">Guardar nombre</button><p role="status" id="nombre-estado"></p></form><p class="notice">Bomba individual identificada por su geometría en el modelo 3D. Podés actualizar sus datos, componentes y fotos aquí. Confirmá el TAG y los datos técnicos en campo; escribir un TAG no crea ni vincula una ficha automáticamente. Los campos pendientes permanecen vacíos.</p><form id="maquina-pendiente" data-reference="${esc(key)}"><h3>Ingresar datos de máquina</h3><div class="fields">${CAMPOS_PENDIENTES.filter(([id])=>id!=='nombre').map(([id,label])=>`<label class="field">${esc(label)}<input name="${id}" maxlength="500" value="${esc(datos[id]||'')}" style="width:100%;box-sizing:border-box"></label>`).join('')}</div><button class="primary wide" type="submit">Guardar datos en este navegador</button><p role="status" id="maquina-estado"></p></form><details class="pending-summary"><summary>Ver resumen de los datos registrados</summary>${resumen}</details><div id="imagenes-pendientes"></div><p class="muted">Los datos de esta referencia se guardan en este navegador. Las fotos pueden compartirse con una cuenta autorizada. Todavía no se vinculan a una ficha de Obsidian.</p>`;
 panel.querySelector('#nombre-bomba').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,estado=form.querySelector('#nombre-estado'),button=form.querySelector('button'),valor=form.nombre.value;button.disabled=true;estado.textContent='Guardando…';
  try{
   const result=await pumpNames.save(key,valor);if(!form.isConnected)return;
   panel.querySelector('h2').textContent=pumpNames.nameOf(key)||s.nombre;encabezado();
   estado.textContent={done:'Nombre guardado para todo el equipo.',offline:'Guardado en este celular. Se comparte cuando vuelva la señal.','signed-out':'Guardado en este navegador. Entrá con tu cuenta para compartirlo.','read-only':'Guardado en este navegador. Tu cuenta solo permite consultar.'}[result]||'Guardado en este navegador. Todavía no se pudo compartir; se reintenta solo.';
  }catch{estado.textContent='No se pudo guardar. Revisá el almacenamiento del navegador.';}
  finally{button.disabled=false;}
 };
 panel.querySelector('#maquina-pendiente').onsubmit=e=>{e.preventDefault();try{const data={nombre:pumpNames.nameOf(key),...Object.fromEntries(new FormData(e.currentTarget))};localStorage.setItem(key,JSON.stringify(data));abrirFichaPendiente(panel,s).then(()=>{if(panel.querySelector('#maquina-pendiente')?.dataset.reference===key)panel.querySelector('#maquina-estado').textContent='Datos guardados en este navegador.';});}catch{panel.querySelector('#maquina-estado').textContent='No se pudo guardar. Revisá el almacenamiento del navegador.';}};
 const encabezado=()=>{const el=document.getElementById('selected-tag');if(el)el.textContent=pumpNames.nameOf(key)||'Sin TAG';};encabezado();
 const destino=panel.querySelector('#imagenes-pendientes');
 // Las fotos pertenecen a este lugar, aunque cambie su TAG.
 const fotoKey=s.fotoKey||key;
 async function pintar(){
  let act={},photoError='';try{act=await fotosActualizadas(fotoKey,{writable:false});photoError=act.warning||'';}catch(error){photoError=error.message;}if(!destino.isConnected)return;
  destino.innerHTML=htmlFotos({tag:s.tagAsignado||s.nombre,photoKey:fotoKey,photo:s.imagenesLugar?.photo,ubicacionCroquis:s.imagenesLugar?.ubicacionCroquis},s.imagenesLugar?originales(s.imagenesLugar,s.imagenesLugar):{},act,{writable:false});
  bindPhotoTransfers(destino,fotoKey,{writable:false,reference:true},pintar);
  if(photoError){const error=destino.querySelector('#fotos-error');error.textContent=photoError;const retry=document.createElement('button');retry.type='button';retry.textContent='Reintentar leer fotos';retry.onclick=pintar;error.after(retry);}
  destino.querySelectorAll('input[data-slot]').forEach(input=>input.onchange=async()=>{const file=input.files?.[0];if(!file)return;input.disabled=true;try{await photoInputStarted(input);await guardarFoto(fotoKey,input.dataset.slot,file,{writable:false});await pintar();}catch(e){setPhotoInputStatus(input,e.message,true);if(destino.isConnected)destino.querySelector('#fotos-error').textContent=e.message;}finally{input.disabled=false;input.value='';}});
 }
 await pintar();
}
