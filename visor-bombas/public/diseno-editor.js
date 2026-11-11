// Editor visual del visor (solo administrador). La base vuelve a comprobar que quien guarda es administrador.
import {COLORES,ORIGINAL,ELEMENTOS,GRUPOS,limpiarDiseno,enlaceSeguro} from './diseno-core.js';
import {leerDiseno,guardarDiseno,CACHE} from './diseno.js';
import {surveyConnection} from './cloud-surveys.js';

const $=id=>document.getElementById(id);
const el=(tag,props={},...kids)=>{const n=Object.assign(document.createElement(tag),props);n.append(...kids.filter(k=>k!=null));return n;};
try{if(localStorage.getItem('vocatus-tema')==='claro')document.body.classList.add('claro');}catch{}

let guardado=limpiarDiseno({}),borrador=limpiarDiseno({}),pestana='colores',conexion=null;
const copia=o=>JSON.parse(JSON.stringify(o));
const estado=t=>{$('estado').textContent=t||'';};
const sinGuardar=()=>JSON.stringify(limpiarDiseno(borrador))!==JSON.stringify(guardado);

function vistaPrevia(){
 const w=$('vista').contentWindow;if(w)w.postMessage({tipo:'vocatus-diseno',diseno:limpiarDiseno(borrador)},location.origin);
 if(sinGuardar())estado('Hay cambios sin guardar.');
}
function cambio(fn){fn();vistaPrevia();if(pestana!=='textos'&&pestana!=='menu')pintar();}
addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.tipo==='vocatus-diseno-lista'){vistaPrevia();modoClaroVista();}});
function modoClaroVista(){try{$('vista').contentDocument?.body?.classList.toggle('claro',$('vista-claro').checked);}catch{}}
$('vista-claro').onchange=modoClaroVista;
// La vista previa entra directo al catálogo, sin la portada de bienvenida.
try{sessionStorage.setItem('vocatus-portada-3d-5','1');}catch{}
$('vista').src='/?diseno=vista&modelo=original';

