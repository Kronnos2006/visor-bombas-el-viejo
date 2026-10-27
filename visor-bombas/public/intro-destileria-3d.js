import * as T from './vendor/three.module.js';
// Escena de identidad visual: no representa mediciones ni simulación del proceso.
export async function mountIntro3D(root,{signal,reducedMotion=false}={}){
 if(signal?.aborted||root.hidden)return null;
 const canvas=root.querySelector('.intro-3d-canvas'),world=root.querySelector('.brand-stage'),status=root.querySelector('.intro-3d-status'),startButton=root.querySelector('.intro-replay'),pauseButton=root.querySelector('.intro-pause');
 const reduced=reducedMotion;

const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0x020303,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
let disposed=false,observer,frameId=0;
function dispose(){
 if(disposed)return;disposed=true;if(typeof frameId!=='undefined')cancelAnimationFrame(frameId);observer?.disconnect();
 const geometries=new Set(),materials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const material of (Array.isArray(object.material)?object.material:[object.material]))if(material)materials.add(material);});
 geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());texture?.dispose();environment.dispose();envScene.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});renderer.dispose();renderer.forceContextLoss();root.classList.remove('scene-ready');
}
const scene=new T.Scene();scene.fog=new T.FogExp2(0x020303,.035);
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
const floor=mesh(new T.PlaneGeometry(50,50),new T.MeshStandardMaterial({color:0x030706,metalness:.5,roughness:.42}),scene,[0,-.02,0]);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
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
const curve=new T.CatmullRomCurve3([new T.Vector3(-1.18,1.42,0),new T.Vector3(-1.18,2.25,0),new T.Vector3(-.98,2.53,0),new T.Vector3(-.25,2.53,0),new T.Vector3(.08,2.8,0),new T.Vector3(.66,2.8,0)]);
mesh(new T.TubeGeometry(curve,80,.12,12,false),new T.MeshPhysicalMaterial({color:0x607374,metalness:.5,roughness:.18,transparent:true,opacity:.24,depthWrite:false}),scene);
const fluidGeo=new T.TubeGeometry(curve,100,.065,12,false),fluidMat=new T.MeshStandardMaterial({color:0xc38320,metalness:.35,roughness:.1,emissive:0xffad32,emissiveIntensity:.7});const fluid=mesh(fluidGeo,fluidMat,scene);fluid.castShadow=false;
const glow=mesh(new T.TubeGeometry(curve,80,.095,8,false),new T.MeshBasicMaterial({color:0xffbb45,transparent:true,opacity:.09,blending:T.AdditiveBlending,depthWrite:false}),scene);glow.castShadow=false;
const emblem=new T.Group();emblem.position.set(1.65,1.9,0);scene.add(emblem);
const ringMat=new T.MeshStandardMaterial({color:0xd0b178,metalness:1,roughness:.2,emissive:0xb97b23,emissiveIntensity:.2});mesh(new T.TorusGeometry(1.35,.024,12,120),ringMat,emblem);
const outer=mesh(new T.TorusGeometry(1.53,.008,8,120),new T.MeshBasicMaterial({color:0x594a2c}),emblem);outer.rotation.x=.12;outer.rotation.y=-.15;
const liquidUniforms={uTime:{value:0},uFill:{value:1},uOpacity:{value:.05}};
const liquid=new T.Mesh(new T.PlaneGeometry(2.65,2.65),new T.ShaderMaterial({uniforms:liquidUniforms,transparent:true,depthWrite:false,side:T.DoubleSide,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float uTime,uFill,uOpacity;void main(){vec2 p=v-.5;float r=length(p);if(r>.5)discard;float h=uFill+.026*sin(v.x*24.+uTime*7.)+.013*sin(v.x*41.-uTime*4.);if(v.y>h)discard;float edge=smoothstep(.07,0.,abs(v.y-h));vec3 c=mix(vec3(.31,.09,.006),vec3(1.,.64,.19),v.y*.7+edge*.8);gl_FragColor=vec4(c,uOpacity*(.55+edge*.4));}'}));emblem.add(liquid);
let texture;try{texture=await new T.TextureLoader().loadAsync(root.querySelector('.portada-logo').src);}catch(error){dispose();throw error;}if(signal?.aborted){dispose();return null;}
const logoUniforms={uMap:{value:texture},uReveal:{value:1},uTime:{value:0}};
const logo=new T.Mesh(new T.PlaneGeometry(2.45,2.45),new T.ShaderMaterial({uniforms:logoUniforms,transparent:true,depthWrite:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D uMap;uniform float uReveal,uTime;varying vec2 v;void main(){vec3 raw=texture2D(uMap,v).rgb;float ink=smoothstep(.08,.48,1.-dot(raw,vec3(.299,.587,.114)));float reveal=smoothstep(-.01,.055,uReveal-v.y);float gleam=.9+.1*sin(v.x*8.+uTime*.8);gl_FragColor=vec4(vec3(1.,.83,.49)*gleam,ink*reveal);}'}));logo.position.z=.05;emblem.add(logo);
const spiralPoints=[];for(let i=0;i<110;i++){const a=i/109*Math.PI*3.3;const r=1.45-(i/109)*.2;spiralPoints.push(new T.Vector3(Math.cos(a)*r,Math.sin(a)*r,Math.sin(a*1.6)*.2+.08));}
const spiralMat=new T.MeshPhysicalMaterial({color:0xd69226,metalness:.25,roughness:.12,transparent:true,opacity:.8,emissive:0xd98b22,emissiveIntensity:.35});const spiral=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(spiralPoints),160,.045,8,false),spiralMat,emblem);spiral.castShadow=false;
const count=world.clientWidth<560?130:280;const drops=new T.InstancedMesh(new T.SphereGeometry(1,7,5),new T.MeshStandardMaterial({color:0xe8af49,metalness:.45,roughness:.13,emissive:0xc6831b,emissiveIntensity:.35}),count);drops.frustumCulled=false;scene.add(drops);const dummy=new T.Object3D();
const random=i=>{const v=Math.sin(i*127.1+11.8)*43758.5453;return v-Math.floor(v);};
let elapsed=reduced?7.5:0,playing=false,startTime=0,lastPhase=-1;
const clamp=(v)=>Math.max(0,Math.min(1,v));
function render(t){
 const ready=clamp((t-.7)/1.4),flood=clamp((t-2.1)/2.4),final=clamp((t-5.5)/1.7),running=t>0&&t<6.4;
 impeller.rotation.z=running?t*t*4:0;coupling.rotation.x=running?t*17:0;pump.rotation.z=running?Math.sin(t*54)*.002:0;
 lampMaterial.emissiveIntensity=t>.2?1.7:.08;amberLight.intensity=3+Math.sin(clamp(t/7.5)*Math.PI)*16;ringMat.emissiveIntensity=.3+flood*.7;
 fluidGeo.setDrawRange(0,Math.floor(ready*fluidGeo.index.count/6)*6);glow.material.opacity=ready*.12;
 liquidUniforms.uTime.value=t;liquidUniforms.uFill.value=flood;liquidUniforms.uOpacity.value=(1-final)*.7+.05;
 logoUniforms.uReveal.value=clamp((t-3.05)/2.5);logoUniforms.uTime.value=t;
 spiral.rotation.z=-t*1.2;spiral.scale.setScalar(.8+clamp((t-1.8)/2)*.25);spiralMat.opacity=clamp((t-1.3)/1.8)*(1-final)*.75;
 drops.visible=t>1.25&&t<6.8;
 if(drops.visible)for(let i=0;i<count;i++){
  const seed=random(i),p=(t*.7+seed)%1;
  if(t<3.1){dummy.position.set(.65+p*1.25,2.8+Math.sin(p*Math.PI)*.5-p*p*1.3,(random(i+400)-.5)*.32);}
  else{const a=seed*Math.PI*2+t*.65,r=1.2+p*1.8*clamp((t-3)/2);dummy.position.set(1.65+Math.cos(a)*r,1.9+Math.sin(a)*r-p*p*.9,Math.sin(a*2+t)*.45+(random(i+400)-.5)*p);}
  const size=(.012+random(i+800)*.033)*(1-p*.55);dummy.scale.setScalar(size);dummy.updateMatrix();drops.setMatrixAt(i,dummy.matrix);
 }drops.instanceMatrix.needsUpdate=true;
 const width=world.clientWidth,aspect=width/world.clientHeight;camera.aspect=aspect;const distance=aspect<1.15?13.8:8.3;const q=clamp(t/3.2),sweep=q*q*(3-2*q),near=aspect<1.15?9.8:4.7;camera.position.set(-2.8+sweep*6.1,1.8+sweep*1.3,near+(distance-near)*sweep);camera.lookAt(-1.4+sweep*1.55,.8+sweep*.85,0);camera.updateProjectionMatrix();
 const phase=t<1.5?0:t<4?1:2;if(phase!==lastPhase){lastPhase=phase;root.querySelectorAll('.intro-phases span').forEach((el,i)=>el.classList.toggle('active',i===phase));if(playing)status.textContent=['El motor arranca…','La corriente se transforma en una ola…','El líquido revela el logo de Vocatus.'][phase];}
 renderer.render(scene,camera);
}
function resize(){const w=world.clientWidth,h=world.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);render(elapsed);}
observer=new ResizeObserver(resize);observer.observe(world);resize();
function tick(now){if(disposed||root.hidden||!playing)return;elapsed=Math.min((now-startTime)/1000,7.5);render(elapsed);if(elapsed<7.5)frameId=requestAnimationFrame(tick);else{playing=false;pauseButton.disabled=true;status.textContent='Logo de Vocatus · presentación finalizada';}}
startButton.onclick=()=>{cancelAnimationFrame(frameId);elapsed=reduced?7.5:0;lastPhase=-1;startButton.textContent='Repetir presentación';if(reduced){render(elapsed);status.textContent='Escena final · movimiento reducido';return;}playing=true;pauseButton.disabled=false;pauseButton.textContent='Pausar';startTime=performance.now();frameId=requestAnimationFrame(tick);};
pauseButton.onclick=()=>{if(playing){playing=false;cancelAnimationFrame(frameId);pauseButton.textContent='Continuar';status.textContent='Animación en pausa';}else{playing=true;pauseButton.textContent='Pausar';startTime=performance.now()-elapsed*1000;frameId=requestAnimationFrame(tick);}};
status.textContent=reduced?'Presentación sin movimiento':'Presentación de Vocatus';

 if(signal?.aborted){dispose();return null;}
 root.classList.add('scene-ready');
 pauseButton.hidden=false;
 if(reduced){startButton.disabled=true;pauseButton.disabled=true;startButton.textContent='Movimiento reducido';render(7.5);}
 else{startButton.disabled=false;startButton.onclick();}
 signal?.addEventListener('abort',dispose,{once:true});
 return {dispose,replay:()=>startButton.onclick()};
}
