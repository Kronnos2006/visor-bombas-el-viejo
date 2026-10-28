import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {referenceKey,selectionIdentity} from './public/selection-core.js';
import {plantPumps} from './public/sector-fotos.js';
import {torreSinTag} from './public/equipos-torre.js';
const groups=JSON.parse(await readFile(new URL('./public/modelos/bombas-individuales.json',import.meta.url),'utf8'));
const references=groups.flatMap(group=>group.bombas.map((bounds,index)=>({...bounds,sector:group.sector,nombre:group.bombas.length>1?`${group.nombre} · Bomba ${index+1}`:group.nombre})));
const standalone=torreSinTag.map((pump,index)=>({sector:'torre',nombre:'Torre · referencia sin TAG '+(index+1),standalone:true,min:[pump.x,.3,pump.z],max:[pump.x+1,1.3,pump.z+1]}));
const allReferences=[...references,...standalone];
const phoneSource=await readFile(new URL('./public/telefono-app.js',import.meta.url),'utf8');
const opener=phoneSource.slice(phoneSource.indexOf('function abrirFicha('),phoneSource.indexOf("\n ficha.querySelector('.tel-volver')",phoneSource.indexOf('function abrirFicha(')));
const appSource=await readFile(new URL('./public/app.js',import.meta.url),'utf8');
const pendingSelector=appSource.slice(appSource.indexOf('function selectPendingPump('),appSource.indexOf('\nfunction renderPendingPanel('));
function phone(){
 const scheduled=[],tabs=[],selections=[],calls={};
 const api={pump:null,listo:true,select(tag){this.pump={tag};selections.push(tag);},selectReference(reference){this.pump={tag:'Sin TAG',pending:reference};selections.push(reference);},tab(tab){tabs.push({key:selectionIdentity(this.pump),tab});},explode(){}};
 const context=vm.createContext({selectionIdentity,fichaRequest:0,viendoFicha:false,seccion:'historial',ficha:{dataset:{},querySelector(){return {};},hidden:true},mostrarMapaAmplio(){},document:{body:{classList:{add(){},remove(){}}}},fab:{},movil:{matches:true},paneles:{historial:{}},SECCIONES:[{id:'historial',nombre:'Historial'}],V:()=>api,$:()=>null,pintarRegreso(){},pintarPiezas(){},Date,setTimeout(fn){scheduled.push(fn);},contenido:{},window:{dispatchEvent(){}},Event:class{}});
 const open=vm.runInContext('('+opener+')',context);
 const flush=()=>{for(let count=0;scheduled.length&&count<500;count++)scheduled.shift()();assert.equal(scheduled.length,0,'esperas no terminadas');};
 return {context,api,tabs,selections,open,flush};
}
test('identidades cubren todas las referencias integradas, TAG y representación torre sin colisiones',()=>{
 assert.equal(references.length,34);assert.equal(plantPumps.length,28);assert.equal(standalone.length,1);
 const identities=[...plantPumps.map(p=>selectionIdentity(p)),...allReferences.map(p=>selectionIdentity({tag:'Sin TAG',pending:p}))];
 assert.ok(identities.every(Boolean));assert.equal(new Set(identities).size,63);
 for(const reference of allReferences)assert.equal(selectionIdentity({tag:'Sin TAG',pending:reference}),'reference:'+referenceKey(reference));
 assert.equal(selectionIdentity({tag:'Sin TAG'}),'');assert.equal(selectionIdentity({tag:'B0'}),'');
});
test('apertura real distingue las 35 referencias y 28 TAG y no selecciona referencias mediante API TAG',()=>{
 const fixture=phone();
 for(const reference of allReferences){fixture.open('','ficha',reference);fixture.flush();assert.equal(fixture.context.ficha.dataset.selection,selectionIdentity({pending:reference}));assert.equal(fixture.context.ficha.dataset.tag,'');assert.equal(fixture.context.ficha.hidden,false);assert.equal(fixture.context.fab.hidden,true);assert.equal(fixture.tabs.at(-1).key,selectionIdentity({pending:reference}));assert.equal(fixture.tabs.at(-1).tab,'ficha');}
 for(const pump of plantPumps){fixture.open(pump.tag,'historial');fixture.flush();assert.equal(fixture.context.ficha.dataset.tag,pump.tag);assert.equal(fixture.tabs.at(-1).tab,'historial');}
 assert.equal(fixture.selections.filter(selection=>typeof selection==='string').length,28);
});
test('guardas reales cancelan apertura antigua entre referencias Sin TAG y al salir de sección',()=>{
 const fixture=phone();fixture.open('','ficha',references[0]);fixture.open('','ficha',references[1]);fixture.flush();assert.equal(fixture.tabs.length,1);assert.equal(fixture.tabs[0].key,selectionIdentity({pending:references[1]}));
 fixture.open('','ficha',references[2]);vm.runInContext('++fichaRequest;viendoFicha=false;',fixture.context);fixture.flush();assert.equal(fixture.tabs.length,1,'no reabrir ficha después de salir');
});
test('selección real anuncia cada referencia y transforma centro integrado una sola vez; torre ya está en mundo',()=>{
 const events=[],centers=[];let transformed=0;
 class Vector3{constructor(x,y,z){Object.assign(this,{x,y,z});}add(other){this.x+=other.x;this.y+=other.y;this.z+=other.z;return this;}multiplyScalar(k){this.x*=k;this.y*=k;this.z*=k;return this;}}
 const context=vm.createContext({state:{loading:0},rememberDetailOrigin(){},history:{replaceState(){}},location:{pathname:'/',search:'?s=historial'},document:{dispatchEvent(event){events.push(event);}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},$:()=>({}),SECTORES_INT:[],sectorDe:()=>null,THREE:{Vector3},integrado:{g:{updateMatrixWorld(){},localToWorld(center){transformed++;center.x+=100;}}},transitionToPump(_ticket,center){centers.push(center);},renderList(){},renderPanel(){}});
 const select=vm.runInContext('('+pendingSelector+')',context);
 for(const reference of allReferences){select(reference);const event=events.at(-1);assert.equal(event.type,'vocatus:referencia');assert.equal(event.detail,reference);assert.equal(context.state.pump.pending,reference);const center=centers.at(-1);assert.equal(center.x,(reference.min[0]+reference.max[0])/2+(reference.standalone?0:100));}
 assert.equal(transformed,references.length);assert.equal(events.length,allReferences.length);
});

