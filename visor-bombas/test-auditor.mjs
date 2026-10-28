import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {optionsOf,checkInventory,testFilesOf,checkHtmlAssets} from '../00-Proyecto/scripts/auditar-visor.mjs';
test('política de auditoría acepta 0 a 25 % y rechaza ampliar o invalidar el máximo',()=>{
 assert.equal(optionsOf([]).maxAiPercent,25);assert.equal(optionsOf(['--max-ia','0']).maxAiPercent,0);
 for(const n of ['26','100','-1','NaN','Infinity'])assert.throws(()=>optionsOf(['--max-ia',n]));assert.throws(()=>optionsOf(['--desactivar-limite']));
});
test('auditoría identifica claves duplicadas y límites inválidos sin exigir cantidades fijas',()=>{
 const group={nombre:'Bomba',sector:'REF',bombas:[{min:[0,0,0],max:[1,1,1]}]};
 assert.equal(checkInventory([{tag:'B1'}],[group],[]).selections,2);
 assert.match(checkInventory([{tag:'B1'},{tag:'B1'}],[group],[]).errors.join(),/duplicadas/);
 assert.match(checkInventory([],[{...group,bombas:[{min:[2,0,0],max:[1,1,1]}]}],[]).errors.join(),/Límites/);
});
test('ejecución de pruebas usa argumentos directos y no acepta comandos de shell',()=>{
 assert.deepEqual(testFilesOf('node --test visor-bombas/test.mjs'),['visor-bombas/test.mjs']);
 for(const command of ['npm test','node --test visor-bombas/test.mjs && echo x','node --test ../otro.mjs'])assert.throws(()=>testFilesOf(command));
});
test('recursos HTML ausentes o fuera de la raíz se notifican',async t=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'vocatus-audit-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await writeFile(path.join(root,'index.html'),'<script src="/no-existe.js"></script><a href="../privado">x</a><a href="https://example.com">externo</a>');
 const result=await checkHtmlAssets(root);assert.equal(result.missing.length,2);assert.match(result.missing.join(),/no-existe|fuera/);
});
