// Las páginas de campo muestran las mismas cinco secciones que la app (teléfono y computadora).
(()=>{
 const nav=document.querySelector('.campo-nav');if(!nav)return;
 const S=[['areas','Áreas','<path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>'],['pendientes','Pendientes','<path d="M9 3h6v3H9z"/><path d="M9 4.5H6V21h12V4.5h-3"/><path d="M9 12.5l2 2 4-4"/>'],['historial','Historial','<path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="8.5"/>'],['bodega','Bodega','<path d="M3 8l9-5 9 5v10l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v10"/>'],['mantenimiento','Mantenimiento','<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>']];
 const actual=location.pathname==='/solicitud.html'?'bodega':'';
 nav.classList.add('tel-barra-campo');
 nav.innerHTML=S.map(([id,nombre,d])=>`<a href="${id==='bodega'?'/solicitud.html':'/?s='+id}"${id===actual?' aria-current="page"':''}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg><span>${nombre}</span></a>`).join('');
})();
