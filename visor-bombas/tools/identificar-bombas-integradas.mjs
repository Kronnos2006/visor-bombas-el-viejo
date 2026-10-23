import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
const vendor=new URL('../public/vendor/',import.meta.url);
registerHooks({resolve(specifier,context,next){if(specifier==='three')return {url:new URL('three.module.js',vendor).href,shortCircuit:true};return next(specifier,context);}});
const THREE=await import(new URL('three.module.js',vendor).href);
const {GLTFLoader}=await import(new URL('GLTFLoader.js',vendor).href);
const {MeshoptDecoder}=await import(new URL('meshopt_decoder.module.js',vendor).href);
const data=readFileSync(new URL('../public/modelos/planta-integrada.glb',import.meta.url));
const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
gltf.scene.updateMatrixWorld(true);
const results=[];
gltf.scene.traverse(o=>{
 if(!o.isMesh||!o.userData.bomba)return;
 const p=o.geometry.attributes.position,idx=o.geometry.index;
 // Partition projected triangle boxes into connected regions. A pump's base, motor and guard overlap in plan.
 let groups=[];
 for(let i=0;i<(idx?idx.count:p.count);i+=3){
  const box=new THREE.Box3();for(let j=0;j<3;j++){const n=idx?idx.getX(i+j):i+j;box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,n).applyMatrix4(o.matrixWorld));}
  const hits=[];for(let k=0;k<groups.length;k++){const b=groups[k];if(box.min.x<=b.max.x+.025&&box.max.x>=b.min.x-.025&&box.min.z<=b.max.z+.025&&box.max.z>=b.min.z-.025)hits.push(k);}
  for(let j=hits.length-1;j>=0;j--)box.union(groups.splice(hits[j],1)[0]);groups.push(box);
 }
 // Transitive merges after expanded boxes bridge prior regions.
 let changed=true;while(changed){changed=false;outer:for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){const a=groups[i],b=groups[j];if(a.min.x<=b.max.x+.025&&a.max.x>=b.min.x-.025&&a.min.z<=b.max.z+.025&&a.max.z>=b.min.z-.025){a.union(b);groups.splice(j,1);changed=true;break outer;}}}
 groups=groups.filter(b=>b.max.y-b.min.y>.15&&(b.max.x-b.min.x)>.25&&(b.max.z-b.min.z)>.25).sort((a,b)=>a.min.x-b.min.x||a.min.z-b.min.z);
 results.push({nombre:o.userData.bomba,sector:o.userData.sector,bombas:groups.map(b=>({min:b.min.toArray().map(v=>+v.toFixed(4)),max:b.max.toArray().map(v=>+v.toFixed(4))}))});
});
console.log(`${results.length} grupos; ${results.reduce((n,g)=>n+g.bombas.length,0)} bombas individuales`);
writeFileSync(new URL('../public/modelos/bombas-individuales.json',import.meta.url),JSON.stringify(results,null,1));
