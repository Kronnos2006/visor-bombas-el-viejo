import { buildPumpModel } from './pump-model.js';

const profiles = {
  standard: { label:'Centrífuga horizontal', paint:0x358093, wet:1, drive:1 },
  lowFlow: { label:'Centrífuga horizontal de bajo caudal', paint:0x358093, wet:1, drive:1 },
  process: { label:'Centrífuga horizontal de proceso', paint:0x3d728a, wet:1.14, drive:1.11 },
  large: { label:'Centrífuga horizontal de gran caudal', paint:0x477c87, wet:1.25, drive:1.19 },
  titan: { label:'Centrífuga de proceso tipo TITAN', paint:0x527962, wet:1.1, drive:1.08 },
  compact: { label:'Centrífuga monobloque tipo Goulds' },
  vertical: { label:'Centrífuga vertical multietapa' },
};

export function pumpReference(pump, plate) {
  if (pump.inactive || plate?.fuente === 'Fuera de la lista') return null;
  const evidence = /^Placa(?:$| \()/.test(plate?.fuente ?? '') ? plate.placa : '';
  const catalog = [pump.marca,pump.modelo,pump.size,pump.tipo].filter(Boolean).join(' ');
  const text = (evidence || catalog).toUpperCase();
  const tag = Number(pump.tag?.slice(1));
  let kind = 'standard';
  if (/VERTICAL|MOVITEC|GRUNDFOS|EBARA|\bSB[ -]/.test(text) || [59,69,70,71,72,73].includes(tag)) kind = 'vertical';
  else if (/GOULDS/.test(text) || (tag >= 39 && tag <= 43) || tag === 56) kind = 'compact';
  else if (/TITAN/.test(text) || [17,18,20,21,61,62,63,64,65,66,67,68,81,83].includes(tag)) kind = 'titan';
  else if (/3\s*[X×]\s*4\s*[-X×]?\s*(12|13)|HIDROMAC AZ|RA\s*65|PACO/.test(text) || [44,45,48,55,58,60].includes(tag)) kind = 'large';
  else if (/\bLF\b|DURCO/.test(text) || [19,23,24,30,31,32,33,37,38].includes(tag)) kind = 'lowFlow';
  else if (/\bMTO\b|MULTISTEEL/.test(text) || [27,28,29,34,35,36,49,50,51,52,53,54,57].includes(tag)) kind = 'process';
  return { kind, ...profiles[kind] };
}

export function buildVerticalReference(T) {
  const model = buildPumpModel(T);
  const {root,components} = model;
  const positions = [-1.7,-1.28,-.9,.76,.92,1.12,-.24,.12,1.55,2.86];
  const metal = new T.MeshStandardMaterial({color:0x8dabb2,metalness:.7,roughness:.36});
  const paint = new T.MeshStandardMaterial({color:0x244d63,metalness:.42,roughness:.46});
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
  for(const child of [...root.children])if(!components.includes(child)){
    child.geometry.dispose();
    child.material.dispose();
    child.removeFromParent();
  }
  for(const index of [0,2,3,6,7])clear(components[index]);
  axial(0,.63,.49,paint,'Cuerpo de conexiones',0,true);
  for(const sign of [-1,1]){
    add(0,tube(.26,.65),paint,sign<0?'Entrada en línea':'Salida en línea',0,sign*.58);
    add(0,tube(.42,.13),metal,'Brida de conexión',0,sign*.95);
  }
  for(let stage=0;stage<6;stage++){
    const x=stage*.245;
    axial(2,.36,.095,metal,'Impulsor de etapa',x);
    for(let blade=0;blade<6;blade++){
      const angle=blade*Math.PI/3;
      const fin=add(2,new T.BoxGeometry(.09,.15,.048),paint,'Álabe de etapa',x-.07,.24*Math.cos(angle),.24*Math.sin(angle));
      fin.rotation.x=angle+.35;
    }
    const diffuser=add(7,new T.TorusGeometry(.42,.055,8,48),metal,'Difusor de etapa',x-1.02);
    diffuser.rotation.y=Math.PI/2;
  }
  const sleeve=add(7,new T.CylinderGeometry(.53,.53,1.86,64,1,true),metal,'Camisa exterior inoxidable',-.15,0,0,true);
  sleeve.material.side=T.DoubleSide;
  sleeve.rotation.z=Math.PI/2;
  axial(3,.61,.16,paint,'Cabezal superior',0,true);
  axial(6,.102,2.77,metal,'Eje vertical');
  add(null,new T.BoxGeometry(.14,1.65,1.37),paint,'Base de apoyo',-2.02);
  for(let i=0;i<4;i++){
    const a=Math.PI/4+i*Math.PI/2;
    const tie=add(7,tube(.036,1.94),metal,'Tirante',-.12,.56*Math.cos(a),.56*Math.sin(a));
    tie.rotation.z=Math.PI/2;
  }
  metal.dispose();paint.dispose();
  for(const [index,group] of components.entries()){
    group.position.x=group.userData.base=positions[index];
    const names=new Set();
    group.traverse(object=>{if(object.isMesh)names.add(object.userData.subcomponent||object.name);});
    group.userData.subcomponents=[...names];
  }
  let amount=0;
  return {...model, vertical:true, get explosion(){return amount;},
    moveExplosion(target,immediate){
      amount=immediate?target:T.MathUtils.lerp(amount,target,.12);
      components.forEach((group,index)=>{group.position.x=positions[index]+(index-4.5)*amount*.43;});
    },
    visual:{
      spinner:child=>/Impulsor de etapa|Álabe de etapa|Eje vertical|Rotor del motor|Eje del motor|ventilador/.test(child.name)?child:null,
      flowOffset:[0,0,0], flowScale:[.24,.5,.5],
    },
  };
}
