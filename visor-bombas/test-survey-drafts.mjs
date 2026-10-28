import test from 'node:test';
import assert from 'node:assert/strict';
const modulePath=new URL('./public/survey-drafts.js',import.meta.url);
// Injected in-memory browser storage; no real browser, vault or application records.
function storage(){const values=new Map();return {values,getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
function indexed(){
 const values=new Map(),state={fail:false};let tail=Promise.resolve();
 return {values,state,open(){const request={};setImmediate(()=>{request.result={createObjectStore(){},close(){},transaction(){
  let pending=0,ended=false,staged;const before=tail;let finish;tail=new Promise(resolve=>finish=resolve);
  const started=before.then(()=>{staged=new Map(values);});
  const tx={error:null,abort(){if(ended)return;ended=true;tx.onabort?.();finish();},objectStore(){
   function run(operation){const result={};pending++;started.then(()=>setImmediate(()=>{
    if(ended)return;if(state.fail){tx.error=Error('disk full');tx.abort();return;}
    result.result=operation();result.onsuccess?.();pending--;
    if(!pending&&!ended){ended=true;values.clear();for(const [key,value]of staged)values.set(key,value);tx.oncomplete?.();finish();}
   }));return result;}
   return {get:key=>run(()=>staged.get(key)),put:(value,key)=>run(()=>{staged.set(key,structuredClone(value));return key;})};
  }};return tx;
 }};request.onupgradeneeded?.();request.onsuccess?.();});return request;}};
}
async function fresh(){return import(modulePath.href+'?test='+Math.random());}
test('local survey confirms exact write and isolates TAG records',async()=>{const m=await fresh(),s=storage(),data={tag:'B30',fields:{marca:'Prueba'},author:'Ensayo'};const record=m.writeSavedSurvey(data,s);assert.equal(m.readSavedSurvey('B30',s).data.fields.marca,'Prueba');assert.equal(m.readSavedSurvey('B31',s),null);assert.equal(record.pending,true);assert.throws(()=>m.writeSavedSurvey({...data,tag:'integrado:x'},s),/TAG/);s.setItem(m.savedSurveyKey('B31'),JSON.stringify(record));assert.throws(()=>m.readSavedSurvey('B31',s),/corresponde/);});
test('quota and unconfirmed local writes throw instead of reporting success',async()=>{const m=await fresh();assert.throws(()=>m.writeSavedSurvey({tag:'B30'}, {setItem(){throw Error('QuotaExceededError');}}),/QuotaExceeded/);assert.throws(()=>m.writeSavedSurvey({tag:'B30'},{setItem(){},getItem(){return null;}}),/confirmó/);});
test('photo migration confirms IDB and retains original legacy copy',async()=>{const idb=indexed();globalThis.indexedDB=idb;const m=await fresh(),s=storage(),photos=[{name:'antes.jpg',base64:'YWJj'}];s.setItem('vocatus-fotos-B30',JSON.stringify(photos));assert.deepEqual(await m.readSurveyPhotos('B30',s),photos);assert.deepEqual(idb.values.get('B30'),photos);assert.ok(s.getItem('vocatus-fotos-B30'));await m.writeSurveyPhotos('B31',[{name:'otra.jpg',base64:'ZGVm'}]);assert.deepEqual(await m.readSurveyPhotos('B30',s),photos);});
test('failed IDB migration preserves legacy; retry and newer IDB take precedence',async()=>{const idb=indexed();globalThis.indexedDB=idb;const m=await fresh(),s=storage(),old=[{name:'antigua.jpg',base64:'YWJj'}];s.setItem('vocatus-fotos-B30',JSON.stringify(old));idb.state.fail=true;await assert.rejects(m.readSurveyPhotos('B30',s),/disk full/);assert.ok(s.getItem('vocatus-fotos-B30'));idb.state.fail=false;await m.readSurveyPhotos('B30',s);const current=[{name:'vigente.jpg',base64:'ZGVm'}];await m.writeSurveyPhotos('B30',current);assert.deepEqual(await m.readSurveyPhotos('B30',s),current);});


test('concurrent tabs append transactionally and removal keeps another tab photo',async()=>{
 const idb=indexed();globalThis.indexedDB=idb;const first=await fresh(),second=await fresh(),a={name:'a.jpg',base64:'YQ=='},b={name:'b.jpg',base64:'Yg=='};
 await Promise.all([first.updateSurveyPhotos('B30',current=>[...current,a]),second.updateSurveyPhotos('B30',current=>[...current,b])]);
 assert.deepEqual((await first.readSurveyPhotos('B30',storage())).map(photo=>photo.name),['a.jpg','b.jpg']);
 await first.updateSurveyPhotos('B30',current=>current.filter(photo=>photo.name!==a.name));
 assert.deepEqual(await second.readSurveyPhotos('B30',storage()),[b]);
});
