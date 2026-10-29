import {actualizarTodasFotos} from './fotos-bomba.js';
import {cloudEnabled,connectCloudPhotos} from './cloud-photos.js';

// Un único control general; los controles de cada ficha conservan su alcance.
const header=document.querySelector('header');
if(header&&cloudEnabled()&&!document.getElementById('cloud-photos-all')){
 const control=document.createElement('div');control.className='cloud-global-control';
 control.innerHTML=`<button type="button" id="cloud-photos-all" aria-label="Actualizar todas las fotos en línea" aria-describedby="cloud-photos-all-help" aria-controls="cloud-photos-all-result" aria-expanded="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 2M4 16l2 2a7 7 0 0 0 12-1"/></svg><span class="cloud-global-label">Actualizar todas las fotos en línea</span><span class="cloud-global-short" aria-hidden="true">Fotos</span></button><span id="cloud-photos-all-help" class="cloud-sr-only">Comparte las fotos pendientes de este dispositivo y consulta las fotos en línea de toda la planta.</span><section id="cloud-photos-all-result" hidden aria-label="Resultado de actualización de todas las fotos"><strong>Fotos de toda la planta</strong><p role="status" aria-live="polite" aria-atomic="true"></p><button type="button" data-cloud-global-close>Cerrar</button></section>`;
 header.append(control);
 const button=control.querySelector('#cloud-photos-all'),result=control.querySelector('#cloud-photos-all-result'),status=result.querySelector('[role=status]');
 const show=text=>{result.hidden=false;button.setAttribute('aria-expanded','true');status.textContent=text;};
 result.querySelector('[data-cloud-global-close]').onclick=()=>{result.hidden=true;button.setAttribute('aria-expanded','false');button.focus();};
 button.onclick=async()=>{
  button.disabled=true;button.setAttribute('aria-busy','true');show('Comprobando fotos pendientes y conexión…');
  try{
   const report=await actualizarTodasFotos({onProgress:progress=>show(progress.phase==='sharing'?`Compartiendo fotos: ${progress.done} de ${progress.total} equipos…`:`Consultando fotos en línea: ${progress.done} de ${progress.total} equipos…`)});
   const messages=[`${report.photos} fotos en línea actualizadas de ${report.equipment} equipos.`];
   if(report.pending===null)messages.push('No se pudo comprobar cuántas fotos locales quedan pendientes.');
   else messages.push(report.pending?`${report.pending} fotos locales siguen pendientes de compartir.`:'No quedan fotos locales pendientes de compartir.');
   if(report.conflicts)messages.push(`${report.conflicts} fotos tienen otra versión en línea; revisalas en su bomba.`);
   if(report.failed)messages.push(`${report.failed} fotos no se pudieron descargar. Podés reintentar.`);
   if(report.errors.length)messages.push('Avisos: '+report.errors.join(' '));
   show(messages.join(' '));
  }catch(error){show(error.message||'No se pudieron actualizar las fotos. Reintentá.');if(error.code==='CLOUD_LOGIN_REQUIRED')await connectCloudPhotos().catch(()=>{});}
  finally{button.disabled=false;button.removeAttribute('aria-busy');}
 };
}
