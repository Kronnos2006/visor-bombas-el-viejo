import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Worker as NodeWorker} from 'node:worker_threads';
import {decodePhoto,isHeicPhoto} from './public/photo-image.js';
const fixture=JSON.parse(await readFile(new URL('./test-fixtures/synthetic-heic.json',import.meta.url),'utf8'));
const file=(name='photo.heic',type='image/heic')=>Object.assign(new Blob([Buffer.from(fixture.base64,'base64')],{type}),{name});
test('detecta HEIC por extensión, MIME y firma aunque venga sin tipo desde el teléfono',async()=>{assert.equal(await isHeicPhoto(file()),true);assert.equal(await isHeicPhoto(file('PHOTO.HEIF','')),true);assert.equal(await isHeicPhoto(file('archivo','')),true);assert.equal(await isHeicPhoto(new Blob(['jpeg'],{type:'image/jpeg'})),false);});
test('Safari que ya abre HEIC no descarga el conversor adicional',async()=>{let converted=false;const bitmap={width:64,height:48};assert.equal(await decodePhoto(file(),{native:async()=>bitmap,heic:async()=>{converted=true;}}),bitmap);assert.equal(converted,false);});
test('Android sin decodificador HEIC convierte antes de guardar',async()=>{const bitmap={width:64,height:48};let converted=false;assert.equal(await decodePhoto(file(),{native:async()=>{throw Error('unsupported');},heic:async source=>{converted=true;assert.equal(source.type,'image/heic');return bitmap;}}),bitmap);assert.equal(converted,true);});
test('fallo HEIC es legible y no continúa al guardado',async()=>{await assert.rejects(decodePhoto(file(),{native:async()=>{throw Error('unsupported');},heic:async()=>{throw Error('decode failed');}}),/HEIC.*anterior se conserva/);});
test('admite foto móvil mayor de 8 MB para reducirla y limita archivos mayores de 32 MB',async()=>{const bitmap={width:1,height:1};assert.equal(await decodePhoto({size:9*1024*1024},{native:async()=>bitmap}),bitmap);await assert.rejects(decodePhoto({size:33*1024*1024},{native:async()=>bitmap}),/32 MB/);});
test('conversor publicado decodifica realmente los píxeles HEIC en worker',async t=>{
 const running=[];const oldWorker=globalThis.Worker,oldBitmap=globalThis.createImageBitmap;
 t.after(async()=>{globalThis.Worker=oldWorker;globalThis.createImageBitmap=oldBitmap;await Promise.all(running.map(w=>w.terminate()));});
 globalThis.Worker=class {
  listeners=new Map();
  constructor(url){this.ready=(async()=>{const source=await(await fetch(url)).text();const shim=`const {parentPort}=require('node:worker_threads');globalThis.self=globalThis;globalThis.ImageData=class {constructor(width,height){this.width=width;this.height=height;this.data=new Uint8ClampedArray(width*height*4);}};Object.defineProperty(globalThis,'onmessage',{set(fn){parentPort.on('message',data=>fn({data}));}});globalThis.postMessage=data=>parentPort.postMessage(data);`;this.worker=new NodeWorker(shim+source,{eval:true});running.push(this.worker);this.worker.on('message',data=>this.emit('message',{data,currentTarget:this}));this.worker.on('error',error=>this.emit('error',{data:error,currentTarget:this}));})();}
  emit(type,event){for(const fn of this.listeners.get(type)||[])fn(event);}
  postMessage(data){this.ready.then(()=>this.worker.postMessage(data));}
  addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);}
  removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);}
 };
 globalThis.createImageBitmap=async imageData=>imageData;
 const {heicTo}=await import('./public/vendor/heic-to.js');
 const result=await heicTo({blob:file(),type:'bitmap'});
 assert.equal(result.width,fixture.width);assert.equal(result.height,fixture.height);assert.equal(result.data.length,64*48*4);assert.equal(result.data[3],255);assert.notEqual(result.data[0],result.data[(63)*4]);
});
