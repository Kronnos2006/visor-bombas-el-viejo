import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import * as core from './public/cloud-photo-core.js';
import * as packages from './public/photo-package-core.js';
import {PHOTO_SLOTS} from './public/photo-slots.js';

const entity='integrado:REF Semilleros y pies de cuba:Bomba a la derecha de escalera 1 - segun foto';
const slots=['placa1','placa2','bomba','posicion'];
const original=await readFile(new URL('./public/fotos-bomba.js',import.meta.url),'utf8');

// Ejecuta el módulo de producción: sustituye únicamente sus dependencias de
// navegador/red por memoria sintética. No copia la implementación de la cola.
function fixture({legacy=false}={}){
 const records=new Map(slots.map(slot=>[entity+':'+slot,{
  blob:new Blob(['synthetic '+slot],{type:'image/jpeg'}),fecha:'2026-10-28T20:00:00Z',
  ...(legacy?{}:{revision:'local-'+slot,cloudPending:true,cloudBase:0})
 }]));
 const uploaded=[],published=[];
 let transportCalls=0,release;
 const gate=new Promise(resolve=>{release=resolve;});
 function request(result){const r={result};queueMicrotask(()=>r.onsuccess?.());return r;}
 const store={
  getAllKeys:()=>request([...records.keys()]),
  getAll:()=>request([...records.values()]),
  get:key=>request(records.get(key)),
  put(value,key){records.set(key,value);return request(key);}
 };
 const database={transaction(){const t={objectStore:()=>store};setTimeout(()=>t.oncomplete?.(),0);return t;}};
 const indexedDB={open(){const r={result:database};queueMicrotask(()=>r.onsuccess?.());return r;}};
 const transport={userId:'synthetic-user',
  async upload(path,blob){uploaded.push({path,blob});},
  async publish(key,slot,expected,path){published.push({key,slot,expected,path});return {revision:1,object_path:path};},
  async readOne(){return null;}
 };
 const dependencies={...core,...packages,PHOTO_SLOTS,indexedDB,globalThis:{indexedDB},crypto:{randomUUID},
  cloudEnabled:()=>true,
  cloudTransport:async()=>{transportCalls++;await gate;return transport;}
 };
 const source=original.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
 assert.doesNotMatch(source,/^import /m,'El arnés debe aislar todos los imports de red.');
 const {flushCloudPhotos}=new Function(...Object.keys(dependencies),source+'\nreturn {flushCloudPhotos};')(...Object.values(dependencies));
 return {flushCloudPhotos,records,uploaded,published,release,get transportCalls(){return transportCalls;}};
}

function assertFourConfirmed(f){
 assert.equal(f.uploaded.length,4);
 assert.equal(f.published.length,4);
 assert.deepEqual(f.published.map(p=>p.slot),slots);
 assert.equal(new Set(f.published.map(p=>p.path)).size,4);
 for(const p of f.published){assert.equal(p.key,entity);assert.equal(p.expected,0);}
 for(const slot of slots){const local=f.records.get(entity+':'+slot);assert.equal(local.cloudRevision,1);assert.equal(local.cloudPending,false);assert.ok(local.blob.size);}
}

test('compartir fotos antiguas durante una actualización automática publica las cuatro después',async()=>{
 const f=fixture({legacy:true});
 const automatic=f.flushCloudPhotos(entity);
 const manual=f.flushCloudPhotos(entity,true);
 assert.equal(f.transportCalls,1,'La pasada manual debe esperar la actualización en curso.');
 f.release();
 assert.match(await automatic,/^0 fotos confirmadas/);
 assert.match(await manual,/^4 fotos confirmadas/);
 assert.equal(f.transportCalls,2);
 assertFourConfirmed(f);
});

test('dos actualizaciones automáticas simultáneas comparten la subida sin duplicar fotos',async()=>{
 const f=fixture();
 const first=f.flushCloudPhotos(entity),second=f.flushCloudPhotos(entity);
 assert.equal(f.transportCalls,1);
 f.release();
 const results=await Promise.all([first,second]);
 assert.deepEqual(results,['4 fotos confirmadas en línea.','4 fotos confirmadas en línea.']);
 assert.equal(f.transportCalls,1);
 assertFourConfirmed(f);
});

test('dos solicitudes manuales simultáneas comparten una sola subida de fotos antiguas',async()=>{
 const f=fixture({legacy:true});
 const first=f.flushCloudPhotos(entity,true),second=f.flushCloudPhotos(entity,true);
 assert.equal(f.transportCalls,1);
 f.release();
 const results=await Promise.all([first,second]);
 assert.deepEqual(results,['4 fotos confirmadas en línea.','4 fotos confirmadas en línea.']);
 assert.equal(f.transportCalls,1);
 assertFourConfirmed(f);
});

test('resultado de compartir permanece visible cuando actualizar las fotos reemplaza sus controles',async()=>{
 const text=await readFile(new URL('./public/cloud-photos.js',import.meta.url),'utf8');
 function controls(){
  const elements=new Map(['data-cloud-state','data-cloud-result','data-cloud-pending','data-cloud-connect','data-cloud-refresh'].map(name=>['['+name+']',{textContent:'',disabled:false,hidden:false}]));
  return {dataset:{cloudEntity:entity},querySelector:selector=>elements.get(selector),append(){}};
 }
 const oldBox=controls();let currentBox=oldBox,refreshes=0;
 const root={isConnected:true,querySelector:selector=>selector==='.cloud-photo-controls'?currentBox:currentBox.querySelector(selector)};
 const fakeSupabase={auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange(){}},channel(){return {on(){return this;},subscribe(){}};}};
 const document={addEventListener(){},getElementById:()=>({}),createElement:()=>({})};
 const dependencies={cloudPhotoConfig:{enabled:true},loadSharedPhotoRows:core.loadSharedPhotoRows,fakeSupabase,document,window:{addEventListener(){}},setInterval(){}};
 const source=text.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
 const api=new Function(...Object.keys(dependencies),source+'\nclientPromise=Promise.resolve(fakeSupabase);return {bindCloudPhotoControls,startCloudPhotos};')(...Object.values(dependencies));
 await api.startCloudPhotos();
 api.bindCloudPhotoControls(root,entity,{flush:async()=> '4 fotos confirmadas en línea.',refresh:async()=>{refreshes++;currentBox=controls();}});
 // Deja terminar la actualización inicial del estado de cuenta antes de pulsar.
 await Promise.resolve();await Promise.resolve();
 await oldBox.querySelector('[data-cloud-pending]').onclick();
 assert.equal(refreshes,1);
 assert.notEqual(currentBox,oldBox);
 assert.equal(currentBox.querySelector('[data-cloud-result]').textContent,'4 fotos confirmadas en línea.');
 assert.equal(oldBox.querySelector('[data-cloud-result]').textContent,'');
});
