// Solo análisis local con el parser de PostgreSQL 17: no abre conexiones de base.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const {parse}=createRequire(import.meta.url)('libpg-query');
const migration=new URL('../supabase/migrations/20261102193600_vocatus_cloud_accounts.sql',import.meta.url);
const rollback=new URL('../supabase/review/cuentas-preview-rollback.sql',import.meta.url);

test('la migración y la reversión tienen sintaxis PostgreSQL 17 válida sin ejecutar SQL',async()=>{
 for(const file of [migration,rollback]){
  const ast=await parse(await readFile(file,'utf8'));
  assert.ok(ast.version>=170000&&ast.version<180000,'usar el parser de la versión de la base');
  assert.ok(ast.stmts.length>0);
  assert.equal(ast.stmts[0].stmt.TransactionStmt.kind,'TRANS_STMT_BEGIN');
  assert.equal(ast.stmts.at(-1).stmt.TransactionStmt.kind,'TRANS_STMT_COMMIT');
 }
});
test('también se analiza el contenido de cada función LANGUAGE SQL',async()=>{
 const ast=await parse(await readFile(migration,'utf8'));
 let parsed=0;
 for(const raw of ast.stmts){
  const fn=raw.stmt.CreateFunctionStmt;if(!fn)continue;
  const options=fn.options.map(x=>x.DefElem);
  if(options.find(x=>x.defname==='language')?.arg.String.sval!=='sql')continue;
  const body=options.find(x=>x.defname==='as').arg.List.items[0].String.sval;
  const inner=await parse(body);assert.ok(inner.stmts.length>0);parsed++;
 }
 assert.ok(parsed>0);
});
test('el parser rechaza delimitadores rotos antes de enviar una migración a la base',async()=>{
 await assert.rejects(parse("create function ejemplo() returns void language plpgsql as $ begin null; end; $;"));
});
