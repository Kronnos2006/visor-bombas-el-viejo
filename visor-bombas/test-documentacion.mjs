// Documentación por fabricante: cada bomba recibe solo documentos de su marca y modelo.
import assert from 'node:assert/strict';
import {photoPumps} from './public/equipos-sector.js';
import * as torre from './public/equipos-torre.js';
import {linksBomba,linkPieza} from './public/expediente.js';
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
assert.equal(linksBomba(p('B41')).alcance,'familia');
assert.ok(urls(p('B41')).some(u=>/xylem/i.test(u)));
assert.ok(!urls(p('B41')).some(u=>/hidromac|bomeq/i.test(u)));
assert.equal(linksBomba({tag:'X',marca:'HIDROMAC',modelo:'3196'}),null,'Hidromac de otro modelo queda pendiente');
assert.equal(linksBomba({tag:'X',marca:'Por confirmar',modelo:''}),null);
assert.equal(linksBomba({tag:'B41',marca:'GOULDS',modelo:'2X2 1/2-6-2P'}).alcance,'familia','B41 de la bóveda conserva su relación del expediente');
assert.equal(linksBomba({tag:'B17',marca:'GOULDS',modelo:'2X2'}),null,'Sin modelo SH ni expediente Goulds queda pendiente');
assert.equal(linksBomba({tag:'B44',marca:'HIDROMAC AZ',modelo:'3X4X12A SMCDV'}),null,'Hidromac que no es 2196 no recibe el manual 2196');
for(const b of todas){const m=b.motor?.marca||'';if(/BALDOR/i.test(m))assert.ok(!linkPieza(b,9).some(l=>/weg\.net|nidec/i.test(l.u)),b.tag+' motor BALDOR recibe catálogo de otra marca');}
console.log('OK: documentación asignada solo por relación explícita de marca y modelo.');
