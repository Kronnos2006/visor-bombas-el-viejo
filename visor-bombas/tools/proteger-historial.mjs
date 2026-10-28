#!/usr/bin/env node
// Barrera de regresión sin modelos de IA, sin servidor ni escrituras de fichas.
import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const visor=fileURLToPath(new URL('../',import.meta.url));
const tests=['test-selection-all.mjs','test-survey-drafts.mjs','test-photo-references.mjs','test-survey-view.mjs','test-auditoria-web.mjs'];
async function main(){
 const args=process.argv.slice(2);if(args.length&&!(args.length===2&&args[0]==='--out'&&args[1]))throw Error('Uso: node tools/proteger-historial.mjs [--out CARPETA]');
 const out=path.resolve(args[1]||path.join(visor,'.auditoria-regresion'));await mkdir(out,{recursive:true});
 const missing=tests.filter(test=>!existsSync(path.join(visor,test)));
 const result=missing.length?{status:1,stdout:'',stderr:'Faltan controles obligatorios: '+missing.join(', ')}:spawnSync(process.execPath,['--test',...tests.map(test=>path.join(visor,test))],{cwd:visor,encoding:'utf8',timeout:90000,windowsHide:true,maxBuffer:8*1024*1024,env:{...process.env,GEMINI_API_KEY:'',OPENAI_API_KEY:'',ANTHROPIC_API_KEY:''}});
 const log=(result.stdout||'')+'\n'+(result.stderr||'');await writeFile(path.join(out,'pruebas.txt'),log,'utf8');
 const passed=log.match(/(?:#|ℹ) pass (\d+)/),failed=log.match(/(?:#|ℹ) fail (\d+)/);
 const ok=result.status===0&&!result.error&&passed&&failed&&Number(passed[1])>0&&Number(failed[1])===0;
 const report={date:new Date().toISOString(),status:ok?'aprobado':'bloqueado',passed:passed?Number(passed[1]):null,failed:failed?Number(failed[1]):null,missing,tests,aiPercent:0,modelCalls:0,error:result.error?.message||null,scope:['Todas las identidades TAG y referencias sin TAG','Evento del 3D conectado a apertura de ficha','Selección vigente y cancelación de aperturas antiguas','Persistencia aislada por TAG y concurrencia de adjuntos','Transferencia de fotos y escape de datos'],limits:['No sustituye el clic real ni la revisión visual.','No garantiza ausencia de otros defectos.','No modifica fichas ni publica cambios por sí mismo.']};
 await writeFile(path.join(out,'regresion.json'),JSON.stringify(report,null,2)+'\n','utf8');
 console.log(ok?'Protección de Historial aprobada.':'BLOQUEADO: regresión o controles incompletos.');console.log('IA: 0 %. Informe: '+path.join(out,'regresion.json'));
 if(!ok){console.error(log);process.exitCode=1;}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
