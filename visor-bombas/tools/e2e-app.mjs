import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import net from 'node:net';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.resolve(process.env.UI_SCREENSHOTS_DIR||path.join(root,'informes-auditoria','interfaz-app'));
const sections=['areas','pendientes','historial','bodega','mantenimiento'];

async function port(){return new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>resolve(n));});});}
async function geometry(page,label){
 const state=await page.evaluate(()=>{
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};};
  const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
  const content=document.querySelector('#tel-contenido'),nav=document.querySelector('#tel-barra');
  const overflow=[...content.querySelectorAll('.report-step,.tel-resumen,.tel-accion,.tel-fila,.tel-dos,.tel-elegida,#tabs,.quick-actions')]
   .filter(e=>visible(e)&&e.scrollWidth>e.clientWidth+2).map(e=>({element:e.id||e.className,scroll:e.scrollWidth,client:e.clientWidth}));
  const panel=content.querySelector('.tel-panel:not([hidden])'),summary=content.querySelector('.tel-resumen');
  let overlap=false;if(panel&&visible(panel)&&summary&&visible(summary)){const a=rect(panel),b=rect(summary);overlap=Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1;}
  return {width:innerWidth,viewportHeight:innerHeight,pageWidth:document.documentElement.scrollWidth,content:rect(content),nav:rect(nav),header:rect(document.querySelector('header')),main:rect(document.querySelector('main')),scroll:content.scrollWidth,client:content.clientWidth,overflow,overlap};
 });
 assert.ok(state.pageWidth<=state.width+1,label+': pagina desborda');
 assert.ok(state.scroll<=state.client+2,label+': contenido desborda '+JSON.stringify(state));
 assert.deepEqual(state.overflow,[],label+': controles desbordan');
 assert.equal(state.overlap,false,label+': resumen superpuesto');
 assert.ok(state.content.h>=80,label+': no queda altura para trabajar');
 assert.ok(state.content.y>=state.header.bottom-1,label+': cabecera tapa contenido');
 if(state.width<=900){assert.ok(state.content.bottom<=state.nav.y+1,label+': barra tapa contenido');if(state.main.h>0)assert.ok(state.main.bottom<=state.content.y+1,label+': 3D tapa contenido');}
 else if(state.main.w>0&&state.main.h>0)assert.ok(state.main.right<=state.content.x+1,label+': 3D tapa contenido');
 return state;
}
async function main(){
 await mkdir(out,{recursive:true});const p=await port(),base='http://127.0.0.1:'+p;
 const env={...process.env,PORT:String(p),VOCATUS_DEMO:'1',VERCEL:'1',GEMINI_API_KEY:'',OPENAI_API_KEY:''};delete env.OBSIDIAN_VAULT;
 const server=spawn(process.execPath,['visor-bombas/server.mjs'],{cwd:root,env,windowsHide:true,stdio:'ignore'});let browser;
 const checks=[],errors=[],blockedWrites=[];
 try{
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base+'/api/bootstrap')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}assert.ok(ready,'Servidor aislado no inicia');
  const bootstrap=await(await fetch(base+'/api/bootstrap')).json();assert.equal(bootstrap.maintenanceWritable,false);
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{}),args:['--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:1560,height:800},reducedMotion:'reduce'});
  await context.addInitScript(()=>sessionStorage.setItem('vocatus-portada','1'));
  await context.route('https://fonts.googleapis.com/**',r=>r.abort());
  await context.route('**/*.supabase.co/**',r=>r.abort());
  await context.route('**/api/**',async r=>{const request=r.request();if(['POST','DELETE'].includes(request.method())&&/\/api\/(maintenance|equipment|survey)(?:\?|$)/.test(request.url())){blockedWrites.push(request.url());await r.abort();}else await r.continue();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const shot=async name=>page.screenshot({path:path.join(out,name+'.png')});
  const navigate=async section=>{await page.locator('#tel-barra button[data-s='+section+']').click();await page.waitForFunction(s=>document.body.dataset.telSeccion===s,section);};
  await page.goto(base+'/?s=mantenimiento',{waitUntil:'networkidle',timeout:90000});
  await page.locator('#mant-bomba option[value=B3]').waitFor({state:'attached'});await page.selectOption('#mant-bomba','B3');
  await page.locator('[data-localizar=mant-bomba]').click();await page.waitForTimeout(1000);
  for(const width of [1920,1560,1440,1280,1024,901,900,768,420,390,360,320]){
   await page.setViewportSize({width,height:width>900?800:820});
   checks.push({name:'reportar-3d-'+width,state:await geometry(page,'Reportar con 3D '+width)});
   if([1560,1024,390,320].includes(width))await shot('reportar-3d-'+width);
  }
  await page.setViewportSize({width:844,height:390});checks.push({name:'reportar-3d-horizontal',state:await geometry(page,'Reportar 3D horizontal')});await shot('reportar-3d-horizontal');
  await page.locator('#tel-mant [data-cerrar-mapa]').click();assert.ok(!await page.locator('body').evaluate(e=>e.classList.contains('tel-3d')));
  assert.equal(await page.inputValue('#mant-bomba'),'B3');
  await page.setViewportSize({width:1560,height:800});
  for(const size of [{width:1560,height:800},{width:1024,height:768},{width:901,height:700},{width:768,height:1024},{width:390,height:844},{width:320,height:700},{width:844,height:390}]){
   await page.setViewportSize(size);
   for(const section of sections){await navigate(section);checks.push({name:section+'-'+size.width,state:await geometry(page,section+' '+size.width+'x'+size.height)});if([1560,390,844].includes(size.width))await shot(section+'-'+size.width);}
   await shot('reportar-'+size.width);
  }
  // Navegacion y guardado reales de interfaz, en un navegador nuevo y servidor de solo lectura.
  await page.setViewportSize({width:390,height:844});await navigate('mantenimiento');
  await page.getByRole('button',{name:'Guardar en este dispositivo',exact:true}).click();
  assert.equal(await page.locator('#mant-aviso').getAttribute('role'),'alert');
  assert.equal(await page.locator('#mant-aviso').evaluate(e=>document.activeElement===e),true);
  assert.ok(await page.locator('#mant-aviso').evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===e||e.contains(hit);}), 'Error de validacion oculto');
  checks.push({name:'error-de-validacion-visible-y-enfocado',ok:true});await shot('validacion-movil');
  await page.locator('#mant-problema').fill('PRUEBA AISLADA DE INTERFAZ');
  await page.locator('#mant-comentario').fill('Comprobacion automatica local; no es una intervencion de planta.');
  await page.locator('#mant-autor').fill('PRUEBA AUTOMATICA');await page.locator('#mant-fecha').fill('2026-10-30');
  await page.locator('[name=mant-funcional][value=si]').check();
  await navigate('historial');await navigate('mantenimiento');assert.equal(await page.inputValue('#mant-problema'),'PRUEBA AISLADA DE INTERFAZ');
  await page.locator('#tel-mant [data-elegir]').click();await geometry(page,'Elegir bomba movil');
  const otherPump=page.locator('#tel-franja button[data-tag]:not([data-tag=B3])').first(),otherTag=await otherPump.getAttribute('data-tag');
  await otherPump.click();assert.equal(await page.inputValue('#mant-bomba'),otherTag);
  await page.locator('#mant-bomba-elegida .tel-cambiar').click();await page.selectOption('#mant-bomba','B3');
  assert.equal(await page.inputValue('#mant-problema'),'PRUEBA AISLADA DE INTERFAZ');
  await page.getByRole('button',{name:'Guardar en este dispositivo',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#mant-aviso')?.textContent.includes('Reporte de B3'));
  assert.ok((await page.locator('#mant-local').textContent()).includes('PRUEBA AISLADA DE INTERFAZ'));checks.push({name:'guardar-reporte-y-recuperar-borrador',ok:true});
  await shot('reporte-guardado-movil');
  await navigate('historial');if(await page.locator('.tel-volver').isVisible())await page.locator('.tel-volver').click();await page.locator('#hist-buscar').fill('B-3');
  await page.locator('#hist-tarjetas [data-tag=B3]').click();await page.waitForFunction(()=>!document.querySelector('.tel-ficha').hidden);
  await geometry(page,'Historial con ficha movil');await shot('historial-movil');
  await page.locator('#tema-toggle').click();await geometry(page,'Ficha tema claro');await shot('historial-movil-claro');await page.locator('#tema-toggle').click();
  await page.setViewportSize({width:1024,height:768});await navigate('pendientes');
  const pendingGroup=page.locator('#pend-lista details').first();if(await pendingGroup.getAttribute('open')===null)await pendingGroup.locator('summary').click();
  await page.locator('#pend-lista .tel-pend').first().click();await page.waitForTimeout(400);
  await geometry(page,'Pendientes con ficha 1024');await shot('pendientes-ficha-1024');
  const beforeExpand=await page.locator('.inspector').boundingBox();await page.locator('#expand-inspector').click();
  const expanded=await page.locator('.inspector').boundingBox();assert.ok(expanded.width>beforeExpand.width*1.5,'Pantalla completa no amplia la ficha');
  assert.equal(await page.locator('#expand-inspector').getAttribute('aria-pressed'),'true');await shot('ficha-ampliada');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#expand-inspector').getAttribute('aria-pressed'),'false');
  await page.locator('#expand-inspector').click();await navigate('mantenimiento');assert.equal(await page.locator('.inspector.is-fullscreen').count(),0);checks.push({name:'ampliar-ficha-escape-y-navegar',ok:true});
  await page.goto(base+'/?s=no-existe',{waitUntil:'networkidle'});await page.locator('#tel-barra').waitFor();assert.equal(await page.locator('body').getAttribute('data-tel-seccion'),'areas');
  checks.push({name:'enlace-con-seccion-invalida',ok:true});assert.deepEqual(errors,[],'Errores JS');assert.deepEqual(blockedWrites,[],'Se intento escribir en el servidor');
  for(const size of [{width:1280,height:800},{width:390,height:844}]){
   await page.setViewportSize(size);
   for(const route of ['levantamiento','avance','solicitud','equipo']){
    await page.goto(base+'/'+route+'.html?tag=B3',{waitUntil:'networkidle'});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' desborda a '+size.width);
    checks.push({name:route+'-'+size.width,ok:true});if(size.width===390)await shot(route+'-movil');
   }
  }
  const flat=await context.newPage();flat.on('pageerror',e=>errors.push(e.message));
  await flat.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};});
  await flat.goto(base+'/?s=areas',{waitUntil:'networkidle'});assert.equal(await flat.evaluate(()=>document.createElement('canvas').getContext('webgl2')),null);
  if(await flat.locator('#portada button').isVisible())await flat.locator('#portada button').click();
  await flat.locator('#portada').waitFor({state:'hidden'});
  await flat.locator('#tel-barra button[data-s=historial]').click();assert.ok(await flat.locator('#hist-buscar').isVisible());await geometry(flat,'Historial sin WebGL');
  checks.push({name:'consulta-de-historial-sin-webgl',ok:true});await flat.screenshot({path:path.join(out,'sin-webgl.png')});await flat.close();assert.deepEqual(errors,[]);
  await writeFile(path.join(out,'resultado.json'),JSON.stringify({ok:true,checks,errors,blockedWrites,scope:'Servidor DEMO de solo lectura; Supabase bloqueado; datos sinteticos solo en contexto descartable.'},null,2));
  console.log('OK: '+checks.length+' comprobaciones de interfaz, sin escrituras remotas. Capturas: '+out);
 }catch(error){await browser?.contexts()[0]?.pages()[0]?.screenshot({path:path.join(out,'fallo.png')});await writeFile(path.join(out,'fallo.json'),JSON.stringify({error:error.message,checks,errors,blockedWrites},null,2));throw error;}
 finally{await browser?.close();server.kill();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
