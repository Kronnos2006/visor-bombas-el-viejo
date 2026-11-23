// Documentación por fabricante: cada bomba recibe solo documentos de su marca y modelo.
import assert from 'node:assert/strict';
import {photoPumps} from './public/equipos-sector.js';
import * as torre from './public/equipos-torre.js';
import {linksBomba,linkPieza,documentosBomba} from './public/expediente.js';
import inventory from './public/modelos/asignacion-bombas.json' with {type:'json'};
import {identificarBomba} from './public/identidad-bomba.js';
import {existsSync} from 'node:fs';
const todas=[...photoPumps];for(const v of Object.values(torre))if(Array.isArray(v)&&v[0]?.tag)todas.push(...v);
const p=tag=>todas.find(x=>x.tag===tag);
const urls=(bomba)=>{const L=linksBomba(bomba);return [L?.manual.u,L?.planos.u,...(L?.extra||[]).map(x=>x.u),...Array.from({length:10},(_,i)=>linkPieza(bomba,i).map(l=>l.u)).flat()].filter(Boolean);};
for(const tag of ['B17','B18','B19','B20','B21']){
 assert.equal(p(tag).marca,'DURCO');
 assert.equal(linksBomba(p(tag)),null,tag+' (DURCO) no debe recibir manuales de otra marca');
 assert.ok(!urls(p(tag)).some(u=>/xylem|goulds|pumpcatalog|hidromac|bomeq/i.test(u)),tag+' recibe documentos de otro fabricante');
}
assert.equal(linksBomba(p('B30')).alcance,'modelo');
assert.ok(linksBomba(p('B30')).manual.t.includes('Hidromac 2196'));
assert.equal(linksBomba(identificarBomba(p('B41'),inventory.excel.B41)).alcance,'familia');
assert.ok(urls(identificarBomba(p('B41'),inventory.excel.B41)).some(u=>/xylem/i.test(u)));
assert.ok(!urls(p('B41')).some(u=>/hidromac|bomeq/i.test(u)));
assert.equal(linksBomba({tag:'X',marca:'HIDROMAC',modelo:'3196'}),null,'Hidromac de otro modelo queda pendiente');
assert.equal(linksBomba({tag:'X',marca:'Por confirmar',modelo:''}),null);
assert.equal(linksBomba({tag:'B41',marca:'GOULDS',modelo:'2X2 1/2-6-2P'}).alcance,'familia','B41 de la bóveda conserva su relación del expediente');
assert.equal(linksBomba({tag:'B17',marca:'GOULDS',modelo:'2X2'}),null,'Sin modelo SH ni expediente Goulds queda pendiente');
assert.equal(linksBomba({tag:'B44',marca:'HIDROMAC AZ',modelo:'3X4X12A SMCDV'}),null,'Hidromac que no es 2196 no recibe el manual 2196');
for(const b of todas){const m=b.motor?.marca||'';if(/BALDOR/i.test(m))assert.ok(!linkPieza(b,9).some(l=>/weg\.net|nidec/i.test(l.u)),b.tag+' motor BALDOR recibe catálogo de otra marca');}
console.log('OK: documentación asignada solo por relación explícita de marca y modelo.');

const audit = Array.from({length:90}, (_, i) => {
 const tag='B'+(i+1);
 assert.ok(Object.hasOwn(inventory.excel,tag),tag);
 const bomba=identificarBomba({tag},inventory.excel[tag]);
 const docs=documentosBomba(bomba);
 for(const {u} of docs) {
  if(u.startsWith('/'))assert.ok(existsSync(new URL('./public'+u,import.meta.url)),tag+' '+u);
  else assert.equal(new URL(u).protocol,'https:');
 }
 if(!bomba.marca||!bomba.modelo||bomba.identificacion.bloqueo)assert.deepEqual(docs,[],tag);
 return [tag,{bomba,docs}];
});
const byTag=Object.fromEntries(audit);
for(const tag of ['B17','B18','B20','B21','B81','B83']) {
 assert.equal(byTag[tag].bomba.marca,'TITAN');
 assert.ok(byTag[tag].docs.length>=2);
 assert.ok(byTag[tag].docs.every(d=>/titan/i.test(d.u)));
}
assert.ok(byTag.B19.docs.some(d=>/Durco/.test(d.t)));
assert.ok(byTag.B48.docs.some(d=>/RA65-300/.test(d.u)));
assert.ok(byTag.B56.docs.every(d=>/xylem/.test(d.u)));
assert.ok(byTag.B56.docs.length>=2);
assert.equal(byTag.B73.bomba.marca,'KSB');
for(const tag of ['B51','B52','B57','B58','B59','B60','B61','B62','B74','B75','B76','B77','B78','B79','B80']){
 assert.deepEqual(byTag[tag].docs,[],tag);
}
