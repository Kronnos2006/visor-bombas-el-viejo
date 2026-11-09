import test from 'node:test';
import assert from 'node:assert/strict';
import middleware from './middleware.js';

const limpiar=()=>{for(const k of ['VISOR_PASSWORD','VOCATUS_CLOUD_ACCOUNTS'])delete process.env[k];};

test('sin contraseña ni cuentas, el sitio queda bloqueado', async()=>{
 limpiar();
 const r=await middleware(new Request('https://visor.test/'));
 assert.equal(r.status,503);
});

test('con contraseña, pide autenticación', async()=>{
 limpiar();process.env.VISOR_PASSWORD='prueba-123';
 const r=await middleware(new Request('https://visor.test/'));
 assert.equal(r.status,401);
 const ok=await middleware(new Request('https://visor.test/',{headers:{authorization:'Basic '+btoa('x:prueba-123')}}));
 assert.equal(ok,undefined);
 limpiar();
});
