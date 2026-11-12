import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { assembledPosition } from './bomba-n32-125-montaje.js';

const viewport = document.querySelector('#viewport');
const parts = document.querySelector('#parts');
const fitButton = document.querySelector('#fit');
const status = document.querySelector('#status');
const explode = document.querySelector('#explode');

async function init() {
  const { scene: model } = await new GLTFLoader().loadAsync('./modelos/bomba-n32-125.glb');
  const pieces = model.children.filter(piece => Number.isInteger(piece.userData.partNumber));
  if (!pieces.length) throw new Error('El conjunto está vacío.');
  const positions = pieces.map(piece => {
    const { partNumber, partInstance } = piece.userData;
    const exploded = piece.position.clone();
    const assembled = new THREE.Vector3(...assembledPosition(partNumber, partInstance, exploded.toArray()));
    piece.position.copy(assembled);
    return { piece, assembled, exploded };
  });

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
  const defaultDirection = new THREE.Vector3(-0.5, 0.38, 1).normalize();
  let isExploded = false;
  let separation = 0;
  let animation = 0;

  function fit(direction = defaultDirection) {
    const bounds = new THREE.Box3();
    for (const piece of pieces) {
      if (piece.visible) bounds.expandByObject(piece);
    }
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = bounds.getSize(new THREE.Vector3()).length() / 2;
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right);
    const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
    const height = Math.tan(vertical);
    const width = height * camera.aspect;
    let distance = radius;
    for (const x of [bounds.min.x, bounds.max.x]) {
      for (const y of [bounds.min.y, bounds.max.y]) {
        for (const z of [bounds.min.z, bounds.max.z]) {
          const point = new THREE.Vector3(x, y, z).sub(center);
          const extent = Math.max(Math.abs(point.dot(right)) / width, Math.abs(point.dot(up)) / height);
          distance = Math.max(distance, point.dot(direction) + extent * 1.16);
        }
      }
    }
    camera.near = distance / 100;
    camera.far = distance * 30;
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(direction, distance);
    controls.minDistance = radius * 0.12;
    controls.maxDistance = distance * 8;
    controls.update();
    render();
  }

  const labels = new Map(pieces.map(({ userData }) => [userData.partNumber, userData.partLabel]));
  for (const [number, label] of [...labels].sort(([a], [b]) => a - b)) {
    parts.add(new Option(`${String(number).padStart(2, '0')} · ${label}`, number));
  }
  function showSelection() {
    const number = Number(parts.value);
    for (const piece of pieces) piece.visible = !number || piece.userData.partNumber === number;
    const count = pieces.filter(piece => piece.visible).length;
    const mode = isExploded ? 'Vista explosionada de Inventor' : 'Bomba ensamblada';
    status.textContent = number ? `${mode} · ${labels.get(number)} (${count})` : `${mode} · ${pieces.length} piezas e instancias`;
  }
  explode.onclick = () => {
    isExploded = !isExploded;
    explode.textContent = isExploded ? 'Volver a ensamblar' : 'Separar piezas';
    explode.setAttribute('aria-pressed', String(isExploded));
    showSelection();
    cancelAnimationFrame(animation);
    const direction = camera.position.clone().sub(controls.target).normalize();
    const start = performance.now();
    const from = separation;
    const to = Number(isExploded);
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
    function move(now) {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      separation = THREE.MathUtils.lerp(from, to, t * t * (3 - 2 * t));
      for (const { piece, assembled, exploded } of positions) piece.position.lerpVectors(assembled, exploded, separation);
      fit(direction);
      if (t < 1) animation = requestAnimationFrame(move);
    }
    animation = requestAnimationFrame(move);
  };
  parts.onchange = () => {
    showSelection();
    fit();
  };
  fitButton.onclick = () => fit();
  parts.disabled = fitButton.disabled = explode.disabled = false;
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
