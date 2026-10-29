import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadSharedPhotoRows} from './public/cloud-photo-core.js';

const source=(await readFile(new URL('./public/cloud-photos.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
const row=(entity,slot='bomba')=>({entity_key:entity,slot,revision:1,object_path:'synthetic/'+encodeURIComponent(entity)+'/'+slot+'.jpg',updated_at:'2026-10-29T20:00:00Z'});
const refA='integrado:REF Semilleros y pies de cuba:Bomba a la derecha de escalera 1 - segun foto';
const refB='integrado:REF Agua y enfriamiento:Tres bombas de circulacion con guardas y bancadas · Bomba 2';

// Solo ejecuta las funciones reales con un cliente Supabase en memoria. Ningún
// import dinámico, credencial, archivo privado o petición real se utiliza aquí.
function fixture(data,{signedIn=true,onRange=()=>{},onDownload=()=>{},failed=new Set()}={}){
 const ranges=[],orders=[],downloads=[],created=[],revoked=[],events=[];
 let authChanged,queries=0,rpcCalls=0;
 const account={user:{id:'synthetic-owner',email:'test@example.invalid'}};
 const fakeSupabase={
  auth:{getSession:async()=>({data:{session:signedIn?account:null}}),onAuthStateChange(callback){authChanged=callback;}},
  async rpc(){rpcCalls++;return {data:{read:true,write:true}};},
  channel(){return {on(){return this;},subscribe(){}};},
  from(table){
   assert.equal(table,'vocatus_photos');queries++;
   const query={select(value){assert.equal(value,'*');return this;},order(key){orders.push(key);return this;},async range(from,to){ranges.push([from,to]);await onRange({from,to,changeAccount});return {data:data.slice(from,to+1)};}};
   return query;
  },
  storage:{from(bucket){assert.equal(bucket,'vocatus-photos');return {async download(path){downloads.push(path);await onDownload({path,changeAccount});return failed.has(path)?{error:Error('fallo sintético de descarga')}:{data:new Blob(['synthetic'],{type:'image/jpeg'})};}};}}
 };
 const dependencies={cloudPhotoConfig:{enabled:true},loadSharedPhotoRows,fakeSupabase,
  document:{visibilityState:'visible',addEventListener(){},dispatchEvent(event){events.push(event);}},
  window:{addEventListener(){}},
  URL:{createObjectURL(){const value='blob:synthetic-'+created.length;created.push(value);return value;},revokeObjectURL:value=>revoked.push(value)},
  CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}},
  setTimeout:callback=>queueMicrotask(callback),setInterval(){}
 };
 const api=new Function(...Object.keys(dependencies),source+'\nclientPromise=Promise.resolve(fakeSupabase);return {refreshAllSharedPhotos,cloudRevision,watch(entity){watchers.set(entity,1);}};')(...Object.values(dependencies));
 function changeAccount(){assert.ok(authChanged);authChanged('SIGNED_IN',{user:{id:'another-synthetic-owner'}});}
 return {...api,ranges,orders,downloads,created,revoked,events,get queries(){return queries;},get rpcCalls(){return rpcCalls;}};
}

test('actualización global pagina más de 200 fotos y conserva todas las entidades y categorías',async()=>{
 const entities=[refA,refB,'B30',...Array.from({length:202},(_,i)=>'integrado:Prueba:Bomba '+i)];
 const rows=entities.flatMap(entity=>[row(entity),row(entity,'placa1')]);
 const f=fixture(rows),progress=[];f.watch(refA);f.watch('B30');
 const result=await f.refreshAllSharedPhotos({onProgress:event=>progress.push(event)});
 assert.deepEqual(f.ranges,[[0,199],[200,399],[400,599]]);
 assert.deepEqual(f.orders,['entity_key','slot','entity_key','slot','entity_key','slot']);
 assert.deepEqual(result,{photos:410,equipment:205,failed:0});
 assert.equal(new Set(f.downloads).size,410);
 for(const entity of entities){assert.equal(f.cloudRevision(entity,'bomba'),1);assert.equal(f.cloudRevision(entity,'placa1'),1);}
 assert.equal(progress.length,205);assert.deepEqual(progress.at(-1),{phase:'reading',done:205,total:205});
 assert.deepEqual(f.events.filter(e=>e.type==='vocatus:cloud-photos').map(e=>e.detail.entity),[refA,'B30']);
});

test('fallo parcial de descarga cuenta la foto fallida y conserva las demás entidades',async()=>{
 const rows=[row(refA),row(refA,'placa1'),row(refB),row('B30')];
 const failed=new Set([rows[1].object_path]),f=fixture(rows,{failed});
 assert.deepEqual(await f.refreshAllSharedPhotos(),{photos:3,equipment:3,failed:1});
 assert.equal(f.downloads.length,4);assert.equal(f.created.length,3);
 failed.clear();
 assert.deepEqual(await f.refreshAllSharedPhotos(),{photos:4,equipment:3,failed:0});
 assert.equal(f.downloads.length,5,'El reintento recupera la foto fallida sin descargar de nuevo las ya disponibles.');
});

test('sin sesión la actualización global rechaza y no consulta tablas ni Storage',async()=>{
 const f=fixture([row(refA)],{signedIn:false});
 await assert.rejects(f.refreshAllSharedPhotos(),/Conectá tu cuenta/);
 assert.equal(f.queries,0);assert.equal(f.downloads.length,0);assert.equal(f.rpcCalls,0);
});

test('cambiar cuenta durante el listado descarta las filas y no descarga fotos',async()=>{
 const f=fixture([row(refA)],{onRange:({changeAccount})=>changeAccount()});
 await assert.rejects(f.refreshAllSharedPhotos(),/cuenta cambió/);
 assert.equal(f.downloads.length,0);assert.equal(f.cloudRevision(refA,'bomba'),undefined);
 assert.equal(f.created.length,0);
});

test('cambiar cuenta durante una descarga no devuelve datos y revoca las fotos anteriores',async()=>{
 const rows=[row(refA),row(refA,'placa1')];let count=0;
 const f=fixture(rows,{onDownload:({changeAccount})=>{if(++count===2)changeAccount();}});
 await assert.rejects(f.refreshAllSharedPhotos(),/cuenta cambió/);
 assert.equal(f.downloads.length,2);assert.equal(f.created.length,1);
 assert.deepEqual(f.revoked,f.created);assert.equal(f.cloudRevision(refA,'bomba'),undefined);
});

test('listado vacío devuelve cero y actualiza la ficha observada sin inventar imágenes',async()=>{
 const f=fixture([]);f.watch(refB);
 assert.deepEqual(await f.refreshAllSharedPhotos(),{photos:0,equipment:0,failed:0});
 assert.deepEqual(f.ranges,[[0,199]]);assert.equal(f.downloads.length,0);
 assert.deepEqual(f.events.filter(e=>e.type==='vocatus:cloud-photos').map(e=>e.detail.entity),[refB]);
});
