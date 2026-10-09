// Portada: dibuja una placa por posición a partir de los mismos datos del visor.
// Solo lectura: no modifica photoPumps ni ninguna función del visor.
import {photoPumps} from './equipos-sector.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const known=v=>v&&!/^sin dato$/i.test(v);
const order=['frente','lateral','derecho','posterior'];
// Orden de lectura dentro de cada lado: el mismo que usa el visor.
const along={frente:p=>p.x,lateral:p=>-p.z,derecho:p=>-p.z,posterior:p=>-p.x};

function plate(p){
 const title=p.inactive?'Sin uso':[p.marca,p.modelo].filter(known).join(' ');
 const size=known(p.size)?p.size:'';
 return `<a class="plate${p.inactive?' is-idle':''}" href="/visor.html#${esc(p.tag)}" aria-label="${esc(p.tag)}, ${esc(title)}, ${esc(p.nombre)}">
  <span class="plate-tag">${esc(p.tag)}</span>
  <span class="plate-model">${esc(title)}</span>
  ${size?`<span class="plate-size">${esc(size)}</span>`:''}
  <span class="plate-where">${esc(p.nombre)}</span>
 </a>`;
}

const groups=order.map(g=>photoPumps.filter(p=>p.grupo===g)).filter(list=>list.length);
document.getElementById('plates').innerHTML=groups.map(list=>{
 const g=list[0].grupo,sorted=[...list].sort((a,b)=>(along[g]?.(a)??0)-(along[g]?.(b)??0));
 return `<div class="side"><h3 class="side-name">${esc(list[0].area.replace(' · ',', '))}</h3><div class="plate-row">${sorted.map(plate).join('')}</div></div>`;
}).join('');

// Línea bajo el encabezado al bajar de la portada.
const top=document.querySelector('.top');
let ticking=false;
addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{top.classList.toggle('scrolled',scrollY>8);ticking=false;});},{passive:true});
