#!/usr/bin/env node
// Auditoría determinista: no importa SDK de IA ni realiza llamadas a modelos.
import {readFile,readdir,mkdir,writeFile,stat,mkdtemp,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {Readable} from 'node:stream';

export function optionsOf(args){
 const options={maxAiPercent:25};
 for(let i=0;i<args.length;i++){
  if(args[i]==='--help'){options.help=true;continue;}
  if(!['--out','--max-ia'].includes(args[i])||!args[i+1])throw Error('Usá --out CARPETA y/o --max-ia N (0 a 25).');
  const name=args[i++],value=args[i];
  if(name==='--out')options.out=value;
  else{const n=Number(value);if(!Number.isFinite(n)||n<0||n>25)throw Error('El máximo de IA debe estar entre 0 y 25 %.');options.maxAiPercent=n;}
 }
 return options;
}
export function checkInventory(tagged,groups,standalone){
 const keys=[],errors=[];let references=0;
 for(const pump of tagged){if(!/^(B[1-9]\d{0,3}|P-\d{4}[A-Z]?)$/.test(pump.tag||''))errors.push('TAG inválido');keys.push('tag:'+pump.tag);}
 for(const group of groups){
  if(!group.nombre||!group.sector||!Array.isArray(group.bombas)){errors.push('Grupo de referencias incompleto');continue;}
  group.bombas.forEach((box,index)=>{
   references++;const name=group.bombas.length>1?`${group.nombre} · Bomba ${index+1}`:group.nombre;
   keys.push('reference:integrado:'+group.sector+':'+name);
   if(!Array.isArray(box.min)||!Array.isArray(box.max)||box.min.length!==3||box.max.length!==3||box.min.some((v,i)=>!Number.isFinite(v)||!Number.isFinite(box.max[i])||v>box.max[i]))errors.push('Límites geométricos inválidos: '+name);
  });
 }
 standalone.forEach((_,index)=>keys.push('reference:integrado:torre:Torre · referencia sin TAG '+(index+1)));
 if(new Set(keys).size!==keys.length)errors.push('Identidades de selección duplicadas');
 return {tagged:tagged.length,references,standaloneRepresentations:standalone.length,selections:keys.length,errors};
}
async function walk(folder,excluded=new Set()){
 const out=[];for(const entry of await readdir(folder,{withFileTypes:true})){if(excluded.has(entry.name))continue;const file=path.join(folder,entry.name);if(entry.isDirectory())out.push(...await walk(file,excluded));else if(entry.isFile())out.push(file);}return out;
}
export async function checkHtmlAssets(publicRoot){
 const missing=[];let checked=0;
 for(const name of await readdir(publicRoot)){
  if(!name.endsWith('.html'))continue;
  const html=await readFile(path.join(publicRoot,name),'utf8');
  for(const [,attribute,raw] of html.matchAll(/\b(src|href)\s*=\s*["']([^"']+)["']/gi)){
   if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(raw)||raw.startsWith('/api/'))continue;
   const clean=decodeURIComponent(raw.split(/[?#]/)[0]);if(!clean)continue;
   const file=path.resolve(publicRoot,'.'+(clean.startsWith('/')?'':'/')+clean),relative=path.relative(publicRoot,file);
   if(relative.startsWith('..')||path.isAbsolute(relative)){missing.push(name+': ruta fuera de public');continue;}
   checked++;const target=clean==='/'?path.join(file,'index.html'):file;
   if(!existsSync(target))missing.push(name+': '+attribute+' '+raw);
  }
 }
 return {checked,missing};
}
export function testFilesOf(command){
 const parts=String(command).trim().split(/\s+/);
 if(parts[0]!=='node'||parts[1]!=='--test'||parts.length<3||parts.slice(2).some(p=>!/^visor-bombas\/test[\w-]*\.mjs$/.test(p)))throw Error('El comando test cambió: revisar su formato antes de ejecutarlo automáticamente.');
 return parts.slice(2);
}
async function probe(root){
 // Debe ejecutarse en proceso separado; esta configuración nunca apunta a la bóveda real.
 process.env.VERCEL='1';process.env.VOCATUS_DEMO='1';delete process.env.VISOR_PASSWORD;delete process.env.OBSIDIAN_VAULT;
 delete process.env.GEMINI_API_KEY;delete process.env.OPENAI_API_KEY;
 const {handler}=await import(pathToFileURL(path.join(root,'visor-bombas/server.mjs')));
 async function request(url,body,token){
  const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);req.method=body?'POST':'GET';req.url=url;req.headers={host:'127.0.0.1:8766',...(token?{'x-local-token':token}:{})};
  const res={writeHead(status){this.status=status;},end(bytes){this.data=JSON.parse(bytes);}};await handler(req,res);return res;
 }
 const results=[],boot=await request('/api/bootstrap'),catalog=await request('/api/survey-catalog');
 if(boot.status!==200||catalog.status!==200||catalog.data.writable!==false||boot.data.maintenanceWritable!==false||!boot.data.demo)throw Error('No se confirmó el modo DEMO de solo lectura.');
 results.push('Bootstrap y catálogo DEMO de solo lectura');
 const unavailable=[];for(const pump of boot.data.sectorPumps){const result=await request('/api/pump?tag='+encodeURIComponent(pump.tag));if(result.status!==200||result.data.tag!==pump.tag)unavailable.push(pump.tag);}
 if(unavailable.length)throw Error('Fichas no consultables: '+unavailable.join(', '));
 results.push(boot.data.sectorPumps.length+' bombas con TAG consultables, incluso con datos mínimos');
 const denied=await request('/api/survey',{tag:'B30'},catalog.data.token);
 if(denied.status!==403||denied.data.code!=='NOT_WRITABLE')throw Error('El modo de auditoría no rechazó la escritura como se esperaba.');
 results.push('Escritura rechazada en modo de auditoría; ninguna ficha creada');
 return {results,tagged:boot.data.sectorPumps.length};
}
export async function audit(root,options={maxAiPercent:25}){
 if(!Number.isFinite(options.maxAiPercent)||options.maxAiPercent<0||options.maxAiPercent>25)throw Error('El máximo de IA debe estar entre 0 y 25 %.');
 const started=new Date(),stamp=started.toISOString().replace(/[:.]/g,'-'),out=path.resolve(options.out||path.join(root,'informes-auditoria',stamp));
 await mkdir(out,{recursive:true});
 const checks=[];async function check(id,operation){const time=Date.now();try{const details=await operation();checks.push({id,status:'aprobado',durationMs:Date.now()-time,details});}catch(error){checks.push({id,status:'fallo',durationMs:Date.now()-time,error:error.message});}}
 const env={...process.env,VOCATUS_DEMO:'1',GEMINI_API_KEY:'',OPENAI_API_KEY:'',ANTHROPIC_API_KEY:''};
 for(const key of ['VERCEL','OBSIDIAN_VAULT','VOCATUS_CLOUD_DEV','CODESPACES','VISOR_PASSWORD'])delete env[key];
 await check('sintaxis',async()=>{
  const files=(await walk(path.join(root,'visor-bombas'),new Set(['vendor','node_modules','archivo','demo-vault','modelos','fotos','fotos3','expediente','referencias','texturas']))).filter(file=>/\.(?:js|mjs)$/.test(file));
  files.push(fileURLToPath(import.meta.url));const failures=[];
  for(const file of files){const result=spawnSync(process.execPath,['--check',file],{cwd:root,env,encoding:'utf8',timeout:15000,windowsHide:true});if(result.status!==0||result.error)failures.push(path.relative(root,file)+': '+(result.error?.message||result.stderr.trim()));}
  if(failures.length)throw Error(failures.join('\n'));return {files:files.length};
 });
 await check('recursos-html',async()=>{const result=await checkHtmlAssets(path.join(root,'visor-bombas/public'));if(result.missing.length)throw Error(result.missing.join('\n'));return result;});
 await check('identidades-y-geometria',async()=>{
  const {plantPumps}=await import(pathToFileURL(path.join(root,'visor-bombas/public/sector-fotos.js'))),{torreSinTag}=await import(pathToFileURL(path.join(root,'visor-bombas/public/equipos-torre.js')));
  const groups=JSON.parse(await readFile(path.join(root,'visor-bombas/public/modelos/bombas-individuales.json'),'utf8')),result=checkInventory(plantPumps,groups,torreSinTag);
  if(result.errors.length)throw Error(result.errors.join('\n'));return result;
 });
 await check('api-aislada',async()=>{
  const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--probe'],{cwd:root,env,encoding:'utf8',timeout:60000,windowsHide:true,maxBuffer:4*1024*1024});
  if(result.status!==0||result.error)throw Error(result.error?.message||result.stderr.trim()||'Falló el proceso de consulta');return JSON.parse(result.stdout.trim());
 });
 await check('suite-de-regresion',async()=>{
  const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')),files=testFilesOf(pkg.scripts.test);
  for(const file of files)if(!(await stat(path.join(root,file))).isFile())throw Error('Falta prueba: '+file);
  const fixture=await mkdtemp(path.join(os.tmpdir(),'vocatus-audit-vault-'));
  let result;
  try{
   const notes=path.join(fixture,'00-Proyecto/bombas'),equipment=path.join(fixture,'00-Proyecto/equipos');await mkdir(notes,{recursive:true});await mkdir(equipment,{recursive:true});
   for(let index=0;index<15;index++){const tag='P-'+(1401+index);await writeFile(path.join(notes,tag+'.md'),'---\n'+JSON.stringify({id:tag,tag,marca:'PRUEBA AISLADA',modelo:'Auditoria',sello_diametro_mm:'',orings:[],demostracion:true})+'\n---\n# '+tag+' · prueba aislada\n## Historial de intervenciones\nSin registros.\n','utf8');}
   const {plantPumps}=await import(pathToFileURL(path.join(root,'visor-bombas/public/sector-fotos.js')));
   for(const p of plantPumps){const note=p.documental||{id:p.tag,marca:p.marca,modelo:p.modelo,liquido:p.servicio,ubicacion:p.nombre,tamano:p.size,orings:[]};await writeFile(path.join(equipment,p.tag+'.md'),'---\n'+JSON.stringify({...note,id:p.tag,demostracion:true})+'\n---\n# Copia de referencia del código para pruebas\n','utf8');}
   result=spawnSync(process.execPath,['--test',...files],{cwd:root,env:{...env,VOCATUS_DEMO:'0',OBSIDIAN_VAULT:fixture},encoding:'utf8',timeout:180000,windowsHide:true,maxBuffer:12*1024*1024});
  }finally{
   const relative=path.relative(path.resolve(os.tmpdir()),path.resolve(fixture));
   if(!relative.startsWith('..')&&!path.isAbsolute(relative)&&path.basename(fixture).startsWith('vocatus-audit-vault-'))await rm(fixture,{recursive:true,force:true});
  }
  const log=(result.stdout||'')+'\n'+(result.stderr||'');await writeFile(path.join(out,'pruebas.txt'),log,'utf8');
  if(result.status!==0||result.error)throw Error((result.error?.message||'Falló la suite')+'; revisar pruebas.txt');
  const passes=log.match(/(?:#|ℹ) pass (\d+)/),failures=log.match(/(?:#|ℹ) fail (\d+)/);
  if(!passes||!failures||Number(failures[1])!==0)throw Error('No se pudo confirmar el resumen de pruebas; revisar pruebas.txt');
  return {files:files.length,passed:Number(passes[1]),failed:Number(failures[1]),log:'pruebas.txt'};
 });
 const report={version:1,started:started.toISOString(),finished:new Date().toISOString(),result:checks.some(c=>c.status==='fallo')?'fallos detectados':'sin fallos en comprobaciones automáticas',ai:{maximumPercent:options.maxAiPercent,actualPercent:0,modelCalls:0,method:'No se ejecutan modelos ni se envía código o datos a una IA.'},checks,notExecuted:['Clics reales en navegador, cámara y carga de fotos mediante interfaz','Revisión visual, contraste, superposiciones y dispositivos físicos','Comprobación del despliegue público y sincronización entre dispositivos'],limits:['Las representaciones sin TAG no acreditan equipos físicos distintos.','El resultado no garantiza ausencia de todos los fallos.','No publica cambios, no opera Revit y no modifica fichas reales.']};
 await writeFile(path.join(out,'auditoria.json'),JSON.stringify(report,null,2)+'\n','utf8');
 const md=['# Auditoría automática del visor','',report.result,'',`Inicio: ${report.started}`,`Fin: ${report.finished}`,'',`IA: ${report.ai.actualPercent} % usado; máximo configurado ${report.ai.maximumPercent} %; 0 llamadas a modelos.`,'','| Control | Resultado |','| --- | --- |',...checks.map(c=>`| ${c.id} | ${c.status} |`),'',...checks.filter(c=>c.error).flatMap(c=>['## '+c.id,'','```text',c.error,'```','']),'## Pendiente de revisión visual y operativa','',...report.notExecuted.map(x=>'- '+x),'','## Límites','',...report.limits.map(x=>'- '+x),'','Detalles en auditoria.json y salida completa en pruebas.txt.',''].join('\n');
 await writeFile(path.join(out,'auditoria.md'),md,'utf8');return {report,out};
}
async function main(){
 const root=fileURLToPath(new URL('../../',import.meta.url));
 if(process.argv.includes('--probe')){process.stdout.write(JSON.stringify(await probe(root)));return;}
 const options=optionsOf(process.argv.slice(2));if(options.help){console.log('node 00-Proyecto/scripts/auditar-visor.mjs [--out CARPETA] [--max-ia 0..25]\nSin llamadas a IA. No publica ni modifica fichas reales.');return;}
 const {report,out}=await audit(root,options);console.log(report.result+'\nIA utilizada: 0 % (máximo '+options.maxAiPercent+' %)\nInforme: '+path.join(out,'auditoria.md'));process.exitCode=report.checks.some(c=>c.status==='fallo')?1:0;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=2;});
