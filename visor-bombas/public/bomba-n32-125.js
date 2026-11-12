import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const viewport = document.querySelector('#viewport');
const parts = document.querySelector('#parts');
const fitButton = document.querySelector('#fit');
const status = document.querySelector('#status');

async function init() {
  const { scene: model } = await new GLTFLoader().loadAsync('./modelos/bomba-n32-125.glb');
  const pieces = model.children.filter(piece => Number.isInteger(piece.userData.partNumber));
  if (!pieces.length) throw new Error('El conjunto está vacío.');

  const scene = new THREE.Scene();
  scene.add(model, new THREE.HemisphereLight(0xe6f8ff, 0x6b7279, 2.6));
  for (const [x, y, z, strength] of [[-3, 6, 5, 3], [4, 3, -5, 2]]) {
    const light = new THREE.DirectionalLight(0xffffff, strength);
    light.position.set(x, y, z);
    scene.add(light);
  }
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  viewport.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  const render = () => renderer.render(scene, camera);
  controls.addEventListener('change', render);

  function fit() {
    const bounds = new THREE.Box3();
    for (const piece of pieces) {
      if (piece.visible) bounds.expandByObject(piece);
    }
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
    const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
    const distance = sphere.radius * 1.08 / Math.sin(Math.min(vertical, horizontal));
    camera.near = distance / 100;
    camera.far = distance * 30;
    camera.updateProjectionMatrix();
    controls.target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(new THREE.Vector3(-0.4, 0.35, 1).normalize(), distance);
    controls.minDistance = sphere.radius * 0.12;
    controls.maxDistance = distance * 8;
    controls.update();
    render();
  }

  const labels = new Map(pieces.map(({ userData }) => [userData.partNumber, userData.partLabel]));
  for (const [number, label] of [...labels].sort(([a], [b]) => a - b)) {
    parts.add(new Option(`${String(number).padStart(2, '0')} · ${label}`, number));
  }
  parts.onchange = () => {
    const number = Number(parts.value);
    for (const piece of pieces) piece.visible = !number || piece.userData.partNumber === number;
    const count = pieces.filter(piece => piece.visible).length;
    status.textContent = number ? `${labels.get(number)} · ${count} en el conjunto` : `${pieces.length} piezas e instancias`;
    fit();
  };
  fitButton.onclick = fit;
  parts.disabled = fitButton.disabled = false;
  new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    fit();
  }).observe(viewport);
  parts.onchange();
}

init().catch(error => {
  console.error(error);
  status.textContent = 'No se pudo mostrar el modelo CAD. Recargá la página para reintentar.';
});
