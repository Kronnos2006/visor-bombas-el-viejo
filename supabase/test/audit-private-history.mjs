// Auditoría de solo lectura. Nunca imprime valores de las credenciales.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const git=(...args)=>execFileSync('git',args,{maxBuffer:512*1024*1024});
const privateDir=process.env.VOCATUS_QA_PRIVATE_DIR;
const backupDir=process.env.VOCATUS_BACKUP_DIR;
if(!privateDir||!backupDir)throw Error('Se requieren las dos carpetas privadas locales.');
const secrets=[],privateBlobs=new Set();
function collect(value){
 if(!value||typeof value!=='object')return;
 for(const [key,item]of Object.entries(value)){
  if(typeof item==='string'&&/password|access_token|refresh_token/i.test(key)&&item.length>=8)secrets.push(Buffer.from(item));
  else collect(item);
 }
}
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const name=path.join(dir,entry.name);if(entry.isDirectory())visit(name);
 else if(entry.isFile()){
  const bytes=fs.readFileSync(name);
  privateBlobs.add(crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'));
  if(entry.name.endsWith('.json')){try{collect(JSON.parse(bytes));}catch{}}
  if(entry.name.endsWith('.sql')){
   for(const match of bytes.toString().matchAll(/crypt\('([^']+)'/g))if(match[1].length>=8)secrets.push(Buffer.from(match[1]));
   for(const hash of bytes.toString().match(/\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/g)||[])secrets.push(Buffer.from(hash));
  }
 }
}}
visit(privateDir);visit(backupDir);
const commits=git('rev-list','--all','--reflog').toString().trim().split('\n');
const objects=git('rev-list','--objects','--all','--reflog').toString().trim().split('\n').map(x=>{const i=x.indexOf(' ');return {id:i<0?x:x.slice(0,i),name:i<0?'':x.slice(i+1)};});
const suspiciousPaths=objects.filter(x=>/(^|\/)(private-cuentas-qa|Respaldos-supabase)(\/|$)/i.test(x.name));
const raw=execFileSync('git',['cat-file','--batch'],{input:objects.map(x=>x.id).join('\n')+'\n',maxBuffer:512*1024*1024});
let offset=0,blobs=0;const findings=[];
for(const object of objects){
 const end=raw.indexOf(10,offset),header=raw.subarray(offset,end).toString(),[id,type,sizeText]=header.split(' '),size=Number(sizeText);
 if(!Number.isSafeInteger(size))throw Error('Respuesta Git inválida.');
 const bytes=raw.subarray(end+1,end+1+size);offset=end+1+size+1;
 if(type!=='blob')continue;blobs++;
 const reasons=[];
 if(privateBlobs.has(id))reasons.push('contenido de archivo privado');
 if(secrets.some(s=>bytes.includes(s)))reasons.push('credencial real de pruebas');
 if(/sb_secret_[A-Za-z0-9_-]{12,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(bytes.toString()))reasons.push('patrón de clave privada');
 for(const jwt of bytes.toString().match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]){
  try{if(JSON.parse(Buffer.from(jwt.split('.')[1],'base64url')).role==='service_role')reasons.push('JWT service_role');}catch{}
 }
 if(reasons.length)findings.push({blob:id,path:object.name,reasons:[...new Set(reasons)]});
}
const result={at:new Date().toISOString(),branch:git('branch','--show-current').toString().trim(),head:git('rev-parse','HEAD').toString().trim(),scope:'todos los commits alcanzables por refs y reflogs locales',commits:commits.length,uniqueObjects:objects.length,blobs,privateFileFingerprints:privateBlobs.size,testCredentialValues:secrets.length,suspiciousPaths,findings,passed:!suspiciousPaths.length&&!findings.length};
if(process.env.VOCATUS_QA_REPORT)fs.writeFileSync(process.env.VOCATUS_QA_REPORT,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));process.exitCode=result.passed?0:1;
