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
test('una verificación requiere persona y fecha válida, no campos completos',()=>{
 assert.equal(verificationOf({verificado_por:'Técnica',fecha_verificacion:'2026-10-26'}).verified,true);
 for(const date of ['2026-02-30','pendiente',''])assert.equal(verificationOf({verificado_por:'Técnica',fecha_verificacion:date}).verified,false);
 assert.equal(verificationOf({verificado_por:'Por confirmar',fecha_verificacion:'2026-10-26'}).verified,false);
 assert.equal(completeness({marca:'Por confirmar',modelo:'Sin dato'}).done,0);
});
test('el destino distingue navegador, demostración y Obsidian',()=>{
 assert.match(storageDescription({writable:false,demo:true}),/Solo este navegador/);
 assert.match(storageDescription({writable:true,demo:true}),/bóveda de prueba/);
 assert.equal(storageDescription({writable:true,demo:false,vaultName:'Prueba'}),'Obsidian · Prueba');
});
