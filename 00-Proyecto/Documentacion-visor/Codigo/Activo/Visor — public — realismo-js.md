# Visor/public/realismo.js

Capa de iluminación, entorno, materiales PBR y sombras de Claude.

**Categoría:** Activo. **Captura:** 2026-10-07.

Original: [abrir archivo](<<RUTA-LOCAL>/vocatus/auto cad/visor-bombas/public/realismo.js>).

SHA-256: `01b679cb0eb475f90fe6d0a1e2ec186f697cd47a13569bbe958abc860b8253bd`

Esta es una copia documental. Editar el original para cambiar el programa.

````javascript
// realismo.js — capa de render realista para el visor de bombas.
// No cambia la lógica ni la geometría del visor: mejora iluminación,
// materiales y sombras sobre lo que ya existe.
//
// Uso, dentro de initScene(), DESPUÉS de buildPump():
//     import {aplicarRealismo} from './realismo.js';
//     aplicarRealismo({THREE, renderer, scene, camera});
//
// Solo usa el núcleo de Three.js. No descarga nada.

// --- familias de material, por el color que ya usa el visor ---------------
const FAMILIAS = {
  0x608d7e: {nombre:'fundición pintada', metalness:0.15, roughness:0.62, color:0x4f7a6d, rugosidad:0.35},
  0xa6b9b7: {nombre:'acero inoxidable',  metalness:0.92, roughness:0.28, color:0xb6c4c2, rugosidad:0.18},
  0x42595c: {nombre:'hierro fundido',    metalness:0.45, roughness:0.78, color:0x3b4e51, rugosidad:0.45},
  0xe7a269: {nombre:'elastómero',        metalness:0.02, roughness:0.88, color:0xc8762f, rugosidad:0.25},
  0xc2cec9: {nombre:'acero mecanizado',  metalness:0.88, roughness:0.22, color:0xc9d4d0, rugosidad:0.14},
  0xc2d0c7: {nombre:'acero mecanizado',  metalness:0.88, roughness:0.24, color:0xc5d1c9, rugosidad:0.14},
  0x83a596: {nombre:'aleta de motor',    metalness:0.30, roughness:0.68, color:0x6f8d80, rugosidad:0.38},
  0x263d3b: {nombre:'bancada',           metalness:0.25, roughness:0.85, color:0x223533, rugosidad:0.50},
};

