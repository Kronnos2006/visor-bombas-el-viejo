// Diseño editable del visor (colores, textos, mostrar/ocultar, orden, logo y botones extra del menú).
// Todo lo que entra se valida aquí: solo colores #hex, textos planos y enlaces https o de la propia página.

export const COLORES=[
 ['accent','Color principal (botones y resaltados)'],
 ['cana','Color secundario (verde caña)'],
 ['orange','Color de avisos'],
 ['fondo','Fondo de la página'],
 ['fondo-2','Fondo de los paneles'],
 ['tinta','Color del texto'],
 ['tinta-2','Color del texto secundario'],
];
// Valores de fábrica (tema-vocatus.css), para mostrar en el editor.
export const ORIGINAL={
 oscuro:{accent:'#f2b84b',cana:'#a9d46f',orange:'#f08a4b',fondo:'#120f0b','fondo-2':'#1a1610',tinta:'#f4ead8','tinta-2':'#cdbfa6'},
 claro:{accent:'#b9770e',cana:'#4f7d1d',orange:'#c4581b',fondo:'#f7f1e6','fondo-2':'#efe6d6',tinta:'#2a2116','tinta-2':'#5a4a33'},
};

// texto: 'nodo' = primer texto suelto (deja el ícono); 'todo' = todo el contenido; selector = un hijo.
// grupo 'menu' y 'pestanas' se pueden reordenar. fija = no se puede ocultar.
// Son las piezas del diseño actual (barra lateral, panel de áreas y ficha), que es el que se ve en PC y celular.
const RAIL=(id,nombre,fija)=>({id:'nav-'+id,grupo:'menu',nombre:'Menú: '+nombre,sel:`#tel-barra [data-s="${id}"]`,texto:'span:not(.tel-pill)',fija});
const AREAS='.tel-panel[data-s="areas"]';
export const ELEMENTOS=[
 RAIL('areas','Áreas',true),RAIL('pendientes','Pendientes'),RAIL('historial','Historial'),RAIL('bodega','Bodega'),RAIL('mantenimiento','Reportar'),
 {id:'btn-fotos',grupo:'botones',nombre:'Botón Actualizar todas las fotos',sel:'#cloud-photos-all',texto:'.cloud-global-label'},
 {id:'btn-tema',grupo:'botones',nombre:'Botón Claro/Oscuro',sel:'#tema-toggle'},
 {id:'btn-ampliar',grupo:'botones',nombre:'Botón Ampliar planta',sel:'#tel-ampliar'},
 {id:'titulo-animado',grupo:'encabezado',nombre:'Título animado del encabezado',sel:'#cab-flujo'},
 {id:'areas-titulo',grupo:'secciones',nombre:'Título del panel (La planta, por áreas)',sel:`${AREAS} .tel-section-head h2`,texto:'todo',fija:true},
 {id:'areas-texto',grupo:'secciones',nombre:'Texto bajo el título del panel',sel:`${AREAS} .tel-section-head p`,texto:'todo'},
 {id:'buscador',grupo:'secciones',nombre:'Buscador de bombas',sel:`${AREAS} .tel-buscar`},
 {id:'filtros',grupo:'secciones',nombre:'Filtros Fluido y Marca',sel:`${AREAS} .tel-campo`},
 {id:'cuenta',grupo:'secciones',nombre:'Conteo de bombas',sel:'#tel-cuenta'},
 {id:'areas-sub',grupo:'secciones',nombre:'Subtítulo «Áreas de la planta»',sel:`${AREAS} > h2.tel-sub:nth-of-type(1)`,texto:'todo'},
 {id:'menu-areas',grupo:'secciones',nombre:'Botones de áreas de la planta',sel:'#area-menu'},
 {id:'herr-sub',grupo:'secciones',nombre:'Subtítulo «Herramientas»',sel:`${AREAS} > h2.tel-sub:nth-of-type(2)`,texto:'todo'},
 {id:'camara',grupo:'secciones',nombre:'Botones de cámara (acercar, girar)',sel:'#camera-tools'},
 {id:'lista-flotante',grupo:'secciones',nombre:'Lista flotante de bombas sobre el 3D',sel:'#paleta-bombas'},
 {id:'tab-ficha',grupo:'pestanas',nombre:'Pestaña Ficha',sel:'#tabs [data-tab="ficha"]',texto:'nodo',fija:true},
 {id:'tab-historial',grupo:'pestanas',nombre:'Pestaña Historial',sel:'#tabs [data-tab="historial"]',texto:'nodo'},
 {id:'tab-ia',grupo:'pestanas',nombre:'Pestaña Preguntar',sel:'#tabs [data-tab="ia"]',texto:'nodo'},
 {id:'tab-sim',grupo:'pestanas',nombre:'Pestaña Simulador',sel:'#tabs [data-tab="sim"]',texto:'nodo'},
];
export const GRUPOS={menu:'Menú lateral',encabezado:'Encabezado',botones:'Botones',secciones:'Secciones',pestanas:'Pestañas de la ficha'};
const POR_ID=new Map(ELEMENTOS.map(e=>[e.id,e]));

