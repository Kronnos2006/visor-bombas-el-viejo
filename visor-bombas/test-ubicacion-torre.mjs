// Regresión de ubicación: las bombas de la torre deben quedar dentro de la estructura DUSA del
// modelo de Blender, apoyadas en su losa y sin superponerse entre sí. Lee el .glb real, así que
// si el modelo se reemplaza o se desplaza, esta prueba lo detecta.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from './public/vendor/three.module.js';
import {leerCajasGLB} from './tools/cajas-glb.mjs';
import {medirDesplazamiento,aplicarDesplazamiento,alturaPiso,ES_PISO} from './public/blender-local.js';
import {torreAIntegrado} from './public/planta-integrada.js';
import {torrePumps} from './public/equipos-torre.js';
import {exterior} from './public/sector-fotos.js';
import {compactar} from './public/compactar.js';
const json=r=>JSON.parse(readFileSync(new URL(r,import.meta.url),'utf8'));
const modelo=leerCajasGLB(new URL('./public/modelos/blender-local/planta-blender-local.glb',import.meta.url));
const info=json('./public/modelos/planta-integrada.json'),grupos=json('./public/modelos/bombas-individuales.json');

// 1. El modelo de Blender es una traslación rígida del integrado anterior.
const medida=medirDesplazamiento(modelo.sectores,info);
assert.ok(medida.comunes>=10,'Pocos sectores en común entre el modelo de Blender y planta-integrada.json');
assert.ok(medida.residuo<.05,`Los sectores no se desplazaron juntos (residuo ${medida.residuo.toFixed(3)} m): revisar ubicaciones`);
// Un sector movido por separado debe detectarse.
const alterado=structuredClone(modelo.sectores);alterado.DUSA.min[0]+=3;alterado.DUSA.max[0]+=3;
assert.ok(medirDesplazamiento(alterado,info).residuo>2.5,'No se detecta un sector desplazado por separado');
aplicarDesplazamiento(info,grupos,modelo.sectores,medida.d);

// 2. Cada bomba de la torre queda en la DUSA, apoyada en la losa y sin chocar con otra.
const dusa=modelo.sectores.DUSA,pisos=modelo.nodos.filter(n=>ES_PISO.test(n.nombre));
const cajas=[];
for(const p of torrePumps){
 const b=compactar(T,exterior(T,p.scale,p.variant)),[x,y,z]=torreAIntegrado(info.torre,p.x,p.y??.3,p.z);
 b.position.set(x,y,z);b.rotation.y=p.rotation+info.torre.giro;b.updateMatrixWorld(true);
 let caja=new T.Box3().setFromObject(b);const c=caja.getCenter(new T.Vector3());
 const piso=alturaPiso(pisos,c.x,c.z,caja.min.y+.5);
 assert.notEqual(piso,null,p.tag+' no tiene losa debajo');
 b.position.y+=piso-caja.min.y;b.updateMatrixWorld(true);caja=new T.Box3().setFromObject(b);
 assert.ok(caja.min.x>=dusa.min[0]&&caja.max.x<=dusa.max[0]&&caja.min.z>=dusa.min[2]&&caja.max.z<=dusa.max[2],p.tag+' fuera de la estructura DUSA');
 assert.ok(Math.abs(caja.min.y-piso)<.01,p.tag+' no apoya en la losa');
 assert.ok(caja.min.y<1,p.tag+` quedó elevada (${caja.min.y.toFixed(2)} m)`);
 cajas.push([p.tag,caja]);
}
for(let i=0;i<cajas.length;i++)for(let j=i+1;j<cajas.length;j++)
 assert.ok(!cajas[i][1].clone().expandByScalar(-.02).intersectsBox(cajas[j][1]),`${cajas[i][0]} y ${cajas[j][0]} se superponen`);

// 3. Pendiente de campo: bombas de la torre que coinciden con bombas dibujadas en el modelo.
const dibujadas=modelo.nodos.filter(n=>n.sector==='DUSA'&&/bomba/i.test(n.nombre)&&n.max[1]-n.min[1]<5);
const cruces=cajas.map(([tag,c])=>[tag,dibujadas.filter(n=>c.clone().expandByScalar(-.05).intersectsBox(new T.Box3(new T.Vector3(...n.min),new T.Vector3(...n.max)))).length]).filter(([,n])=>n);
console.log(`OK: ${cajas.length} bombas de la torre dentro de DUSA, sobre la losa y sin superponerse (desplazamiento ${medida.d.map(v=>v.toFixed(2)).join(', ')} m).`);
if(cruces.length)console.log(`Pendiente de campo: ${cruces.map(([t])=>t).join(', ')} coinciden con bombas dibujadas en el modelo de Blender; falta confirmar qué TAG corresponde a cada una.`);
