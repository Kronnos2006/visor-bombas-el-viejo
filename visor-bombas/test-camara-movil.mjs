import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pumpPhotoStore} from './pump-photos.mjs';
import {htmlFotos} from './public/fotos-bomba.js';
const JPG=Buffer.from([255,216,255,224,1,2,3]), PNG=Buffer.from([137,80,78,71,13,10,26,10,1,2]);
test('expediente ofrece cámara directa sin perder galería',()=>{
 const html=htmlFotos({tag:'B1'}, {}, {}, {writable:false});
 assert.match(html,/capture="environment"/);
 assert.match(html,/Tomar foto/);
 assert.match(html,/Galería/);
});
test('recargar la ficha devuelve la foto nueva y no la antigua aun con extensiones duplicadas',async t=>{
 const vault=await mkdtemp(path.join(os.tmpdir(),'vocatus-camera-'));
 t.after(()=>rm(vault,{recursive:true,force:true}));
 const s=pumpPhotoStore(vault);
 await s.save('B1','bomba',JPG.toString('base64'));
 const first=(await s.list('B1')).bomba.url;
 await s.save('B1','bomba',PNG.toString('base64'));
 const now=(await s.list('B1')).bomba.url;
 assert.notEqual(first,now);
 assert.deepEqual((await s.read('B1','bomba')).bytes,PNG);
 const dir=path.join(vault,'00-Proyecto/fotos-campo/B1/expediente');
 await writeFile(path.join(dir,'bomba.jpg'),JPG);
 assert.deepEqual((await s.read('B1','bomba')).bytes,PNG,'no dar prioridad al JPG viejo');
 assert.match((await s.list('B1')).bomba.url,/v=/);
});