// --- texturas procedurales -------------------------------------------------
// Ruido fino de rugosidad: rompe el plástico perfecto del render sintético.
function mapaRugosidad(THREE, intensidad, escala = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = escala;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(escala, escala);
  let semilla = 1337;
  const rnd = () => (semilla = (semilla * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rnd() - 0.5) * 255 * intensidad;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.max(0, Math.min(255, v));
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // suavizado: dos pasadas de desenfoque barato
  ctx.filter = 'blur(1.2px)';
  ctx.drawImage(c, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

// --- entorno: un estudio procedural para los reflejos ----------------------
// Equivale a un HDRI simple. Sin esto, el metal se ve mate y muerto.
function entornoEstudio(THREE, renderer) {
  const env = new THREE.Scene();
  const panel = (w, h, d, color, intensidad, x, y, z, rx = 0, ry = 0) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshBasicMaterial({color: new THREE.Color(color).multiplyScalar(intensidad)})
    );
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    env.add(m);
    return m;
  };
  // caja envolvente: suelo oscuro, cielo claro, paredes frías
  panel(40, 0.1, 40, 0x3a4147, 0.7, 0, -8, 0);       // piso de nave
  panel(40, 0.1, 40, 0xdfe8ee, 2.6, 0, 14, 0);        // cielo / techo difusor
  panel(0.1, 24, 40, 0x9fb4c4, 1.1, -16, 3, 0);       // pared izquierda
  panel(0.1, 24, 40, 0x7f93a3, 0.8, 16, 3, 0);        // pared derecha
  panel(40, 24, 0.1, 0x8da0ad, 0.9, 0, 3, -16);       // fondo
  // luminarias de nave: las bandas que se reflejan en el acero
  panel(14, 0.1, 1.6, 0xffffff, 9, -4, 11.5, 4);
  panel(14, 0.1, 1.6, 0xffffff, 9, 4, 11.5, -4);
  panel(1.4, 0.1, 12, 0xfff2dd, 6, -9, 11.5, -3);
  // ventana lateral fría
  panel(0.1, 7, 11, 0xd8ecff, 5, -15.6, 5, 2);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const rt = pmrem.fromScene(env, 0.03);
  pmrem.dispose();
  env.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  return rt.texture;
}

// --- iluminación -----------------------------------------------------------
function montarLuces(THREE, scene) {
  // fuera las luces planas del visor base
  const viejas = [];
  scene.traverse(o => { if (o.isLight) viejas.push(o); });
  viejas.forEach(l => l.parent && l.parent.remove(l));

  // clave: una sola luz dura que proyecta sombra. Es la que da volumen.
  const clave = new THREE.DirectionalLight(0xfff0dc, 2.6);
  clave.position.set(-9, 14, 7);
  clave.castShadow = true;
  clave.shadow.mapSize.set(2048, 2048);
  clave.shadow.bias = -0.0006;
  clave.shadow.normalBias = 0.02;
  const c = clave.shadow.camera;
  c.left = -14; c.right = 14; c.top = 14; c.bottom = -14;
  c.near = 1; c.far = 60;
  c.updateProjectionMatrix();
  scene.add(clave);

  // relleno frío, suave, sin sombra
  const relleno = new THREE.DirectionalLight(0xbcd4ea, 0.55);
  relleno.position.set(8, 5, 9);
  scene.add(relleno);

  // contraluz: separa la bomba del fondo
  const contra = new THREE.DirectionalLight(0xffffff, 1.1);
  contra.position.set(4, 6, -11);
  scene.add(contra);

  return clave;
}

// --- piso que solo recibe sombra ------------------------------------------
function pisoSombra(THREE, scene) {
  const piso = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.ShadowMaterial({opacity: 0.34})
  );
  piso.rotation.x = -Math.PI / 2;
  piso.position.y = -1.42;
  piso.receiveShadow = true;
  piso.name = 'piso-sombra';
  scene.add(piso);
  return piso;
}

// --- aplicar materiales a lo que ya está construido ------------------------
function mejorarMateriales(THREE, scene, entorno) {
  const cache = new Map();
  let tocados = 0;

  scene.traverse(obj => {
    if (!obj.isMesh || !obj.material) return;
    obj.castShadow = true;
    obj.receiveShadow = true;

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach(mat => {
      if (!mat.isMeshStandardMaterial) return;
      const hex = mat.color.getHex();
      const fam = FAMILIAS[hex];
      if (!fam) {
        // material no catalogado: al menos que reciba el entorno
        mat.envMap = entorno;
        mat.envMapIntensity = 0.8;
        mat.needsUpdate = true;
        return;
      }
      let rug = cache.get(fam.rugosidad);
      if (!rug) { rug = mapaRugosidad(THREE, fam.rugosidad); cache.set(fam.rugosidad, rug); }

      mat.color.setHex(fam.color);
      mat.metalness = fam.metalness;
      mat.roughness = fam.roughness;
      mat.roughnessMap = rug;
      mat.envMap = entorno;
      mat.envMapIntensity = 1.0;
      mat.needsUpdate = true;
      tocados++;
    });
  });
  return tocados;
}

// --- API pública -----------------------------------------------------------
export function aplicarRealismo({THREE, renderer, scene, camera}) {
  if (!THREE || !renderer || !scene) throw new Error('aplicarRealismo: faltan THREE, renderer o scene.');

  // 1. salida de color y rango dinámico
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 2. entorno para los reflejos
  const entorno = entornoEstudio(THREE, renderer);
  scene.environment = entorno;

  // 3. luces con sombra
  const clave = montarLuces(THREE, scene);

  // 4. piso receptor
  const piso = pisoSombra(THREE, scene);

  // 5. materiales PBR
  const n = mejorarMateriales(THREE, scene, entorno);

  // 6. la cámara se acerca un poco: el encuadre cerrado ayuda a la lectura
  if (camera) camera.fov = Math.min(camera.fov, 40), camera.updateProjectionMatrix();

  return {
    entorno, clave, piso, materiales: n,
    // llamar si se construye geometría nueva después
    refrescar: () => mejorarMateriales(THREE, scene, entorno),
  };
}

````
