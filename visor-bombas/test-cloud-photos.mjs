import test from 'node:test';
import assert from 'node:assert/strict';
import {syncPhoto,loadPhotoView,photoBaseRevision,loadSharedPhotoRows} from './public/cloud-photo-core.js';
function fixture(extra={}){
 let record={blob:new Blob(['synthetic'],{type:'image/jpeg'}),revision:'local-a',pending:true,cloudBase:0,...extra};
 const calls=[];const transport={userId:'user-a',upload:async path=>calls.push(['upload',path]),publish:async(entity,slot,expected,path)=>{calls.push([entity,slot,expected,path]);return {revision:expected+1,object_path:path};},readOne:async()=>null};
 const args={entity:'B30',slot:'sello',entry:{...record},transport,uuid:()=> 'unique',isCurrent:async rev=>record.revision===rev,updateLocal:async(rev,patch)=>{if(record.revision!==rev)return false;record={...record,...patch};return true;}};
 return {args,calls,get record(){return record;},replace(){record={...record,revision:'local-b'};}};
}
test('foto en línea confirma la revisión después de subir y publicar',async()=>{const f=fixture();const result=await syncPhoto(f.args);assert.equal(result.marked,true);assert.equal(f.record.pending,false);assert.equal(f.record.cloudRevision,1);assert.deepEqual(f.calls[1],['B30','sello',0,'vocatus/user-a/unique.jpg']);});
test('sin internet conserva foto y estado pendiente',async()=>{const f=fixture();f.args.transport.upload=async()=>{throw Error('sin conexión');};const r=await syncPhoto(f.args);assert.equal(r.pending,true);assert.equal(f.record.pending,true);assert.equal(f.record.blob.size,9);assert.equal(f.record.cloudError,'sin conexión');});
test('conflicto entre dispositivos conserva la selección local sin sobrescribir',async()=>{const f=fixture();f.args.transport.publish=async()=>{throw Object.assign(Error('PHOTO_CONFLICT'),{code:'40001'});};const r=await syncPhoto(f.args);assert.equal(r.conflict,true);assert.equal(f.record.cloudConflict,true);assert.equal(f.record.pending,true);});
test('respuesta perdida reconoce el mismo archivo confirmado sin republicar',async()=>{const f=fixture();f.args.transport.publish=async()=>{throw Error('timeout');};f.args.transport.readOne=async()=>({revision:3,object_path:'vocatus/user-a/unique.jpg'});const r=await syncPhoto(f.args);assert.equal(r.published.revision,3);assert.equal(f.record.pending,false);});
test('pestaña o selección más nueva impide publicar la foto anterior',async()=>{const f=fixture();f.args.transport.upload=async()=>f.replace();const r=await syncPhoto(f.args);assert.equal(r.superseded,true);assert.equal(f.record.revision,'local-b');assert.equal(f.record.pending,true);assert.equal(f.calls.length,0);});
test('confirmación atrasada nunca limpia otra revisión local',async()=>{const f=fixture();f.args.transport.publish=async(_e,_s,_v,path)=>{f.replace();return {revision:1,object_path:path};};const r=await syncPhoto(f.args);assert.equal(r.marked,false);assert.equal(f.record.pending,true);});
test('B30, B31 y referencia sin TAG conservan identidad y revisión independiente',async()=>{for(const entity of ['B30','B31','integrado:torre:Bomba sin TAG']){const f=fixture({cloudBase:8});f.args.entity=entity;await syncPhoto(f.args);assert.equal(f.calls[1][0],entity);assert.equal(f.calls[1][2],8);}});
test('cambiar cuenta no reutiliza una ruta de subida del usuario anterior',async()=>{const f=fixture({cloudUploadPath:'vocatus/another-user/old.jpg'});await syncPhoto(f.args);assert.equal(f.calls[0][1],'vocatus/user-a/unique.jpg');});
test('el servidor debe confirmar la misma identidad de archivo',async()=>{const f=fixture();f.args.transport.publish=async()=>({revision:1,object_path:'wrong'});await assert.rejects(syncPhoto(f.args),/foto correcta/);assert.equal(f.record.pending,true);});

