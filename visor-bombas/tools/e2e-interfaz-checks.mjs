import path from 'node:path';
import assert from 'node:assert/strict';
export const checkInterface=async({page,context,base,out,errors})=>{
 const shot=async(name,fullPage=true)=>page.screenshot({path:path.join(out,name+'.png'),fullPage});
 const noOverflow=async name=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' desborda horizontalmente');
 await page.locator('#search').fill('B32');await page.locator('#pump-list [data-tag=B32]').click();
 await page.waitForFunction(()=>document.querySelector('#pump-meta')?.textContent.includes('Completos'));
 await page.waitForFunction(()=>window.__blenderIntegrado?.bombas?.length>0,{},{timeout:60000});
 const beforeZoom=await page.evaluate(()=>window.__visor.camera.position.toArray());await page.locator('[data-camera=in]').click();await page.waitForTimeout(300);assert.notDeepEqual(await page.evaluate(()=>window.__visor.camera.position.toArray()),beforeZoom,'Acercar no mueve la cámara');
 const beforeRotate=await page.evaluate(()=>window.__visor.camera.position.toArray());await page.locator('[data-camera=left]').click();await page.waitForTimeout(300);assert.notDeepEqual(await page.evaluate(()=>window.__visor.camera.position.toArray()),beforeRotate,'Girar no mueve la cámara');
 await page.locator('[data-quick=locate]').click();await page.waitForTimeout(700);
 assert.equal(await page.locator('#selected-tag').textContent(),'B32');
 assert.ok(await page.locator('.label.located').count()>0);
 await noOverflow('Escritorio');await shot('escritorio-planta');
 await page.locator('#pump-list [data-tag=B32]').click();await page.waitForTimeout(700);
 await shot('escritorio-expediente');
 await page.locator('#vista-toggle').click();await shot('escritorio-completa');await page.locator('#vista-toggle').click();await page.locator('#tema-toggle').click();await shot('escritorio-claro');await page.locator('#tema-toggle').click();
 const summary=page.locator('#pump-resumen details').first();
 if(await summary.getAttribute('open')!==null)await summary.locator(':scope > summary').click();
 await page.waitForTimeout(100);
 await page.locator('[data-tab=historial]').click();await page.waitForTimeout(300);await shot('escritorio-historial');
 await page.locator('[data-tab=ficha]').click();assert.equal(await page.locator('#pump-resumen details').first().getAttribute('open'),null,'No recuerda sección plegada');
 await page.locator('[data-quick=photos]').click();assert.notEqual(await page.locator('#fuentes-B32 details').first().getAttribute('open'),null,'Fotos no abre su sección');
 await page.locator('[data-quick=maintenance]').click();assert.ok(await page.locator('#rep-form').isVisible());
 await page.locator('[data-tab=sim]').click();await page.waitForTimeout(300);assert.ok(await page.locator('#sim-run').isVisible());await shot('escritorio-simulador');
 await page.locator('#sim-run').click();await page.waitForTimeout(300);assert.ok((await page.locator('#sim-phase').textContent()).length>0);await page.locator('#sim-run').click();
 for(const route of ['levantamiento','avance','solicitud','equipo']){
  await page.goto(base+'/'+route+'.html?tag=B32',{waitUntil:'networkidle'});await noOverflow(route+' escritorio');await shot('escritorio-'+route);
  if(route==='avance'){
   assert.ok(await page.getByRole('columnheader',{name:'VERIFICACIÓN EN CAMPO'}).count());await page.selectOption('#verified','yes');await page.selectOption('#verified','no');await page.selectOption('#verified','');
  }
  await page.setViewportSize({width:420,height:900});await noOverflow(route+' móvil');await shot('movil-'+route,false);await page.setViewportSize({width:1440,height:1000});
 }
 await page.setViewportSize({width:420,height:900});await page.goto(base+'/#B32',{waitUntil:'networkidle'});await page.waitForTimeout(700);
 assert.equal(await page.locator('.inspector').getAttribute('data-sheet'),'folded');const scroll=await page.evaluate(()=>scrollY);
 await shot('movil-planta',false);await page.locator('.sheet-bar [data-sheet=open]').click();await page.waitForTimeout(250);const viewport=await page.locator('#viewport').boundingBox(),sheetBox=await page.locator('.inspector').boundingBox();assert.ok(viewport.height>100&&viewport.y+viewport.height<=sheetBox.y,'La ficha abierta oculta el 3D');await shot('movil-ficha',false);
 await page.locator('[data-tab=historial]').click();await page.waitForTimeout(200);await shot('movil-historial',false);await page.locator('[data-tab=sim]').click();await page.waitForTimeout(200);await shot('movil-simulador',false);
 await page.locator('[data-quick=photos]').click();assert.equal(await page.evaluate(()=>scrollY),scroll,'Fotos desplaza la página móvil');
 await page.locator('.sheet-bar [data-sheet=folded]').click();await page.locator('.sheet-bar [data-sheet=closed]').click();assert.ok(await page.locator('.sheet-reopen').isVisible());
 await page.locator('.sheet-reopen').click();assert.equal(await page.locator('.inspector').getAttribute('data-sheet'),'open');
 const sizes=await page.locator('#camera-tools button').evaluateAll(bs=>bs.map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})));assert.ok(sizes.every(b=>b.w>=44&&b.h>=44));
 await page.setViewportSize({width:360,height:800});await noOverflow('Ficha a 360px');
 await page.setViewportSize({width:1440,height:1000});
 const failed=await context.newPage();failed.on('pageerror',e=>errors.push(e.message));
 await failed.route('**/modelos/blender-local/planta-blender-local.glb',r=>r.abort());
 await failed.goto(base,{waitUntil:'networkidle'});await failed.locator('#scene-error').waitFor({state:'visible'});
 await failed.locator('#scene-sheets').click();assert.ok(await failed.locator('body.fichas-only').count());
 await failed.screenshot({path:path.join(out,'recuperacion-3d.png')});
 await failed.unroute('**/modelos/blender-local/planta-blender-local.glb');await failed.locator('#scene-retry').click();
 await failed.waitForFunction(()=>window.__blenderIntegrado?.bombas?.length>0,{},{timeout:60000});assert.ok(await failed.locator('#scene-error').isHidden());assert.equal(await failed.locator('#model-progress').getAttribute('value'),'100','La carga no informa porcentaje');await failed.close();
 const flat=await context.newPage();flat.on('pageerror',e=>errors.push(e.message));
 await flat.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/i.test(type))return null;return original.call(this,type,...args);};});
 await flat.goto(base,{waitUntil:'networkidle'});await flat.locator('#scene-error').waitFor({state:'visible'});await flat.locator('#scene-sheets').click();await flat.fill('#search','B32');await flat.locator('#pump-list [data-tag=B32]').click();await flat.waitForTimeout(500);assert.equal(await flat.locator('#selected-tag').textContent(),'B32');await flat.close();
 assert.deepEqual(errors,[]);console.log('OK: acciones, secciones, móvil, Avance, cámara, recuperación de modelo y consulta sin WebGL.');
};
