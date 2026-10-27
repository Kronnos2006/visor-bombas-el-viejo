import * as T from './vendor/three.module.js';
import {mountLiquidEther} from './liquid-ether-native.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder.module.js';
// Escena de identidad visual: no representa mediciones ni simulación del proceso.
export async function mountIntro3D(root,{signal,reducedMotion=false}={}){
 if(signal?.aborted||root.hidden)return null;
 const canvas=root.querySelector('.intro-3d-canvas'),world=root.querySelector('.brand-stage');
 const reduced=reducedMotion;root.classList.add('intro-loading');

const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,world.clientWidth<560?1.25:1.5));renderer.setClearColor(0x020303,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=false;renderer.shadowMap.type=T.PCFSoftShadowMap;
const etherSource=root.querySelector('#ether-source');const etherTexture=new T.CanvasTexture(etherSource.querySelector('canvas'));etherTexture.colorSpace=T.SRGBColorSpace;let stopEther=null;
let disposed=false,observer,frameId=0;
function dispose(){
 if(disposed)return;disposed=true;if(typeof frameId!=='undefined')cancelAnimationFrame(frameId);observer?.disconnect();
 const geometries=new Set(),materials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const material of (Array.isArray(object.material)?object.material:[object.material]))if(material)materials.add(material);});
 if(stopEther){stopEther();etherSource.querySelector('canvas').getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();}etherSource.remove();etherTexture.dispose();geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());texture?.dispose();environment.dispose();envScene.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});renderer.dispose();renderer.forceContextLoss();root.classList.remove('scene-ready','intro-loading');root.dataset.introState='closed';document.removeEventListener('visibilitychange',onVisibility);
}
const scene=new T.Scene();scene.fog=new T.FogExp2(0x100d08,.025);
const camera=new T.PerspectiveCamera(36,1,.1,100);
scene.add(new T.HemisphereLight(0xbacbcb,0x18140a,1.4));
const key=new T.DirectionalLight(0xffe6bd,3.3);key.position.set(-3,6,7);key.castShadow=true;key.shadow.mapSize.set(world.clientWidth<560?512:1024,world.clientWidth<560?512:1024);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;scene.add(key);
const fill=new T.PointLight(0xb9c8db,17,15);fill.position.set(-3,3,3);scene.add(fill);
const amberLight=new T.PointLight(0xffbb45,0,8);amberLight.position.set(1.7,2,1.2);scene.add(amberLight);
const envScene=new T.Scene();envScene.add(new T.Mesh(new T.BoxGeometry(20,20,20),new T.MeshBasicMaterial({color:0x22272b,side:T.BackSide})));
for(const [x,y,z,sx,sy,sz,color] of [[0,7,0,8,.1,5,0xd6e1d7],[-5,2,2,.1,4,5,0x91b5c0],[5,2,-2,.1,4,2,0xe0b66b]]){const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),new T.MeshBasicMaterial({color}));m.position.set(x,y,z);envScene.add(m);}
const pmrem=new T.PMREMGenerator(renderer);const environment=pmrem.fromScene(envScene,.03);scene.environment=environment.texture;pmrem.dispose();
const metal=new T.MeshStandardMaterial({color:0x7c9696,metalness:.8,roughness:.28});
const darkMetal=new T.MeshStandardMaterial({color:0x243b3c,metalness:.85,roughness:.32});
const gold=new T.MeshStandardMaterial({color:0xdba848,metalness:.8,roughness:.19});
const dark=new T.MeshStandardMaterial({color:0x101a18,metalness:.6,roughness:.55});
function mesh(geo,mat,parent,pos){const m=new T.Mesh(geo,mat);if(pos)m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const floor=mesh(new T.PlaneGeometry(50,50),new T.MeshStandardMaterial({color:0x030706,metalness:.5,roughness:.42}),scene,[0,-.02,0]);floor.rotation.x=-Math.PI/2;floor.castShadow=false;floor.visible=false;
// Bomba en tres cuartos: motor, eje e impulsor comparten el eje mecánico X.
const pump=new T.Group();pump.position.set(-2.3,1.3,.65);pump.rotation.set(.055,-.65,0);pump.scale.setScalar(1.05);scene.add(pump);
const paint=new T.MeshStandardMaterial({color:0x2d514f,metalness:.52,roughness:.34});
const brushed=new T.MeshStandardMaterial({color:0x84938e,metalness:.72,roughness:.42});
mesh(new T.BoxGeometry(3.05,.14,1.16),darkMetal,pump,[0,.08,0]);
for(const x of[-1.12,1.08])for(const z of[-.4,.4]){mesh(new T.CylinderGeometry(.105,.12,.12,20),dark,pump,[x,-.025,z]);const bolt=mesh(new T.CylinderGeometry(.045,.045,.035,6),brushed,pump,[x,.17,z]);}
for(const x of[-.95,-.4,.6,1.03])mesh(new T.BoxGeometry(.12,.2,.72),paint,pump,[x,.23,0]);
const motor=mesh(new T.CylinderGeometry(.43,.43,1.14,48),paint,pump,[-.7,.68,0]);motor.rotation.z=Math.PI/2;
for(let i=0;i<12;i++){const fin=mesh(new T.CylinderGeometry(.465,.465,.035,40),paint,pump,[-1.22+i*.094,.68,0]);fin.rotation.z=Math.PI/2;}
for(const x of[-1.31,-.07]){const end=mesh(new T.CylinderGeometry(.43,.43,.09,48),paint,pump,[x,.68,0]);end.rotation.z=Math.PI/2;const lip=mesh(new T.TorusGeometry(.42,.016,8,48),brushed,pump,[x,.68,0]);lip.rotation.y=Math.PI/2;}
mesh(new T.BoxGeometry(.32,.18,.29),paint,pump,[-.72,1.15,0]);
const bearingCover=mesh(new T.CylinderGeometry(.22,.22,.06,32),darkMetal,pump,[-.005,.68,0]);bearingCover.rotation.z=Math.PI/2;
const shaft=mesh(new T.CylinderGeometry(.085,.085,.65,24),brushed,pump,[.3,.68,0]);shaft.rotation.z=Math.PI/2;
const coupling=mesh(new T.CylinderGeometry(.15,.15,.28,32),darkMetal,pump,[.23,.68,0]);coupling.rotation.z=Math.PI/2;
for(const x of[.12,.34]){const ring=mesh(new T.TorusGeometry(.15,.018,8,32),gold,pump,[x,.68,0]);ring.rotation.y=Math.PI/2;}
const casing=mesh(new T.CylinderGeometry(.57,.57,.28,64),paint,pump,[.82,.72,0]);casing.rotation.z=Math.PI/2;
const rim=mesh(new T.TorusGeometry(.49,.055,16,80),brushed,pump,[1.0,.72,0]);rim.rotation.y=Math.PI/2;
const impeller=new T.Group();impeller.position.set(1.035,.72,0);impeller.rotation.y=Math.PI/2;pump.add(impeller);
for(let i=0;i<6;i++){const a=i*Math.PI/3;const blade=mesh(new T.BoxGeometry(.28,.065,.075),gold,impeller,[Math.cos(a)*.25,Math.sin(a)*.25,0]);blade.rotation.z=a+.6;}
const hub=mesh(new T.CylinderGeometry(.105,.105,.1,24),brushed,impeller,[0,0,.025]);hub.rotation.x=Math.PI/2;
for(let i=0;i<8;i++){const a=i*Math.PI/4;const bolt=mesh(new T.CylinderGeometry(.033,.033,.055,6),brushed,pump,[1.02,.72+Math.cos(a)*.54,Math.sin(a)*.54]);bolt.rotation.z=Math.PI/2;}
// Brida y boca abiertas: el tubo no termina en un cilindro macizo.
const inlet=mesh(new T.CylinderGeometry(.18,.18,.55,32,1,true),paint,pump,[1.37,.72,0]);inlet.rotation.z=Math.PI/2;
const bore=mesh(new T.CylinderGeometry(.15,.15,.55,32,1,true),new T.MeshStandardMaterial({color:0x101b1b,metalness:.5,roughness:.4,side:T.BackSide}),pump,[1.37,.72,0]);bore.rotation.z=Math.PI/2;
const flange=mesh(new T.RingGeometry(.15,.28,40),brushed,pump,[1.66,.72,0]);flange.rotation.y=Math.PI/2;flange.material.side=T.DoubleSide;
for(let i=0;i<4;i++){const a=i*Math.PI/2+.78;const nut=mesh(new T.CylinderGeometry(.026,.026,.04,6),darkMetal,pump,[1.68,.72+Math.cos(a)*.23,Math.sin(a)*.23]);nut.rotation.z=Math.PI/2;}
mesh(new T.CylinderGeometry(.12,.12,.24,28,1,true),brushed,pump,[.82,1.39,0]);mesh(new T.RingGeometry(.095,.185,32),brushed,pump,[.82,1.515,0]).rotation.x=-Math.PI/2;
const lampMaterial=new T.MeshStandardMaterial({color:0xb9de8a,emissive:0xa0d068,emissiveIntensity:.1});mesh(new T.SphereGeometry(.033,12,8),lampMaterial,pump,[-.72,1.26,.035]);
pump.updateMatrixWorld(true);const discharge=pump.localToWorld(new T.Vector3(.82,1.54,0));
const curve=new T.CatmullRomCurve3([discharge,new T.Vector3(discharge.x,3.57,discharge.z),new T.Vector3(discharge.x+.32,3.95,.24),new T.Vector3(.55,3.95,.04),new T.Vector3(1.05,3.88,0),new T.Vector3(1.1,3.74,0)]);
for(const u of[0,1]){const cuff=mesh(new T.CylinderGeometry(.145,.145,.11,28,1,true),brushed,scene);cuff.position.copy(curve.getPointAt(u));cuff.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),curve.getTangentAt(u));}
root.dataset.introPumpAngle='three-quarter';

