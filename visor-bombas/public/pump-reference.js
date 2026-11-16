import { buildPumpModel } from './pump-model.js?v=montaje-monobloque';

const profiles = {
  standard: { label:'Centrífuga horizontal', paint:0x358093, wet:1, drive:1, motorLength:1 },
  lowFlow: { label:'Centrífuga horizontal de bajo caudal', paint:0x358093, wet:1, drive:1, motorLength:1 },
  process: { label:'Centrífuga horizontal de proceso', paint:0x3d728a, wet:1.08, drive:1.11, motorLength:1.13 },
  large: { label:'Centrífuga horizontal de gran caudal', paint:0x477c87, wet:1.20, drive:1.25, motorLength:1.25 },
  titan: { label:'Centrífuga de proceso tipo TITAN', paint:0x527962, wet:1.04, drive:1.08, motorLength:1.08 },
  compact: { label:'Centrífuga monobloque tipo Goulds' },
  vertical: { label:'Centrífuga vertical multietapa' },
};

export function pumpReference(pump, plate) {
  const evidence = /^Placa(?:$| \()/.test(plate?.fuente ?? '') ? plate.placa : '';
  const catalog = [pump.marca,pump.modelo,pump.size,pump.tipo,pump.tipo_bomba,pump.nombre].filter(Boolean).join(' ');
  const text = (evidence || catalog).toUpperCase();
  const tag = Number(pump.tag?.slice(1));
  let kind = 'standard';
  if (/VERTICAL|MOVITEC|GRUNDFOS|EBARA|\bSB[ -]/.test(text) || [59,69,70,71,72,73,77,78,79,80].includes(tag)) kind = 'vertical';
  else if (/GOULDS|MONOBLOQUE|ACOPLAMIENTO DIRECTO/.test(text) || pump.variant==='goulds' || (tag >= 39 && tag <= 43) || tag === 56) kind = 'compact';
  else if (/TITAN/.test(text) || [17,18,20,21,61,62,63,64,65,66,67,68,81,83].includes(tag)) kind = 'titan';
  else if (/3\s*[X×]\s*4\s*[-X×]?\s*(12|13)|HIDROMAC AZ|RA\s*65|PACO/.test(text) || [44,45,48,55,58,60].includes(tag)) kind = 'large';
  else if (/\bLF\b|DURCO/.test(text) || [19,23,24,30,31,32,33,37,38].includes(tag)) kind = 'lowFlow';
  else if (/\bMTO\b|MULTISTEEL/.test(text) || [27,28,29,34,35,36,49,50,51,52,53,54,57].includes(tag)) kind = 'process';
  const stages = /EVMSU?5[- /]?9/.test(text) ? 9 : /MOVITEC.*4[/ -]8/.test(text) ? 8 : /\bSB.*15[- /]5/.test(text) ? 5 : 6;
  const profile={kind,...profiles[kind]};
  if(kind==='vertical'){
    const finish=/EBARA/.test(text)?0x275168:/GRUNDFOS/.test(text)?0x343b40:/MOVITEC/.test(text)?0x365579:0x244d63;
    return {...profile,stages,finish};
  }
  if(!profile.wet)return profile;
  const sizePattern=/(?:^|\s)(\d+(?:\.\d+)?)\s*[X×]\s*(\d+(?:\.\d+)?)\s*[-X×]\s*(\d+(?:\.\d+)?)/i;
  const size=evidence?.match(sizePattern)||catalog.match(sizePattern);
  // Proporciones visuales acotadas según el tamaño nominal. La B30 1×1.5–8 es la referencia.
  const radial=size?Math.max(.88,Math.min(1.31,.70+Number(size[3])*.0375+(Number(size[2])-1.5)*.057)):profile.wet;
  return {...profile,wet:radial};
}

export function buildVerticalReference(T, stages=6, finish=0x244d63) {
  const model = buildPumpModel(T);
  const {root,components} = model;
  const positions = [-1.7,-1.28,-.9,.76,.92,1.12,-.24,.12,1.55,2.86];
  const metal = new T.MeshStandardMaterial({color:0x8dabb2,metalness:.7,roughness:.36});
  const paint = new T.MeshStandardMaterial({color:finish,metalness:.42,roughness:.46});
  const steel = new T.MeshStandardMaterial({color:0xc4cdd1,metalness:.73,roughness:.3});
  function clear(group) {
    while (group.children.length) {
      const child=group.children[0];
      child.traverse(object=>{
        object.geometry?.dispose();
        for(const material of [object.material].flat()) material?.dispose();
      });
      child.removeFromParent();
    }
  }
  function add(index,geometry,material,name,x=0,y=0,z=0,cover=false) {
    const mesh=new T.Mesh(geometry,material.clone());
    mesh.position.set(x,y,z);
    mesh.name=name;
    if(index===null)root.add(mesh);
    else {
      mesh.userData={part:index,subcomponent:name,anatomyCover:cover};
      components[index].add(mesh);
    }
    return mesh;
  }
  const tube=(r,h)=>new T.CylinderGeometry(r,r,h,48);
  function axial(index,r,h,material,name,x=0,cover=false) {
    const mesh=add(index,tube(r,h),material,name,x,0,0,cover);
    mesh.rotation.z=Math.PI/2;
    return mesh;
  }
  function ring(outer,bore,depth,bolts=0) {
    const disk=new T.Shape();
    disk.absarc(0,0,outer,0,Math.PI*2,false);
    const opening=(x,y,r)=>{
      const path=new T.Path();
      path.absarc(x,y,r,0,Math.PI*2,true);
      disk.holes.push(path);
    };
    opening(0,0,bore);
    for(let i=0;i<bolts;i++){
      const a=(i+.5)*2*Math.PI/bolts;
      opening(.8*outer*Math.cos(a),.8*outer*Math.sin(a),outer*.11);
    }
    const geometry=new T.ExtrudeGeometry(disk,{depth,bevelEnabled:false,curveSegments:24});
    geometry.translate(0,0,-depth/2);
    return geometry;
  }
  for(const child of [...root.children])if(!components.includes(child)){
    child.geometry.dispose();
    child.material.dispose();
    child.removeFromParent();
  }
  for(const index of [0,1,2,3,6,7])clear(components[index]);
  const motorFeet=components[9].getObjectByName('Pies del motor');
  motorFeet.geometry.dispose();
  motorFeet.material.dispose();
  motorFeet.removeFromParent();
  components[9].traverse(object=>{
    if(!object.isMesh)return;
    for(const material of [object.material].flat()){
      if(material.color?.getHex()===0x375d64)material.color.setHex(finish);
    }
  });
  const seal=add(1,ring(.52,.46,.045),paint,'Junta de la camisa');
  seal.rotation.y=Math.PI/2;
  const fanCap=axial(9,.675,.045,paint,'Tapa del ventilador',1.33,true);
  fanCap.userData.removableQuarter=true;
  axial(0,.63,.49,paint,'Cuerpo de conexiones',0,true);
  for(const sign of [-1,1]){
    const nozzle=add(0,ring(.27,.18,.48),paint,sign<0?'Entrada en línea':'Salida en línea',0,sign*.59);
    nozzle.rotation.x=Math.PI/2;
    const flange=add(0,ring(.42,.18,.13,4),steel,'Brida de conexión',0,sign*.88);
    flange.rotation.x=Math.PI/2;
    const rim=add(0,ring(.24,.18,.035),metal,'Resalte de brida',0,sign*.95);
    rim.rotation.x=Math.PI/2;
  }
  for(let stage=0;stage<stages;stage++){
    const x=stage*1.47/stages;
    axial(2,.36,.52/stages,metal,'Impulsor de etapa',x);
    for(let blade=0;blade<6;blade++){
      const angle=blade*Math.PI/3;
      const fin=add(2,new T.BoxGeometry(.09,.15,.048),paint,'Álabe de etapa',x-.07,.24*Math.cos(angle),.24*Math.sin(angle));
      fin.rotation.x=angle+.35;
    }
    const diffuser=add(7,ring(.47,.37,.065),steel,'Difusor de etapa',x-1.02);
    diffuser.rotation.y=Math.PI/2;
  }
  const sleeve=add(7,new T.CylinderGeometry(.53,.53,1.86,64,1,true),metal,'Camisa exterior inoxidable',-.15,0,0,true);
  sleeve.material.side=T.DoubleSide;
  sleeve.rotation.z=Math.PI/2;
  for(const x of [-1.04,.74]){
    const shoulder=add(7,ring(.55,.46,.075),steel,'Aro de cierre de la camisa',x);
    shoulder.rotation.y=Math.PI/2;
  }
  axial(3,.65,.18,paint,'Cabezal superior',0,true);
  const adapter=add(3,ring(.46,.35,.52),paint,'Adaptador del motor',.39,0,0,true);
  adapter.rotation.y=Math.PI/2;
  const motorSeat=add(3,ring(.60,.35,.10,4),paint,'Brida del motor',.72,0,0,true);
  motorSeat.rotation.y=Math.PI/2;
  axial(6,.102,2.77,metal,'Eje vertical');
  add(null,new T.BoxGeometry(.14,1.65,1.37),paint,'Base de apoyo',-2.02);
  for(const y of [-.62,.62])for(const z of [-.51,.51]){
    const anchor=add(0,new T.CylinderGeometry(.075,.075,.07,6),steel,'Perno de anclaje',-.2,y,z);
    anchor.rotation.z=Math.PI/2;
  }
  for(let i=0;i<4;i++){
    const a=Math.PI/4+i*Math.PI/2;
    const tie=add(7,tube(.036,1.94),metal,'Tirante',-.12,.56*Math.cos(a),.56*Math.sin(a));
    tie.rotation.z=Math.PI/2;
    for(const x of [-1.09,.85]){
      const nut=add(7,new T.CylinderGeometry(.08,.08,.078,6),steel,'Tuerca de tirante',x,.56*Math.cos(a),.56*Math.sin(a));
      nut.rotation.z=Math.PI/2;
    }
  }
  metal.dispose();paint.dispose();steel.dispose();
  for(const [index,group] of components.entries()){
    group.position.x=group.userData.base=positions[index];
    const names=new Set();
    group.traverse(object=>{if(object.isMesh)names.add(object.userData.subcomponent||object.name);});
    group.userData.subcomponents=[...names];
  }
  let amount=0;
  const explodedOffsets=[-1.75,-1.32,-.62,.4,.88,1.26,-2.24,1.6,2.05,2.6];
  return {...model, vertical:true, get explosion(){return amount;},
    moveExplosion(target,immediate){
      amount=immediate?target:T.MathUtils.lerp(amount,target,.12);
      components.forEach((group,index)=>{
        group.position.x=positions[index]+explodedOffsets[index]*amount;
        group.position.z=index===6?amount*.95:0;
      });
    },
    visual:{
      spinner:child=>/Impulsor de etapa|Álabe de etapa|Eje vertical|Rotor del motor|Eje del motor|ventilador/.test(child.name)?child:null,
      flowOffset:[0,0,0], flowScale:[.24,.5,.5],
    },
  };
}
