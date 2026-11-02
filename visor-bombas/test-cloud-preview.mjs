import test from 'node:test';
import assert from 'node:assert/strict';
import {assertAccountPreviewScope} from './cloud-preview-config.js';
test('el acceso nuevo solo se activa en Preview de la rama autorizada',()=>{
 assert.equal(assertAccountPreviewScope({VOCATUS_CLOUD_ACCOUNTS:'1',VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'codex/cuentas-vercel'}),true);
});
test('producción, main, otras ramas y metadatos ausentes fallan cerrados',()=>{
 for(const env of [
  {VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'codex/cuentas-vercel'},
  {VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'main'},
  {VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'otra-rama'},
  {VERCEL_ENV:'preview'},
  {VERCEL_GIT_COMMIT_REF:'codex/cuentas-vercel'},
 ])assert.throws(()=>assertAccountPreviewScope({...env,VOCATUS_CLOUD_ACCOUNTS:'1'}));
});
test('sin la activación explícita se conserva el modo anterior',()=>{
 assert.equal(assertAccountPreviewScope({VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'main'}),false);
 assert.equal(assertAccountPreviewScope({VOCATUS_CLOUD_ACCOUNTS:'0'}),false);
});
