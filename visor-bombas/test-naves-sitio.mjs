import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from './public/vendor/three.module.js';
import {navePequena,naveGrande,agregarNaves,ajustarSemejanza,PLANO_A15} from './public/naves-sitio.js';
import {sectorDe} from './public/planta-integrada.js';

const tam=g=>{g.updateMatrixWorld(true);return new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3());};

test('nave pequeña respeta las cotas de A16 y A17', ()=>{
 const s=tam(navePequena(THREE));
 assert.ok(Math.abs(s.x-17.5)<.01,'losa 17,5 m de largo');
 assert.ok(Math.abs(s.z-9.8)<.01,'losa 9,8 m de ancho');
 assert.ok(Math.abs(s.y-(6.012+.15+.06))<.12,'cumbrera +6,012 m sobre la losa');
});

test('bodega de ron con la huella de A15 y las alturas de las fotos', ()=>{
 const s=tam(naveGrande(THREE));
 assert.ok(Math.abs(s.x-27.87)<.4,'largo '+s.x);assert.ok(Math.abs(s.z-19.3)<.5,'ancho '+s.z);
 assert.ok(s.y>10.3&&s.y<10.7,'cumbrera ≈10,3 m: '+s.y);
});

test('el ajuste del plano coincide con los edificios FBX', ()=>{
 // Centros medidos en planta-blender-local.glb (x, z).
 const modelo={'FBX Bodega pequena':[-3.7,-10],'FBX Banos':[-14,-10],'FBX Cuarto electrico':[-26,-6.7],'FBX Bodega quimicos':[-40.1,-7.1],'FBX Administracion':[-4.9,13.2]};
 const k=Object.keys(modelo),a=ajustarSemejanza(k.map(x=>PLANO_A15[x]),k.map(x=>modelo[x]));
 assert.ok(a.error<.5,'error '+a.error);
 assert.ok(Math.abs(1/a.escala-12.3)<.5,'escala px/m');
});

test('agrega las naves en el sector Edificios', ()=>{
 const escena=new THREE.Group();escena.userData.blenderLocal=true;
 const modelo={'FBX Bodega pequena':[-3.7,-10],'FBX Banos':[-14,-10],'FBX Cuarto electrico':[-26,-6.7],'FBX Bodega quimicos':[-40.1,-7.1],'FBX Administracion':[-4.9,13.2]};
 for(const [k,[x,z]] of Object.entries(modelo)){const m=new THREE.Mesh(new THREE.BoxGeometry(4,3,4));m.position.set(x,1.5,z);m.userData.sector=k;escena.add(m);}
 const r=agregarNaves(THREE,escena);
 assert.equal(r.edificios,5);
 const naves=escena.children.filter(o=>o.userData.presentationOnly);
 assert.equal(naves.length,2);
 for(const n of naves)assert.equal(sectorDe(n.userData.sector),'edificios');
 assert.equal(agregarNaves(THREE,escena),r,'no duplica');
});

test('tanque con dique junto a la nave pequeña', async()=>{
 const {tanqueNave}=await import('./public/naves-sitio.js');
 const s=tam(tanqueNave(THREE));
 assert.ok(Math.abs(s.x-12.3)<.6&&Math.abs(s.z-12.3)<.6,'dique Ø12,3');
 assert.ok(s.y>12&&s.y<14,'altura '+s.y);
});
