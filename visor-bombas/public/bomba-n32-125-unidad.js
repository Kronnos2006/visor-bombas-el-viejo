import { assembledPosition } from './bomba-n32-125-montaje.js';
import { buildPumpModel, sectorShellGeometry } from './pump-model.js';

// La geometría CAD se agrupa con los índices de ficha que usa el visor.
const partGroups = {
  1: 0, 2: 2, 3: 3, 4: 7, 5: 6, 6: 5, 7: 4, 8: 7, 9: 3,
  10: 5, 11: 5, 12: 7, 13: 7, 14: 7, 15: 7, 16: 7, 17: 7, 18: 7,
  19: 0, 20: 0, 21: 0, 22: 7, 23: 7, 24: 6, 25: 6, 26: 2,
};
const bases = [-3.6, -3.21, -3.5, -2.85, -2.8, -2.58, -1.85, -1.15, .52, 2.2];
const covers = new Set([1, 3, 4, 8]);

export function buildN32Unit(T, cad) {
  const { root, components } = buildPumpModel(T);
  const retained = new Set([1, 8, 9]);
  const moving = [];
  const spinning = new Map();
  const frame = new T.Group();
  const supportMaterial = new T.MeshStandardMaterial({ color: 0x606b73, metalness: .45, roughness: .58 });
  const guardMaterial = new T.MeshStandardMaterial({ color: 0xdbac27, metalness: .2, roughness: .55 });

  function dispose(object) {
    object.traverse(child => {
      child.geometry?.dispose();
      for (const material of Array.isArray(child.material) ? child.material : [child.material]) material?.dispose();
    });
    object.removeFromParent();
  }
  for (const child of [...root.children]) if (!components.includes(child)) dispose(child);
  for (const [index, group] of components.entries()) {
    if (!retained.has(index)) for (const child of [...group.children]) dispose(child);
    group.position.x = group.userData.base = bases[index];
  }
  components[1].scale.set(1, .85, .85);
  components[8].scale.x = 1.08;
  components[9].scale.set(.91, 1.02, 1.02);
  for (const child of components[8].children) spinning.set(child, child);
  components[9].traverse(object => {
    if (object.isMesh && object.material) {
      for (const material of [object.material].flat()) {
        if (material.color?.getHex() === 0x375d64) material.color.setHex(0x255796);
      }
    }
  });
  for (const child of components[9].children) {
    if (/Rotor del motor|Eje del motor|Cubo del ventilador|Aspa del ventilador/.test(child.name)) spinning.set(child, child);
  }
  const terminal = components[9].getObjectByName('Caja de conexiones');
  terminal.position.set(-.43,.86,0);
  terminal.scale.set(1.6,1.06,1.32);
  for (const x of [-.61,-.25]) {
    const port = new T.Mesh(new T.CylinderGeometry(.105,.105,.035,24),
      new T.MeshStandardMaterial({color:0x152331,metalness:.5,roughness:.6}));
    port.position.set(x,.86,.30);
    port.rotation.x = Math.PI / 2;
    port.name = terminal.name;
    port.userData = {part:9,subcomponent:terminal.name,removableQuarter:true};
    components[9].add(port);
  }

  for (const source of cad.children) {
    const { partNumber, partInstance, partLabel } = source.userData;
    let index = partGroups[partNumber];
    if (partNumber === 9 && partInstance === 1) index = 0;
    if (partNumber >= 19 && partNumber <= 21 && partInstance > 8) index = 5;
    const carrier = new T.Group();
    const rotor = new T.Group();
    const geometry = source.clone();
    geometry.position.set(0, 0, 0);
    geometry.scale.multiplyScalar(10);
    geometry.traverse(object => {
      if (!object.isMesh) return;
      object.geometry = object.geometry.clone();
      object.material = object.material.clone();
      object.userData = { part: index, subcomponent: partLabel, anatomyCover: covers.has(partNumber) };
    });
    rotor.add(geometry);
    carrier.add(rotor);
    components[index].add(carrier);
    const assembled = new T.Vector3(...assembledPosition(partNumber, partInstance, source.position.toArray())).multiplyScalar(10);
    const exploded = source.position.clone().multiplyScalar(10);
    assembled.x -= 1.95 + bases[index];
    exploded.x -= 1.95 + bases[index];
    carrier.position.copy(assembled);
    moving.push({ carrier, assembled, exploded });
    if (index === 2 || index === 6) spinning.set(carrier, rotor);
  }

  function box(group, size, position, material, name) {
    const mesh = new T.Mesh(new T.BoxGeometry(...size), material.clone());
    mesh.position.set(...position);
    mesh.name = name;
    group.add(mesh);
    return mesh;
  }
  // Lámina 1: eje a 227 mm del piso, bancada de 850 × 330 mm y guarda de acople.
  for (const z of [-1.48, 1.48]) {
    box(frame, [8.5, .34, .34], [0, -2.10, z], supportMaterial, 'Larguero');
    for (const x of [-2.25, 2.25]) box(frame, [.5, .09, .5], [x, -2.225, z * 1.16], supportMaterial, 'Oreja de anclaje');
  }
  for (const x of [-4.08, -.58, 4.08]) box(frame, [.34, .34, 3], [x, -2.10, 0], supportMaterial, 'Travesaño');
  for (const [x, y, width, depth] of [[-3.1,-1.52,1.75,1.95],[-.57,-1.52,.54,1.45],[2.2,-1.39,1.48,1.34]]) {
    for (const z of [-depth * .36, depth * .36]) {
      box(frame, [width, 2 * (y + 1.93), depth * .24], [x,y,z], supportMaterial, 'Pedestal de montaje');
    }
  }
  root.add(frame);

  const coupling = components[8];
  const guard = new T.Mesh(sectorShellGeometry(T,{inner:.59,outer:.63,length:1.17,start:-Math.PI/2,end:Math.PI/2}),[guardMaterial.clone(),guardMaterial.clone()]);
  guard.name = 'Guarda del acople';
  guard.userData = {part:8, subcomponent:guard.name, anatomyCover:true};
  coupling.add(guard);
  for (const z of [-.61,.61]) {
    const skirt=box(coupling,[1.17,1.88,.045],[0,-.94,z],guardMaterial,guard.name);
    skirt.userData={...guard.userData};
  }
  supportMaterial.dispose();
  guardMaterial.dispose();

  for (const group of components) {
    const names = new Set();
    group.traverse(object => {
      if (!object.isMesh) return;
      object.userData.subcomponent ||= object.name;
      names.add(object.userData.subcomponent);
    });
    group.userData.subcomponents = [...names];
  }
  let amount = 0;
  function moveExplosion(target, immediate, isolated) {
    amount = immediate ? target : T.MathUtils.lerp(amount, target, .12);
    for (const {carrier,assembled,exploded} of moving) carrier.position.lerpVectors(assembled, exploded, amount);
    components[1].position.x = bases[1] - amount * .8;
    components[8].position.x = bases[8] + amount * 4.35;
    components[9].position.x = bases[9] + amount * 4.45;
    frame.visible = !isolated && amount < .06;
  }
  return {
    root, components, moveExplosion,
    get explosion() { return amount; },
    visual: { spinner: child => spinning.get(child), flowOffset: [.03,0,0], flowScale: [.65,.83,.83] },
  };
}
