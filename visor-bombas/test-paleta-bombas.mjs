import test from 'node:test';import assert from 'node:assert/strict';
const {filtrarFilas}=await import('./public/paleta-bombas.js');
test('paleta: busca sin importar tildes ni mayúsculas',()=>{
 const f=[{texto:'B2 Destilación'},{texto:'Bomba 9 Fermentación'}];
 assert.equal(filtrarFilas(f,'fermentacion').length,1);assert.equal(filtrarFilas(f,'B2').length,1);assert.equal(filtrarFilas(f,'').length,2);
});