test('teléfono sin IndexedDB sigue leyendo fotos privadas en línea',async()=>{const remote={placa1:{url:'blob:shared',cloud:true,revision:1}};const result=await loadPhotoView({enabled:true,loadLocal:async()=>{throw Error('almacenamiento no disponible');},loadShared:async()=>remote});assert.equal(result.placa1.url,'blob:shared');assert.match(result.warning,/almacenamiento/);assert.deepEqual(Object.keys(result),['placa1']);});
test('foto pendiente nunca se presenta como confirmada cuando falla internet',async()=>{const local={bomba:{url:'blob:local',cloudPending:true}};const result=await loadPhotoView({enabled:true,loadLocal:async()=>local,loadShared:async()=>{throw Error('sin red');}});assert.equal(result.bomba.url,'blob:local');assert.equal(result.bomba.cloud,undefined);assert.match(result.warning,/pendiente de confirmar/);assert.match(result.warning,/sin red/);});
test('foto confirmada nueva de otro dispositivo prevalece sobre respaldo local antiguo',async()=>{const result=await loadPhotoView({enabled:true,loadLocal:async()=>({bomba:{url:'blob:old',cloudRevision:1,cloudPending:false}}),loadShared:async()=>({bomba:{url:'blob:new',cloud:true,revision:2}})});assert.equal(result.bomba.url,'blob:new');assert.equal(result.bomba.revision,2);});
test('foto local pendiente se conserva para comparación con otra foto en línea',async()=>{const result=await loadPhotoView({enabled:true,loadLocal:async()=>({bomba:{url:'blob:mine',cloudPending:true}}),loadShared:async()=>({bomba:{url:'blob:theirs',cloud:true,revision:2}})});assert.equal(result.bomba.url,'blob:mine');assert.equal(result.bomba.online.url,'blob:theirs');});
test('reemplazar una foto tras invalidar caché conserva la revisión confirmada',()=>{assert.equal(photoBaseRevision(undefined,{cloudRevision:4}),4);assert.equal(photoBaseRevision(5,{cloudRevision:4}),5);assert.equal(photoBaseRevision(0,{cloudRevision:4}),0);assert.equal(photoBaseRevision(undefined,{}),0);});

test('PC conserva tres categorías en línea aunque falle la cuarta y permite reintentar',async()=>{
 const rows=['placa1','placa2','bomba','posicion'].map(slot=>({slot}));
 let failed=true;const calls=[];
 const loadShared=()=>loadSharedPhotoRows({rows,isCurrent:()=>true,download:async row=>{calls.push(row.slot);if(failed&&row.slot==='placa2')throw Error('fallo temporal');return {url:'blob:'+row.slot,cloud:true};}});
 const result=await loadPhotoView({enabled:true,loadLocal:async()=>({}),loadShared});
 assert.deepEqual(Object.keys(result),['placa1','bomba','posicion']);assert.match(result.warning,/Placa del motor: fallo temporal/);assert.deepEqual(calls,['placa1','placa2','bomba','posicion']);
 failed=false;const retried=await loadPhotoView({enabled:true,loadLocal:async()=>({}),loadShared});
 assert.equal(Object.keys(retried).length,4);assert.equal(retried.warning,undefined);
});
test('fallo remoto parcial conserva también el respaldo local de la categoría fallida',async()=>{
 const result=await loadPhotoView({enabled:true,loadLocal:async()=>({placa2:{url:'blob:backup',cloudRevision:1,cloudPending:false}}),loadShared:()=>loadSharedPhotoRows({rows:[{slot:'placa1'},{slot:'placa2'}],isCurrent:()=>true,download:async row=>{if(row.slot==='placa2')throw Error('sin red');return {url:'blob:shared'};}})});
 assert.equal(result.placa2.url,'blob:backup');assert.equal(result.placa1.url,'blob:shared');assert.match(result.warning,/sin red/);
});
test('sin sesión en PC se conserva la indicación de conectar cuenta sin inventar fotos',async()=>{
 const result=await loadPhotoView({enabled:true,loadLocal:async()=>({}),loadShared:async()=>Object.defineProperty({},'warning',{value:'Conectá tu cuenta autorizada en este navegador.'})});
 assert.deepEqual(Object.keys(result),[]);assert.match(result.warning,/Conectá tu cuenta/);
});
test('cambiar cuenta durante una descarga parcial descarta el conjunto completo',async()=>{
 let current=true;
 await assert.rejects(loadSharedPhotoRows({rows:[{slot:'placa1'},{slot:'placa2'}],isCurrent:()=>current,download:async row=>{if(row.slot==='placa2'){current=false;throw Error('sin permiso');}return {url:'blob:private'};}}),/cuenta cambió/);
});
test('respaldo completo rechaza descargas parciales y funciona al reintentar',async()=>{
 let failed=true;const args={strict:true,rows:[{slot:'placa1'},{slot:'placa2'}],isCurrent:()=>true,download:async row=>{if(failed&&row.slot==='placa2')throw Error('sin red');return {url:'blob:'+row.slot};}};
 await assert.rejects(loadSharedPhotoRows(args),/Reintentá antes de descargar el respaldo/);
 failed=false;assert.equal(Object.keys(await loadSharedPhotoRows(args)).length,2);
});
