import path from 'node:path';
import {mkdir,copyFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
export async function backupFicha(vault,tag){
 if(!/^(B[1-9]\d{0,3}|P-\d{4}[A-Z]?)$/.test(tag))throw Error('TAG inválido para respaldo.');
 const source=path.join(vault,'00-Proyecto',tag.startsWith('B')?'equipos':'bombas',tag+'.md');
 const dir=path.join(vault,'00-Proyecto','Respaldos','fichas');await mkdir(dir,{recursive:true});
 const target=path.join(dir,tag+'_'+new Date().toISOString().replace(/[:.]/g,'-')+'_'+randomUUID().slice(0,8)+'.md.respaldo');
 await copyFile(source,target);return target;
}
