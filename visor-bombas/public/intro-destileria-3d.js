import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder.module.js';
// Escena de identidad visual: no representa mediciones ni simulación del proceso.
export async function mountIntro3D(root,{signal,reducedMotion=false}={}){
 if(signal?.aborted||root.hidden)return null;
 const canvas=root.querySelector('.intro-3d-canvas'),world=root.querySelector('.brand-stage');
 const reduced=reducedMotion;root.classList.add('intro-loading');

const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,world.clientWidth<560?1.25:1.5));renderer.setClearColor(0x020303,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;renderer.shadowMap.enabled=false;renderer.shadowMap.type=T.PCFSoftShadowMap;
let disposed=false,observer,frameId=0;
function dispose(){
 if(disposed)return;disposed=true;if(typeof frameId!=='undefined')cancelAnimationFrame(frameId);observer?.disconnect();
 const geometries=new Set(),materials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const material of (Array.isArray(object.material)?object.material:[object.material]))if(material)materials.add(material);});
 geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());texture?.dispose();environment.dispose();envScene.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});renderer.dispose();renderer.forceContextLoss();root.classList.remove('scene-ready','intro-loading');root.dataset.introState='closed';document.removeEventListener('visibilitychange',onVisibility);
}
const scene=new T.Scene();scene.fog=new T.FogExp2(0x100d08,.025);
const camera=new T.PerspectiveCamera(36,1,.1,100);
scene.add(new T.HemisphereLight(0xbacbcb,0x18140a,1.4));
const key=new T.DirectionalLight(0xffe6bd,4);key.position.set(0,6,4);key.castShadow=true;key.shadow.mapSize.set(world.clientWidth<560?512:1024,world.clientWidth<560?512:1024);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;scene.add(key);
const fill=new T.PointLight(0xb9c8db,35,15);fill.position.set(-3,3,3);scene.add(fill);
const amberLight=new T.PointLight(0xffbb45,0,8);amberLight.position.set(1.7,2,1.2);scene.add(amberLight);
const envScene=new T.Scene();envScene.add(new T.Mesh(new T.BoxGeometry(20,20,20),new T.MeshBasicMaterial({color:0x22272b,side:T.BackSide})));
for(const [x,y,z,sx,sy,sz,color] of [[0,7,0,8,.1,5,0xd6e1d7],[-5,2,2,.1,4,5,0x91b5c0],[5,2,-2,.1,4,2,0xe0b66b]]){const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),new T.MeshBasicMaterial({color}));m.position.set(x,y,z);envScene.add(m);}
const pmrem=new T.PMREMGenerator(renderer);const environment=pmrem.fromScene(envScene,.03);scene.environment=environment.texture;pmrem.dispose();
const metal=new T.MeshStandardMaterial({color:0x7c9696,metalness:.92,roughness:.23});
const darkMetal=new T.MeshStandardMaterial({color:0x243b3c,metalness:.85,roughness:.32});
const gold=new T.MeshStandardMaterial({color:0xdba848,metalness:.8,roughness:.19});
const dark=new T.MeshStandardMaterial({color:0x101a18,metalness:.6,roughness:.55});
function mesh(geo,mat,parent,pos){const m=new T.Mesh(geo,mat);if(pos)m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const floor=mesh(new T.PlaneGeometry(50,50),new T.MeshStandardMaterial({color:0x030706,metalness:.5,roughness:.42}),scene,[0,-.02,0]);floor.rotation.x=-Math.PI/2;floor.castShadow=false;floor.visible=false;
const pump=new T.Group();pump.position.set(-2,.12,0);scene.add(pump);
mesh(new T.BoxGeometry(3.05,.16,1.3),darkMetal,pump,[0,.08,0]);
for(const x of [-1,-.4,.5,1.1])mesh(new T.BoxGeometry(.13,.2,1.02),metal,pump,[x,.2,0]);
const motor=mesh(new T.CylinderGeometry(.42,.42,1.2,48),metal,pump,[-.65,.68,0]);motor.rotation.z=Math.PI/2;
for(let i=0;i<12;i++){const fin=mesh(new T.CylinderGeometry(.49,.49,.035,40),darkMetal,pump,[-1.18+i*.093,.68,0]);fin.rotation.z=Math.PI/2;}
const back=mesh(new T.CylinderGeometry(.44,.44,.1,40),darkMetal,pump,[-1.3,.68,0]);back.rotation.z=Math.PI/2;
mesh(new T.BoxGeometry(.3,.18,.3),darkMetal,pump,[-.8,1.12,0]);
const coupling=mesh(new T.CylinderGeometry(.15,.15,.4,32),gold,pump,[.15,.68,0]);coupling.rotation.z=Math.PI/2;
const casing=mesh(new T.CylinderGeometry(.61,.61,.28,64),darkMetal,pump,[.82,.72,-.08]);casing.rotation.x=Math.PI/2;
mesh(new T.TorusGeometry(.46,.15,20,80),metal,pump,[.82,.72,.11]);
const impeller=new T.Group();impeller.position.set(.82,.72,.16);pump.add(impeller);
for(let i=0;i<6;i++){const a=i*Math.PI/3;const blade=mesh(new T.BoxGeometry(.27,.065,.13),gold,impeller,[Math.cos(a)*.22,Math.sin(a)*.22,0]);blade.rotation.z=a+.5;}
const hub=mesh(new T.CylinderGeometry(.11,.11,.16,28),gold,impeller,[0,0,.04]);hub.rotation.x=Math.PI/2;
for(let i=0;i<8;i++){const a=i*Math.PI/4;const bolt=mesh(new T.CylinderGeometry(.034,.034,.055,6),metal,pump,[.82+Math.cos(a)*.57,.72+Math.sin(a)*.57,.22]);bolt.rotation.x=Math.PI/2;}
const inlet=mesh(new T.CylinderGeometry(.18,.18,.6,32),metal,pump,[1.58,.72,0]);inlet.rotation.z=Math.PI/2;const flange=mesh(new T.CylinderGeometry(.27,.27,.08,40),metal,pump,[1.91,.72,0]);flange.rotation.z=Math.PI/2;
const lampMaterial=new T.MeshStandardMaterial({color:0xb9de8a,emissive:0xa0d068,emissiveIntensity:.1});mesh(new T.SphereGeometry(.045,12,8),lampMaterial,pump,[-.8,1.25,0]);
const curve=new T.CatmullRomCurve3([new T.Vector3(-1.18,1.42,0),new T.Vector3(-1.18,2.8,0),new T.Vector3(-.96,3.2,0),new T.Vector3(-.45,3.35,0),new T.Vector3(.15,3.35,0)]);
mesh(new T.TubeGeometry(curve,80,.12,12,false),new T.MeshPhysicalMaterial({color:0x607374,metalness:.5,roughness:.18,transparent:true,opacity:.24,depthWrite:false}),scene);
const fluidGeo=new T.TubeGeometry(curve,100,.065,12,false),fluidMat=new T.MeshStandardMaterial({color:0xc38320,metalness:.35,roughness:.1,emissive:0xffad32,emissiveIntensity:.7});const fluid=mesh(fluidGeo,fluidMat,scene);fluid.castShadow=false;
const glow=mesh(new T.TubeGeometry(curve,80,.095,8,false),new T.MeshBasicMaterial({color:0xffbb45,transparent:true,opacity:.09,blending:T.AdditiveBlending,depthWrite:false}),scene);glow.castShadow=false;
const emblem=new T.Group();emblem.position.set(1.1,2.4,0);scene.add(emblem);
const ringMat=new T.MeshStandardMaterial({color:0xd0b178,metalness:1,roughness:.2,emissive:0xb97b23,emissiveIntensity:.2});mesh(new T.TorusGeometry(1.35,.024,12,120),ringMat,emblem);
const outer=mesh(new T.TorusGeometry(1.53,.008,8,120),new T.MeshBasicMaterial({color:0x594a2c}),emblem);outer.rotation.x=.12;outer.rotation.y=-.15;
const liquidUniforms={uTime:{value:0},uFill:{value:1},uOpacity:{value:.05}};
const liquid=new T.Mesh(new T.PlaneGeometry(2.65,2.65),new T.ShaderMaterial({uniforms:liquidUniforms,transparent:true,depthWrite:false,side:T.DoubleSide,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float uTime,uFill,uOpacity;void main(){vec2 p=v-.5;float r=length(p);if(r>.5)discard;float h=uFill+.026*sin(v.x*24.+uTime*7.)+.013*sin(v.x*41.-uTime*4.);if(v.y>h)discard;float edge=smoothstep(.07,0.,abs(v.y-h));vec3 c=mix(vec3(.31,.09,.006),vec3(1.,.64,.19),v.y*.7+edge*.8);gl_FragColor=vec4(c,uOpacity*(.55+edge*.4));}'}));emblem.add(liquid);
let texture;try{texture=await new T.TextureLoader().loadAsync(root.querySelector('.portada-logo').src);}catch(error){dispose();throw error;}if(signal?.aborted){dispose();return null;}
const logoUniforms={uMap:{value:texture},uReveal:{value:1},uTime:{value:0}};
const logo=new T.Mesh(new T.PlaneGeometry(2.45,2.45),new T.ShaderMaterial({uniforms:logoUniforms,transparent:true,depthWrite:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D uMap;uniform float uReveal,uTime;varying vec2 v;void main(){vec3 raw=texture2D(uMap,v).rgb;float ink=smoothstep(.08,.48,1.-dot(raw,vec3(.299,.587,.114)));float wave=.035*sin(v.x*17.-uTime*2.)+.018*sin(v.x*31.+uTime*3.);float reveal=smoothstep(-.12,.16,uReveal-v.y+wave);float gleam=.9+.1*sin(v.x*8.+uTime*.8);gl_FragColor=vec4(vec3(1.,.83,.49)*gleam,ink*reveal);}'}));logo.position.z=.05;emblem.add(logo);
const spiralPoints=[];for(let i=0;i<110;i++){const a=i/109*Math.PI*3.3;const r=1.45-(i/109)*.2;spiralPoints.push(new T.Vector3(Math.cos(a)*r,Math.sin(a)*r,Math.sin(a*1.6)*.2+.08));}
const spiralMat=new T.MeshPhysicalMaterial({color:0xd69226,metalness:.25,roughness:.12,transparent:true,opacity:.8,emissive:0xd98b22,emissiveIntensity:.35});const spiral=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(spiralPoints),160,.045,8,false),spiralMat,emblem);spiral.castShadow=false;
// El retorno sale del punto inferior del emblema y se aleja en Z hasta la planta.
const drainCurve=new T.CatmullRomCurve3([
 new T.Vector3(1.1,1.05,0),new T.Vector3(1.1,.62,0),new T.Vector3(1.35,.22,-.3),
 new T.Vector3(1.5,.18,-1.8),new T.Vector3(1.65,.12,-3.3),new T.Vector3(1.7,.12,-4.8)
]);
const pipeShell=new T.MeshPhysicalMaterial({color:0xc2c8b2,metalness:.35,roughness:.2,transparent:true,opacity:.25,depthWrite:false});
const drainShell=mesh(new T.TubeGeometry(drainCurve,96,.125,12,false),pipeShell,scene);
const nozzle=mesh(new T.CylinderGeometry(.19,.13,.2,24),gold,scene,[1.1,1.02,0]);
const flowUniforms={uTime:{value:0}};
function flowingLiquid(){
 return new T.ShaderMaterial({uniforms:flowUniforms,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float uTime;void main(){float band=pow(.5+.5*sin((v.x*12.-uTime*.65)*6.283185),5.);vec3 amber=mix(vec3(.38,.13,.012),vec3(1.,.72,.26),.35+band*.65);gl_FragColor=vec4(amber,1.);}'});
}
fluid.material.dispose();fluid.material=flowingLiquid();
let drainGeo=new T.TubeGeometry(drainCurve,110,.075,12,false);
const drainMesh=mesh(drainGeo,flowingLiquid(),scene);
// Se reutiliza la planta del catálogo, sin planos de referencia ni cubierta común.
root.dataset.introPlant='loading';
const plant=new T.Group();scene.add(plant);
try{
 const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/modelos/planta-integrada.glb');
 const model=gltf.scene,removed=[];
 model.traverse(object=>{if(/Suelo.?VOCATUS|REF.?Sector$|REF.?Cubierta.?comun/i.test(object.name))removed.push(object);});
 for(const object of removed){object.removeFromParent();object.traverse(part=>{part.geometry?.dispose();for(const material of(Array.isArray(part.material)?part.material:[part.material]))material?.dispose();});}
 const plantMaterial=new T.MeshStandardMaterial({color:0xa69a74,metalness:.35,roughness:.65});
 model.traverse(object=>{if(!object.isMesh)return;for(const material of(Array.isArray(object.material)?object.material:[object.material]))material.dispose();object.material=plantMaterial;object.castShadow=false;object.receiveShadow=false;});
 const box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
 model.position.set(-center.x,-box.min.y,-center.z);plant.add(model);plant.scale.setScalar(5/Math.max(size.x,size.z));plant.position.set(1.5,-1.15,-5.4);plant.rotation.y=-.3;
 plant.updateMatrixWorld(true);
 // Terminar el tubo sobre una superficie real de la miniatura, sin dejarlo suspendido.
 const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0);let contact;
 for(const [x,z] of [[1.7,-4.8],[1.5,-5.4],[2,-5.4],[1,-5.4],[1.5,-4.5]]){
  ray.set(new T.Vector3(x,4,z),down);contact=ray.intersectObject(plant,true)[0]?.point;if(contact)break;
 }
 if(contact){
  drainCurve.points[5].set(contact.x,Math.max(.12,contact.y+.38),contact.z+.35);
  drainCurve.points.push(contact.clone().add(new T.Vector3(0,.015,0)));drainCurve.updateArcLengths();
  drainGeo.dispose();drainGeo=new T.TubeGeometry(drainCurve,110,.075,12,false);drainMesh.geometry=drainGeo;
  drainShell.geometry.dispose();drainShell.geometry=new T.TubeGeometry(drainCurve,110,.125,12,false);
  root.dataset.introConnection='surface';
 }
 root.dataset.introPlant='ready';
}catch(error){root.dataset.introPlant='unavailable';console.warn('La miniatura de planta no está disponible.',error);}
if(signal?.aborted){dispose();return null;}
const beadCount=world.clientWidth<560?32:56;
const beads=new T.InstancedMesh(new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:0xffd484}),beadCount);
beads.frustumCulled=false;scene.add(beads);const dummy=new T.Object3D(),up=new T.Vector3(0,1,0);
let elapsed=reduced?8:0,playing=false,lastTick=0,frameCount=0,maxGap=0,lastPresented=0;let viewWidth=world.clientWidth,viewHeight=world.clientHeight;
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{const q=clamp(v);return q*q*(3-2*q);};
function positionCamera(){
 const aspect=viewWidth/viewHeight;camera.aspect=aspect;
 // Cámara perpendicular al logo: ni órbita ni giro durante el arranque.
 const distance=Math.max(10.5,4.3/(Math.tan(T.MathUtils.degToRad(18))*aspect));
 camera.position.set(.25,1.4,distance);camera.lookAt(.25,1.4,0);camera.updateProjectionMatrix();
 root.dataset.introCamera='frontal';
}
function render(t){
 const ready=clamp((t-.4)/1.6),flood=clamp((t-1.5)/2.6),drain=clamp((t-3.6)/2.4);
 const rotation=t<1?t*t*5:5+(t-1)*10;impeller.rotation.z=rotation;coupling.rotation.x=rotation;
 lampMaterial.emissiveIntensity=.1+ease(t/.7)*1.6;amberLight.intensity=10+Math.sin(t*.7)*1.2;ringMat.emissiveIntensity=.3+flood*.6;
 fluidGeo.setDrawRange(0,Math.floor(ready*fluidGeo.index.count/6)*6);glow.material.opacity=ready*.1;
 drainGeo.setDrawRange(0,Math.floor(drain*drainGeo.index.count/6)*6);flowUniforms.uTime.value=t;
 liquidUniforms.uTime.value=t;liquidUniforms.uFill.value=flood*.67;liquidUniforms.uOpacity.value=.22;
 logoUniforms.uReveal.value=-.2+1.4*ease((t-1.3)/3.4);logoUniforms.uTime.value=t;
 spiral.rotation.z=-t*.35;spiral.scale.setScalar(1);spiralMat.opacity=ease((t-1)/2)*.09;
 for(let i=0;i<beadCount;i++){
  const returning=i>=beadCount/2,path=returning?drainCurve:curve,phase=((t*(returning?.17:.24))+i/(beadCount/2))%1;
  const active=phase<=(returning?drain:ready);dummy.position.copy(path.getPointAt(phase));dummy.quaternion.setFromUnitVectors(up,path.getTangentAt(phase));
  dummy.scale.set(active?.026:0,active?.075:0,active?.026:0);dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);
 }beads.instanceMatrix.needsUpdate=true;
 renderer.render(scene,camera);
 root.dataset.introTime=t.toFixed(2);root.dataset.introFrames=String(frameCount);
}

function resize(){viewWidth=world.clientWidth;viewHeight=world.clientHeight;if(!viewWidth||!viewHeight)return;renderer.setSize(viewWidth,viewHeight,false);positionCamera();render(elapsed);}
function tick(now){
 if(disposed||root.hidden||!playing)return;
 // Limitar a 45 fps reduce carga sin detener el flujo al terminar el revelado.
 if(lastPresented&&now-lastPresented<1000/45){frameId=requestAnimationFrame(tick);return;}
 const gap=lastTick?(now-lastTick)/1000:0;lastTick=now;lastPresented=now;maxGap=Math.max(maxGap,gap);elapsed+=Math.min(gap,.05);frameCount++;render(elapsed);
 root.dataset.introMaxGap=String(Math.round(maxGap*1000));frameId=requestAnimationFrame(tick);
}

function onVisibility(){cancelAnimationFrame(frameId);lastTick=0;lastPresented=0;if(!document.hidden&&playing&&!disposed)frameId=requestAnimationFrame(tick);}
// Warm the actual materials before revealing the canvas: no first-use shader stalls.
renderer.setSize(viewWidth,viewHeight,false);positionCamera();
try{
 if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);
 renderer.render(scene,camera);
}catch(error){dispose();throw error;}
if(signal?.aborted){dispose();return null;}
observer=new ResizeObserver(resize);observer.observe(world);resize();
root.classList.remove('intro-loading');root.classList.add('scene-ready');
signal?.addEventListener('abort',dispose,{once:true});document.addEventListener('visibilitychange',onVisibility);
if(reduced){render(8);root.dataset.introState='finished';}
else{root.dataset.introState='playing';playing=true;frameId=requestAnimationFrame(tick);}
return {dispose};
}
