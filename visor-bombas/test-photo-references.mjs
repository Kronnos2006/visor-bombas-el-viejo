import test from 'node:test';
import assert from 'node:assert/strict';
import {makePhotoPackage,readPhotoPackage,makeReferencePhotoPackage,readReferencePhotoPackage,storagePhotoIdentity} from './public/photo-package-core.js';
import {guardarFoto,exportPhotoPackage,saveLocalPhotos,photoTransferHTML,htmlFotos} from './public/fotos-bomba.js';

const base64=Buffer.from([255,216,255,224,0,1,255,217]).toString('base64');
const reference='integrado:tanques:Bomba de recirculación: Ácido Nº 2 / '+ 'nombre largo '.repeat(40);
const image=(extra={})=>({reference,slot:'sello',fecha:'2026-10-28T20:00:00.000Z',base64,...extra});

test('fotos sin TAG conservan referencia con dos puntos, Unicode, nombre largo y bytes sin crear TAG',()=>{
 const original=[image()],pkg=makeReferencePhotoPackage(original),loaded=readReferencePhotoPackage(JSON.stringify(pkg));
 assert.equal(pkg.formato,'vocatus-reference-photos');assert.deepEqual(loaded,original);assert.equal(loaded[0].tag,undefined);
 assert.deepEqual(storagePhotoIdentity(reference+':sello'),{reference,slot:'sello'});
 assert.throws(()=>readPhotoPackage(pkg),/compatible/);assert.throws(()=>makePhotoPackage(original),/TAG/);
 assert.throws(()=>readReferencePhotoPackage(makePhotoPackage([{tag:'B30',slot:'bomba',fecha:image().fecha,base64}])),/compatible/);
});

test('separa claves vigentes TAG y referencias del historial y claves ajenas',()=>{
 assert.deepEqual(storagePhotoIdentity('B30:sello'),{tag:'B30',slot:'sello'});
 for(const key of ['history:B30:sello:12','history:'+reference+':sello:12','B30:incorrecto','B0:sello','integrado::Bomba:sello','integrado:tanques:\u0000:sello','__proto__:sello'])assert.equal(storagePhotoIdentity(key),null,key);
 assert.throws(()=>makeReferencePhotoPackage([image(),image()]),/repite/);
 for(const extra of [{reference:'B30'},{reference:'integrado::Bomba'},{reference:'integrado:a:'+ 'x'.repeat(2000)},{slot:'otra'},{fecha:'ayer'},{base64:'***='},{tag:'B30'}])assert.throws(()=>makeReferencePhotoPackage([image(extra)]));
});

test('transferencia de referencias identifica nombre y referencia, sin prometer sincronización de ficha',async()=>{
 const html=photoTransferHTML(reference,{writable:false,reference:true,displayName:'Bomba sin TAG'});
 assert.match(html,/sin asignar TAG/);assert.match(html,/Descargar fotos de Bomba sin TAG/);assert.doesNotMatch(html,/data-photo-sync/);
 await assert.rejects(saveLocalPhotos(reference,{writable:true}),/visor local/);
});

// Prueba de la cola real de guardado: una compresión lenta no puede escribir después
// de la segunda foto seleccionada. Se simulan solo las APIs de imagen/red del navegador.
test('selecciones consecutivas de una categoría se guardan en orden y una falla libera la cola',async t=>{
 const previous=Object.fromEntries(['document','createImageBitmap','FileReader','fetch'].map(k=>[k,globalThis[k]]));
 t.after(()=>{for(const [key,value] of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
 const posted=[];
 globalThis.createImageBitmap=async file=>{await new Promise(resolve=>setTimeout(resolve,file.delay));if(file.fail)throw Error('imagen dañada');return {width:1,height:1,id:file.id,close(){}};};
 globalThis.document={createElement(){let id;return {getContext(){return {drawImage(image){id=image.id;}};},toBlob(done){done(new Blob([String(id)],{type:'image/jpeg'}));}};}};
 globalThis.FileReader=class{readAsDataURL(blob){blob.arrayBuffer().then(bytes=>{this.result='data:image/jpeg;base64,'+Buffer.from(bytes).toString('base64');this.onload();});}};
 globalThis.fetch=async(_url,options)=>{const body=JSON.parse(options.body);posted.push(Buffer.from(body.base64,'base64').toString());return {ok:true,json:async()=>({foto:{id:posted.at(-1)}})};};
 const options={writable:true,token:'TEST'};
 await Promise.all([guardarFoto('B30','sello',{id:'primera',size:1,delay:30},options),guardarFoto('B30','sello',{id:'segunda',size:1,delay:0},options)]);
 assert.deepEqual(posted,['primera','segunda']);
 const bad=guardarFoto('B30','sello',{size:1,delay:1,fail:true},options);
 const good=guardarFoto('B30','sello',{id:'tercera',size:1,delay:0},options);
 await assert.rejects(bad,/No se pudo abrir esta imagen/);await good;assert.equal(posted.at(-1),'tercera');
});


test('selectores nativos visibles tienen nombre único por categoría y equipo',()=>{
 const html=htmlFotos({tag:'B30'},{},{},{writable:false});
 const inputs=[...html.matchAll(/<input\b[^>]*>/g)].map(match=>match[0]);
 assert.equal(inputs.length,11);
 assert.equal(new Set(inputs.map(input=>input.match(/aria-label="([^"]+)"/)?.[1])).size,11);
 for(const input of inputs){assert.match(input,/class="foto-file"/);assert.match(input,/type="file"/);assert.match(input,/aria-label="[^"]+B30"/);assert.doesNotMatch(input,/\shidden(?:[\s=>]|$)/);}
 assert.doesNotMatch(html,/role="button"|tabindex="0"/);
 assert.match(html,/aria-label="Sello mecánico de B30"/);
 assert.match(html,/aria-label="Cargar archivo de fotos para B30"/);
});
