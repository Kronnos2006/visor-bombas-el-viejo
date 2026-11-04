// Paleta de bombas sobre el 3D: se abre y se cierra. Repite la lista actual, que sigue siendo quien selecciona.
const CLAVE='vocatus-paleta-bombas';
const leer=()=>{try{return localStorage.getItem(CLAVE);}catch{return null;}};
const escribir=v=>{try{localStorage.setItem(CLAVE,v);}catch{}};
export function filtrarFilas(filas,texto){
 const q=String(texto||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
 return q?filas.filter(f=>f.texto.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().includes(q)):filas;
}
export function crearPaleta({contenedor,lista,alSenalar=()=>{},alDejar=()=>{}}){
 const raiz=document.createElement('aside');raiz.id='paleta-bombas';raiz.setAttribute('aria-label','Paleta de bombas');
 raiz.innerHTML='<button type="button" class="paleta-boton" aria-expanded="false" aria-controls="paleta-cuerpo"><span>Bombas</span> <b id="paleta-cuenta"></b> <i aria-hidden="true">▾</i></button><div id="paleta-cuerpo" hidden><input type="search" id="paleta-buscar" placeholder="Buscar bomba" aria-label="Buscar bomba en esta área"><div id="paleta-filas"></div></div>';
 contenedor.append(raiz);
 const boton=raiz.querySelector('.paleta-boton'),cuerpo=raiz.querySelector('#paleta-cuerpo'),buscar=raiz.querySelector('#paleta-buscar'),filas=raiz.querySelector('#paleta-filas'),cuenta=raiz.querySelector('#paleta-cuenta');
 const abrir=si=>{cuerpo.hidden=!si;boton.setAttribute('aria-expanded',String(si));raiz.classList.toggle('abierta',si);escribir(si?'1':'0');};
 boton.onclick=()=>abrir(cuerpo.hidden);
 function pintar(){
  const originales=[...lista.querySelectorAll('button.pump-row')].map(b=>({b,titulo:b.querySelector('strong')?.textContent||'',detalle:b.querySelector('small')?.textContent||'',texto:b.textContent,activa:b.classList.contains('active')}));
  cuenta.textContent=originales.length;
  const visibles=filtrarFilas(originales,buscar.value);filas.replaceChildren();
  if(!visibles.length){const p=document.createElement('p');p.textContent='No hay bombas.';filas.append(p);}
  for(const o of visibles){
   const f=document.createElement('button');f.type='button';f.className='paleta-fila'+(o.activa?' activa':'');
   const t=document.createElement('strong');t.textContent=o.titulo;const d=document.createElement('small');d.textContent=o.detalle;f.append(t,d);
   const tag=o.b.dataset.tag||null,pendiente=o.b.dataset.pending??null;
   f.onclick=()=>o.b.click();
   f.onmouseenter=f.onfocus=()=>alSenalar({tag,pendiente});f.onmouseleave=f.onblur=()=>alDejar();
   filas.append(f);
  }
 }
 buscar.oninput=pintar;
 document.addEventListener('vocatus:lista',pintar);
 const guardado=leer();abrir(guardado===null?!matchMedia('(max-width:900px)').matches:guardado==='1');
 pintar();
 let visible=null;
 return {mostrar(si){if(si!==visible){visible=si;raiz.hidden=!si;if(!si)alDejar();}},pintar};
}