mesh(new T.TubeGeometry(curve,80,.12,12,false),new T.MeshPhysicalMaterial({color:0x607374,metalness:.5,roughness:.18,transparent:true,opacity:.24,depthWrite:false}),scene);
const fluidGeo=new T.TubeGeometry(curve,100,.065,12,false),fluidMat=new T.MeshStandardMaterial({color:0xc38320,metalness:.35,roughness:.1,emissive:0xffad32,emissiveIntensity:.7});const fluid=mesh(fluidGeo,fluidMat,scene);fluid.castShadow=false;
const glow=mesh(new T.TubeGeometry(curve,80,.095,8,false),new T.MeshBasicMaterial({color:0xffbb45,transparent:true,opacity:.09,blending:T.AdditiveBlending,depthWrite:false}),scene);glow.castShadow=false;
const emblem=new T.Group();emblem.position.set(1.1,2.4,0);scene.add(emblem);
const ringMat=new T.MeshStandardMaterial({color:0xd0b178,metalness:1,roughness:.2,emissive:0xb97b23,emissiveIntensity:.2});mesh(new T.TorusGeometry(1.35,.024,12,120),ringMat,emblem);
const outer=mesh(new T.TorusGeometry(1.53,.008,8,120),new T.MeshBasicMaterial({color:0x594a2c}),emblem);outer.rotation.x=.12;outer.rotation.y=-.15;
const liquidUniforms={uEther:{value:etherTexture},uTime:{value:0},uFill:{value:1},uOpacity:{value:.05}};
const liquid=new T.Mesh(new T.PlaneGeometry(2.65,2.65),new T.ShaderMaterial({uniforms:liquidUniforms,transparent:true,depthWrite:false,side:T.DoubleSide,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 v;uniform float uTime,uFill,uOpacity;uniform sampler2D uEther;
void main(){
 vec2 p=v-.5;float circle=1.-smoothstep(.48,.5,length(p));
 float wave=.012*sin(v.x*16.-uTime*1.6)+.007*sin(v.x*31.+uTime*2.1);
 float surface=uFill+wave,meniscus=exp(-abs(v.y-surface)*145.);
 float wet=1.-smoothstep(surface-.007,surface+.005,v.y);
 vec4 swirl=texture2D(uEther,v);float eddy=clamp(swirl.r*1.3+swirl.g*.6,0.,1.);
 vec3 rum=mix(vec3(.10,.022,.003),vec3(.68,.31,.045),eddy*.85+v.y*.2);
 rum+=vec3(.82,.55,.16)*meniscus*.6;rum+=swirl.rgb*.28;
 float caustic=pow(.5+.5*sin(v.x*38.+v.y*19.+eddy*12.-uTime),12.);
 rum+=vec3(.27,.12,.02)*caustic*eddy;
 gl_FragColor=vec4(rum,circle*wet*uOpacity);
}`}));emblem.add(liquid);
let texture;try{texture=await new T.TextureLoader().loadAsync(root.querySelector('.portada-logo').src);}catch(error){dispose();throw error;}if(signal?.aborted){dispose();return null;}
const logoUniforms={uMap:{value:texture},uReveal:{value:1},uTime:{value:0}};
const logo=new T.Mesh(new T.PlaneGeometry(2.45,2.45),new T.ShaderMaterial({uniforms:logoUniforms,transparent:true,depthWrite:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D uMap;uniform float uReveal,uTime;varying vec2 v;void main(){vec3 raw=texture2D(uMap,v).rgb;float ink=smoothstep(.08,.48,1.-dot(raw,vec3(.299,.587,.114)));float wave=.035*sin(v.x*17.-uTime*2.)+.018*sin(v.x*31.+uTime*3.);float reveal=smoothstep(-.12,.16,uReveal-(1.-v.y)+wave);float gleam=.9+.1*sin(v.x*8.+uTime*.8);gl_FragColor=vec4(vec3(1.,.83,.49)*gleam,ink*reveal);}'}));logo.position.z=.05;logo.renderOrder=3;emblem.add(logo);
const spiralPoints=[];for(let i=0;i<110;i++){const a=i/109*Math.PI*3.3;const r=1.45-(i/109)*.2;spiralPoints.push(new T.Vector3(Math.cos(a)*r,Math.sin(a)*r,Math.sin(a*1.6)*.2+.08));}
const spiralMat=new T.MeshPhysicalMaterial({color:0xd69226,metalness:.25,roughness:.12,transparent:true,opacity:.8,emissive:0xd98b22,emissiveIntensity:.35});const spiral=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(spiralPoints),160,.045,8,false),spiralMat,emblem);spiral.castShadow=false;spiral.visible=false;
// El retorno sale del punto inferior del emblema y se aleja en Z hasta la planta.
const drainCurve=new T.CubicBezierCurve3(
 new T.Vector3(1.1,1.05,0),new T.Vector3(1.1,.4,-.1),
 new T.Vector3(1.5,-1,-6.8),new T.Vector3(1.5,-1.5,-7.2)
);
const pipeShell=new T.MeshPhysicalMaterial({color:0xc2c8b2,metalness:.35,roughness:.2,transparent:true,opacity:.25,depthWrite:false});
const drainShell=mesh(new T.TubeGeometry(drainCurve,96,.125,12,false),pipeShell,scene);
const nozzle=mesh(new T.CylinderGeometry(.19,.13,.2,24),gold,scene,[1.1,1.02,0]);
const flowUniforms={uTime:{value:0},uEther:{value:etherTexture}};
function flowingLiquid(){
 return new T.ShaderMaterial({uniforms:flowUniforms,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 v;uniform float uTime;uniform sampler2D uEther;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 p=vec2(v.x*16.-uTime*1.7,v.y*5.);float n=noise(p)+.4*noise(p*2.1+uTime*.2);float gleam=pow(max(0.,sin(v.y*6.283)),16.);vec3 amber=mix(vec3(.19,.045,.003),vec3(.86,.48,.09),smoothstep(.18,1.25,n));amber+=vec3(.42,.29,.1)*gleam;gl_FragColor=vec4(amber,1.);}`});
}
fluid.material.dispose();fluid.material=flowingLiquid();
let drainGeo=new T.TubeGeometry(drainCurve,110,.075,12,false);
const drainMesh=mesh(drainGeo,flowingLiquid(),scene);
// Miniatura del modelo Blender completo; geometría reducida solo para esta vista local.
const plantUniforms={uTime:{value:0},uLevel:{value:-10},uHeight:{value:1}};
const plantVertex=`varying vec3 worldP;varying vec3 worldN;void main(){vec4 p=modelMatrix*vec4(position,1.);worldP=p.xyz;worldN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}`;
const glassMaterial=new T.ShaderMaterial({uniforms:plantUniforms,transparent:true,depthWrite:false,side:T.DoubleSide,vertexShader:plantVertex,fragmentShader:`varying vec3 worldP;varying vec3 worldN;uniform float uTime,uLevel;void main(){float wave=.012*sin(worldP.x*8.+uTime*1.6)+.009*sin(worldP.z*9.-uTime*1.2);if(worldP.y<=uLevel+wave)discard;vec3 eye=normalize(cameraPosition-worldP);float edge=pow(1.-abs(dot(normalize(worldN),eye)),2.2);vec3 tint=mix(vec3(.28,.40,.40),vec3(.83,.91,.86),edge);gl_FragColor=vec4(tint,.045+edge*.36);}`});
const plantLiquidMaterial=new T.ShaderMaterial({uniforms:plantUniforms,transparent:true,depthWrite:true,side:T.DoubleSide,vertexShader:plantVertex,fragmentShader:`varying vec3 worldP;varying vec3 worldN;uniform float uTime,uLevel,uHeight;void main(){float wave=.012*sin(worldP.x*8.+uTime*1.6)+.009*sin(worldP.z*9.-uTime*1.2);float d=uLevel+wave-worldP.y;if(d<0.)discard;vec3 normal=normalize(worldN);float edge=pow(1.-abs(dot(normal,normalize(cameraPosition-worldP))),2.);float surface=exp(-d*110.);float caustic=.5+.5*sin(worldP.x*13.+worldP.z*8.+uTime*1.5);float light=.72+.28*abs(dot(normal,normalize(vec3(-.2,.8,.6))));vec3 c=mix(vec3(.38,.095,.008),vec3(.98,.54,.09),.35+edge*.4+surface*.25)*light;c+=vec3(.2,.10,.008)*pow(caustic,8.);gl_FragColor=vec4(c,.88+edge*.1);}`});
root.dataset.introPlant='loading';
const plant=new T.Group();scene.add(plant);let plantBottom=-1.7,plantHeight=1;
try{
 const gltf=await new GLTFLoader().loadAsync('/modelos/intro-planta.glb');const model=gltf.scene;
 const sourceMaterials=new Set();model.traverse(o=>{if(o.isMesh){for(const m of(Array.isArray(o.material)?o.material:[o.material]))sourceMaterials.add(m);o.material=glassMaterial;o.renderOrder=2;}});sourceMaterials.forEach(m=>m.dispose());
 const box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
 model.position.set(-center.x,-box.min.y,-center.z);plant.add(model);plant.scale.setScalar(7.2/Math.max(size.x,size.z));plant.position.set(.05,-2.3,-7.2);plant.rotation.y=-.3;
 const amber=model.clone(true);amber.traverse(o=>{if(o.isMesh){o.material=plantLiquidMaterial;o.renderOrder=1;}});plant.add(amber);
 plant.updateMatrixWorld(true);const worldBox=new T.Box3().setFromObject(plant);plantBottom=worldBox.min.y;plantHeight=worldBox.max.y-worldBox.min.y;plantUniforms.uHeight.value=plantHeight;
 root.dataset.introPlant='ready';root.dataset.introPlantStyle='glass';root.dataset.introPlantDepth=String(plant.position.z);root.dataset.introWetStyle='amber-only';const sectors=gltf.parser.json.extras?.sectors||[];root.dataset.introHasTankSector=String(sectors.includes('Sector de tanques'));root.dataset.introSectors=String(sectors.length);
 const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0);let contact;
 for(const [x,z] of [[1.5,-7.2],[1,-7.2],[.5,-7.2],[0,-7.2],[1,-7.9],[0,-7.9]]){ray.set(new T.Vector3(x,5,z),down);contact=ray.intersectObject(model,true)[0]?.point;if(contact)break;}
 if(contact){
  const end=contact.clone().add(new T.Vector3(0,.015,0)),fall=1.05-end.y;
  drainCurve.v0.set(1.1,1.05,0);
  drainCurve.v1.set(1.1,1.05-fall*.32,end.z*.12);
  drainCurve.v2.set(end.x,end.y+fall*.22,end.z*.82);
  drainCurve.v3.copy(end);drainCurve.updateArcLengths();
  drainGeo.dispose();drainGeo=new T.TubeGeometry(drainCurve,110,.075,12,false);drainMesh.geometry=drainGeo;drainShell.geometry.dispose();drainShell.geometry=new T.TubeGeometry(drainCurve,110,.125,12,false);root.dataset.introConnection='surface';
 }
}catch(error){root.dataset.introPlant='unavailable';dispose();throw error;}
// Entrada superior: el chorro nace de la manguera y cae hasta el nivel acumulado.
const jetCurve=new T.LineCurve3(new T.Vector3(0,0,0),new T.Vector3(0,-2.665,0));
const jetGeo=new T.TubeGeometry(jetCurve,52,.045,10,false),jet=new T.Mesh(jetGeo,flowingLiquid());jet.position.set(1.1,3.74,.025);emblem.parent.add(jet);jet.renderOrder=1;
mesh(new T.CylinderGeometry(.115,.09,.12,24),gold,scene,[1.1,3.78,0]);
const splash=new T.Mesh(new T.TorusGeometry(.12,.009,8,40),new T.MeshBasicMaterial({color:0xf1bf69,transparent:true,opacity:.65}));scene.add(splash);splash.rotation.x=Math.PI/2;
if(signal?.aborted){dispose();return null;}
const beadCount=world.clientWidth<560?32:56;
const beads=new T.InstancedMesh(new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:0xffdc9a}),beadCount);
beads.frustumCulled=false;scene.add(beads);const dummy=new T.Object3D(),up=new T.Vector3(0,1,0);
let elapsed=reduced?25:0,playing=false,lastTick=0,frameCount=0,maxGap=0,lastPresented=0;let viewWidth=world.clientWidth,viewHeight=world.clientHeight;
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{const q=clamp(v);return q*q*(3-2*q);};
function positionCamera(){
 const aspect=viewWidth/viewHeight;camera.aspect=aspect;
 // Cámara perpendicular al logo: ni órbita ni giro durante el arranque.
 const distance=Math.max(11.4,4.3/(Math.tan(T.MathUtils.degToRad(18))*aspect));
 camera.position.set(.1,1.1,distance);camera.lookAt(.1,1.1,0);camera.updateProjectionMatrix();
 root.dataset.introCamera='frontal';
 const projectBox=object=>{const b=new T.Box3().setFromObject(object),p=new T.Vector3();let min=Infinity,max=-Infinity;for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z]){p.set(x,y,z).project(camera);min=Math.min(min,p.y);max=Math.max(max,p.y);}return {min,max};};
 camera.updateMatrixWorld();const pb=projectBox(pump),plantB=projectBox(plant);root.dataset.introPlantClear=String(plantB.max<pb.min);
}
function render(t){
 const ready=clamp((t-.4)/1.7),pour=clamp((t-2.1)/.9),flood=clamp((t-3.)/4.),drain=clamp((t-6.5)/2.2),plantFill=clamp((t-8.7)/12.);
 const rotation=t<1?t*t*5:5+(t-1)*10;impeller.rotation.z=rotation;coupling.rotation.x=rotation;
 lampMaterial.emissiveIntensity=.1+ease(t/.7)*1.6;amberLight.intensity=10+Math.sin(t*.7)*1.2;ringMat.emissiveIntensity=.3+flood*.6;
 fluidGeo.setDrawRange(0,Math.floor(ready*fluidGeo.index.count/6)*6);glow.material.opacity=ready*.1;
 drainGeo.setDrawRange(0,Math.floor(drain*drainGeo.index.count/6)*6);flowUniforms.uTime.value=t;
 liquidUniforms.uTime.value=t;liquidUniforms.uFill.value=-.03+flood*.65;liquidUniforms.uOpacity.value=t>3?.86:0;
 const surfaceY=1.075+2.65*liquidUniforms.uFill.value;jet.visible=t>2.1;jet.scale.y=(3.74-Math.max(1.075,surfaceY))/2.665;jetGeo.setDrawRange(0,Math.floor(pour*jetGeo.index.count/6)*6);
 splash.visible=t>3;splash.position.set(1.1,Math.max(1.075,surfaceY)+.015,.03);splash.scale.setScalar(.8+.2*Math.sin(t*5.));
 plantUniforms.uTime.value=t;plantUniforms.uLevel.value=plantBottom-.03+(plantHeight+.06)*plantFill;root.dataset.introPlantFill=plantFill.toFixed(3);root.dataset.introJet='top-down';root.dataset.introPool=flood.toFixed(3);
 logoUniforms.uReveal.value=-.2+1.4*ease((t-2.1)/3.5);logoUniforms.uTime.value=t;
 spiral.rotation.z=-t*.35;spiral.scale.setScalar(1);spiralMat.opacity=0;
 for(let i=0;i<beadCount;i++){
  const returning=i>=beadCount/2,path=returning?drainCurve:curve,phase=((t*(returning?.17:.24))+i/(beadCount/2))%1;
  const active=phase<=(returning?drain:ready);dummy.position.copy(path.getPointAt(phase));dummy.quaternion.setFromUnitVectors(up,path.getTangentAt(phase));
  dummy.scale.set(active?.011:0,active?.032:0,active?.011:0);dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);
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
stopEther=mountLiquidEther(etherSource,{colors:['#4b1d04','#c07119','#ffda7e'],intensity:1.8,mouseForce:12,cursorSize:80,persistence:.8,viscosity:.2,resolution:.42,autoSpeed:.35,autoIntensity:2.3,autoResumeDelay:700,maxDevicePixelRatio:1,clickBurst:false,backgroundColor:'#170b02',onFrame:()=>{etherTexture.needsUpdate=true;}});
 if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);
 renderer.render(scene,camera);
}catch(error){dispose();throw error;}
if(signal?.aborted){dispose();return null;}
observer=new ResizeObserver(resize);observer.observe(world);resize();
root.classList.remove('intro-loading');root.classList.add('scene-ready');
signal?.addEventListener('abort',dispose,{once:true});document.addEventListener('visibilitychange',onVisibility);
if(reduced){render(25);root.dataset.introState='finished';}
else{root.dataset.introState='playing';playing=true;frameId=requestAnimationFrame(tick);}
return {dispose};
}
