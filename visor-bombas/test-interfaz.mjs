import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSearch,searchPump,completeness,verificationOf,storageDescription} from './public/interfaz-core.js';
import {documentationProgress,filterProgress} from './public/avance-core.js';
test('buscar encuentra TAG con separadores, marcas, series y tamaños',()=>{
 const p={tag:'B14',marca:'HIDROMAC',modelo:'2196',serie:'ÁB-123',size:'1 X 1.5-8'};
 for(const q of ['b-14','Hidro mac','2196','ab123','1x1.58'])assert.ok(searchPump(p,q),q);
 assert.equal(normalizeSearch('ÁREA — B-14'),'areab14');assert.equal(searchPump(p,'DURCO'),false);
});
test('documentación completa y verificación son independientes',()=>{
 const row={kind:'B',checks:{placa:true,sello:true,empaque:null,orings:true,fotos:true,bodega:true,verificado:false},verification:{author:'',date:''}};
 const p=documentationProgress(row);assert.equal(p.percent,100);assert.equal(p.verification.verified,false);assert.equal(p.total,5);
 assert.equal(filterProgress([row],{only:'done',verified:'no'}).length,1);
 assert.equal(filterProgress([row],{verified:'yes'}).length,0);
});
test('un registro antiguo requiere revisión y no verifica toda la ficha',()=>{
 assert.equal(verificationOf({verificado_por:'Técnica',fecha_verificacion:'2026-10-26'}).verified,false);
 for(const date of ['2026-02-30','pendiente',''])assert.equal(verificationOf({verificado_por:'Técnica',fecha_verificacion:date}).verified,false);
 assert.equal(verificationOf({verificado_por:'Por confirmar',fecha_verificacion:'2026-10-26'}).verified,false);
 assert.equal(completeness({marca:'Por confirmar',modelo:'Sin dato'}).done,0);
});
test('el destino distingue navegador, demostración y Obsidian',()=>{
 assert.match(storageDescription({writable:false,demo:true}),/Solo este navegador/);
 assert.match(storageDescription({writable:true,demo:true}),/bóveda de prueba/);
 assert.equal(storageDescription({writable:true,demo:false,vaultName:'Prueba'}),'Obsidian · Prueba');
});


test('primera planta recorta solo la torre y restaura materiales y visibilidad',async()=>{
 const T=await import('./public/vendor/three.module.js');
 const {createFirstFloorView}=await import('./public/primera-planta.js');
 const root=new T.Group();root.position.y=10;
 const material=new T.MeshStandardMaterial();
 const low=new T.Mesh(new T.BoxGeometry(1,2,1),material);low.userData.sector='DUSA';low.position.y=1;
 const high=new T.Mesh(new T.BoxGeometry(1,2,1),material);high.userData.sector='DUSA';high.position.y=8;
 const other=new T.Mesh(new T.BoxGeometry(1,2,1),material);other.userData.sector='Sector de tanques';other.position.y=8;
 const hidden=new T.Mesh(new T.BoxGeometry(1,2,1),[material]);hidden.userData.sector='DUSA';hidden.visible=false;
 root.add(low,high,other,hidden);const floor=createFirstFloorView(T);floor.apply(root,13,['DUSA']);
 assert.equal(low.visible,true);assert.equal(high.visible,false);assert.equal(hidden.visible,false);
 assert.equal(other.visible,true);assert.equal(other.material,material);assert.notEqual(low.material,material);
 assert.equal(low.material.clippingPlanes[0].distanceToPoint(new T.Vector3(0,14,0)),-1);
 assert.equal(floor.contains(12),true);assert.equal(floor.contains(14),false);
 floor.reset();assert.equal(high.visible,true);assert.equal(hidden.visible,false);assert.equal(low.material,material);assert.equal(hidden.material[0],material);assert.equal(floor.height,null);
});