const hex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v.trim())?v.trim().toLowerCase():null;
const txt=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max):'';
// Enlaces: https o rutas de la propia página. Nada de javascript:, data:, //otro-sitio.
export function enlaceSeguro(v){
 const s=txt(v,500);if(!s)return null;
 if(/^\/(?!\/)[^\s\\]*$/.test(s))return s;
 try{const u=new URL(s);return u.protocol==='https:'?u.href:null;}catch{return null;}
}

export function limpiarDiseno(raw){
 const d=raw&&typeof raw==='object'?raw:{},out={colores:{oscuro:{},claro:{}},textos:{},ocultos:[],orden:{},menu:[],logo:''};
 for(const modo of ['oscuro','claro'])for(const [k] of COLORES){const c=hex(d.colores?.[modo]?.[k]);if(c)out.colores[modo][k]=c;}
 for(const [id,v] of Object.entries(d.textos||{})){const e=POR_ID.get(id),t=txt(v,120);if(e?.texto&&t)out.textos[id]=t;}
 out.ocultos=[...new Set((Array.isArray(d.ocultos)?d.ocultos:[]).filter(id=>POR_ID.has(id)&&!POR_ID.get(id).fija))];
 for(const g of ['menu','pestanas']){
  const validos=new Set(ELEMENTOS.filter(e=>e.grupo===g).map(e=>e.id));
  if(g==='menu')(Array.isArray(d.menu)?d.menu:[]).forEach((_,i)=>validos.add('extra-'+i));
  const lista=[...new Set((Array.isArray(d.orden?.[g])?d.orden[g]:[]).filter(id=>validos.has(id)))];
  if(lista.length)out.orden[g]=lista;
 }
 for(const item of (Array.isArray(d.menu)?d.menu:[]).slice(0,8)){
  const texto=txt(item?.texto,40),enlace=enlaceSeguro(item?.enlace),icono=[...txt(item?.icono,8)].slice(0,2).join('');
  if(texto&&enlace)out.menu.push({texto,enlace,icono,nueva:!!item?.nueva});
 }
 if(out.orden.menu)out.orden.menu=out.orden.menu.filter(id=>!id.startsWith('extra-')||Number(id.slice(6))<out.menu.length);
 out.logo=enlaceSeguro(d.logo)||'';
 return out;
}

export function cssDeColores(cfg){
 const bloque=(sel,obj)=>{const v=Object.entries(obj).map(([k,c])=>`--${k}:${c}`).join(';');return v?`${sel}{${v}}`:'';};
 const o=cfg.colores.oscuro,c=cfg.colores.claro;
 return [bloque('body:not(.claro)',o),bloque('body.claro',c),
  o.fondo?`html:not(:has(body.claro)){background:${o.fondo}}`:'',c.fondo?`html:has(body.claro){background:${c.fondo}}`:'',
  '.diseno-oculto{display:none!important}',
  '@media(max-width:900px){body.app-tel #tel-barra{grid-template-columns:repeat(var(--diseno-n,5),1fr)!important}}',
  '#tel-barra [data-diseno-extra] .tel-pill{font-size:18px;line-height:1}'].join('\n');
}