const PINTORES={
 colores(){
  const out=[];
  for(const [modo,titulo] of [['oscuro','Modo oscuro'],['claro','Modo claro']]){
   out.push(el('h2',{textContent:titulo}));
   for(const [k,nombre] of COLORES){
    const actual=borrador.colores[modo][k],input=el('input',{type:'color',value:actual||ORIGINAL[modo][k],title:nombre});
    input.oninput=()=>{borrador.colores[modo][k]=input.value;vistaPrevia();};
    input.onchange=()=>pintar();
    const volver=el('button',{type:'button',className:'mini',textContent:'↺',title:'Volver al color original',disabled:!actual});
    volver.onclick=()=>cambio(()=>delete borrador.colores[modo][k]);
    out.push(el('div',{className:'fila'},el('label',{textContent:nombre}),input,volver));
   }
  }
  return out;
 },
 textos(){
  const out=[el('p',{className:'ayuda',textContent:'Escribí el texto nuevo. Si lo dejás vacío, queda el texto original.'})];
  for(const [g,titulo] of Object.entries(GRUPOS)){
   const items=ELEMENTOS.filter(e=>e.grupo===g&&e.texto);if(!items.length)continue;
   out.push(el('h2',{textContent:titulo}));
   for(const e of items){
    const input=el('input',{type:'text',maxLength:120,value:borrador.textos[e.id]||'',placeholder:'Texto original'});
    input.oninput=()=>{const v=input.value.trim();if(v)borrador.textos[e.id]=v;else delete borrador.textos[e.id];vistaPrevia();};
    out.push(el('div',{className:'fila'},el('label',{textContent:e.nombre}),input));
   }
  }
  return out;
 },
 mostrar(){
  const out=[el('p',{className:'ayuda',textContent:'Desmarcá lo que querés ocultar. Con las flechas cambiás el orden del menú y de las pestañas.'})];
  for(const [g,titulo] of Object.entries(GRUPOS)){
   let items=ELEMENTOS.filter(e=>e.grupo===g).map(e=>({id:e.id,nombre:e.nombre,fija:e.fija}));
   if(g==='menu')borrador.menu.forEach((m,i)=>items.push({id:'extra-'+i,nombre:'Menú: '+m.texto+' (agregado)',extra:true}));
   const ordenable=g==='menu'||g==='pestanas';
   if(ordenable){const orden=borrador.orden[g]||[];items.sort((a,b)=>(orden.indexOf(a.id)+1||999)-(orden.indexOf(b.id)+1||999));}
   out.push(el('h2',{textContent:titulo}));
   items.forEach((it,i)=>{
    const visible=el('input',{type:'checkbox',checked:!borrador.ocultos.includes(it.id),disabled:!!it.fija||!!it.extra,title:it.fija?'Esto no se puede ocultar':it.extra?'Para quitarlo, usá «Menú y logo»':'Mostrar u ocultar'});
    visible.onchange=()=>cambio(()=>{borrador.ocultos=borrador.ocultos.filter(x=>x!==it.id);if(!visible.checked)borrador.ocultos.push(it.id);});
    const fila=el('div',{className:'fila'},visible,el('label',{textContent:it.nombre}));
    if(ordenable){
     const mover=d=>cambio(()=>{const ids=items.map(x=>x.id);[ids[i],ids[i+d]]=[ids[i+d],ids[i]];borrador.orden[g]=ids;});
     const sube=el('button',{type:'button',className:'mini',textContent:'↑',title:'Subir',disabled:i===0});sube.onclick=()=>mover(-1);
     const baja=el('button',{type:'button',className:'mini',textContent:'↓',title:'Bajar',disabled:i===items.length-1});baja.onclick=()=>mover(1);
     fila.append(sube,baja);
    }
    out.push(fila);
   });
  }
  return out;
 },
 menu(){
  const out=[el('h2',{textContent:'Botones agregados al menú'}),el('p',{className:'ayuda',textContent:'Cada botón abre una página. Usá un enlace que empiece con https:// o una página del visor como /avance.html. Máximo 8.'})];
  borrador.menu.forEach((m,i)=>{
   const texto=el('input',{type:'text',maxLength:40,value:m.texto,placeholder:'Texto del botón'});
   const enlace=el('input',{type:'url',maxLength:500,value:m.enlace,placeholder:'https://… o /pagina.html'});
   const icono=el('input',{type:'text',maxLength:8,value:m.icono,placeholder:'Ícono (ej. 📁)',style:'max-width:110px'});
   const nueva=el('input',{type:'checkbox',checked:m.nueva});
   const aviso=el('small',{className:'ayuda'});
   const actualizar=()=>{m.texto=texto.value;m.enlace=enlace.value;m.icono=icono.value;m.nueva=nueva.checked;aviso.textContent=enlace.value&&!enlaceSeguro(enlace.value)?'⚠ Ese enlace no es válido: tiene que empezar con https:// o con /':'';vistaPrevia();};
   [texto,enlace,icono].forEach(x=>x.oninput=actualizar);nueva.onchange=actualizar;
   const quitar=el('button',{type:'button',className:'mini',textContent:'🗑 Quitar botón'});
   quitar.onclick=()=>{borrador.menu.splice(i,1);delete borrador.orden.menu;vistaPrevia();pintar();};
   out.push(el('div',{className:'extra'},texto,enlace,el('div',{className:'fila'},icono,el('label',{},nueva,' Abrir en otra pestaña'),quitar),aviso));
  });
  const agregar=el('button',{type:'button',className:'mini',textContent:'➕ Agregar botón al menú',disabled:borrador.menu.length>=8});
  agregar.onclick=()=>{borrador.menu.push({texto:'Nuevo botón',enlace:'/',icono:'⭐',nueva:false});vistaPrevia();pintar();};
  out.push(agregar);
  const logo=el('input',{type:'url',maxLength:500,value:borrador.logo,placeholder:'Vacío = logo original'});
  const avisoLogo=el('small',{className:'ayuda'});
  logo.oninput=()=>{borrador.logo=logo.value.trim();avisoLogo.textContent=logo.value&&!enlaceSeguro(logo.value)?'⚠ Tiene que empezar con https:// o con /':'';vistaPrevia();};
  out.push(el('h2',{textContent:'Logo'}),el('p',{className:'ayuda',textContent:'Pegá el enlace de una imagen (https://…). Para volver al logo de Vocatus, dejalo vacío.'}),el('div',{className:'fila'},logo),avisoLogo);
  return out;
 },
 archivo(){
  const exportar=el('button',{type:'button',className:'mini',textContent:'⬇ Descargar este diseño (archivo)'});
  exportar.onclick=()=>{const blob=new Blob([JSON.stringify(limpiarDiseno(borrador),null,2)],{type:'application/json'});const a=el('a',{href:URL.createObjectURL(blob),download:'diseno-vocatus-'+new Date().toISOString().slice(0,10)+'.json'});a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  const archivo=el('input',{type:'file',accept:'.json,application/json'});
  archivo.onchange=async()=>{const f=archivo.files?.[0];if(!f)return;try{borrador=limpiarDiseno(JSON.parse(await f.text()));vistaPrevia();pintar();estado('Diseño cargado del archivo. Revisalo y tocá Guardar para todos.');}catch{estado('Ese archivo no es un diseño válido.');}};
  const original=el('button',{type:'button',className:'mini',textContent:'↺ Volver al diseño original de Vocatus'});
  original.onclick=()=>{if(confirm('¿Quitar todos los cambios de diseño? Se ve en la vista previa; no se guarda hasta que toques Guardar para todos.')){borrador=limpiarDiseno({});vistaPrevia();pintar();}};
  return [el('h2',{textContent:'Guardar una copia'}),el('p',{className:'ayuda',textContent:'Descargá el diseño para tener un respaldo o pasarlo a otra persona.'}),exportar,
   el('h2',{textContent:'Cargar una copia'}),el('p',{className:'ayuda',textContent:'Elegí un archivo de diseño descargado antes.'}),archivo,
   el('h2',{textContent:'Empezar de cero'}),original];
 },
};
function pintar(){
 document.querySelectorAll('[data-p]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.p===pestana)));
 $('contenido').replaceChildren(...PINTORES[pestana]());
}
document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{pestana=b.dataset.p;pintar();});

$('guardar').onclick=async()=>{
 const boton=$('guardar');boton.disabled=true;estado('Guardando…');
 try{
  conexion=conexion||await surveyConnection();if(!conexion)throw new Error('Entrá con tu cuenta para guardar.');
  guardado=await guardarDiseno(conexion,borrador);borrador=copia(guardado);localStorage.setItem(CACHE,JSON.stringify(guardado));
  pintar();vistaPrevia();estado('✅ Guardado. Todos lo ven al abrir o actualizar el visor.');
 }catch(e){estado(/row-level|permission|42501/i.test(e?.message||'')?'Solo un administrador puede guardar el diseño.':/vocatus_site_design|PGRST205|does not exist/i.test(e?.message||'')?'Falta preparar la base: hay que correr el SQL del diseño en Supabase.':e?.message||'No se pudo guardar. Volvé a intentar.');}
 finally{boton.disabled=false;}
};
$('descartar').onclick=()=>{borrador=copia(guardado);vistaPrevia();pintar();estado('Cambios descartados.');};
addEventListener('beforeunload',e=>{if(sinGuardar()){e.preventDefault();e.returnValue='';}});

(async()=>{
 pintar();
 try{const me=await(await fetch('/api/auth/me')).json();if(me?.user&&me.user.role!=='admin'){$('contenido').replaceChildren(el('p',{className:'ayuda',textContent:'Solo un administrador puede editar el diseño.'}));$('guardar').disabled=true;return;}}catch{}
 try{
  conexion=await surveyConnection();
  if(conexion){const {data}=await leerDiseno(conexion);guardado=data;borrador=copia(data);pintar();vistaPrevia();estado('');}
  else estado('Entrá con tu cuenta para cargar y guardar el diseño.');
 }catch(e){estado(/vocatus_site_design|PGRST205|does not exist/i.test(e?.message||'')?'Falta preparar la base: hay que correr el SQL del diseño en Supabase. Podés probar cambios igual.':'No se pudo leer el diseño guardado.');}
})();