test('evento real del 3D abre automáticamente cada ficha sin TAG en Historial',()=>{
 const start=phoneSource.indexOf(" document.addEventListener('vocatus:referencia',");
 const end=phoneSource.indexOf(" document.addEventListener('vocatus:referencias'",start);
 assert.ok(start>=0&&end>start,'falta conectar el evento de selección sin TAG');
 const fixture=phone(),handlers=new Map();fixture.context.document.addEventListener=(type,fn)=>handlers.set(type,fn);fixture.context.abrirFicha=fixture.open;
 vm.runInContext(phoneSource.slice(start,end),fixture.context);
 assert.equal(typeof handlers.get('vocatus:referencia'),'function');
 for(const reference of allReferences){fixture.api.pump={tag:'Sin TAG',pending:reference};handlers.get('vocatus:referencia')({detail:reference});fixture.flush();assert.equal(fixture.context.ficha.hidden,false);assert.equal(fixture.context.ficha.dataset.selection,selectionIdentity({pending:reference}));}
 fixture.context.seccion='bodega';fixture.context.viendoFicha=false;fixture.context.ficha.hidden=true;handlers.get('vocatus:referencia')({detail:references[0]});assert.equal(fixture.context.ficha.hidden,true,'no cambiar a ficha cuando se trabaja en Bodega');
});