function textoNodo(el){for(const n of el.childNodes)if(n.nodeType===3&&n.textContent.trim())return n;return null;}
function ponerTexto(el,modo,valor){
 if(modo==='todo'){if(el.dataset.disenoOrig==null)el.dataset.disenoOrig=el.innerHTML;if(valor==null){if(el.innerHTML!==el.dataset.disenoOrig)el.innerHTML=el.dataset.disenoOrig;}else if(el.textContent!==valor)el.textContent=valor;return;}
 const destino=modo==='nodo'?textoNodo(el):el.querySelector(modo);if(!destino)return;
 if(destino.disenoOrig==null)destino.disenoOrig=destino.textContent;
 const nuevo=valor==null?destino.disenoOrig:(modo==='nodo'?valor+' ':valor);if(destino.textContent!==nuevo)destino.textContent=nuevo;
}

// Se puede llamar muchas veces: siempre parte del diseño original y aplica encima.
export function aplicarDiseno(doc,raw){
 const cfg=limpiarDiseno(raw);
 let style=doc.getElementById('diseno-vocatus');
 if(!style){style=doc.createElement('style');style.id='diseno-vocatus';doc.head.append(style);}
 const css=cssDeColores(cfg);if(style.textContent!==css)style.textContent=css;
 for(const e of ELEMENTOS)for(const el of doc.querySelectorAll(e.sel)){
  if(el.dataset.disenoId!==e.id)el.dataset.disenoId=e.id;
  const oculto=cfg.ocultos.includes(e.id);if(el.classList.contains('diseno-oculto')!==oculto)el.classList.toggle('diseno-oculto',oculto);
  if(e.texto)ponerTexto(el,e.texto,cfg.textos[e.id]??null);
  if(el.style.order)el.style.order='';
 }
 const nav=doc.getElementById('tel-barra');
 if(nav){
  const firma=JSON.stringify(cfg.menu);if(nav.dataset.disenoMenu!==firma||nav.querySelectorAll('[data-diseno-extra]').length!==cfg.menu.length){nav.dataset.disenoMenu=firma;
  nav.querySelectorAll('[data-diseno-extra]').forEach(a=>a.remove());
  cfg.menu.forEach((m,i)=>{
   const b=doc.createElement('button');b.type='button';b.dataset.disenoExtra='1';b.dataset.disenoId='extra-'+i;b.title=m.enlace;
   const pill=doc.createElement('span');pill.className='tel-pill';pill.textContent=m.icono||'🔗';
   const t=doc.createElement('span');t.textContent=m.texto;b.append(pill,t);
   b.addEventListener('click',()=>{if(m.nueva)doc.defaultView.open(m.enlace,'_blank','noopener');else doc.defaultView.location.assign(m.enlace);});
   nav.append(b);
  });}
  // En celular la barra va abajo en columnas: una por botón visible.
  const visibles=[...nav.children].filter(x=>!x.classList.contains('diseno-oculto')).length;
  if(nav.style.getPropertyValue('--diseno-n')!==String(visibles||1))nav.style.setProperty('--diseno-n',String(visibles||1));
 }
 for(const [g,ids] of Object.entries(cfg.orden)){
  const cont=doc.querySelector(g==='menu'?'#tel-barra':'#tabs');if(!cont)continue;
  ids.forEach((id,i)=>{const el=cont.querySelector(`[data-diseno-id="${id}"]`);if(el&&el.style.order!==String(i+1))el.style.order=String(i+1);});
  for(const el of cont.children)if(!ids.includes(el.dataset.disenoId)&&el.style.order!==String(ids.length+1))el.style.order=String(ids.length+1);
 }
 const logo=doc.querySelector('.brand-logo');
 if(logo){if(logo.dataset.disenoOrig==null)logo.dataset.disenoOrig=logo.getAttribute('src');const src=cfg.logo||logo.dataset.disenoOrig;if(logo.getAttribute('src')!==src)logo.setAttribute('src',src);}
 return cfg;
}
