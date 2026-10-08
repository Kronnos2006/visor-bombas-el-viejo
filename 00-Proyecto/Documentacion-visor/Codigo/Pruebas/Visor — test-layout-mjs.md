# Visor/test-layout.mjs

Prueba de separación geométrica y plataforma.

**Categoría:** Pruebas. **Captura:** 2026-10-07.

Original: [abrir archivo](<<RUTA-LOCAL>/vocatus/auto cad/visor-bombas/test-layout.mjs>).

SHA-256: `a92716108a4fd0b83d2b614cb40a3d0a5845087e183499c9165e684729b94cb9`

Esta es una copia documental. Editar el original para cambiar el programa.

````javascript
import assert from 'node:assert/strict';
import {plantLayout} from './public/plant-layout.js';
for(const demo of [true,false]){
 const pumps=demo?[{tag:'P-9001',area:'Agua'},{tag:'P-9002',area:'Alcohol'}]:Array.from({length:15},(_,i)=>({tag:`P-${i}`,area:i<9?'Fermentación':'Destilación'}));
 const layout=plantLayout(pumps,demo);
 for(const pump of layout.pumps){
  for(const tank of layout.tanks){
   // Distancia entre círculo de tanque y rectángulo de pedestal, en vista superior.
   const dx=Math.max(Math.abs(tank.x-pump.x)-2.15/2,0),dz=Math.max(Math.abs(tank.z-pump.z)-1.25/2,0);
   assert.ok(Math.hypot(dx,dz)>tank.radius+.5,`${pump.tag}: pedestal demasiado cerca del tanque`);
  }
  assert.ok(Math.abs(pump.x)+1.075<15 && Math.abs(pump.z)+.625<12,'Pedestal fuera de la plataforma');
  for(const other of layout.pumps.filter(p=>p!==pump))assert.ok(Math.abs(pump.x-other.x)>2.15 || Math.abs(pump.z-other.z)>1.25,'Pedestales superpuestos');
 }
 if(demo)assert.equal(layout.tanks.length,2);
}
console.log('OK: bombas fuera de tanques, pedestales separados y dentro de la plataforma, en ambos modos.');

````
