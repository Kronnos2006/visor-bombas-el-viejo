import test from 'node:test';
import assert from 'node:assert/strict';
import {synchronizeAllPhotos} from './public/cloud-photo-batch.js';

const refA='integrado:REF Semilleros y pies de cuba:Bomba a la derecha de escalera 1 - segun foto';
const refB='integrado:REF Agua y enfriamiento:Tres bombas de circulacion con guardas y bancadas · Bomba 2';
const remote={photos:12,equipment:3,failed:0};
const photo=(identity,extra={})=>Object.freeze({...(identity.startsWith('integrado:')?{reference:identity}:{tag:identity}),slot:'bomba',blob:new Blob(['synthetic'],{type:'image/jpeg'}),cloudPending:true,...extra});

test('actualización global conserva dos referencias y B30 independientes y comparte secuencialmente',async()=>{
 const local=Object.freeze([photo(refA),photo(refA,{slot:'placa1'}),photo(refB),photo('B30')]);
 const calls=[],progress=[];let active=0,peak=0;
 const result=await synchronizeAllPhotos({localEntries:async()=>local,syncEntity:async entity=>{active++;peak=Math.max(peak,active);calls.push(entity);await Promise.resolve();active--;},loadShared:async({onProgress})=>{assert.equal(active,0);assert.equal(calls.length,3);onProgress({phase:'loading',done:12,total:12});return remote;},onProgress:p=>progress.push(p)});
 assert.deepEqual(calls,[refA,refB,'B30']);assert.equal(peak,1);
 assert.deepEqual(progress.filter(p=>p.phase==='sharing'),[0,1,2,3].map(done=>({phase:'sharing',done,total:3})));
 assert.deepEqual(progress.at(-1),{phase:'loading',done:12,total:12});
 assert.deepEqual(result,{...remote,pending:4,conflicts:0,errors:[]});
 assert.equal(local[0].cloudPending,true,'El coordinador no puede marcar fotos como publicadas.');
});

test('incluye fotos antiguas y pendientes; excluye las confirmadas y conserva conflictos',async()=>{
 const local=[photo(refA,{cloudPending:undefined}),photo(refB),photo('B30',{cloudPending:false,cloudRevision:3}),photo('B31',{cloudPending:undefined,cloudRevision:1}),photo('B32',{cloudConflict:true}),photo(refA,{slot:'placa1',cloudConflict:true})];
 const calls=[];
 const result=await synchronizeAllPhotos({localEntries:async()=>local,syncEntity:async entity=>calls.push(entity),loadShared:async()=>remote});
 assert.deepEqual(calls,[refA,refB]);
 assert.equal(result.pending,4);assert.equal(result.conflicts,2);
 assert.equal(local[4].cloudConflict,true);assert.equal(local[5].cloudConflict,true);
});

test('fallo de una entidad conserva su pendiente, continúa con la siguiente y consulta la nube',async()=>{
 const local=[photo(refA),photo(refB)],calls=[];
 const result=await synchronizeAllPhotos({localEntries:async()=>local,syncEntity:async entity=>{calls.push(entity);if(entity===refA)throw Error('sin conexión temporal');},loadShared:async()=>{calls.push('shared');return {...remote,failed:1};}});
 assert.deepEqual(calls,[refA,refB,'shared']);assert.equal(result.failed,1);
 assert.equal(result.pending,2);assert.equal(result.errors.length,1);assert.match(result.errors[0],/Semilleros.*sin conexión temporal/);
});

test('fallo de lectura local no impide descargar la nube ni inventa el conteo pendiente',async()=>{
 let sharedCalls=0,localCalls=0;
 const result=await synchronizeAllPhotos({localEntries:async()=>{localCalls++;throw Error('IndexedDB bloqueado');},syncEntity:async()=>assert.fail('No hay inventario local disponible.'),loadShared:async()=>{sharedCalls++;return remote;}});
 assert.equal(sharedCalls,1);assert.equal(localCalls,2);
 assert.equal(result.photos,12);assert.equal(result.pending,null);assert.equal(result.conflicts,null);
 assert.ok(result.errors.some(error=>error.includes('IndexedDB bloqueado')));
});

test('relee el estado después de compartir y repetir sin pendientes no duplica subidas',async()=>{
 let local=[photo(refA,{cloudPending:undefined}),photo('B30')],sends=0,reads=0;
 const args={localEntries:async()=>{reads++;return local;},syncEntity:async entity=>{sends++;local=local.map(p=>(p.reference||p.tag)===entity?photo(entity,{...p,cloudPending:false,cloudRevision:1}):p);},loadShared:async()=>remote};
 const first=await synchronizeAllPhotos(args),second=await synchronizeAllPhotos(args);
 assert.equal(first.pending,0);assert.equal(second.pending,0);assert.equal(sends,2);assert.equal(reads,4);
});

test('si se recupera la lectura local final cuenta pendientes y mantiene visible el fallo inicial',async()=>{
 let reads=0;
 const result=await synchronizeAllPhotos({localEntries:async()=>{if(++reads===1)throw Error('almacén ocupado');return [photo(refA)];},syncEntity:async()=>assert.fail('No se debe inventar una entidad.'),loadShared:async()=>remote});
 assert.equal(result.pending,1);assert.match(result.errors[0],/almacén ocupado/);
});

test('fallo al consultar fotos compartidas se propaga en lugar de declarar éxito',async()=>{
 let readShared=false;
 const problem=Error('Sesión vencida');
 await assert.rejects(synchronizeAllPhotos({localEntries:async()=>[],syncEntity:async()=>{},loadShared:async()=>{readShared=true;throw problem;}}),error=>error===problem);
 assert.equal(readShared,true);
});
