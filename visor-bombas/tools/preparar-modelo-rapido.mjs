import {createHash} from 'node:crypto';
import {readFile,writeFile,rename,rm} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const dir=path.dirname(fileURLToPath(import.meta.url));
const source=path.join(dir,'..','public','modelos','blender-local','planta-blender-local.glb');
const target=source+'.gz',temp=target+'.tmp';
const raw=await readFile(source);
const digest=createHash('sha256').update(raw).digest('hex').slice(0,16);
const loader=await readFile(path.join(dir,'..','public','blender-local.js'),'utf8');
if(!loader.includes(`PLANTA_BLENDER_CACHE='${digest}'`))throw new Error(`Actualiza PLANTA_BLENDER_CACHE a ${digest} cuando cambie el modelo.`);
const compressed=gzipSync(raw,{level:9});
if(!gunzipSync(compressed).equals(raw))throw new Error('La versión gzip no conserva el modelo original.');
try{await writeFile(temp,compressed);await rename(temp,target);}catch(error){await rm(temp,{force:true});throw error;}
console.log(`Modelo rápido listo: ${(raw.length/1e6).toFixed(2)} MB → ${(compressed.length/1e6).toFixed(2)} MB (${(100-compressed.length/raw.length*100).toFixed(1)} % menos).`);
